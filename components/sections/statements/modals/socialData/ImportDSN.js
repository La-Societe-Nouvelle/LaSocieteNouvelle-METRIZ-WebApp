import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  checkFractions,
  getApprenticeshipRemunerations,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";
import Dropzone from "react-dropzone";
import { Alert, Button, Table } from "react-bootstrap";
import {
  DSNDataReader,
  DSNFileReader,
} from "../../../../../src/readers/DSNReader";

import { getNewId } from "/src/utils/Utils";
import metaRubriques from "/lib/rubriquesDSN";

const ImportDSN = ({ impactsData, onGoBack, onUpdate }) => {
  const [socialStatements, setSocialStatements] = useState(
    impactsData.socialStatements || []
  );
  const [errorFile, setErrorFile] = useState(false);
  const [errors, setErrors] = useState([]);
    const [warning, setWarning] = useState([]);

  useEffect(() => {

    if (socialStatements.length > 0) {
      let alerts = [];
      let errors = [];

      const monthlyStatements = socialStatements.filter(
        (statement) => statement.nature === "01"
      );

      let distinctStatements = monthlyStatements.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              item.nicEtablissement === value.nicEtablissement &&
              item.mois === value.mois &&
              item.fraction === value.fraction
          )
      );

      const duplicate = monthlyStatements.length > distinctStatements.length;
      if (duplicate) {
        errors.push({
          type: "duplicate",
          message: "Plusieurs déclarations sont identiques",
        });
      }

      let etablissements = monthlyStatements
        .map((statement) => statement.nicEtablissement)
        .filter(
          (value, index, self) =>
            index === self.findIndex((item) => item === value)
        );

      etablissements.forEach((etablissement) => {
        let etablissementStatements = distinctStatements.filter(
          (statement) => statement.nicEtablissement === etablissement
        );

        let missingMonth =
          etablissementStatements.filter(
            (value, index, self) =>
              index === self.findIndex((item) => item.mois === value.mois)
          ).length !== 12;
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

      // Update the alerts state with the verification results
      setWarning(alerts);
      setErrors(errors);
    }

    console.log(errors);
  }, [socialStatements]);

  const onDrop = (files) => {
    if (files.length) {
      files.forEach((file) => importFile(file));
      setErrorFile(false);
    } else {
      setErrorFile(true);
    }
  };

  const importFile = async (file) => {
    const extension = file.name.split(".").pop();

    if (extension === "edi" || extension === "txt") {
      try {
        const dataDSN = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(DSNFileReader(reader.result));
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const socialStatement = await DSNDataReader(dataDSN);

        // Check if socialStatement is empty
        if (Object.keys(socialStatement).length === 0) {
 
          setErrors([{
            type: "error",
            message: "Erreur lors de la lecture des déclarations.",
          }]); 

          console.log(errors)
      
          return;
        }

        const individualsData = await getIndividualsData([socialStatement]);

        socialStatement.interdecileRange = await getInterdecileRange(
          individualsData
        );
        socialStatement.genderWageGap = await getGenderWageGap(individualsData);
        socialStatement.id = getNewId(socialStatements);
        socialStatement.nicEtablissement =
          socialStatement.entreprise.etablissement.nic;
        socialStatement.error = false;

        setSocialStatements((prevSocialStatements) => [
          ...prevSocialStatements,
          socialStatement,
        ]);
      } catch (error) {
        console.log("error");

        console.log(error);
      }
    }
  };

  const deleteAll = () => {
    setSocialStatements([]);
  };

  const deleteStatement = (id) => {
    setSocialStatements((prevSocialStatements) =>
      prevSocialStatements.filter((statement) => statement.id !== id)
    );
  };

  const onSubmit = async () => {
    impactsData.socialStatements = socialStatements;

    // indiividuals data
    impactsData.individualsData = await getIndividualsData(
      impactsData.socialStatements
    );

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(
      impactsData.individualsData
    );
    await onUpdate("idr");

    // update geq data (in pct i.e. 14.2 for 14.2 %)
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    await onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations =
      await getApprenticeshipRemunerations(impactsData.individualsData);
    await onUpdate("knw");

    onGoBack();
  };

  return (
    <div className="assessment">
      <div>
        <h5 className="h6">Importez les déclarations mensuelles</h5>
        <Dropzone onDrop={onDrop} accept={[".edi", ".txt"]}>
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
      <hr></hr>
      <div>
        {socialStatements.length > 0 && (
          <>
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
                        onClick={() => deleteStatement(socialStatement.id)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                        &nbsp;Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {errorFile && (
              <Alert variant="danger"> Format de fichier incorrect.</Alert>
            )}
            {warning.map((error, key) => (
              <Alert key={key} variant="warning">
                <p>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                  {error.message}
                </p>
              </Alert>
            ))}


{/* TO DO : check eroor */}
{errors.map((error, key) => 

(
    
    <Alert key={key} variant="danger">
      <p>
        <i className="bi bi-x-circle-fill me-2"></i>
        {error.message}
      </p>
    </Alert>
  ))}

            <div className="text-end mb-2">
              <Button variant="light" size="sm" onClick={() => deleteAll()}>
                <i className="bi bi-trash3-fill"></i>
                &nbsp;Supprimer tout
              </Button>{" "}
            </div>
          </>
        )}
      </div>
      <hr />

      <div className="text-end mt-2">
      <Button
  variant="secondary"
  size="sm"
  disabled={socialStatements.length === 0 || errors.length > 0}
  onClick={() => onSubmit()}
>
  Valider
</Button>
      </div>
    </div>
  );
};

export default ImportDSN;
