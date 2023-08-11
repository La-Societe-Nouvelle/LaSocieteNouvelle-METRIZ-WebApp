import axios from 'axios';
import { saveErrorLog } from '../src/services/StatsService';


const apiStats = axios.create({
  baseURL: "https://api.stats.lasocietenouvelle.org",
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

