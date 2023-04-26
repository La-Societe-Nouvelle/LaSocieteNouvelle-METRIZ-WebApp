import api from "../api";

class LegalUnitService {
  getLegalUnitData(siren) {
    return api.get(`/legalunitfootprint/${siren}`);
  }
}

