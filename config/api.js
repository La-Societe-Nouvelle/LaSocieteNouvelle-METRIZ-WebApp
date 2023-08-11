import axios from 'axios';
import { saveErrorLog } from '../src/services/StatsService';

const api = axios.create({
  baseURL: 'https://api.lasocietenouvelle.org',

});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "production") {
      saveErrorLog(new Date(), "Erreur API", error.message);
    }
  }
);

export default api;
