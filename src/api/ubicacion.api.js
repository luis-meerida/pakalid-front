// ubicacion.api.js
import axios from 'axios';

const API = 'http://localhost:3000/ubicacion';

export const getDefaultPais = () => axios.get(`${API}/pais-default`);

export const getPaises = () => axios.get(`${API}/paises`);

export const getEstados = (pais) =>
  axios.get(`${API}/estados`, {
    params: { pais },
  });

export const getCiudades = (pais, estado) =>
  axios.get(`${API}/ciudades`, {
    params: { pais, estado },
  });

export const getPorCP = (cp, pais = 'MX') =>
  axios.get(`${API}/por-cp`, {
    params: { cp, pais },
  });
