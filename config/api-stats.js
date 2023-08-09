import axios from 'axios';

export default axios.create({
  baseURL: "https://api.stats.lasocietenouvelle.org",
  headers: {
    "Content-type": "application/json"
  }
});
