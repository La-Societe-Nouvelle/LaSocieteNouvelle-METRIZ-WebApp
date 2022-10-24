import api from "../api";

class SerieDataService {

    getMacroData(indic,code,aggregate){
        return api.get(`/serie/MACRO_${indic}_FRA_DIV?code=${code}&aggregate=${aggregate}&area=FRA`);
    }    
    


}

export default new SerieDataService();