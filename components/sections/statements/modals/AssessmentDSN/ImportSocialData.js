import React from "react";
import { useEffect, useState } from "react";

import Dropzone from "react-dropzone";
import { Alert, Button, Table } from "react-bootstrap";

import {
  checkFractions,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";

import {
  DSNDataReader,
  DSNFileReader,
} from "../../../../../src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

const ImportSocialData = ({ impactsData, handleSocialStatements }) => {
  const [socialStatements, setSocialStatements] = useState(
    impactsData.socialStatements || []
  );
  const [errorFile, setErrorFile] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warning, setWarning] = useState([]);

  useEffect(async () => {
    if (socialStatements != impactsData.socialStatements) {
      setSocialStatements(impactsData.socialStatements);
    }
  }, [impactsData.socialStatements]);

  useEffect(async () => {
    if (socialStatements.length > 0) {
      verifySocialStatements(socialStatements);
    }

    if (impactsData.socialStatements != socialStatements) {
      await handleSocialStatements(socialStatements);
    }
  }, [socialStatements]);

  const verifySocialStatements = async (statements) => {
    const monthlyStatements = statements.filter(
      (statement) => statement.nature === "01"
    );

    const distinctStatements = monthlyStatements.reduce(
      (uniqueStatements, statement) => {
        const isDuplicate = uniqueStatements.some(
          (item) =>
            item.nicEtablissement === statement.nicEtablissement &&
            item.mois === statement.mois &&
            item.fraction === statement.fraction
        );
        return isDuplicate
          ? uniqueStatements
          : [...uniqueStatements, statement];
      },
      []
    );

    const duplicate = monthlyStatements.length > distinctStatements.length;

    const etablissements = [
      ...new Set(
        monthlyStatements.map((statement) => statement.nicEtablissement)
      ),
    ];

    const alerts = [];
    const errors = [];

    etablissements.forEach((etablissement) => {
      const etablissementStatements = distinctStatements.filter(
        (statement) => statement.nicEtablissement === etablissement
      );

      const missingMonth =
        etablissementStatements.filter((value) => value.mois).length !== 12;
      if (missingMonth) {
        alerts.push({
          type: "missing",
          message: `Déclaration mensuelle manquante (année incomplète) pour l'établissement n°${etablissement}`,
        });
      }

      const missingFraction = checkFractions(etablissementStatements);
      if (missingFraction) {
        alerts.push({
          type: "missing",
          message: `Déclaration mensuelle manquante (fraction incomplète) pour l'établissement n°${etablissement}`,
        });
      }
    });

    setWarning(alerts);
    setErrors(
      duplicate
        ? [
            ...errors,
            {
              type: "duplicate",
              message: "Plusieurs déclarations sont identiques",
            },
          ]
        : errors
    );
  };

  const onDrop = (files) => {
    if (files.length) {
      importFiles(files);
      setErrorFile(false);
    } else {
      setErrorFile(true);
    }
  };

  const importFiles = async (files) => {
    try {
      const newSocialStatements = await Promise.all(
        files.map(async (file) => {
          const extension = file.name.split(".").pop();

          if (extension === "edi" || extension === "txt") {
            const dataDSN = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(DSNFileReader(reader.result));
              reader.onerror = reject;
              reader.readAsText(file, "ISO-8859-1");
            });
            const socialStatement = await DSNDataReader(dataDSN);

            // Check if socialStatement is empty
            if (Object.keys(socialStatement).length === 0) {
              throw new Error("Erreur lors de la lecture des déclarations.");
            }

            const individualsData = await getIndividualsData([socialStatement]);

            socialStatement.interdecileRange = await getInterdecileRange(
              individualsData
            );
            socialStatement.genderWageGap = await getGenderWageGap(
              individualsData
            );

            socialStatement.nicEtablissement =
              socialStatement.entreprise.etablissement.nic;
            socialStatement.error = false;

            return socialStatement;
          }
        })
      );

      // Determine the new IDs for the social statements
      const newIds = Array.from(
        { length: newSocialStatements.length },
        (_, index) => socialStatements.length + index + 1
      );

      // Update the newSocialStatements with the correct IDs
      newSocialStatements.forEach((statement, index) => {
        statement.id = newIds[index];
      });

      const validSocialStatements = newSocialStatements.filter(
        (statement) => statement !== undefined
      );

      setSocialStatements((prevSocialStatements) => [
        ...prevSocialStatements,
        ...validSocialStatements,
      ]);
    } catch (error) {
      console.log(error);
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

  return (
    <div className="assessment">
      <div>
        <p>Importez les déclarations mensuelles</p>
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
      <div>
        {socialStatements.length > 0 && (
          <>
            <hr></hr>

            <h6>Déclarations importées</h6>
            {errors.map((error, key) => (
              <Alert key={key} variant="danger">
                <p>
                  <i className="bi bi-x-circle-fill me-2"></i>
                  {error.message}
                </p>
              </Alert>
            ))}
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

            <Table>
              <thead>
                <tr>
                  <th>Etat</th>
                  <th>Nom du fichier</th>
                  <th>Mois</th>
                  <th>Fraction</th>
                  <th>Ecart D9/D1</th>
                  <th>Ecart Femmes/Hommes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {socialStatements
                  .sort((a, b) => parseInt(a.mois) - parseInt(b.mois))
                  .map((socialStatement) => (
                    <tr key={socialStatement.id}>
                      <td>{socialStatement.error ? "ERROR" : "OK"}</td>
                      <td>
                        {
                          metaRubriques.declaration.nature[
                            socialStatement.nature
                          ]
                        }
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
                          <i className="bi bi-trash3-fill"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            <div className="text-end mb-2">
              <Button variant="light" size="sm" onClick={() => deleteAll()}>
                <i className="bi bi-trash3-fill"></i> Supprimer tout
              </Button>{" "}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportSocialData;
