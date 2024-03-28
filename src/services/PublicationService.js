import api from "../../config/api";

export const sendPublications = async (data) =>
{
 
      try {
        // post data
        const response = await api.post(`/publications`, data);
        return response;
      } catch (error) {
        throw Error(error.message);
      }
}


