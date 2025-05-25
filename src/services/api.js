import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const api2 = axios.create({
  baseURL: import.meta.env.VITE_API_SEC_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  }
})

const api3 = axios.create({
  baseURL: import.meta.env.VITE_API_TRD_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  }
})

export const fetchAutocompleteResults = async (query) => {
  if (!query || query.length < 2) return [];

  const response = await api.get('/autocomplete', {
    params: { q: query }
  });

  console.log(response.data);

  return response.data;
};

export const fetchRiskAddresses = async () => {
  
  const response = await api2.get('/addresses');

  return response.data;
}

export const sendReport = async (id, addr) => {
  const query = {
    osm_id: parseInt(id),
    raw_address: addr
  };

  console.log(query)

  const response = await api3.post('/addresses', query);
  return response.data;
};

export const getReports = async () => {
  const response = await api3.get('/reports');
  return response.data;
}

export const getReportFile = async (id) => {
  const response = await api3.get(`/reports/${id}/download`, {
    responseType: 'blob', // <-- ВАЖНО: получать бинарные данные
  });

  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Пытаемся извлечь имя файла из заголовков
  const disposition = response.headers['content-disposition'];
  const filenameMatch = disposition && disposition.match(/filename="?(.+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : `report_${id}.pdf`;

  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const getAddress = async (id) => {
  const response = await api3.get(`/addresses/${id}/raw`)

  return response.data
}