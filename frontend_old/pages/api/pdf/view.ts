import { NextApiRequest, NextApiResponse } from 'next';

// Backend REST URL for accessing stored PDFs
const BACKEND_REST_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

/**
 * API Route: /api/pdf/view
 *
 * Proxies PDF file requests to the backend storage service
 * Opens PDF in new tab/window instead of downloading directly
 *
 * Query params:
 *   - file: File key (e.g., 'pdfs/te/filename.pdf')
 *
 * Response codes:
 *   - 200: PDF file served
 *   - 400: Invalid or missing file parameter
 *   - 404: PDF file not found
 *   - 500: Server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file } = req.query;

    // Validate file parameter
    if (!file || typeof file !== 'string') {
      console.error('❌ Invalid or missing file parameter:', file);
      return res.status(400).json({ error: 'File parameter is required' });
    }

    // Security: Prevent path traversal attacks
    if (file.includes('..') || file.startsWith('/')) {
      console.error('❌ Invalid file path attempt:', file);
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Ensure file is a PDF in the pdfs directory
    if (!file.startsWith('pdfs/') || !file.endsWith('.pdf')) {
      console.error('❌ File not in allowed directory or format:', file);
      return res.status(400).json({ error: 'Only PDF files in pdfs/ directory are allowed' });
    }

    console.log(`📖 PDF view request: ${file}`);

    // Call backend REST API to fetch PDF
    const backendUrl = `${BACKEND_REST_URL}/rest/pdf/file?key=${encodeURIComponent(file)}`;

    const response = await fetch(backendUrl);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️  PDF not found: ${file}`);
        return res.status(404).json({ error: 'PDF file not found' });
      }

      const errorText = await response.text();
      console.error(`❌ Backend error (${response.status}):`, errorText);
      return res.status(response.status).json({ error: 'Failed to retrieve PDF' });
    }

    // Get file buffer from response
    const buffer = await response.arrayBuffer();

    // Extract filename from file path for Content-Disposition header
    const filename = file.split('/').pop() || 'document.pdf';

    // Set headers for PDF response - use 'inline' to open in browser/new tab instead of downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    console.log(`✅ PDF opened: ${file} (${buffer.byteLength} bytes)`);

    // Send PDF file
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ PDF view error:', error);
    return res.status(500).json({
      error: 'Failed to view PDF',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
