import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  preview: string;
  wordCount: number;
  error?: string;
}

export async function processFile(file: File, id: string): Promise<ProcessedFile> {
  const baseInfo = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    content: '',
    preview: '',
    wordCount: 0,
  };

  try {
    let content = '';
    
    if (file.type === 'text/plain') {
      content = await processTextFile(file);
    } else if (file.type === 'application/pdf') {
      content = await processPDFFile(file);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      content = await processWordFile(file);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const wordCount = countWords(content);
    const preview = createPreview(content);

    return {
      ...baseInfo,
      content,
      preview,
      wordCount,
    };

  } catch (error) {
    console.error('File processing error:', error);
    return {
      ...baseInfo,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        resolve(content);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

async function processPDFFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read PDF file'));
          return;
        }

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n';
        }
        
        resolve(fullText.trim());
        
      } catch (error) {
        reject(new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('PDF file reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

async function processWordFile(file: File): Promise<string> {
  // For this demo, we'll use a simplified approach
  // In production, you'd use a library like mammoth.js
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read Word file'));
          return;
        }

        // This is a simplified extraction - in production use mammoth.js
        const uint8Array = new Uint8Array(arrayBuffer);
        let text = '';
        
        // Very basic text extraction (not recommended for production)
        for (let i = 0; i < uint8Array.length; i++) {
          const char = uint8Array[i];
          if (char >= 32 && char <= 126) {
            text += String.fromCharCode(char);
          }
        }
        
        // Clean up the extracted text
        text = text
          .replace(/[^\w\s.,!?;:()\-"']/g, '')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (text.length < 100) {
          reject(new Error('Could not extract text from Word document. Please try converting to PDF or plain text.'));
          return;
        }
        
        resolve(text);
        
      } catch (error) {
        reject(new Error(`Word document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Word file reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function createPreview(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  
  // Try to cut at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1) + '...';
  }
  
  // Cut at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please use PDF, DOCX, DOC, or TXT files.'
    };
  }

  return { valid: true };
}

export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return '📄';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return '📝';
    case 'text/plain':
      return '📋';
    default:
      return '📁';
  }
}

// Utility function to combine multiple file contents
export function combineFileContents(files: ProcessedFile[]): string {
  return files
    .filter(file => file.content && !file.error)
    .map(file => `=== ${file.name} ===\n\n${file.content}`)
    .join('\n\n');
}