import api from "../api";

class SerieDataService {

    getMacroData(indic,code,aggregate){
        return api.get(`/serie/MACRO_HISTORICALDATA_DISCOUNTED_${indic}_FRA_DIVISION?code=${code}&aggregate=${aggregate}&area=FRA`);
    } 
    
    getSerieData(id,code,aggregate){

        return api.get(`/serie/${id}?code=${code}&aggregate=${aggregate}&area=FRA`);        
    }
    


}

export default new SerieDataService();