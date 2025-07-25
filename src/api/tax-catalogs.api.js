import axios from 'axios';

const API_BASE = 'http://localhost:3000/catalogs'; 

export const getTaxRegimes = async () => {
  const response = await axios.get(`${API_BASE}/tax-regimes`);
  return response.data; 
};

export const getCfdiUses = async () => {
  const response = await axios.get(`${API_BASE}/cfdi-uses`);
  return response.data;
};
