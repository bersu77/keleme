import { Question, ParsedFile } from './types';

const QUESTION_GENERATION_PROMPT = `You are an expert exam question generator. Based on the provided content, generate multiple-choice questions that test understanding of the key concepts.

IMPORTANT: You must respond with ONLY a valid JSON array, no markdown, no explanation, just the raw JSON.

Generate 5-10 questions depending on the content length. Each question should:
1. Test important concepts from the content
2. Have exactly 4 options (A, B, C, D)
3. Have only one correct answer
4. Include a brief explanation for the correct answer

Response format (JSON array only):
[
  {
    "question": "What is the main purpose of X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct"
  }
]

Note: correctAnswer is the 0-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).

Content to analyze:
`;

const IMAGE_PROMPT = `You are an expert exam question generator. Look at this image and generate multiple-choice questions that test understanding of the content shown.

IMPORTANT: You must respond with ONLY a valid JSON array, no markdown, no explanation, just the raw JSON.

Generate 3-5 questions based on what you see. Each question should:
1. Test understanding of concepts visible in the image
2. Have exactly 4 options (A, B, C, D)
3. Have only one correct answer
4. Include a brief explanation for the correct answer

Response format (JSON array only):
[
  {
    "question": "What is shown in this image?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct"
  }
]

Note: correctAnswer is the 0-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).
`;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

export async function generateQuestions(
  apiKey: string,
  parsedFile: ParsedFile
): Promise<Question[]> {
  if (parsedFile.type === 'image') {
    return generateFromImage(apiKey, parsedFile);
  } else {
    return generateFromText(apiKey, parsedFile.content);
  }
}

async function generateFromText(apiKey: string, text: string): Promise<Question[]> {
  const maxLength = 30000;
  const truncatedText = text.length > maxLength
    ? text.substring(0, maxLength) + '...[content truncated]'
    : text;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Exam Question Generator'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: QUESTION_GENERATION_PROMPT + truncatedText }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return parseQuestions(data.choices?.[0]?.message?.content || '');
}

async function generateFromImage(apiKey: string, parsedFile: ParsedFile): Promise<Question[]> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Exam Question Generator'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: IMAGE_PROMPT },
          { type: 'image_url', image_url: { url: `data:${parsedFile.mimeType || 'image/png'};base64,${parsedFile.content}` } }
        ]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return parseQuestions(data.choices?.[0]?.message?.content || '');
}

function parseQuestions(responseText: string): Question[] {
  try {
    let jsonStr = responseText.trim();

    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) throw new Error('Response is not an array');

    return parsed.map((q, index) => ({
      id: index + 1,
      question: q.question || 'Question not available',
      options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || undefined
    }));
  } catch (error) {
    console.error('Failed to parse questions:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
