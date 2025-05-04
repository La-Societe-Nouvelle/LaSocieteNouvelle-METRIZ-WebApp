// La Société Nouvelle

//-- Packages
import axios from 'axios';

//-- Service
import { saveErrorLog } from '../src/statReportService/StatReportService';

const apiStats = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APISTAT_URL,
  headers: {
    "Content-type": "application/json"
  }
});

// Global error handler
apiStats.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "production") {
      saveErrorLog(new Date(), "Erreur API Stats", error.message);
    }
  }
);

export default apiStats;