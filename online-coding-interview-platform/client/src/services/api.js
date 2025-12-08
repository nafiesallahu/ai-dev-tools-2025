import { API_URL } from '../constants';

export async function createSession() {
  const res = await fetch(`${API_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to create session');
  }

  return res.json();
}


