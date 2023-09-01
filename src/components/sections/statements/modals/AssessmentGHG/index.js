// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Table, Row, Col } from "react-bootstrap";

// Components
import { InputNumber } from "/src/components/input/InputNumber";

// Utils
import { getNewId, getSumItems, printValue } from "/src/utils/Utils";
import { 
  getGhgEmissions,
  getGhgEmissionsUncertainty,
  getTotalByAssessmentItem,
  getTotalGhgEmissions, 
  getTotalGhgEmissionsUncertainty, 
  getUncertaintyByAssessmentItem,
  initGhgItem
} from "./utils";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import landChanges from "/lib/emissionFactors/landChanges";
import greenhouseGases from "/lib/ghg";

// formulas (NRG)
import {
  getNrgConsumption,
  getNrgConsumptionUncertainty,
  getTotalNrgConsumption,
  getTotalNrgConsumptionUncertainty,
} from "../AssessmentNRG";

// Rows
import { RowAssessmentType_5 } from "./RowAssessmentType_5";
import { RowAssessmentType_4 } from "./RowAssessmentType_4";
import { RowAssessmentType_3b } from "./RowAssessmentType_3b";
import { RowAssessmentType_3a } from "./RowAssessmentType_3a";
import { RowAssessmentType_2 } from "./RowAssessmentType_2";
import { RowAssessmentType_1 } from "./RowAssessmentType_1";
import { initNrgItem } from "../AssessmentNRG/utils";

const emissionFactors = {
  ...fuels,
  ...industrialProcesses,
  ...agriculturalProcesses,
  ...coolingSystems,
  ...landChanges,
};

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT GHG -------------------- */
/* -------------------------------------------------------- */

/* [FR] Liste des postes d'émissions :
    - emissions directes de sources fixes [1]
    - emissions directes de sources mobiles [2]
    - emissions directes de procédés hors énergie - Procédés industriels [3.1]
    - emissions directes de procédés hors énergie - Procédés agricoles [3.2]
    - emissions fugitives [4]
    - emissions de la biomasse (sols et forêts) [5]

   Each item in ghgDetails has the following properties :
    id: id of the item,
    assessmentItem : id of the assessment item (1 -> 5)
    label: name of the source
    factorId: code to the emission factor used (fuel, coolingSystems, etc.)
    gaz: code of gaz (co2e by default)
    consumption: consumption
    consumptionUnit: unit for the consumption value
    consumptionUncertainty: uncertainty for the consumption value
    ghgEmissions: greenhouse gas emissions (in kgCO2e)
    ghgEmissionsUncertainty: uncertainty for the emissions
   for fuels :
    idNRG : id of the item in nrgDetails

   Modifications are saved only when validation button is pressed, otherwise it stay in the state
*/

const assessmentItems = {
  "1":  { label: "Emissions directes des sources fixes de combustion" },
  "2":  { label: "Emissions directes des sources mobiles de combustion" },
  "3a": { label: "Emissions directes des procédés industriels" },
  "3b": { label: "Emissions directes des procédés agricoles" },
  "4":  { label: "Emissions directes fugitives" },
  "5":  { label: "Emissions issues de la biomasse (sols et forêts)" },
};

export const AssessmentGHG = ({
  impactsData,
  onGoBack
}) => {

  const [message, setMessage] = useState("");
  const [ghgDetails, setGhgDetails] = useState(impactsData.ghgDetails);

  useEffect(() => {
    console.log("use effect triggered");
  }, [ghgDetails])

  // add new ghg emissions item
  const addItem = (assessmentItem) => {
    const id = getNewId(Object.entries(ghgDetails).map(([_, item]) => item));
    const ghgItem = initGhgItem(id,assessmentItem);

    // nrg details
    if (["1","2"].includes(assessmentItem)) {
      const idNRG = getNewId(Object.entries(impactsData.nrgDetails).map(([_, item]) => item));
      const nrgItem = initNrgItem(idNRG);
      nrgItem.idGHG = id;
      impactsData.nrgDetails[idNRG] = nrgItem;
      ghgItem.idNRG = idNRG;
    }

    ghgDetails[id] = ghgItem;
    setGhgDetails({...ghgDetails});
  };

  // delete item
  const deleteItem = (itemId) => {
    const item = ghgDetails[itemId];
    if (item.idNRG) {
      delete impactsData.nrgDetails[idNRG];
    }
    delete ghgDetails[itemId];
    setGhgDetails({...ghgDetails});
  };

  const didUpdate = () => {
    console.log("did update");
  }

  const onSubmit = () => {
    console.log("submit");
  }

  // get total
  const total = getTotalGhgEmissions(ghgDetails);
  const totalUncertainty = getTotalGhgEmissionsUncertainty(ghgDetails);

  return (
    <div className="assessment ghg-assessment">
      <Table>
        <thead>
          <tr>
            <th colSpan="2">Libellé</th>
            <th>Valeur</th>
            <th>Incertitude</th>
          </tr>
        </thead>
        <tbody>
          
        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"1"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "1")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_1
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
              nrgItem={impactsData.nrgDetails[itemData.idNRG]}
            />
          ))}

        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"2"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "2")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_2
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
              nrgItem={impactsData.nrgDetails[itemData.idNRG]}
            />
          ))}

        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"3a"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "3a")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_3a
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
            />
          ))}

        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"3b"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "3b")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_3b
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
            />
          ))}

        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"4"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "4")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_4
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
            />
          ))}

        <FirstRowAssessmentItem
          ghgDetails={ghgDetails}
          assessmentItem={"5"}
          addNewLine={addItem}
        />

        {Object.entries(ghgDetails)
          .filter(([_, itemData]) => itemData.assessmentItem == "5")
          .map(([itemId, itemData]) => (
            <RowAssessmentType_5
              key={itemId}
              deleteItem={() => deleteItem(itemId)}
              itemId={itemId}
              itemData={itemData}
              onUpdate={didUpdate}
            />
          ))}

          <tr className="total">
            <td colSpan="2">Total</td>
            <td>{printValue(total, 0)} kgCO2e</td>
            <td>{printValue(totalUncertainty, 0)} %</td>
          </tr>
        </tbody>
      </Table>
      {message && (
        <p className="small p-2 alert-warning">
          modifications ayant été apportées sur la consommation de produits
          énergétiques (combustibles), l'intensité de consommation d'énergie
          sera également modifiée. Veuillez vérifier et (re)valider la
          déclaration en conséquence.
        </p>
      )}
      <div className="view-header">
        <button
          className="btn btn-sm btn-light me-2"
          onClick={() => onGoBack()}
        >
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onSubmit()}
        >
          Valider
        </button>
      </div>
    </div>
  )
}

  // --------------------------------------------------
  // update props

const onSubmit = async () => 
{
  let impactsData = this.props.impactsData;

  // update ghg data
  impactsData.ghgDetails = this.state.ghgDetails;
  impactsData.greenhousesGazEmissions = getTotalGhgEmissions(
    impactsData.ghgDetails
  );
  impactsData.greenhousesGazEmissionsUncertainty =
    getTotalGhgEmissionsUncertainty(impactsData.ghgDetails);

  await this.props.onUpdate("ghg");

  // --------------------------------------------------
  // update nrg data

  // ...delete
  Object.entries(impactsData.nrgDetails)
    .filter(
      ([_, itemData]) =>
        itemData.type == "fossil" || itemData.type == "biomass"
    )
    .forEach(([itemId, _]) => {
      let ghgItem = Object.entries(impactsData.ghgDetails)
        .map(([_, ghgItemData]) => ghgItemData)
        .filter((ghgItem) => ghgItem.idNRG == itemId)[0];
      if (ghgItem == undefined) delete impactsData.nrgDetails[itemId];
    });
  // ...add & update
  Object.entries(impactsData.ghgDetails)
    .filter(([_, itemData]) => ["1", "2"].includes(itemData.assessmentItem))
    .forEach(([itemId, itemData]) => {
      let nrgItem = Object.entries(impactsData.nrgDetails)
        .map(([_, nrgItemData]) => nrgItemData)
        .filter((nrgItem) => nrgItem.idGHG == itemId)[0];
      if (nrgItem == undefined) {
        const id = getNewId(
          Object.entries(impactsData.nrgDetails)
            .map(([_, data]) => data)
            .filter((item) => !isNaN(item.id))
        );
        impactsData.nrgDetails[id] = { id: id, idGHG: itemId };
        nrgItem = impactsData.nrgDetails[id];
        itemData.idNRG = id;
      }
      // update values
      nrgItem.fuelCode = itemData.factorId;
      nrgItem.consumption = itemData.consumption;
      nrgItem.consumptionUnit = itemData.consumptionUnit;
      nrgItem.consumptionUncertainty = itemData.consumptionUncertainty;
      nrgItem.nrgConsumption = getNrgConsumption(nrgItem);
      nrgItem.nrgConsumptionUncertainty =
        getNrgConsumptionUncertainty(nrgItem);
      nrgItem.type = fuels[itemData.factorId].type;
    });

  // ...total & uncertainty
  impactsData.energyConsumption = getTotalNrgConsumption(
    impactsData.nrgDetails
  );
  impactsData.energyConsumptionUncertainty =
    getTotalNrgConsumptionUncertainty(impactsData.nrgDetails);

  await this.props.onUpdate("nrg");

  // --------------------------------------------------

  // back to statement
  this.props.onGoBack();
};

const FirstRowAssessmentItem = ({
  ghgDetails,
  assessmentItem,
  addNewLine
}) => {
  
  return (
    <tr>
      <td width="30px">
        <button 
          className="btn btn-sm btn-light"
          onClick={() => addNewLine(assessmentItem)}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </td>
      <td>
        {assessmentItems[assessmentItem].label}
        </td>
      <td>
        {printValue(getTotalByAssessmentItem(ghgDetails, assessmentItem), 0)}
        kgCO2e
      </td>
      <td>
        {printValue(getUncertaintyByAssessmentItem(ghgDetails, assessmentItem), 0)}
        %
      </td>
    </tr>
  )
}