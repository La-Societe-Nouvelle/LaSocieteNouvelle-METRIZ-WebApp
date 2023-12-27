import apiStats from "../../config/api-stats";

const PublicationService = {
  async sendPublications(publications) {
    try {
      const response = await apiStats.post('/publication', publications);
      return response.data; 
    } catch (error) {
        console.log(error)
      throw new Error(`Erreur lors de l'envoi des publications : ${error.message}`);
    }
  },
};

export default PublicationService;
