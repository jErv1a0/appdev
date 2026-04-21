import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export default API;
