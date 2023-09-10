// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { printValue, printValueInput } from "/src/utils/formatters";
import { getKnwContribution, getKnwContributionRate } from "./utils";
import { isValidInput } from "../../../../../utils/Utils";

/* ------------------------------------------------------------------------------------------------ */
/* ---------------------------------------- ASSESSMENT KNW ---------------------------------------- */
/* ------------------------------------------------------------------------------------------------ */

/* Liste des postes de charges:
    - Taxe d'appentissage
    - Participation à la formation professionnelle continue
    - Contrats de formation
    - Heures de formation
    - Heures de recherche
*/

const knwItems = {
  "apprenticeshipTax": { 
    label: "Taxe d'apprentissage" 
  },
  "vocationalTrainingTax": { 
    label: "Participation à la formation professionnelle continue" 
  },
  "apprenticesRemunerations": {
    label: "Rémunérations liées à des contrats de formation (stage, alternance, etc.)"
  },
  "employeesTrainingsCompensations": {
    label: "Rémunérations liées à des heures de suivi d'une formation"
  },
  "researchPersonnelRemunerations": {
    label: "Rémunérations liées à des activités de recherche ou de formation"
  }
}

export const AssessmentKNW = ({
  impactsData,
  onGoBack,
  submit
}) => {

  const [knwDetails, setKnwDetails] = useState(impactsData.knwDetails);

  useEffect(() => {
    // ...
  }, [knwDetails]);

  //

  const updateKnwDetails = (itemKey, nextValue) => {
    setKnwDetails({ 
      ...knwDetails, 
      [itemKey]: nextValue 
    });
  }

  const onSubmit = async () => 
  {
    // update knw contribution
    impactsData.researchAndTrainingContribution = getKnwContribution(knwDetails);

    submit();
  };

  const { netValueAdded } = impactsData;
  const knwContribution = getKnwContribution(knwDetails);
  const knwContributionRate = getKnwContributionRate(netValueAdded,knwContribution);

  return (
    <div className="assessment">
      <Table >
        <thead>
          <tr>
            <td>Libellé</td>
            <td >Valeur</td>
          </tr>
        </thead>
        <tbody>

          {Object.entries(knwItems).map(([itemKey,itemProps]) =>
            <RowAssessmentKNW
              itemKey={itemKey}
              itemProps={itemProps}
              itemValue={knwDetails[itemKey]}
              onUpdate={updateKnwDetails}
            />
          )}

          <tr className="with-top-line">
            <td>Total</td>
            <td className="column_value">
              {printValue(knwContribution, 0)} &euro;
            </td>
          </tr>
          <tr>
            <td>Valeur ajoutée nette</td>
            <td className="column_value">
              {printValue(impactsData.netValueAdded, 0)} &euro;
            </td>
          </tr>
          <tr className="with-top-line with-bottom-line">
            <td>Contribution directe liée à la valeur ajoutée</td>
            <td className="column_value">
              {printValue(knwContributionRate, 1)}
              %
            </td>
          </tr>
        </tbody>
      </Table>

      <div className="text-end">
        <button className="btn btn-sm btn-light me-2" 
                onClick = {onGoBack}>
          <i className="bi bi-chevron-left"></i> Retour</button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSubmit}
        >
          Valider
        </button>
      </div>
    </div>
  )
}

const RowAssessmentKNW = ({
  itemKey,
  itemValue,
  itemProps,
  onUpdate
}) => {

  const [value, setValue] = useState(itemValue || "");

  const updateValue = (nextValue) => {
    setValue(nextValue);
  }

  useEffect(() => {
    onUpdate(itemKey,value);
  }, [value])

  return(
    <tr>
      <td>{itemProps.label}</td>
      <td>
        <InputNumber
          value={printValueInput(value, 0)}
          onUpdate={updateValue}
          placeholder="&euro;"
          isInvalid={!isValidInput(value,0)}
        />
      </td>
    </tr>
  )
}