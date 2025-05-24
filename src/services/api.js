import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchAutocompleteResults = async (query) => {
  if (!query || query.length < 2) return [];

  const response = await api.get('/autocomplete', {
    params: { q: query }
  });

  return response.data;
};