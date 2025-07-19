import axios from 'axios';

const API_BASE = 'http://localhost:3002/tax-catalogs';

export const getTaxRegimes = async () => {
  const response = await axios.get(`${API_BASE}/tax-regimes`);
  return response.data;
};

export const getCfdiUses = async () => {
  const response = await axios.get(`${API_BASE}/cfdi-uses`);
  return response.data;
};
