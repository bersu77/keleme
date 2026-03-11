import { Question, ParsedFile } from './types';

export async function generateQuestions(
  _apiKey: string,
  parsedFile: ParsedFile
): Promise<Question[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: parsedFile.type,
      content: parsedFile.content,
      mimeType: parsedFile.mimeType
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return parseQuestions(data.text || '');
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
