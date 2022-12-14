// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { getNewId, getSumItems, roundValue } from "../../src/utils/Utils";

// readers
import { DSNDataReader, DSNFileReader } from "/src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

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
    console.log(socialStatements);
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
                  <td>Date</td>
                  <td>Fraction</td>
                </tr>
              </thead>
              <tbody>
                {socialStatements.map(socialStatement => 
                  <tr key={socialStatement.id}>
                    <td>OK</td>
                    <td>{metaRubriques.declaration.nature[socialStatement.nature]}</td>
                    <td>{socialStatement.mois}</td>
                    <td>{socialStatement.fraction}</td>
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

  importFile = (file) => 
  {
    let extension = file.name.split(".").pop();
    if (extension=="edi") 
    {
      let reader = new FileReader();
      reader.onload = async () => 
      {
        let dataDSN = await DSNFileReader(reader.result);
        let socialStatement = await DSNDataReader(dataDSN);
        socialStatement.id = getNewId(this.state.socialStatements);
        this.setState({ socialStatements: this.state.socialStatements.concat([socialStatement]) });
      };

      reader.readAsText(file);
    }
  }
  
  // Submit
  onSubmit = async () => 
  {
    let impactsData = this.props.impactsData;
  
    // update dis data
    impactsData.interdecileRange = getInterdecileRange(this.state.socialStatements);
    //await this.props.onUpdate("idr");
  
    this.props.onGoBack();
  };
}

/* -------------------- FORMULAS -------------------- */

// 
const getInterdecileRange = async (declarations) => 
{
  let individus = [];
  declarations.forEach(declaration => 
  {
    let individusDeclaration = declaration.entreprise.etablissement.individus;
    individusDeclaration.forEach(individuDeclaration => 
    {
      let montantDeclaration = 0;
      let heuresDeclaration = 0;

      let contrat = individuDeclaration.contrats[0];
      let uniteContrat = contrat.uniteMesure;

      let versements = individuDeclaration.versements;
      versements.forEach(versement => {
        let remunerations = versement.remunerations;
        remunerations.filter(remuneration => remuneration.type=="002").forEach(remuneration => {
            montantDeclaration+= parseFloat(remuneration.montant);
            //heuresDeclaration+= parseInt(remuneration.nombreHeures);
            let activites = remuneration.activites;
            activites.filter(activite => activite.type=="01").forEach(activite => {
              heuresDeclaration+= getQuotiteTravail(parseInt(activite.mesure),activite.uniteMesure,uniteContrat);
              console.log(heuresDeclaration);
            })
        })
        let primes = versement.primes;
        primes.forEach(prime => {
          montantDeclaration+= parseFloat(prime);
        })
      });

      let individu = individus.filter(individu => individu.identifiant==individuDeclaration.identifiant)[0];
      if (individu!=undefined) {
        individu.montant+= montantDeclaration;
        individu.heures+= heuresDeclaration;
      } else {
        individus.push({
          identifiant: individuDeclaration.identifiant,
          montant: montantDeclaration,
          heures: heuresDeclaration
        })
      }
    })
  })

  individus.forEach(individu => individu.tauxHoraire = individu.heures > 0 ? roundValue(individu.montant / individu.heures, 2) : null);
  individus = individus.sort((a,b) => a.tauxHoraire - b.tauxHoraire);

  let totalHeures = getSumItems(individus.map(individu => individu.heures));
  let indexD1 = totalHeures*0.1;
  let indexD9 = totalHeures*0.9;

  let indexIndividu = 0;
  let indexHeures = 0;
  while (indexHeures < indexD1 && indexIndividu < individus.length) {
    indexHeures+= individus[indexIndividu].heures;
    indexIndividu+=1;
  }
  let d1 = individus[indexIndividu].tauxHoraire;

  indexIndividu = 0;
  indexHeures = 0;
  while (indexHeures < indexD9 && indexIndividu < individus.length) {
    indexHeures+= individus[indexIndividu].heures;
    indexIndividu+=1;
  }
  if (indexIndividu==individus.length && individus.length > 1) indexIndividu-= 1;
  let d9 = individus[indexIndividu].tauxHoraire;

  let interdecileRange = roundValue(d9/d1,2);
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