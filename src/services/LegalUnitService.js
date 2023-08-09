import api from "../../config/api";

class LegalUnitService {
  getLegalUnitData(siren) {
    return api.get(`/legalunitfootprint/${siren}`);
  }
}

export default new LegalUnitService();
