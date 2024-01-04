import apiStats from "../../config/api-stats";

export const sendPublications = async (data) =>
{
 
      try {
        // post data
        const response = await apiStats.post(`/publication`, {publication : data});
        return response;
      } catch (error) {
        console.error(error);
        // throw Error(error.message);
      }
}

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
