import process from 'node:process';
import { FetchError } from '../services/helpers';

const API_URL = 'https://api.openstreetmap.org';

const authFetch = async <T>(endpoint: string, token: string): Promise<T> => {
  if (!token) {
    throw new FetchError('No OSM access token', '401');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'User-Agent': `osmapp ${process.env.osmappVersion} (SSR; https://osmapp.org/)`,
      // biome-ignore lint/style/useNamingConvention: ??????????
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || response.status < 200 || response.status >= 300) {
    const data = await response.text();
    throw new FetchError(
      `${response.status} ${response.statusText}`,
      `${response.status}`,
      data,
    );
  }

  return response.json();
};

export type ServerOsmUser = { id: number; username: string };

export const serverFetchOsmUser = async (token: string) => {
  const { user } = await authFetch('/api/0.6/user/details.json', token);
  return {
    id: user.id,
    username: user.display_name,
  } as ServerOsmUser;
};
