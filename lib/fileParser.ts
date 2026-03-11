import { ParsedFile } from './types';
import mammoth from 'mammoth';
import JSZip from 'jszip';

export async function parseFile(file: File): Promise<ParsedFile> {
  const extension = file.name.toLowerCase().split('.').pop();

  switch (extension) {
    case 'pdf':
      return parsePDF(file);
    case 'docx':
      return parseDOCX(file);
    case 'pptx':
      return parsePPTX(file);
    case 'ppt':
    case 'doc':
      throw new Error(`Legacy ${extension.toUpperCase()} format not supported. Please convert to ${extension === 'ppt' ? 'PPTX' : 'DOCX'}.`);
    case 'txt':
      return parseTXT(file);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
      return parseImage(file);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

async function parsePDF(file: File): Promise<ParsedFile> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source from local public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return {
    type: 'text',
    content: fullText.trim()
  };
}

async function parseDOCX(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return {
    type: 'text',
    content: result.value.trim()
  };
}

async function parsePPTX(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let fullText = '';

  // PPTX slides are stored in ppt/slides/slide*.xml
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text');
    // Extract text from XML - simple regex approach
    const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
    if (textMatches) {
      const slideText = textMatches
        .map(match => match.replace(/<\/?a:t>/g, ''))
        .join(' ');
      fullText += slideText + '\n\n';
    }
  }

  return {
    type: 'text',
    content: fullText.trim()
  };
}

async function parseTXT(file: File): Promise<ParsedFile> {
  const text = await file.text();

  return {
    type: 'text',
    content: text.trim()
  };
}

async function parseImage(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({
        type: 'image',
        content: base64,
        mimeType: file.type
      });
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function getFileExtension(filename: string): string {
  return filename.toLowerCase().split('.').pop() || '';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
