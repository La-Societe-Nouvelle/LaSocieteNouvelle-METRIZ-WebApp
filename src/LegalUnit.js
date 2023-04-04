/* ---------- LEGAL UNIT DATA ---------- */
export class LegalUnit 
{
  constructor(props) 
  {
    if (props == undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //

    // identifiant
    this.siren = props.siren || "";

    // Legal data
    this.corporateName = props.corporateName || null;
    this.corporateHeadquarters = props.corporateHeadquarters || null;
    this.areaCode = props.areaCode || null;
    this.activityCode = props.activityCode || null;

    // Complements
    this.isEmployeur = props.isEmployeur || null;
    this.trancheEffectifs = props.trancheEffectifs || "";
    this.isEconomieSocialeSolidaire = props.isEconomieSocialeSolidaire || null;

    // Accounting period
    this.year = props.year || "";

    // ---------------------------------------------------------------------------------------------------- //
  }
}
