export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ParsedFile {
  type: 'text' | 'image';
  content: string;
  mimeType?: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  questions: Question[];
}

export type SupportedFileType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/vnd.ms-powerpoint'
  | 'application/msword'
  | 'text/plain'
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif';

export const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.pptx',
  '.ppt',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif'
] as const;

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};
