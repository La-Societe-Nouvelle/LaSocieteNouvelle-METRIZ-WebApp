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
  "026", // Prime exceptionnelle liée à l'activité avec période de rattachement spécifique
  "027", // Prime liée à l'activité avec période de rattachement spécifique
  "028", // Prime non liée à l'activité
  "029", // Prime liée au rachat des jours de RTT avec période de rattachement spécifique
  "030", // Prime rachat CET
];
const revenuAutresIncludedInPay = [
  "02", // Avantage en nature : repas
  "03", // Avantage en nature : logement
  "04", // Avantage en nature : véhicule
  "05", // Avantage en nature : NTIC
  "06", // Avantage en nature : autres
  // ignore : Frais professionnels remboursés &assimilés
  "10", // Déduction forfaitaire spécifique
  "11", // Participation y compris supplément
  "12", // ntéressement y compris supplément
  "14", // Abondement au plan d'épargne entreprise (PEE)
  "15", // Abondement au plan d'épargne interentreprises (PEI)
  "16", // Abondement au plan d'épargne pour la retraite collectif (PERCO)
  "17", // Participation patronale au financement des titres-restaurant
  "18", // Participation patronale aux frais de transports publics
  "19", // Participation patronale aux frais de transports personnels
  "25", // Droit d'auteur
  "26", // Droit de doublage
  "27", // Droit de rediffusion
  "31", // Avantages de préretraite versés par l’employeur
  "33", // Sommes provenant d'un CET et réaffectées à un PERCO ou à un régime de retraite supplémentaire
  "90", // Participation au financement des services à la personne
  "91", // Montant de la participation de l'employeur aux chèques vacances
  "92", // Cotisation frais de santé
  "93", // Cotisation prévoyance et retraite supplémentaire
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

    // filtre déclarations mensuelles
    const monthlyStatements = socialStatements.filter(
      (statement) => statement.nature == "01"
    );
    // filtre déclarations mensuelles uniques
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

    // liste des établissements concernés par les DSN
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
      // verification mois
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
      // Vérification fractions
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

    // tri par mois et fraction
    socialStatements.sort((a, b) => compare(a, b));

    return (
      <div className="assessment">
        <div>
          <h4>Importez les déclarations mensuelles</h4>
          <Dropzone onDrop={this.onDrop} accept={[".edi",".txt"]}>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone-section">
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>
                    <i className="bi bi-file-arrow-up-fill"></i>
                    Glisser votre fichier ici
                  </p>
                  <p className="small">OU</p>
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
                  <td>Ecart Femmes/Hommes</td>
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
    if (extension == "edi" || extension =="txt") {
      let reader = new FileReader();
      reader.onload = async () => {
        try {
          // DSN file -> array of rows (grouped by bloc)
          let dataDSN = await DSNFileReader(reader.result);
          try {
            // rows -> json
            let socialStatement = await DSNDataReader(dataDSN);
            let individualsData = await getIndividualsData([socialStatement]);
            try {
              // check if data measurable
              socialStatement.interdecileRange = await getInterdecileRange(individualsData);
              socialStatement.genderWageGap = await getGenderWageGap(individualsData);
              // add to list of statements
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
  onSubmit = async () => 
  {
    let impactsData = this.props.impactsData;

    impactsData.socialStatements = this.state.socialStatements;

    // indiividuals data
    impactsData.individualsData = await getIndividualsData(impactsData.socialStatements);

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(impactsData.individualsData);
    await this.props.onUpdate("idr");

    // update geq data (in pct i.e. 14.2 for 14.2 %)
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(impactsData.individualsData);
    await this.props.onUpdate("knw");

    this.props.onGoBack();
  };
}

/* -------------------- INDIVIDUALS DATA -------------------- */

/** Individuals Data -> return array with each individual and data needed for assessment, from DSN files
 *  Elements in json for each individual :
 *    - id
 *    - sex (1 for man & 2 for woman)
 *    - workingHours
 *    - wage
 *    - hourlyRate
 *    - apprenticeshipHours
 */

const getIndividualsData = async (declarations) => 
{
  // array of data
  let individualsData = [];
  for (let declaration of declarations) {
    let individus = declaration.entreprise.etablissement.individus;
    for (let individu of individus) {
      let id = individu.identifiant || individu.identifiantTechnique;
      let sex = getIndividualSex(individu);
      let name = individu.prenoms+" "+individu.nomFamille;
      let workingHours = await getIndividualWorkingHours(individu);
      let wage = await getIndividualWage(individu);
      let apprenticeshipHours = await getIndividualApprenticeshipHours(individu);
      let apprenticeshipContract = await getIndividualApprenticeshipContract(individu);

      let individual = individualsData.filter((individual) => individual.id == id)[0];
      if (individual != undefined) {
        individual.workingHours += workingHours;
        individual.wage += wage;
        individual.apprenticeshipHours += apprenticeshipHours;
      } else {
        individualsData.push({
          id,
          sex,
          name,
          workingHours,
          wage,
          apprenticeshipHours,
          apprenticeshipContract
        });
      }
    }
  }

  // build hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.workingHours > 0
          ? roundValue(individual.wage / individual.workingHours, 2)
          : null)
  );

  return individualsData;
};

/* -------------------- FORMULAS -------------------- */

export const getInterdecileRange = async (individualsData) => 
{
  // sort individuals by hourly rate
  individualsData = individualsData
    .filter((individual) => individual.hourlyRate != null && !isNaN(individual.hourlyRate) && individual.hourlyRate > 0)
    .filter((individual) => individual.workingHours != null && !isNaN(individual.workingHours) && individual.workingHours > 0)
    .sort((a, b) => a.hourlyRate - b.hourlyRate);

  // get nb total hours
  let totalHours = getSumItems(individualsData.map((individual) => individual.workingHours), 2);

  if (individualsData.length < 2 || totalHours <= 0) return 1;

  // Limits
  let limitD1 = Math.round(totalHours * 0.1);
  let limitD9 = Math.round(totalHours * 0.9);

  // D1
  let indexIndividualD1 = 0;
  let hoursD1 = individualsData[indexIndividualD1].workingHours;
  while (hoursD1 < limitD1 && indexIndividualD1 < individualsData.length) {
    indexIndividualD1 += 1;
    hoursD1 += individualsData[indexIndividualD1].workingHours;
  }
  let hourlyRateD1 = individualsData[indexIndividualD1].hourlyRate;

  // D9
  let indexIndividualD9 = 0;
  let hoursD9 = individualsData[indexIndividualD9].workingHours;
  while (hoursD9 < limitD9 && indexIndividualD9 < individualsData.length) {
    indexIndividualD9 += 1;
    hoursD9 += individualsData[indexIndividualD9].workingHours;
  }
  let hourlyRateD9 = individualsData[indexIndividualD9].hourlyRate;

  // Interdecile range
  let interdecileRange = roundValue(hourlyRateD9 / hourlyRateD1, 2);
  return interdecileRange;
};

export const getGenderWageGap = async (individualsData) => 
{
  // filter individuals without hourly rate or defined sex
  individualsData = individualsData
    .filter((individual) => individual.wage != null && !isNaN(individual.wage) && individual.wage > 0)
    .filter((individual) => individual.workingHours != null && !isNaN(individual.workingHours) && individual.workingHours > 0)
    .filter((individual) => individual.sex == 1 || individual.sex == 2);

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(
    men.map((individual) => individual.wage),
    2
  );
  let hoursMen = getSumItems(
    men.map((individual) => individual.workingHours),
    2
  );
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(
    women.map((individual) => individual.wage),
    2
  );
  let hoursWomen = getSumItems(
    women.map((individual) => individual.workingHours),
    2
  );
  let hourlyRateWomen = roundValue(payWomen / hoursWomen, 2);

  // All
  let hourlyRateAll = roundValue(
    (payMen + payWomen) / (hoursMen + hoursWomen),
    2
  );

  // Gander gap
  let genderWageGap = roundValue(
    Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateAll *100,
    1
  );
  return genderWageGap;
};

const getGenderWageGap_pctHourlyRateMen = async (individualsData) => 
{
  // filter individuals without hourly rate or defined sex
  individualsData = individualsData
    .filter((individual) => individual.wage != null && !isNaN(individual.wage) && individual.wage > 0)
    .filter((individual) => individual.workingHours != null && !isNaN(individual.workingHours) && individual.workingHours > 0)
    .filer((individual) => individual.sex == 1 || individual.sex == 2);

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(
    men.map((individual) => individual.wage),
    2
  );
  let hoursMen = getSumItems(
    men.map((individual) => individual.workingHours),
    2
  );
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(
    women.map((individual) => individual.wage),
    2
  );
  let hoursWomen = getSumItems(
    women.map((individual) => individual.workingHours),
    2
  );
  let hourlyRateWomen = roundValue(payWomen / hoursWomen, 2);

  // Gender gap
  let genderWageGap = roundValue(
    Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateMen,
    2
  );
  return genderWageGap;
};

// Rémunérations liées à des contrats d'apprentissage (stage, alternance, etc.)
export const getApprenticeshipRemunerations = async (individualsData) => 
{
  // filter individuals without hourly rate or defined sex
  individualsData = individualsData
    .filter((individual) => individual.hourlyRate != null && !isNaN(individual.hourlyRate) && individual.hourlyRate > 0)
    .filter((individual) => individual.apprenticeshipContract)
    .filter((individual) => individual.apprenticeshipHours != null && !isNaN(individual.apprenticeshipHours) && individual.apprenticeshipHours > 0);

  let apprenticesRemunerations = individualsData
    .map(
      ({ hourlyRate, apprenticeshipHours }) => hourlyRate * apprenticeshipHours
    )
    .reduce((a, b) => a + b, 0);

  return roundValue(apprenticesRemunerations, 0);
};

// Rémunérations liées à des contrats d'apprentissage (stage, alternance, etc.)
export const getEmployeesTrainingCompensations = async (individualsData) => 
{
  // filter individuals without hourly rate or defined sex
  individualsData = individualsData
    .filter((individual) => individual.hourlyRate != null && !isNaN(individual.hourlyRate) && individual.hourlyRate > 0)
    .filter((individual) => !individual.apprenticeshipContract)
    .filter((individual) => individual.apprenticeshipHours != null && !isNaN(individual.apprenticeshipHours) && individual.apprenticeshipHours > 0);

  let apprenticesRemunerations = individualsData
    .map(
      ({ hourlyRate, apprenticeshipHours }) => hourlyRate * apprenticeshipHours
    )
    .reduce((a, b) => a + b, 0);

  return roundValue(apprenticesRemunerations, 0);
};

/* -------------------- INDIVIDUALS DATA GETTERS -------------------- */

const getIndividualSex = (individu) => {
  let sex = individu.sexe
    ? parseInt(individu.sexe)
    : parseInt((individu.identifiant || individu.identifiantTechnique).charAt(0)); // erro if both id missing
  return sex;
};

/** Heures de travail
 *  Conditions - Heures associées à la recherche/formation
 *    - Heures d'activités
 *    - 012
 *    - 013
 *    - 017
 *    - 018
 */

const getIndividualWage = (individu) => {
  let montantDeclaration = 0;

  let versements = individu.versements;
  versements.forEach((versement) => {
    // Rémunérations
    let remunerations = versement.remunerations;
    remunerations
      .filter((remuneration) => remuneration.type == "001")
      .forEach((remuneration) => {
        montantDeclaration += parseFloat(remuneration.montant);
      });
    remunerations
      .filter((remuneration) =>
        ["012", "013", "017", "018"].includes(remuneration.type)
      )
      .forEach((remuneration) => {
        montantDeclaration += parseFloat(remuneration.montant);
      });
    // Primes
    let primes = versement.primes;
    primes
      .filter((prime) => primesIncludedInPay.includes(prime.type))
      .forEach((prime) => {
        montantDeclaration += parseFloat(prime.montant);
      });
    // Autres revenus
    let revenuAutres = versement.revenuAutres;
    revenuAutres
      .filter((revenuAutre) =>
        revenuAutresIncludedInPay.includes(revenuAutre.type)
      )
      .forEach((revenuAutre) => {
        montantDeclaration += parseFloat(revenuAutre.montant);
      });
  });

  return roundValue(montantDeclaration, 2);
};

/** Heures de travail
 *  Conditions - Heures associées à la recherche/formation
 *    - Heures d'activités
 *    - 012
 *    - 013
 *    - 017
 *    - 018
 */

const getIndividualWorkingHours = (individu) => {
  let heuresDeclaration = 0;

  let versements = individu.versements;
  versements.forEach((versement) => {
    // Rémunérations
    let remunerations = versement.remunerations;
    remunerations
      .filter((remuneration) => remuneration.type == "002")
      .forEach((remuneration) => {
        let contrat = individu.contrats.filter(
          (contrat) => contrat.numero == remuneration.numeroContrat
        )[0];
        let uniteContrat = contrat.uniteMesure;
        let activites = remuneration.activites;
        activites
          .filter((activite) => activite.type == "01")
          .forEach((activite) => {
            heuresDeclaration += getQuotiteTravail(
              parseInt(activite.mesure),
              activite.uniteMesure,
              uniteContrat
            );
          });
      });
    remunerations
      .filter(
        (remuneration) =>
          ["012", "013", "017", "018"].includes(remuneration.type) // add to doc
      )
      .forEach((remuneration) => {
        heuresDeclaration += parseInt(remuneration.nombreHeures);
      });
  });

  return roundValue(heuresDeclaration, 2);
};

const getQuotiteTravail = (mesure, uniteActivite, uniteContrat) => {
  const unite = uniteActivite || uniteContrat || null;
  switch (unite) {
    case null:
      return 0;
    case "10": // heure
      return mesure;
    case "12": // journée
      return mesure * 7;
    case "20": // forfait jour
      return mesure * 7;
    case "21": // forfait heure
      return mesure;
    case "35": // heures intermittents du spectacle
      return mesure;
    default:
      return 0;
  }
};

/** Conditions - Heures associées à la recherche/formation
 *    - nature "29" : Stage
 *    - dispositif politique "61" : Contrat de Professionnalisation
 *    - dispositif politique "64" : Contrat d'apprentissage entreprises artisanales ou de moins de 11 salariés (loi du 3 janvier 1979)
 *    - dispositif politique "65" : Contrat d’apprentissage entreprises non inscrites au répertoire des métiers d’au moins 11 salariés (loi de 1987)
 *    - dispositif politique "66" : Convention industrielle de formation par la recherche en entreprise (CIFRE)
 *    - dispositif politique "81" : Contrat d'apprentissage secteur public (Loi de 1992)
 *    - dispositif politique "92" : Stage de la formation professionnelle
 */

const getIndividualApprenticeshipHours = (individu) => {
  let trainingHours = 0;

  let versements = individu.versements;
  versements.forEach((versement) => {
    // Rémunérations
    let remunerations = versement.remunerations;
    remunerations
      .filter((remuneration) => remuneration.type == "002")
      .forEach((remuneration) => {
        let contrat = individu.contrats.filter(
          (contrat) => contrat.numero == remuneration.numeroContrat
        )[0];
        if (
          contrat.nature == "29" ||
          ["61", "64", "65", "66", "81", "92"].includes(
            contrat.dispositifPolitique
          )
        ) {
          let uniteContrat = contrat.uniteMesure;
          let activites = remuneration.activites;
          activites
            .filter((activite) => activite.type == "01")
            .forEach((activite) => {
              trainingHours += getQuotiteTravail(
                parseInt(activite.mesure),
                activite.uniteMesure,
                uniteContrat
              );
            });
        }
      });
  });

  return roundValue(trainingHours, 2);
};

const getIndividualApprenticeshipContract = async (individu) => 
{
  let apprenticeshipContract = false;

  let versements = individu.versements;
  versements.forEach((versement) => {
    // Rémunérations
    let remunerations = versement.remunerations;
    remunerations
      .filter((remuneration) => remuneration.type == "002")
      .forEach((remuneration) => 
      {
        let contrat = individu.contrats.find((contrat) => contrat.numero == remuneration.numeroContrat);
        if (contrat && (contrat.nature == "29" ||
          ["61", "64", "65", "66", "81", "92"].includes(contrat.dispositifPolitique))
        ) {
          apprenticeshipContract = true;
        }
      });
  });

  return apprenticeshipContract;
};

/* -------------------- OTHER FUNCTIONS -------------------- */

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
