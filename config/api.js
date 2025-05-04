// La Société Nouvelle

//-- Packages
import axios from 'axios';

//-- Services
import { saveErrorLog } from '../src/statReportService/StatReportService';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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