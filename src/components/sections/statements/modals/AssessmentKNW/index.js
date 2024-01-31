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
    label: "Taxe d'apprentissage",
    showAssessmentOption: false
  },
  "vocationalTrainingTax": { 
    label: "Participation à la formation professionnelle continue" 
  },
  "apprenticesRemunerations": {
    label: "Rémunérations liées à des contrats d'alternance et de profesionnalisation",
    showAssessmentOption: false
  },
  "internshipsRemunerations": {
    label: "Indemnités de stage",
    showAssessmentOption: false
  },
  "employeesTrainingsCompensations": {
    label: "Rémunérations liées à des heures de suivi d'une formation",
    showAssessmentOption: true
  },
  "researchPersonnelRemunerations": {
    label: "Rémunérations liées à des activités de recherche ou de formation",
    showAssessmentOption: true
  }
}

export const AssessmentKNW = ({
  impactsData,
  onGoBack,
  submit
}) => {

  const [knwDetails, setKnwDetails] = useState(impactsData.knwDetails);

  useEffect(() => {
    impactsData.knwDetails = knwDetails;
  }, [knwDetails]);

  const updateKnwDetails = (itemKey, itemData) => {
    setKnwDetails({ 
      ...knwDetails, 
      [itemKey]: itemData 
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
            <td>Option</td>
            <td>Heures</td>
            <td>Montant</td>
          </tr>
        </thead>
        <tbody>

          {Object.entries(knwItems).map(([itemKey,itemProps]) =>
            <RowAssessmentKNW
              key={itemKey}
              itemKey={itemKey}
              itemProps={itemProps}
              itemData={knwDetails[itemKey]}
              onUpdate={updateKnwDetails}
            />
          )}

          <tr className="with-top-line">
            <td colSpan={"3"}>Total</td>
            <td className="column_value">
              {printValue(knwContribution, 0)} &euro;
            </td>
          </tr>
          <tr>
            <td colSpan={"3"}>Valeur ajoutée nette</td>
            <td className="column_value">
              {printValue(impactsData.netValueAdded, 0)} &euro;
            </td>
          </tr>
          <tr className="with-top-line with-bottom-line">
            <td colSpan={"3"}>Contribution directe liée à la valeur ajoutée</td>
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
  itemData,
  itemProps,
  onUpdate
}) => {

  const [assessmentOption, setAssessmentOption] = useState(itemData?.assessmentOption || "assessment_amount");
  const [hours, setHours] = useState(itemData?.hours || "");
  const [amount, setAmount] = useState(itemData?.amount || "");

  const [knwDetail, setKnwDetail] = useState(itemData || {});

  const updateValue = (nextValue) => {
    setAmount(nextValue);
  }

  useEffect(() => {
    itemData = amount;
    onUpdate(itemKey,amount);
  }, [amount])

  // on change
  useEffect(() => 
  {
    // itemData props
    knwDetail.assessmentOption = assessmentOption;
    knwDetail.hours = hours;
    knwDetail.amount = amount;

    setKnwDetail(knwDetail);
    
    // trigger onUpdate
    onUpdate(itemKey,knwDetail);

  }, [amount,hours,assessmentOption])

  // ----------------------------------------------------------------------------------------------------

  // Assessment option
  const updateAssessmentOption = (event) => 
  {
    const nextAssessmentOption = event.target.value
    console.log(nextAssessmentOption);
    setAssessmentOption(nextAssessmentOption);
    
  };

  return(
    <tr>
      <td colSpan={itemProps.showAssessmentOption ? "1" : "3"}>{itemProps.label}</td>
      {itemProps.showAssessmentOption &&
        <>
          <td>
            <select
                className="form-select form-select-sm"
                value={assessmentOption || ""}
                onChange={updateAssessmentOption}
              >
                <option key="assessment_amount" value="assessment_amount">Montant total</option>
                <option key="assessment_hours" value="assessment_hours">Heures</option>
                <option key="assessment_dsn" value="assessment_dsn">Données sociales</option>
            </select>
          </td>
          <td>
            <InputNumber
              value={hours}
              onUpdate={updateValue}
              placeholder="h"
              isInvalid={!isValidInput(hours,0)}
              disabled={assessmentOption != "assessment_hours"}
            />
          </td>
        </>
      }
      <td>
        <InputNumber
          value={amount}
          onUpdate={updateValue}
          placeholder="&euro;"
          isInvalid={!isValidInput(amount,0)}
          disabled={assessmentOption != "assessment_amount"}
        />
      </td>
    </tr>
  )
}