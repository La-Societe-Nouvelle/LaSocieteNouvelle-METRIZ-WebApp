// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { 
  checkGhgItem,
  getTotalByAssessmentItem,
  getTotalGhgEmissions,
  getTotalGhgEmissionsUncertainty, 
  getUncertaintyByAssessmentItem,
  initGhgItem
} from "./utils";
import { initNrgItem } from "../AssessmentNRG/utils";

// Rows
import { RowAssessmentType_5  } from "./RowAssessmentType_5";
import { RowAssessmentType_4  } from "./RowAssessmentType_4";
import { RowAssessmentType_3b } from "./RowAssessmentType_3b";
import { RowAssessmentType_3a } from "./RowAssessmentType_3a";
import { RowAssessmentType_2  } from "./RowAssessmentType_2";
import { RowAssessmentType_1  } from "./RowAssessmentType_1";

/* ------------------------------------------------------------------------------------------------ */
/* ---------------------------------------- ASSESSMENT GHG ---------------------------------------- */
/* ------------------------------------------------------------------------------------------------ */

/* [FR] Liste des postes d'émissions :
    - emissions directes de sources fixes [1]
    - emissions directes de sources mobiles [2]
    - emissions directes de procédés hors énergie - Procédés industriels [3a]
    - emissions directes de procédés hors énergie - Procédés agricoles [3b]
    - emissions fugitives [4]
    - emissions de la biomasse (sols et forêts) [5]

   Item data :
    id: id of the item,
    assessmentItem : id of the assessment item (1 -> 5)
    label: name of the source
    factorId: code to the emission factor used (fuel, coolingSystems, etc.)
    gas: code of gaz (co2e by default)
    consumption: consumption
    consumptionUnit: unit for the consumption value
    consumptionUncertainty: uncertainty for the consumption value
    ghgEmissions: greenhouse gas emissions (in kgCO2e)
    ghgEmissionsUncertainty: uncertainty for the emissions
   
   /!\ for fuels :
    idNRG : id of the item in nrgDetails
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
  onGoBack,
  submit
}) => {

  const [ghgDetails, setGhgDetails] = useState(impactsData.ghgDetails);

  const [nrgDetailsUpdated, setNrgDetailsUpdated] = useState(false);
  const [isItemsValid, setIsItemsValid] = useState(false); // trigger on mount
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => didUpdate(), []);

  // ----------------------------------------------------------------------------------------------------
  // Items management

  // add new ghg emissions item
  const addItem = (assessmentItem) => 
  {
    // build ghg item
    const id = getNewId(Object.values(ghgDetails));
    const ghgItem = initGhgItem(id, assessmentItem);

    // if fuel product -> build nrg details
    if (["1","2"].includes(assessmentItem)) {
      const idNRG = getNewId(Object.values(impactsData.nrgDetails));
      const nrgItem = initNrgItem(idNRG, null); // type undefined before fuel selection
      nrgItem.idGHG = id;
      impactsData.nrgDetails[idNRG] = nrgItem; // add to nrgDetails
      ghgItem.idNRG = idNRG;
    }

    ghgDetails[id] = ghgItem;
    setGhgDetails({...ghgDetails}); // to refresh view
  };

  // delete item
  const deleteItem = (itemId) => 
  {
    const item = ghgDetails[itemId];

    // delete nrg item
    if (item.idNRG) {
      delete impactsData.nrgDetails[item.idNRG];
      nrgDetailsDidUpdate();
    }
    
    // delete ghg item
    delete ghgDetails[item.id];
    didUpdate();

    setGhgDetails({...ghgDetails});
  };

  // ----------------------------------------------------------------------------------------------------

  const didUpdate = () => 
  {
    // update impacts data
    impactsData.ghgDetails = ghgDetails;
    setGhgDetails({...ghgDetails});

    // check if every items set
    let isDetailsValid = Object.values(ghgDetails).every((item) => checkGhgItem(item));
    setIsItemsValid(isDetailsValid);
    setWarningMessage(isDetailsValid ? "" : "Certains postes sont incomplets ou erronés.");
  }

  const nrgDetailsDidUpdate = () => 
  {
    setNrgDetailsUpdated(true);
  }

  const onSubmit = () => 
  {
    // update ghg statement
    impactsData.ghgDetails = ghgDetails;
    impactsData.greenhouseGasEmissions = getTotalGhgEmissions(ghgDetails);
    impactsData.greenhouseGasEmissionsUncertainty = getTotalGhgEmissionsUncertainty(ghgDetails);

    submit();
  }

  // ----------------------------------------------------------------------------------------------------

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
              onUpdateNrgItem={nrgDetailsDidUpdate}
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
              onUpdateNrgItem={nrgDetailsDidUpdate}
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
      {nrgDetailsUpdated && (
        <p className="small p-2 alert-warning">
          modifications ayant été apportées sur la consommation de produits
          énergétiques (combustibles), l'intensité de consommation d'énergie
          sera également modifiée. Veuillez vérifier et (re)valider la
          déclaration en conséquence.
        </p>
      )}
      {warningMessage && (
        <p className="small p-2 alert-warning">
          {warningMessage}
        </p>
      )}
      <div className="view-header">
        <button
          className="btn btn-sm btn-light me-2"
          onClick={onGoBack}
        >
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSubmit}
          disabled={!isItemsValid}
        >
          Valider
        </button>
      </div>
    </div>
  )
}

// ##############################################################################################################

const FirstRowAssessmentItem = ({
  ghgDetails,
  assessmentItem,
  addNewLine
}) => {
  
  return (
    <tr>
      <td width="30px">
        <button 
          className="btn btn-sm btn-light px-2 py-1"
          onClick={() => addNewLine(assessmentItem)}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </td>
      <td>
        {assessmentItems[assessmentItem].label}
        </td>
      <td>
        {printValue(getTotalByAssessmentItem(ghgDetails, assessmentItem), 0)}{" "}
        kgCO2e
      </td>
      <td>
        {printValue(getUncertaintyByAssessmentItem(ghgDetails, assessmentItem), 0)}
        %
      </td>
    </tr>
  )
}