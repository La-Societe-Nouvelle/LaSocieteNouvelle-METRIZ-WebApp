import apiStats from "../../config/api-stats";

export const sendPublications = async (data) =>
{
    // log data
    const publicationsData = {
        siren: data.siren,
        year : data.year,
        indicators: data.footprint,
      };
    
      try {
            console.log(publicationsData)
        // post data
        const response = await apiStats.post(`/publication`, publicationsData);
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
