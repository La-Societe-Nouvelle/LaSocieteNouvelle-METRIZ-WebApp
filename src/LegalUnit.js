
export class LegalUnit {

  constructor() 
  {
      this.siren = "";
      this.corporateName = null;
      this.corporateHeadquarters = null;
      this.year = "";
  }

  updateFromBackUp(backUp) {
    this.siren = backUp.siren;
    this.corporateName = backUp.corporateName;
    this.corporateHeadquarters = backUp.corporateHeadquarters;
    this.year = backUp.year;
  }

  setSiren(siren) {
    this.siren = siren;
  }

  setYear(year) {
    this.year = year;
  }

}