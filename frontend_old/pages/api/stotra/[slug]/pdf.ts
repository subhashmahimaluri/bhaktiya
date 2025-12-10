import { getAuthSession, isSessionExpired, sendSessionExpiredResponse } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// Backend GraphQL endpoint
const BACKEND_GRAPHQL_URL =
  process.env.BACKEND_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

const BACKEND_REST_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

/**
 * API Route: /api/stotra/[slug]/pdf
 *
 * Handles PDF download requests for stotra content
 *
 * Query params:
 *   - lang: Language code (te, en, hi, kn)
 *
 * Response codes:
 *   - 200: PDF ready, returns { url: string }
 *   - 202: PDF generation queued, returns { message: 'queued' }
 *   - 401: Not authenticated
 *   - 403: Forbidden (user lacks permission)
 *   - 404: Stotra not found
 *   - 500: Server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Verify server-side session
    const session = await getAuthSession(req, res);

    // Check if session has a refresh token error
    if (isSessionExpired(session)) {
      return sendSessionExpiredResponse(res);
    }

    // Allow in development or if auth is bypassed
    const bypassAuth = process.env.BYPASS_AUTH === 'true';
    if (!session && !bypassAuth && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ message: 'Unauthorized - Login required' });
    }

    // 2. Extract parameters
    const { slug } = req.query;
    const lang = (req.query.lang as string) || 'te';

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Invalid slug parameter' });
    }

    // 3. Resolve stotraId from slug (call backend REST API)
    // The backend uses 'canonicalSlug' as the parameter name
    const stotraResponse = await fetch(`${BACKEND_REST_URL}/rest/stotras/${slug}`);

    if (!stotraResponse.ok) {
      if (stotraResponse.status === 404) {
        return res.status(404).json({ message: 'Stotra not found' });
      }
      throw new Error(`Failed to fetch stotra: ${stotraResponse.statusText}`);
    }

    const stotraData = await stotraResponse.json();
    const stotraId = stotraData._id || stotraData.id;

    if (!stotraId) {
      console.error('Failed to resolve stotra ID from response:', stotraData);
      return res.status(500).json({ message: 'Failed to resolve stotra ID' });
    }

    console.log(`📋 Resolved stotra: ${slug} -> ID: ${stotraId}`);

    // 4. Call backend GraphQL getPdfDownloadUrl mutation/query
    // Note: This is a public query (no @auth directive in schema), but we pass the token if available
    // for optional authentication features like personalized PDFs or analytics
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    };

    const graphqlQuery = `
      query GetPdfDownloadUrl($stotraId: ID!, $language: String!) {
        getPdfDownloadUrl(stotraId: $stotraId, language: $language) {
          status
          url
          version
          generatedAt
          message
        }
      }
    `;

    const graphqlResponse = await fetch(BACKEND_GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          stotraId,
          language: lang,
        },
      }),
    });

    if (!graphqlResponse.ok) {
      // Get response body for better error reporting
      const errorBody = await graphqlResponse.text();
      console.error(`GraphQL error (${graphqlResponse.status}):`, errorBody);

      // Handle JWT expiration specifically
      if (graphqlResponse.status === 401) {
        try {
          const errorData = JSON.parse(errorBody);
          if (errorData.details && errorData.details.includes('jwt expired')) {
            return res.status(401).json({
              message: 'Session expired',
              error: 'jwt_expired',
              requiresReauth: true
            });
          }
        } catch (e) {
          // If parsing fails, fall through to generic error handling
        }
      }

      // If GraphQL endpoint doesn't exist yet, return a helpful message
      if (graphqlResponse.status === 400 || graphqlResponse.status === 404) {
        console.warn(
          'GraphQL getPdfDownloadUrl not implemented yet. Returning mock response for development.'
        );
        // For development: return a mock queued response
        return res.status(202).json({ message: 'queued' });
      }
      throw new Error(`GraphQL request failed with status ${graphqlResponse.status}: ${errorBody}`);
    }

    const graphqlData = await graphqlResponse.json();

    // Handle Apollo Server 4 response format (wrapped in body.singleResult)
    const responseData = graphqlData.body?.singleResult || graphqlData;

    if (responseData.errors) {
      console.error('GraphQL errors:', responseData.errors);
      return res.status(500).json({ message: 'Failed to generate PDF' });
    }

    const pdfResult = responseData.data?.getPdfDownloadUrl;

    if (!pdfResult) {
      console.error('No PDF result. Full response:', JSON.stringify(graphqlData));
      console.error('Response data:', JSON.stringify(responseData, null, 2));
      return res.status(500).json({ message: 'No PDF result returned from backend' });
    }

    console.log(`✅ PDF Status for ${slug} (${lang}): ${pdfResult.status}`);

    // 5. Return appropriate response based on status
    switch (pdfResult.status) {
      case 'ready':
        if (!pdfResult.url) {
          return res.status(500).json({ message: 'PDF ready but no URL provided' });
        }
        return res.status(200).json({
          url: pdfResult.url,
          version: pdfResult.version,
          generatedAt: pdfResult.generatedAt,
        });

      case 'queued':
        return res.status(202).json({
          message: 'queued',
          info: pdfResult.message || 'PDF generation has been queued',
        });

      case 'failed':
        return res.status(500).json({
          message: pdfResult.message || 'PDF generation failed',
        });

      default:
        return res.status(500).json({
          message: 'Unknown PDF status',
        });
    }
  } catch (error) {
    console.error('Error in PDF download API for', req.query.slug, ':', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
