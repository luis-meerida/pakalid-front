import axios from 'axios';

export async function createProspect(data) {
  return axios.post('http://localhost:3000/prospects', data); // Cambia la URL si es diferente
}
