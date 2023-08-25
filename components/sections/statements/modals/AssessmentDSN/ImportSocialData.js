// La Société Nouvelle

// React
import React from "react";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Alert, Button, Table } from "react-bootstrap";

import {
  checkFractions,
  checkMonths,
  getDistinctEstablishmentIds,
  getDistinctStatements,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";

import {
  DSNDataReader,
  DSNFileReader,
} from "../../../../../src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

const ImportSocialData = ({ 
  impactsData, 
  onChange,
  handleSocialStatements 
}) => {
  // social statements (= DSN)
  const [socialStatements, setSocialStatements] = 
    useState(impactsData.socialStatements || []);
  
  const [errorFile, setErrorFile] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // used ?
  useEffect(async () => {
    if (socialStatements != impactsData.socialStatements) {
      setSocialStatements(impactsData.socialStatements);
    }
  }, [impactsData.socialStatements]);

  //
  useEffect(async () => 
  {
    // check social statements
    verifySocialStatements(socialStatements);

    // update impacts data (in modal, not in session)
    impactsData.socialStatements = socialStatements;
    // if (impactsData.socialStatements != socialStatements) {
    //   await handleSocialStatements(socialStatements);
    // }
    onChange();
  }, [socialStatements]);

  const verifySocialStatements = async (statements) => 
  {
    const warnings = [];
    const errors = [];

    // Declaration.Nature -> "01" - DSN Mensuelle
    const monthlyStatements = statements.filter((statement) => statement.nature === "01");
    const distinctStatements = getDistinctStatements(monthlyStatements);

    // check duplicata
    if (monthlyStatements.length>distinctStatements.length) {
      errors.push({
        type: "duplicate",
        message: "Plusieurs déclarations sont identiques",
      });
    }

    // check incomplete data
    const nicEtablissements = getDistinctEstablishmentIds(distinctStatements);
    nicEtablissements.forEach((etablissement) => 
    {
      // statements related to the establishment
      const etablissementStatements = distinctStatements
        .filter((statement) => statement.nicEtablissement === etablissement);

      // incomplete year
      const missingMonth = checkMonths(etablissementStatements);
      if (missingMonth) {
        warnings.push({
          type: "missing",
          message: `Déclaration(s) mensuelle(s) manquante(s) pour l'établissement n°${etablissement} (année incomplète)`,
        });
      }

      // missing fraction
      const missingFraction = checkFractions(etablissementStatements);
      if (missingFraction) {
        warnings.push({
          type: "missing",
          message: `Déclaration mensuelle manquante (fraction incomplète) pour l'établissement n°${etablissement}`,
        });
      }
    });

    setWarnings(warnings);
    setErrors(errors);
  };

  // on drop
  const onDrop = (files) => 
  {
    if (files.length) {
      importFiles(files);
      setErrorFile(false);
    } else {
      setErrorFile(true);
    }
  };

  // import files
  const importFiles = async (files) => 
  {
    try {
      const newSocialStatements = await Promise.all(
        files.map(async (file) => 
        {
          const extension = file.name.split(".").pop();
          if (extension === "edi" || extension === "txt") 
          {
            // read file
            const dataDSN = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(DSNFileReader(reader.result));
              reader.onerror = reject;
              reader.readAsText(file, "ISO-8859-1");
            });

            if (dataDSN.errors.length==0)
            {
              // format data
              const socialStatement = await DSNDataReader(dataDSN);

              if (socialStatement.validStatement)
              {
                // build indicators for social statement 
                const individualsData = await getIndividualsData([socialStatement]);
                socialStatement.interdecileRange = await getInterdecileRange(individualsData);
                socialStatement.genderWageGap = await getGenderWageGap(individualsData);
                socialStatement.nicEtablissement = socialStatement.entreprise.etablissement.nic;
    
                return socialStatement;
              }
              else throw new Error("Erreur lors de la lecture des déclarations.");
            }
            else throw new Error("Erreur lors de la lecture du fichier.");
          }
          else {
            // task
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
    } 
    catch (error) {
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
            {warnings.map((error, key) => (
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
