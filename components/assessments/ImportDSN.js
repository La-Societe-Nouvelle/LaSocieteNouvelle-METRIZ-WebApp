// La Société Nouvelle

// React
import React from "react";
import { Alert, Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { getNewId, getSumItems, roundValue } from "../../src/utils/Utils";

// readers
import { DSNDataReader, DSNFileReader } from "/src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

const primesIncludedInPay = [
  // ginore : Indemnités fin de contrat & assimilés
  "026",  // Prime exceptionnelle liée à l'activité avec période de rattachement spécifique
  "027",  // Prime liée à l'activité avec période de rattachement spécifique
  "028",  // Prime non liée à l'activité
  "029",  // Prime liée au rachat des jours de RTT avec période de rattachement spécifique
  "030"   // Prime rachat CET
];
const revenuAutresIncludedInPay = [
  "02",   // Avantage en nature : repas
  "03",   // Avantage en nature : logement
  "04",   // Avantage en nature : véhicule
  "05",   // Avantage en nature : NTIC
  "06",   // Avantage en nature : autres
  // ignore : Frais professionnels remboursés &assimilés
  "10",   // Déduction forfaitaire spécifique
  "11",   // Participation y compris supplément
  "12",   // ntéressement y compris supplément
  "14",   // Abondement au plan d'épargne entreprise (PEE)
  "15",   // Abondement au plan d'épargne interentreprises (PEI)
  "16",   // Abondement au plan d'épargne pour la retraite collectif (PERCO)
  "17",   // Participation patronale au financement des titres-restaurant
  "18",   // Participation patronale aux frais de transports publics
  "19",   // Participation patronale aux frais de transports personnels
  "25",   // Droit d'auteur
  "26",   // Droit de doublage
  "27",   // Droit de rediffusion
  "31",   // Avantages de préretraite versés par l’employeur
  "33",   // Sommes provenant d'un CET et réaffectées à un PERCO ou à un régime de retraite supplémentaire
  "90",   // Participation au financement des services à la personne
  "91",   // Montant de la participation de l'employeur aux chèques vacances
  "92",   // Cotisation frais de santé
  "93"    // Cotisation prévoyance et retraite supplémentaire
];

/* -------------------- IMPORT DSN FILE -------------------- */

export class ImportDSN extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      socialStatements: props.impactsData.socialStatements || [],
      errorFile: false,
    };
  }

  render() {
    const { socialStatements } = this.state;

    let alerts = [];

    const monthlyStatements = socialStatements.filter(
      (statement) => statement.nature == "01"
    );
    let distinctStatements = monthlyStatements.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (item) =>
            item.nicEtablissement == value.nicEtablissement &&
            item.mois == value.mois &&
            item.fraction == value.fraction
        )
    );
    const duplicate = monthlyStatements.length > distinctStatements.length;
    if (duplicate) {
      alerts.push({
        type: "duplicate",
        message: "Plusieurs déclarations sont identiques",
      });
    }

    let etablissements = monthlyStatements
      .map((statement) => statement.nicEtablissement)
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item == value)
      );
    etablissements.forEach((etablissement) => {
      let etablissementStatements = distinctStatements.filter(
        (statement) => statement.nicEtablissement == etablissement
      );
      let missingMonth =
        etablissementStatements.filter(
          (value, index, self) =>
            index === self.findIndex((item) => item.mois == value.mois)
        ).length != 12;
      if (missingMonth) {
        alerts.push({
          type: "missing",
          message:
            "Déclaration mensuelle manquante (année incomplète) pour l'établissement n°" +
            etablissement,
        });
      }
      let missingFraction = checkFractions(etablissementStatements);
      if (missingFraction) {
        alerts.push({
          type: "missing",
          message:
            "Déclaration mensuelle manquante (fraction incomplète) pour l'établissement n°" +
            etablissement,
        });
      }
    });

    socialStatements.sort((a, b) => compare(a, b));

    return (
      <div className="assessment">
        <div>
          <h4>Importez les déclarations mensuelles</h4>
          <Dropzone onDrop={this.onDrop} accept={[".edi"]}>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone-section">
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>
                    <i className="bi bi-file-arrow-up-fill"></i>
                    Glisser votre fichier ici
                  </p>
                  <p className="small-text">OU</p>
                  <p className="btn btn-primary">Selectionner votre fichier</p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div>
          <h4>Fichiers importés</h4>
          {this.state.errorFile == true && (
            <Alert variant="danger"> Format de fichier incorrect.</Alert>
          )}
          {alerts.map((error, key) => (
            <Alert key={key} variant="warning">
              <p>
                <i className=" bi bi-exclamation-triangle "></i> {error.message}
              </p>
            </Alert>
          ))}

          <div className="text-end mb-2">
            <button
              className="btn btn-light me-2 btn-sm"
              onClick={() => this.deleteAll()}
            >
              <i className="bi bi-trash3-fill"></i>
              &nbsp;Supprimer tout
            </button>
          </div>
          <div className="table-main">
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <td>Etat</td>
                  <td>Nom du fichier</td>
                  <td>Mois</td>
                  <td>Fraction</td>
                  <td>Ecart D9/D1</td>
                  <td>Ecart F/H</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {socialStatements.map((socialStatement) => (
                  <tr key={socialStatement.id}>
                    <td>{socialStatement.error ? "ERROR" : "OK"}</td>
                    <td>
                      {metaRubriques.declaration.nature[socialStatement.nature]}
                    </td>
                    <td>
                      {socialStatement.mois.substring(2, 4) +
                        "/" +
                        socialStatement.mois.substring(4, 8)}
                    </td>
                    <td>
                      {socialStatement.fraction.charAt(0) +
                        "/" +
                        socialStatement.fraction.charAt(1)}
                    </td>
                    <td>{socialStatement.interdecileRange}</td>
                    <td>{socialStatement.genderWageGap} %</td>
                    <td className="text-end">
                      <button
                        className="btn btn-light m-2 btn-sm "
                        onClick={() => this.deleteStatement(socialStatement.id)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                        &nbsp;Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        <hr />
        <div className="view-footer text-end mt-2">
          <button
            className="btn btn-light me-2"
            onClick={() => this.props.onGoBack()}
          >
            <i className="bi bi-chevron-left"></i>
            Retour
          </button>
          <button
            className="btn btn-secondary "
            //disabled={!isAllValid || employees.length == 0}
            onClick={() => this.onSubmit()}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  onDrop = (files) => {
    if (files.length) {
      files.forEach((file) => this.importFile(file));
      this.setState({ errorFile: false });
    } else {
      this.setState({ errorFile: true });
    }
  };

  importFile = async (file) => {
    let extension = file.name.split(".").pop();
    if (extension == "edi") {
      let reader = new FileReader();
      reader.onload = async () => {
        try {
          let dataDSN = await DSNFileReader(reader.result);
          try {
            let socialStatement = await DSNDataReader(dataDSN);
            try {
              let individualsData = await getIndividualsData([socialStatement]);
              socialStatement.interdecileRange = await getInterdecileRange(
                individualsData
              );
              socialStatement.genderWageGap = await getGenderWageGap(
                individualsData
              );
              socialStatement.id = getNewId(this.state.socialStatements);
              socialStatement.nicEtablissement =
                socialStatement.entreprise.etablissement.nic;
              socialStatement.error = false;
              this.setState({
                socialStatements: this.state.socialStatements.concat([
                  socialStatement,
                ]),
              });
            } catch (error) {
              console.log(error);
              socialStatement.interdecileRange = null;
              socialStatement.genderWageGap = null;
              socialStatement.id = getNewId(this.state.socialStatements);
              socialStatement.nicEtablissement = "";
              socialStatement.error = true;
              this.setState({
                socialStatements: this.state.socialStatements.concat([
                  socialStatement,
                ]),
              });
            }
          } catch (error) {
            console.log(error);
            console.log(reader);
          }
        } catch (error) {
          console.log(error);
          console.log(reader);
        }
      };

      reader.readAsText(file);
    }
  };

  deleteAll = () => {
    this.setState({ socialStatements: [] });
  };

  deleteStatement = (id) => {
    this.setState({
      socialStatements: this.state.socialStatements.filter(
        (statement) => statement.id != id
      ),
    });
  };

  // Submit
  onSubmit = async () => {
    let impactsData = this.props.impactsData;

    let individualsData = await getIndividualsData(this.state.socialStatements);

    impactsData.socialStatements = this.state.socialStatements;
    impactsData.individualsData = individualsData;

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(individualsData);
    //await this.props.onUpdate("idr");

    // update idr data
    impactsData.wageGap = await getGenderWageGap(individualsData);
    await this.props.onUpdate("geq");

    this.props.onGoBack();
  };
}

/* -------------------- FORMULAS -------------------- */

/** Individuals Data -> return array with each individual and data needed for assessment, from DSN files
 *  Elements in json for each individual :
 *    - id
 *    - sex (1 for man & 2 for woman)
 *    - pay
 *    - hours (nb)
 *    - hourlyRate
 */

const getIndividualsData = async (declarations) => 
{
  // array of data
  let individualsData = [];

  declarations.forEach((declaration) => 
  {
    // list of individuals
    let individus = declaration.entreprise.etablissement.individus;
    
    individus.forEach((individu) => 
    {
      // get id
      let id = individu.identifiant || individu.identifiantTechnique;
      // get sex
      let sex = individu.sexe
        ? parseInt(individu.sexe)                   // use "sexe" variable
        : parseInt(individu.identifiant.charAt(0)); // use first character of social security id
      
      let montantDeclaration = 0;
      let heuresDeclaration = 0;

      // versements
      let versements = individu.versements;
      versements.forEach((versement) => 
      {
        // Rémunérations ------------------------------------ //

        let remunerations = versement.remunerations;

        // get total amount
        // -> type 001 : "Rémunération brute non plafonnée"
        remunerations
          .filter((remuneration) => remuneration.type == "001")
          .forEach((remuneration) => {
            montantDeclaration += parseFloat(remuneration.montant);
          });

        // get nb hours
        // -> type 002 : "Salaire brut soumis à contributions d'Assurance chômage"
        remunerations
          .filter((remuneration) => remuneration.type == "002")
          .forEach((remuneration) => {
            // retrieve contract & measure unit
            let contrat = individu.contrats.filter(
              (contrat) => contrat.numero == remuneration.numeroContrat
            )[0];
            let uniteContrat = contrat.uniteMesure;
            // browse activities
            // -> type 01 : "Travail rémunéré"
            let activites = remuneration.activites;
            activites
              .filter((activite) => activite.type == "01")
              .forEach((activite) => {
                heuresDeclaration += getQuotiteTravail(
                  parseInt(activite.mesure),  // quantity
                  activite.uniteMesure,       // unit (in activity bloc)
                  uniteContrat                // unit (in contract bloc)
                );
              });
          });

        // -> type 012 : "Heures d’équivalence" 
        // -> type 013 : "Heures d’habillage, déshabillage, pause"
        // -> type 017 : "Heures supplémentaires ou complémentaires aléatoires"
        // -> type 018 : "Heures supplémentaires structurelles"
        remunerations
          .filter((remuneration) =>
            ["012", "013", "017", "018"].includes(remuneration.type)
          )
          .forEach((remuneration) => {
            montantDeclaration += parseFloat(remuneration.montant);
            heuresDeclaration += parseInt(remuneration.nombreHeures);
          });
        
        // Primes
        let primes = versement.primes;
        primes
          .filter((prime) => primesIncludedInPay.includes(prime.type))
          .forEach((prime) => {
            montantDeclaration += parseFloat(prime);
          });
        
        // Autres revenus
        //  -
        let revenuAutres = versement.revenuAutres;
        revenuAutres
          .filter((revenuAutre) =>
            revenuAutresIncludedInPay.includes(revenuAutre.type)
          )
          .forEach((revenuAutre) => {
            montantDeclaration += parseFloat(revenuAutre);
          });
      });

      // add data to individuals array
      let individual = individualsData.filter(
        (individual) => individual.id == id
      )[0];
      if (individual != undefined) {
        individual.pay += montantDeclaration;
        individual.hours += heuresDeclaration;
      } else {
        individualsData.push({
          id: id,
          sex: sex,
          pay: montantDeclaration,
          hours: heuresDeclaration,
        });
      }
    });
  });

  // add hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.hours > 0
          ? roundValue(individual.pay / individual.hours, 2)
          : null)
  );

  return individualsData;
};

const getInterdecileRange = async (individualsData) => 
{
  // sort individuals by hourly rate
  individualsData = individualsData
    .filter((individual) => individual.hourlyRate != null)
    .sort((a, b) => a.hourlyRate - b.hourlyRate);
  
  // get nb total hours
  let totalHours = getSumItems(
    individualsData.map((individual) => individual.hours)
  );

  if (individualsData.length < 2 || totalHours == 0) return 1;

  // Limits
  let limitD1 = Math.round(totalHours * 0.1);
  let limitD9 = Math.round(totalHours * 0.9);

  // D1
  let indexIndividualD1 = 0;
  let hoursD1 = individualsData[indexIndividualD1].hours;
  while (hoursD1 < limitD1 && indexIndividualD1 < individualsData.length) {
    indexIndividualD1 += 1;
    hoursD1 += individualsData[indexIndividualD1].hours;
  }
  let hourlyRateD1 = individualsData[indexIndividualD1].hourlyRate;

  // D9
  let indexIndividualD9 = 0;
  let hoursD9 = individualsData[indexIndividualD9].hours;
  while (hoursD9 < limitD9 && indexIndividualD9 < individualsData.length) {
    indexIndividualD9 += 1;
    hoursD9 += individualsData[indexIndividualD9].hours;
  }
  let hourlyRateD9 = individualsData[indexIndividualD9].hourlyRate;

  // Interdecile range
  let interdecileRange = roundValue(hourlyRateD9 / hourlyRateD1, 2);
  return interdecileRange;
};

const getQuotiteTravail = (mesure, uniteActivite, uniteContrat) => {
  const unite = uniteActivite || uniteContrat || null;
  switch (unite) {
    case null:
      return 0;
    case "10":  // heure
      return mesure;
    case "12":  // journée
      return mesure * 7;
    case "20":  // forfait jour
      return mesure * 7;
    case "21":  // forfait heure
      return mesure;
    case "35":  // heures intermittents du spectacle
      return mesure;
    default:
      return 0;
  }
};

const getGenderWageGap = async (individualsData) => {
  individualsData = individualsData.filter(
    (individual) =>
      individual.hourlyRate != null &&
      (individual.sex == 1 || individual.sex == 2)
  );

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(men.map((individual) => individual.pay));
  let hoursMen = getSumItems(men.map((individual) => individual.hours));
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(women.map((individual) => individual.pay));
  let hoursWomen = getSumItems(women.map((individual) => individual.hours));
  let hourlyRateWomen = roundValue(payWomen / hoursWomen, 2);

  // All
  let hourlyRateAll = roundValue(
    (payMen + payWomen) / (hoursMen + hoursWomen),
    2
  );

  // Interdecile range
  let genderWageGap = roundValue(
    Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateAll,
    2
  );
  return genderWageGap;
};

const getGenderWageGap_pctHourlyRateMen = async (individualsData) => {
  individualsData = individualsData.filter(
    (individual) =>
      individual.hourlyRate != null &&
      (individual.sex == 1 || individual.sex == 2)
  );

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(men.map((individual) => individual.pay));
  let hoursMen = getSumItems(men.map((individual) => individual.hours));
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(women.map((individual) => individual.pay));
  let hoursWomen = getSumItems(women.map((individual) => individual.hours));
  let hourlyRateWomen = roundValue(payWomen / hoursWomen, 2);

  // Interdecile range
  let genderWageGap = roundValue(
    Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateMen,
    2
  );
  return genderWageGap;
};

const checkFractions = (socialStatements) => {
  let missingFraction = false;
  let monthsAvailable = socialStatements
    .map((statement) => statement.mois)
    .filter(
      (value, index, self) => index === self.findIndex((item) => item == value)
    );
  monthsAvailable.forEach((month) => {
    let monthStatements = socialStatements
      .filter((statement) => statement.mois == month)
      .sort(
        (a, b) =>
          parseInt(a.fraction.charAt(0)) - parseInt(b.fraction.charAt(0))
      );
    let nbFraction = monthStatements[0].fraction.charAt(1);
    if (nbFraction > monthStatements.length) missingFraction = true;
  });
  return missingFraction;
};

const compare = (statementA, statementB) => {
  if (statementA.mois.substring(4, 8) != statementB.mois.substring(4, 8)) {
    return (
      parseInt(statementA.mois.substring(4, 8)) -
      parseInt(statementB.mois.substring(4, 8))
    );
  } else if (
    statementA.mois.substring(2, 4) != statementB.mois.substring(2, 4)
  ) {
    return (
      parseInt(statementA.mois.substring(2, 4)) -
      parseInt(statementB.mois.substring(2, 4))
    );
  } else if (statementA.fraction != statementB.fraction) {
    return (
      parseInt(statementA.fraction.charAt(0)) -
      parseInt(statementB.fraction.charAt(0))
    );
  } else {
    return 0;
  }
};
