import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import api from "./api";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

/* ---------- LEGAL UNIT DATA ---------- */
export class LegalUnit {
  constructor(props) {
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
    this.isActivitesArtisanales = props.isActivitesArtisanales || null;
    this.isLocalisationEtranger = props.isLocalisationEtranger || null;

    // Accounting period
    this.year = props.year || "";

    // Sector footprints
    this.productionSectorFootprint = new SocialFootprint(
      props.productionSectorFootprint
    );
    this.valueAddedSectorFootprint = new SocialFootprint(
      props.valueAddedSectorFootprint
    );
    this.consumptionSectorFootprint = new SocialFootprint(
      props.consumptionSectorFootprint
    );
    // Economic area footprints
    this.productionAreaFootprint = new SocialFootprint(
      props.productionAreaFootprint
    );
    this.valueAddedAreaFootprint = new SocialFootprint(
      props.valueAddedAreaFootprint
    );

    // status
    this.status = props.status || ""; // OK:200 NOT FOUND: 404 ERROR: 500
    this.dataFetched = props.dataFetched || false;

    // fetch default references
    if (props.productionAreaFootprint == undefined)
      this.initFootprintsReferences();

    // ---------------------------------------------------------------------------------------------------- //
  }

  /* ----- SETTERS ----- */

  setSiren = async (siren) => {
    this.siren = siren;
    this.dataFetched = null;
    // Fetch data
    await this.fetchLegalUnitData();
    await this.fetchFootprintsReferences();
  };

  setYear = (year) => (this.year = year);

  /* ----- FETCHING DATA ----- */

  // Fetch legal unit data
  fetchLegalUnitData = async () => {
    if (/[0-9]{9}/.test(this.siren)) {
      // request
      api.get("legalunitfootprint/" + this.siren).then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          this.corporateName = res.data.legalUnit.denominationunitelegale;
          this.corporateHeadquarters =
            res.data.legalUnit.libellecommuneetablissement +
            " (" +
            res.data.legalUnit.codepostaletablissement +
            ")";
          this.areaCode = "FRA";
          this.activityCode = res.data.legalUnit.activiteprincipaleunitelegale;
          // TO DO
          // this.isEmployeur = res.data.legalUnit.isEmployeur;
          // this.trancheEffectifs = res.data.legalUnit.trancheEffectifs;
          // this.isEconomieSocialeSolidaire = res.data.legalUnit.isEconomieSocialeSolidaire;
          // this.isActivitesArtisanales = res.data.legalUnit.isActivitesArtisanales;
          // this.isLocalisationEtranger = res.data.legalUnit.isLocalisationEtranger;

          this.dataFetched = true;
        } else {
          this.corporateName = "";
          this.corporateHeadquarters = "";
          this.areaCode = "FRA";
          this.activityCode = "00";
          this.isEmployeur = null;
          this.trancheEffectifs = null;
          this.isEconomieSocialeSolidaire = null;
          this.isActivitesArtisanales = null;
          this.isLocalisationEtranger = null;
          this.dataFetched = false;
        }
        this.status = status;
      });
    } else {
      this.corporateName = "";
      this.corporateHeadquarters = "";
      this.areaCode = "";
      this.activityCode = "";
      this.isEmployeur = null;
      this.trancheEffectifs = null;
      this.isEconomieSocialeSolidaire = null;
      this.isActivitesArtisanales = null;
      this.isLocalisationEtranger = null;
      this.status = null;
      this.dataFetched = false;
    }
  };

  // Fetch consumption CSF data
  fetchFootprintsReferences = async () => {


    // Fetch sector footprints
    if (this.activityCode != null) {
      let division = this.activityCode.substring(0, 2);

      api
        .get(
          "defaultfootprint/?activity=" + division + "&aggregate=PRD&area=FRA"
        )
        .then((res) => {
          let status = res.data.header.code;

          if (status == 200) {
            let data = res.data;
            this.productionSectorFootprint.updateAll(data.footprint);
          } else {
            this.productionSectorFootprint = new SocialFootprint();
          }
        });

      // Value Added
      api
        .get(
          "defaultfootprint/?activity=" + division + "&aggregate=GVA&area=FRA"
        )
        .then((res) => {
          let status = res.data.header.code;

          if (status == 200) {
            let data = res.data;
            this.valueAddedSectorFootprint.updateAll(data.footprint);
          } else {
            this.valueAddedSectorFootprint = new SocialFootprint();
          }
          this.status = status;
        });

      // Intermediate Consumption
      api
        .get(
          "defaultfootprint/?activity=" + division + "&aggregate=IC&area=FRA"
        )
        .then((res) => {
          let status = res.data.header.code;

          if (status == 200) {
            let data = res.data;
            this.consumptionSectorFootprint.updateAll(data.footprint);
          } else {
            this.consumptionSectorFootprint = new SocialFootprint();
          }
          this.status = status;
        });
    } else {
      this.productionSectorFootprint = new SocialFootprint();
      this.valueAddedAreaFootprint = new SocialFootprint();
      this.consumptionSectorFootprint = new SocialFootprint();
    }

    // Fetch area footprints

    // PIB+IMP FRA (Available production in FRA)

    api
      .get("defaultfootprint/?activity=00&aggregate=PRD&area=FRA")
      .then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data;
          this.productionAreaFootprint.updateAll(data.footprint);
        } else {
          this.productionAreaFootprint = new SocialFootprint();
        }
      });

    // PIB FRA (Value Added in France)

    api
      .get("defaultfootprint/?activity=00&aggregate=GVA&area=FRA")
      .then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data;
          this.valueAddedAreaFootprint.updateAll(data.footprint);
        } else {
          this.valueAddedAreaFootprint = new SocialFootprint();
        }
      });
  };

  initFootprintsReferences = async () => {

    // Fetch area footprints

    // PIB+IMP FRA (Available production in FRA)

    api
      .get("defaultfootprint/?activity=00&aggregate=GAP&area=FRA")
      .then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data;
          this.productionAreaFootprint.updateAll(data.footprint);
        } else {
          this.productionAreaFootprint = new SocialFootprint();
        }
      });

    // PIB FRA (Value Added in France)
    api
      .get("defaultfootprint/?activity=00&aggregate=GVA&area=FRA")
      .then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data;
          this.valueAddedAreaFootprint.updateAll(data.footprint);
        } else {
          this.valueAddedAreaFootprint = new SocialFootprint();
        }
      });
  };
}
