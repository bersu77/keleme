import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { type, content, mimeType } = body;

    const messages =
      type === 'image'
        ? [{ role: 'user', content: [
            { type: 'text', text: IMAGE_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType || 'image/png'};base64,${content}` } }
          ]}]
        : [{ role: 'user', content: QUESTION_GENERATION_PROMPT + content.substring(0, 30000) }];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://keleme.vercel.app',
        'X-Title': 'Keleme - Gibson Student Tool'
      },
      body: JSON.stringify({ model: MODEL, messages })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: error.error?.message || 'API request failed' }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ text });

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
