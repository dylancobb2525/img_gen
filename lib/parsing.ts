const MAX_FETCH_SIZE = 1.5 * 1024 * 1024; // 1.5MB
const FETCH_TIMEOUT = 10000; // 10 seconds

/**
 * Parse PDF file buffer to text
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading issues
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '[PDF parsing failed]';
  }
}

/**
 * Parse DOCX file buffer to text
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    // Read the docx file
    const result = await docx.Document.load(buffer);
    // Extract text from all paragraphs
    let text = '';
    
    // Simple text extraction - get all text content
    // The docx library structure may vary, this is a basic implementation
    const rawText = buffer.toString('utf-8');
    
    // Basic extraction - look for text between XML tags
    const textMatches = rawText.match(/>([^<]+)</g);
    if (textMatches) {
      text = textMatches
        .map(match => match.slice(1, -1))
        .filter(t => t.trim().length > 0 && !t.startsWith('?xml'))
        .join(' ');
    }
    
    return text || '[DOCX parsing incomplete]';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return '[DOCX parsing failed]';
  }
}

/**
 * Parse TXT file buffer to text
 */
export function parseTXT(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Fetch and extract text from URL with timeout and size limit
 */
export async function fetchURL(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'USH-Image-Helper/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return `[URL fetch failed: ${response.status}]`;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FETCH_SIZE) {
      return '[URL content too large]';
    }

    const text = await response.text();
    
    if (text.length > MAX_FETCH_SIZE) {
      return text.slice(0, MAX_FETCH_SIZE) + '\n[Truncated due to size]';
    }

    // Strip basic HTML tags
    const stripped = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return stripped;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return '[URL fetch timed out]';
    }
    console.error('URL fetch error:', error);
    return '[URL fetch failed]';
  }
}

/**
 * Parse uploaded file based on type
 */
export async function parseFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return parsePDF(buffer);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return parseDOCX(buffer);
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return parseTXT(buffer);
  }
  
  return '[Unsupported file type]';
}

