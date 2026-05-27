const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface GeminiChoicesResult {
  title: string;
  choices: string[];
}

export const generateChoicesAPI = async (prompt: string): Promise<GeminiChoicesResult> => {
  const res = await fetch(`${BASE_URL}/surveys/gemini/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return {
    title: typeof data.title === 'string' ? data.title : '',
    choices: Array.isArray(data.choices) ? data.choices : [],
  };
};
