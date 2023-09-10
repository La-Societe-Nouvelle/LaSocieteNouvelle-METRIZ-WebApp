// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { 
  checkNrgItem,
  getNrgConsumptionByType, 
  getNrgConsumptionUncertaintyByType, 
  getTotalNrgConsumption, 
  getTotalNrgConsumptionUncertainty, 
  initNrgItem 
} from "./utils";
import { initGhgItem } from "../AssessmentGHG/utils";

// Rows
import { SimpleRowAssessment } from "./SimpleRowAssessment";
import { RowAssessmentTypeFossil } from "./RowAssessmentTypeFossil";
import { RowAssessmentTypeBiomass } from "./RowAssessmentTypeBiomass";

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT NRG -------------------- */
/* -------------------------------------------------------- */

/* List of assessment item :
    - electricity (id: "electricity")
    - fossil products
    - biomass products
    - heat (id: "heat")
    - renewableTranformedEnergy (id: "renewableTranformedEnergy")
  /!\ Must filter to use getNewId function

   Each item in nrgDetails has the following properties :
    id: id of the item
    idGHG: if of the matching item in ghg details (if biomass/fossil products)
    fuelCode: code of the energetic product (cf. base nrgProducts)
    type: fossil/biomass (used for distinction between fossil and biomass products)
    consumption: consumption
    consumptionUnit: unit for the consumption value
    consumptionUncertainty: uncertainty for the consumption value
    nrgConsumption: energy consumption (in MJ)
    nrgConsumptionUncertainty: uncertainty of the energy consumption

*/

const assessmentItems = {
  "electricity":                { label: "Electricité",                       toInit: true  },
  "fossil":                     { label: "Produits énergétiques fossiles",    toInit: false },
  "biomass":                    { label: "Biomasse",                          toInit: false },
  "heat":                       { label: "Chaleur",                           toInit: true  },
  "renewableTransformedEnergy": { label: "Energie renouvelable transformée",  toInit: true  }
};

export const AssessmentNRG = ({
  impactsData,
  onGoBack,
  submit
}) => {

  const [nrgDetails, setNrgDetails] = useState(impactsData.nrgDetails);

  const [ghgDetailsUpdated, setGhgDetailsUpdated] = useState(false);
  const [isItemsValid, setIsItemsValid] = useState(false); // trigger on mount
  const [warningMessage, setWarningMessage] = useState("");
  
  useEffect(async () => 
  {
    Object.entries(assessmentItems)
      .filter(([_,assessmentItemData]) => assessmentItemData.toInit)
      .forEach(([assessmentItemId,_]) => 
      {
        if (!impactsData.nrgDetails.hasOwnProperty(assessmentItemId)) {
          impactsData.nrgDetails[assessmentItemId] = {
            id: assessmentItemId,
            fuelCode: assessmentItemId,
            type: assessmentItemId,
            consumption: 0.0,
            consumptionUnit: "kWh",
            consumptionUncertainty: 0.0,
            nrgConsumption: 0.0,
            nrgConsumptionUncertainty: 0.0,
          };
        }
      });
    setNrgDetails({...impactsData.nrgDetails});
  }, [])

  useEffect(() => didUpdate(), []);

  // ----------------------------------------------------------------------------------------------------

  // add new nrg consumption item (fossil or biomass)
  const addItem = (assessmentItem) => 
  {
    // build nrg item
    const id = getNewId(Object.values(nrgDetails).filter((item) => !isNaN(item.id)));
    const nrgItem = initNrgItem(id,assessmentItem);

    // build ghg item
    const idGHG = getNewId(Object.values(impactsData.ghgDetails));
    const ghgItem = initGhgItem(idGHG,null); // don't know assessment item before setting fuel code
    ghgItem.idNRG = id;
    impactsData.ghgDetails[idGHG] = ghgItem;
    nrgItem.idGHG = idGHG;

    nrgDetails[id] = nrgItem;
    setNrgDetails({...nrgDetails});
  };

  // delete item
  const deleteItem = (itemId) => 
  {
    const item = nrgDetails[itemId];

    // delete ghg item
    delete impactsData.ghgDetails[item.idGHG];

    // delete nrg item
    delete nrgDetails[item.id];

    setNrgDetails({...nrgDetails});
  };

  // ----------------------------------------------------------------------------------------------------

  const didUpdate = () => 
  {
    // check if every items set
    let isDetailsValid = Object.values(nrgDetails).every((item) => checkNrgItem(item));
    setIsItemsValid(isDetailsValid);
    setWarningMessage(isDetailsValid ? "" : "Certains postes sont incomplets ou erronés.");
  }

  const ghgDetailsDidUpdate = () => 
  {
    setGhgDetailsUpdated(true);
  }

  const onSubmit = () => 
  {
    // update nrg statement
    impactsData.nrgDetails = nrgDetails;
    impactsData.energyConsumption = getTotalNrgConsumption(nrgDetails);
    impactsData.energyConsumptionUncertainty = getTotalNrgConsumptionUncertainty(nrgDetails);

    submit();
  }

  // ----------------------------------------------------------------------------------------------------

  // get total
  const total = getTotalNrgConsumption(nrgDetails);
  const totalUncertainty = getTotalNrgConsumptionUncertainty(nrgDetails);

  return (
    <div className="assessment">
      <Table>
        <thead>
          <tr>
            <td />
            <td colSpan="2">Libellé</td>
            <td className="text-end">Valeur</td>
            <td className="text-end">Incertitude</td>
          </tr>
        </thead>
        <tbody>
          {nrgDetails["electricity"] && (
            <SimpleRowAssessment
              label={assessmentItems["electricity"].label}
              itemData={nrgDetails["electricity"]}
              onUpdate={didUpdate}
            />
          )}

          <FirstRowAssessmentItem
            nrgDetails={nrgDetails}
            assessmentItem={"fossil"}
            addNewLine={addItem}
          />            

          {Object.entries(nrgDetails)
            .filter(([_, data]) => data.type == "fossil")
            .map(([itemId, itemData]) => (
              <RowAssessmentTypeFossil
                key={itemId}
                deleteItem={() => deleteItem(itemId)}
                itemId={itemId}
                itemData={itemData}
                onUpdate={didUpdate}
                ghgItem={impactsData.ghgDetails[itemData.idGHG]}
                onUpdateGhgItem={ghgDetailsDidUpdate}
              />
            ))}

          <FirstRowAssessmentItem
            nrgDetails={nrgDetails}
            assessmentItem={"biomass"}
            addNewLine={addItem}
          />            

          {Object.entries(nrgDetails)
            .filter(([_, itemData]) => itemData.type == "biomass")
            .map(([itemId, itemData]) => (
              <RowAssessmentTypeBiomass
                key={itemId}
                deleteItem={() => deleteItem(itemId)}
                itemId={itemId}
                itemData={itemData}
                onUpdate={didUpdate}
                ghgItem={impactsData.ghgDetails[itemData.idGHG]}
                onUpdateGhgItem={ghgDetailsDidUpdate}
              />
            ))}            

          {nrgDetails["heat"] && (
            <SimpleRowAssessment
              label={assessmentItems["heat"].label}
              itemData={nrgDetails["heat"]}
              //onUpdate={didUpdate}
            />
          )}

          {nrgDetails["renewableTransformedEnergy"] && (
            <SimpleRowAssessment
              label={assessmentItems["renewableTransformedEnergy"].label}
              itemData={nrgDetails["renewableTransformedEnergy"]}
              //onUpdate={didUpdate}
            />
          )}            

          <tr className="total">
            <td />
            <td colSpan="2">Total</td>
            <td>{printValue(total, 0)} MJ</td>
            <td>{printValue(totalUncertainty, 0)} %</td>
          </tr>
        </tbody>
      </Table>

      {ghgDetailsUpdated && (
        <p className="small p-2 alert-warning">
          modifications ayant été apportées sur la consommation de produits
          énergétiques (combustibles), l'intensité d'émissions de Gaz à effet
          de serre sera également modifiée. Veuillez vérifier et (re)valider
          la déclaration en conséquence.
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
  );
}

// ##############################################################################################################

const FirstRowAssessmentItem = ({
  nrgDetails,
  assessmentItem,
  addNewLine
}) => {
  
  return (
    <tr>
      <td width="50">
        <button
          className="btn btn-sm btn-light px-2 py-1"
          onClick={() => addNewLine(assessmentItem)}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </td>
      <td colSpan="2">{assessmentItems[assessmentItem].label}</td>
      <td>
        {printValue(getNrgConsumptionByType(nrgDetails, assessmentItem), 0)}
        MJ
      </td>
      <td>
        {printValue(getNrgConsumptionUncertaintyByType(nrgDetails, assessmentItem), 0)}
        %
      </td>
    </tr>
  )
}