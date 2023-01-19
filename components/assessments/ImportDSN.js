// La Société Nouvelle

// React
import React from "react";
import { Alert, Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { getNewId, getSumItems, roundValue } from "../../src/utils/Utils";

// readers
import { DSNDataReader, DSNFileReader } from "/src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

const primesIncludedInPay = ["026", "027", "028", "029", "030"];
const revenuAutresIncludedInPay = ["02","03","04","05","06","10","11","12","14","15","16","17","18","19","25","26","27","31","33","90","91","92","93"];

/* -------------------- IMPORT DSN FILE -------------------- */

export class ImportDSN extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      socialStatements: props.impactsData.socialStatements || [],
      errorFile: false,
    };
  }

  render() 
  {
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

  importFile = async (file) => 
  {
    let extension = file.name.split(".").pop();
    if (extension == "edi") {
      let reader = new FileReader();
      reader.onload = async () => {
        try {
          // DSN file -> array of rows (grouped by bloc)
          let dataDSN = await DSNFileReader(reader.result);
          try {
            // rows -> json 
            let socialStatement = await DSNDataReader(dataDSN);
            try {
              // check if data measurable
              socialStatement.interdecileRange = await getInterdecileRange(
                [socialStatement]
              );
              socialStatement.genderWageGap = await getGenderWageGap(
                [socialStatement]
              );
              // add to list of statements
              socialStatement.id = getNewId(this.state.socialStatements);
              socialStatement.nicEtablissement = socialStatement.entreprise.etablissement.nic;
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

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(impactsData.socialStatements);
    await this.props.onUpdate("idr");

    // update geq data
    impactsData.wageGap = await getGenderWageGap(impactsData.socialStatements);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(impactsData.socialStatements);
    await this.props.onUpdate("knw");

    this.props.onGoBack();
  };
}

/* -------------------- FORMULAS -------------------- */

const getInterdecileRange = async (declarations) => 
{
  // retrieve working hours & pay for each individual
  let individualsData = [];
  for (let declaration of declarations) 
  {
    let individus = declaration.entreprise.etablissement.individus;
    for (let individu of individus) {
      let id = individu.identifiant || individu.identifiantTechnique;
      let workingHours = await getIndividualWorkingHours(individu);
      let wage = await getIndividualWage(individu);

      let individual = individualsData.filter((individual) => individual.id == id)[0];
      if (individual != undefined) {
        individual.workingHours += workingHours;
        individual.wage += wage;
      } else {
        individualsData.push({
          id: id,
          workingHours: workingHours,
          wage: wage
        });
      }
    }
  };

  // build hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.workingHours > 0
          ? roundValue(individual.wage / individual.workingHours, 2)
          : null)
  );

  // filter individuals without hourlyRate
  individualsData = individualsData
    .filter((individual) => individual.hourlyRate != null)
    .sort((a, b) => a.hourlyRate - b.hourlyRate);
  
  let totalHours = getSumItems(
    individualsData.map((individual) => individual.workingHours)
  );

  if (individualsData.length < 2 || totalHours == 0) return 1;

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

const getGenderWageGap = async (declarations) => 
{
  // retrieve sex, working hours & pay for each individual
  let individualsData = [];
  for (let declaration of declarations) 
  {
    let individus = declaration.entreprise.etablissement.individus;
    for (let individu of individus) {
      let id = individu.identifiant || individu.identifiantTechnique;
      let sex = getIndividualSex(individu);
      let workingHours = await getIndividualWorkingHours(individu);
      let wage = await getIndividualWage(individu);

      let individual = individualsData.filter((individual) => individual.id == id)[0];
      if (individual != undefined) {
        individual.workingHours += workingHours;
        individual.wage += wage;
      } else {
        individualsData.push({
          id: id,
          sex: sex,
          workingHours: workingHours,
          wage: wage
        });
      }
    }
  };

  // build hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.workingHours > 0
          ? roundValue(individual.wage / individual.workingHours, 2)
          : null)
  );

  // filter individuals without hourly rate or defined sex
  individualsData = individualsData.filter(
    (individual) =>
      individual.hourlyRate != null &&
      (individual.sex == 1 || individual.sex == 2)
  );

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(men.map((individual) => individual.wage));
  let hoursMen = getSumItems(men.map((individual) => individual.workingHours));
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(women.map((individual) => individual.wage));
  let hoursWomen = getSumItems(women.map((individual) => individual.workingHours));
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

const getGenderWageGap_pctHourlyRateMen = async (declarations) => 
{
  // retrieve sex, working hours & pay for each individual
  let individualsData = [];
  for (let declaration of declarations) 
  {
    let individus = declaration.entreprise.etablissement.individus;
    for (let individu of individus) {
      let id = individu.identifiant || individu.identifiantTechnique;
      let sex = getIndividualSex(individu);
      let workingHours = await getIndividualWorkingHours(individu);
      let wage = await getIndividualWage(individu);

      let individual = individualsData.filter((individual) => individual.id == id)[0];
      if (individual != undefined) {
        individual.workingHours += workingHours;
        individual.wage += wage;
      } else {
        individualsData.push({
          id: id,
          sex: sex,
          workingHours: workingHours,
          wage: wage
        });
      }
    }
  };

  // build hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.workingHours > 0
          ? roundValue(individual.wage / individual.workingHours, 2)
          : null)
  );

  // filter individuals without hourly rate or defined sex
  individualsData = individualsData.filter(
    (individual) =>
      individual.hourlyRate != null &&
      (individual.sex == 1 || individual.sex == 2)
  );

  let men = individualsData.filter((individual) => individual.sex == 1);
  let women = individualsData.filter((individual) => individual.sex == 2);

  if (men.length == 0 || women.length == 0) return 0;

  // Men
  let payMen = getSumItems(men.map((individual) => individual.wage));
  let hoursMen = getSumItems(men.map((individual) => individual.workingHours));
  let hourlyRateMen = roundValue(payMen / hoursMen, 2);

  // Men
  let payWomen = getSumItems(women.map((individual) => individual.wage));
  let hoursWomen = getSumItems(women.map((individual) => individual.workingHours));
  let hourlyRateWomen = roundValue(payWomen / hoursWomen, 2);

  // Interdecile range
  let genderWageGap = roundValue(
    Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateMen,
    2
  );
  return genderWageGap;
};

// Rémunérations liées à des contrats d'apprentissage (stage, alternance, etc.)
const getApprenticeshipRemunerations = async (declarations) => 
{
  // retrieve sex, working hours & pay for each individual
  let individualsData = [];
  for (let declaration of declarations) 
  {
    let individus = declaration.entreprise.etablissement.individus;
    for (let individu of individus) {
      let id = individu.identifiant || individu.identifiantTechnique;
      let workingHours = await getIndividualWorkingHours(individu);
      let apprenticeshipHours = await getIndividualApprenticeshipHours(individu);
      let wage = await getIndividualWage(individu);

      let individual = individualsData.filter((individual) => individual.id == id)[0];
      if (individual != undefined) {
        individual.workingHours += workingHours;
        individual.apprenticeshipHours += apprenticeshipHours;
        individual.wage += wage;
      } else {
        individualsData.push({
          id: id,
          workingHours: workingHours,
          apprenticeshipHours: apprenticeshipHours,
          wage: wage
        });
      }
    }
  };

  // build hourly rate
  individualsData.forEach(
    (individual) =>
      (individual.hourlyRate =
        individual.workingHours > 0
          ? roundValue(individual.wage / individual.workingHours, 2)
          : null)
  );

  // filter individuals without hourly rate or defined sex
  individualsData = individualsData.filter(
    (individual) =>
      individual.hourlyRate != null
  );

  let apprenticesRemunerations = individualsData
    .map(({hourlyRate,apprenticeshipHours}) => hourlyRate*apprenticeshipHours)
    .reduce((a, b) => a + b, 0);
  
  return roundValue(apprenticesRemunerations, 0);
};

/* -------------------- STATEMENTS GETTERS -------------------- */

const getIndividualSex = (individu) =>
{
  let sex = individu.sexe
        ? parseInt(individu.sexe)
        : parseInt(individu.identifiant.charAt(0));
  return sex;
}

/** Heures de travail
 *  Conditions - Heures associées à la recherche/formation
 *    - Heures d'activités
 *    - 012
 *    - 013
 *    - 017
 *    - 018
 */

const getIndividualWage = (individu) =>
{
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

  return roundValue(montantDeclaration,2);
}

/** Heures de travail
 *  Conditions - Heures associées à la recherche/formation
 *    - Heures d'activités
 *    - 012
 *    - 013
 *    - 017
 *    - 018
 */

const getIndividualWorkingHours = (individu) =>
{
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
      .filter((remuneration) =>
        ["012", "013", "017", "018"].includes(remuneration.type) // add to doc
      )
      .forEach((remuneration) => {
        heuresDeclaration += parseInt(remuneration.nombreHeures);
      });
  });

  return roundValue(heuresDeclaration,2);
}

const getQuotiteTravail = (mesure, uniteActivite, uniteContrat) => {
  const unite = uniteActivite || uniteContrat || null;
  switch (unite) {
    case null:
      return 0;
    case "10":
      return mesure;
    case "12":
      return mesure * 7;
    case "20":
      return mesure * 7;
    case "21":
      return mesure;
    case "35":
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

const getIndividualApprenticeshipHours = (individu) =>
{
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
        if (contrat.nature == "29" || ["61","64","65","66","81","92"].includes(contrat.dispositifPolitique)) {
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

  return roundValue(trainingHours,2);
}

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
