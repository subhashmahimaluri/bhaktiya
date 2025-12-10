import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get backend URL from environment variables
  // Server-side API routes have access to both BACKEND_REST_URL and NEXT_PUBLIC_BACKEND_REST_URL
  const BACKEND_URL = process.env.BACKEND_REST_URL || process.env.NEXT_PUBLIC_BACKEND_REST_URL;

  if (!BACKEND_URL) {
    console.error('[Image Proxy] BACKEND_REST_URL or NEXT_PUBLIC_BACKEND_REST_URL not configured');
    return res.status(500).json({
      error: 'Backend URL not configured',
      message: 'BACKEND_REST_URL environment variable is required',
    });
  }

  try {
    const { path } = req.query;

    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: 'Invalid image path' });
    }

    // Construct the backend image URL
    const imagePath = path.join('/');
    const backendImageUrl = `${BACKEND_URL}/images/${imagePath}`;

    // Fetch the image from backend
    const imageResponse = await fetch(backendImageUrl);

    if (!imageResponse.ok) {
      console.error(
        `[Image Proxy] Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`
      );
      return res.status(imageResponse.status).json({
        error: 'Image not found',
        backendUrl: backendImageUrl,
        status: imageResponse.status,
        statusText: imageResponse.statusText,
      });
    }

    // Get the image buffer and content type
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Content-Length', imageBuffer.byteLength);

    // Send the image
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({
      error: 'Failed to proxy image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
