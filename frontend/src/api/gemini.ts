const BASE_URL = import.meta.env.VITE_API_URL;

export const generateChoicesAPI = async (prompt: string): Promise<string[]> => {
  const res = await fetch(`${BASE_URL}/surveys/gemini/choices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.choices;
};
