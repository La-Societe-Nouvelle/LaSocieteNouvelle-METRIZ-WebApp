// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { getNewId, getSumItems, roundValue } from "../../src/utils/Utils";

// readers
import { DSNDataReader, DSNFileReader } from "/src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

const primesIncludedInPay = ["026","027","028","029","030"];
const revenuAutresIncludedInPay = ["02","03","04","05","06","10","11","12","14","15","16","17","18","19","25","26","27","31","33","90","91","92","93"];

/* -------------------- IMPORT DSN FILE -------------------- */

export class ImportDSN extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      socialStatements: []
    };
  }

  render() 
  {
    const {socialStatements} = this.state

    const monthlyStatements = socialStatements.filter(statement => statement.nature=="01");
    const distinctStatements = monthlyStatements.filter((value, index, self) => index === self.findIndex(item => item.mois == value.mois && item.fraction==value.fraction));
    const duplicate = monthlyStatements.length > distinctStatements.length;

    const missingMonth = distinctStatements.filter((value, index, self) => index === self.findIndex(item => item.mois == value.mois)).length==12;
    const missingFraction = checkFractions(monthlyStatements);

    socialStatements.sort((a,b) => compare(a,b))

    return (
      <div className="assessment">
        <div className="step">
          <h4>Importez les déclarations mensuelles</h4>
          <Dropzone
            onDrop={this.onDrop}
            accept={[".edi"]}>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone-section">
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>
                    <i className="bi bi-file-arrow-up-fill"></i>
                    Glisser votre fichier ici
                  </p>
                  <p className="small-text">OU</p>
                  <p className="btn btn-primary">
                    Selectionner votre fichier
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div className="step">
          <h4>Fichiers importés</h4>
          <div className="table-main">
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <td>Etat</td>
                  <td>Nom du fichier</td>
                  <td>Mois</td>
                  <td>Fraction</td>
                  <td>Ecart D1/D9</td>
                  <td>Ecart F/H</td>
                </tr>
              </thead>
              <tbody>
                {socialStatements.map(socialStatement => 
                  <tr key={socialStatement.id}>
                    <td>{socialStatement.error ? "ERROR" : "OK"}</td>
                    <td>{metaRubriques.declaration.nature[socialStatement.nature]}</td>
                    <td>{socialStatement.mois.substring(2,4)+"/"+socialStatement.mois.substring(4,8)}</td>
                    <td>{socialStatement.fraction.charAt(0)+"/"+socialStatement.fraction.charAt(1)}</td>
                    <td>{socialStatement.interdecileRange}</td>
                    <td>{socialStatement.genderWageGap} %</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
        <hr/>             
        <div className="view-footer text-end mt-2">
          <button
            className="btn btn-light me-2"
            onClick={() => this.props.onGoBack()}>
            <i className="bi bi-chevron-left"></i>
            Retour
          </button>
          <button
            className="btn btn-secondary "
            //disabled={!isAllValid || employees.length == 0}
            onClick={() => this.onSubmit()}>
            Valider
          </button>
        </div>
      </div>
    );
  }

  onDrop = (files) => 
  {
    if (files.length) 
    {
      files.forEach(file => this.importFile(file));
      // this.openPopup();
      // this.setState({ isDisabled: false });
      // this.setState({ errorFile: false });
    } 
    // else {
    //   this.setState({ errorFile: true });
    // }
  };

  importFile = async (file) => 
  {
    let extension = file.name.split(".").pop();
    if (extension=="edi")
    {
      let reader = new FileReader();
      reader.onload = async () => 
      {
        try 
        {
          let dataDSN = await DSNFileReader(reader.result);
          try 
          {
            let socialStatement = await DSNDataReader(dataDSN);
            try 
            {
              let individualsData = await getIndividualsData([socialStatement]);
              socialStatement.interdecileRange = await getInterdecileRange(individualsData);
              socialStatement.genderWageGap = await getGenderWageGap(individualsData);
              socialStatement.id = getNewId(this.state.socialStatements);
              socialStatement.error = false;
              this.setState({ socialStatements : this.state.socialStatements.concat([socialStatement]) });
            }
            catch(error) {
              console.log(error);
              socialStatement.interdecileRange = null;
              socialStatement.genderWageGap = null;
              socialStatement.id = getNewId(this.state.socialStatements);
              socialStatement.error = true;
              this.setState({ socialStatements: this.state.socialStatements.concat([socialStatement]) });
            }
          }
          catch(error) {
            console.log(error);
            console.log(reader);
          }
        }
        catch(error) {
          console.log(error);
          console.log(reader);
        }
      };

      reader.readAsText(file);
    }
  }
  
  // Submit
  onSubmit = async () => 
  {
    let impactsData = this.props.impactsData;
  
    let individualsData = getIndividualsData(this.state.socialStatements);

    // update idr data
    impactsData.interdecileRange = getInterdecileRange(individualsData);
    //await this.props.onUpdate("idr");

    // update idr data
    impactsData.wageGap = getGenderWageGap(individualsData);
    await this.props.onUpdate("geq");
  
    this.props.onGoBack();
  };
}

/* -------------------- FORMULAS -------------------- */

// 
const getIndividualsData = async (declarations) => 
{
  let individualsData = [];
  declarations.forEach(declaration => 
  {
    let individus = declaration.entreprise.etablissement.individus;
    individus.forEach(individu => 
    {
      let id = individu.identifiant || individu.identifiantTechnique;
      let sex = individu.sexe ? parseInt(individu.sexe) : parseInt(individu.identifiant.charAt(0));
      let montantDeclaration = 0;
      let heuresDeclaration = 0;

      let versements = individu.versements;
      versements.forEach(versement => 
      {
        // Rémunérations
        let remunerations = versement.remunerations;
        remunerations.filter(remuneration => remuneration.type=="001").forEach(remuneration => {
          montantDeclaration+= parseFloat(remuneration.montant);
        })
        remunerations.filter(remuneration => remuneration.type=="002").forEach(remuneration => {
          let contrat = individu.contrats.filter(contrat => contrat.numero==remuneration.numeroContrat)[0];
          let uniteContrat = contrat.uniteMesure;
          let activites = remuneration.activites;
          activites.filter(activite => activite.type=="01").forEach(activite => {
            heuresDeclaration+= getQuotiteTravail(parseInt(activite.mesure),activite.uniteMesure,uniteContrat);
          })
        })
        remunerations.filter(remuneration => ["012","013","017","018"].includes(remuneration.type)).forEach(remuneration => {
          montantDeclaration+= parseFloat(remuneration.montant);
          heuresDeclaration+= parseInt(remuneration.nombreHeures);
        })
        // Primes
        let primes = versement.primes;
        primes.filter(prime => primesIncludedInPay.includes(prime.type)).forEach(prime => {
          montantDeclaration+= parseFloat(prime);
        })
        // Autres revenus
        let revenuAutres = versement.revenuAutres;
        revenuAutres.filter(revenuAutre => revenuAutresIncludedInPay.includes(revenuAutre.type)).forEach(revenuAutre => {
          montantDeclaration+= parseFloat(revenuAutre);
        })
      });

      let individual = individualsData.filter(individual => individual.id==id)[0];
      if (individual!=undefined) {
        individual.pay+= montantDeclaration;
        individual.hours+= heuresDeclaration;
      } else {
        individualsData.push({
          id: id,
          sex: sex,
          pay: montantDeclaration,
          hours: heuresDeclaration
        })
      }
    })
  })

  individualsData.forEach(individual => individual.hourlyRate = individual.hours > 0 ? roundValue(individual.pay / individual.hours, 2) : null);

  return individualsData;
}

const getInterdecileRange = async (individualsData) =>
{
  individualsData = individualsData.filter(individual => individual.hourlyRate!=null).sort((a,b) => a.hourlyRate - b.hourlyRate);
  let totalHours = getSumItems(individualsData.map(individual => individual.hours));

  if (individualsData.length < 2 || totalHours==0) return 1;

  // Limits
  let limitD1 = Math.round(totalHours*0.1);
  let limitD9 = Math.round(totalHours*0.9);

  // D1
  let indexIndividualD1 = 0;
  let hoursD1 = individualsData[indexIndividualD1].hours;
  while (hoursD1 < limitD1 && indexIndividualD1 < individualsData.length) {
    indexIndividualD1+=1;
    hoursD1+= individualsData[indexIndividualD1].hours;
  }
  let hourlyRateD1 = individualsData[indexIndividualD1].hourlyRate;

  // D9
  let indexIndividualD9 = 0;
  let hoursD9 = individualsData[indexIndividualD9].hours;
  while (hoursD9 < limitD9 && indexIndividualD9 < individualsData.length) {
    indexIndividualD9+=1;
    hoursD9+= individualsData[indexIndividualD9].hours;
  }
  let hourlyRateD9 = individualsData[indexIndividualD9].hourlyRate;

  // Interdecile range
  let interdecileRange = roundValue(hourlyRateD9/hourlyRateD1,2);
  return interdecileRange;
}

const getQuotiteTravail = (mesure,uniteActivite,uniteContrat) =>
{
  const unite = uniteActivite || uniteContrat || null;
  switch (unite) {
    case null : return 0;
    case "10" : return mesure;
    case "12" : return mesure*7;
    case "20" : return mesure*7;
    case "21" : return mesure;
    case "35" : return mesure;
    default   : return 0;
  }
}

const getGenderWageGap = async (individualsData) =>
{
  individualsData = individualsData.filter(individual => individual.hourlyRate!=null && (individual.sex==1 || individual.sex==2));

  let men = individualsData.filter(individual => individual.sex==1);
  let women = individualsData.filter(individual => individual.sex==2);

  if (men.length==0 || women.length==0) return 0;

  // Men
  let payMen = getSumItems(men.map(individual => individual.pay));
  let hoursMen = getSumItems(men.map(individual => individual.hours));
  let hourlyRateMen = roundValue(payMen/hoursMen,2);

  // Men
  let payWomen = getSumItems(women.map(individual => individual.pay));
  let hoursWomen = getSumItems(women.map(individual => individual.hours));
  let hourlyRateWomen = roundValue(payWomen/hoursWomen,2);

  // All
  let hourlyRateAll = roundValue((payMen+payWomen)/(hoursMen+hoursWomen),2);

  // Interdecile range
  let genderWageGap = roundValue(Math.abs(hourlyRateMen-hourlyRateWomen)/hourlyRateAll,2);
  return genderWageGap;
}

const getGenderWageGap_pctHourlyRateMen = async (individualsData) =>
{
  individualsData = individualsData.filter(individual => individual.hourlyRate!=null && (individual.sex==1 || individual.sex==2));

  let men = individualsData.filter(individual => individual.sex==1);
  let women = individualsData.filter(individual => individual.sex==2);

  if (men.length==0 || women.length==0) return 0;

  // Men
  let payMen = getSumItems(men.map(individual => individual.pay));
  let hoursMen = getSumItems(men.map(individual => individual.hours));
  let hourlyRateMen = roundValue(payMen/hoursMen,2);

  // Men
  let payWomen = getSumItems(women.map(individual => individual.pay));
  let hoursWomen = getSumItems(women.map(individual => individual.hours));
  let hourlyRateWomen = roundValue(payWomen/hoursWomen,2);

  // Interdecile range
  let genderWageGap = roundValue(Math.abs(hourlyRateMen-hourlyRateWomen)/hourlyRateMen,2);
  return genderWageGap;
}

const checkFractions = (socialStatements) => 
{
  let missingFraction = false;
  let monthsAvailable = socialStatements.map(statement => statement.mois).filter((value, index, self) => index === self.findIndex(item => item == value));
  monthsAvailable.forEach(month => {
    let monthStatements = socialStatements.filter(statement => statement.mois == month).sort((a,b) => parseInt(a.fraction.charAt(0))-parseInt(b.fraction.charAt(0)));
    let nbFraction = monthStatements[0].fraction.charAt(1);
    if (nbFraction > monthStatements.length) missingFraction = true;
  })
  return missingFraction;
}

const compare = (statementA,statementB) =>
{
  if (statementA.mois.substring(4,8)!=statementB.mois.substring(4,8)) {
    return parseInt(statementA.mois.substring(4,8))-parseInt(statementB.mois.substring(4,8));
  }
  else if (statementA.mois.substring(2,4)!=statementB.mois.substring(2,4)) {
    return parseInt(statementA.mois.substring(2,4))-parseInt(statementB.mois.substring(2,4));
  }
  else if (statementA.fraction!=statementB.fraction) {
    return parseInt(statementA.fraction.charAt(0))-parseInt(statementB.fraction.charAt(0));
  }
  else {
    return 0;
  }
}