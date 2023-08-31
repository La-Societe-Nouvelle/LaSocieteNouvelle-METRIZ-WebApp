// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Table, Row, Col } from "react-bootstrap";

// Utils
import { InputNumber } from "../../../../input/InputNumber";
import { getNewId, printValue } from "/src/utils/Utils";

// Libs
import fuels from "/lib/emissionFactors/fuels.json";
import {
  getGhgEmissions,
  getGhgEmissionsUncertainty,
  getTotalGhgEmissions,
  getTotalGhgEmissionsUncertainty,
  initGhgItem,
} from "../AssessmentGHG/utils";
import { SimpleRowAssessment } from "./SimpleRowAssessment";
import { RowAssessmentTypeFossil } from "./RowAssessmentTypeFossil";
import { RowAssessmentTypeBiomass } from "./RowAssessmentTypeBiomass";
import { getNrgConsumptionByType, getNrgConsumptionUncertaintyByType, getTotalNrgConsumption, getTotalNrgConsumptionUncertainty, initNrgItem } from "./utils";

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

   Modifications are saved only when validation button is pressed, otherwise it stay in the state
*/

const assessmentItems = {
  "electricity": { label: "Electricité", toInit: true },
  "fossil": { label: "Produits énergétiques fossiles", toInit: false },
  "biomass": { label: "Biomasse", toInit: false },
  "heat": { label: "Chaleur", toInit: true },
  "renewableTransformedEnergy": { label: "Energie renouvelable transformée", toInit: true }
};

export const AssessmentNRG = ({
  impactsData,
  onGoBack
}) => {

  const [message, setMessage] = useState("");
  const [nrgDetails, setNrgDetails] = useState(impactsData.nrgDetails);

  useEffect(async () => {
    for (let assessmentItemId of [
      "electricity",
      "heat",
      "renewableTransformedEnergy"
    ]) {
      if (nrgDetails[assessmentItemId]==undefined) {
        nrgDetails[assessmentItemId] = {
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
    }
    setNrgDetails({...nrgDetails});
  }, [])

  useEffect(() => {
    console.log("use effect triggered");
  }, [nrgDetails])

  // add new nrg consumption item (fossil or biomass)
  const addItem = (assessmentItem) => {
    const id = getNewId(Object.entries(nrgDetails).map(([_, item]) => item).filter((item) => !isNaN(item.id)));
    const nrgItem = initNrgItem(id,assessmentItem);

    // nrg details
    const idGHG = getNewId(Object.entries(impactsData.ghgDetails).map(([_, item]) => item));
    const ghgItem = initGhgItem(idGHG,null); // don't know assessment item before setting fuel code !
    ghgItem.idNRG = id;
    impactsData.ghgDetails[idGHG] = ghgItem;
    nrgItem.idGHG = idGHG;

    nrgDetails[id] = nrgItem;
    setNrgDetails({...nrgDetails});
  };

  // delete item
  const deleteItem = (itemId) => {
    const item = nrgDetails[itemId];
    delete impactsData.ghgDetails[item.idGHG];
    delete nrgDetails[itemId];
    setNrgDetails({...nrgDetails});
  };

  const didUpdate = () => {
    console.log("did update");
  }

  const onSubmit = () => {
    console.log("submit");
  }

  // get total
  const total = getTotalNrgConsumption(nrgDetails);
  const totalUncertainty = getTotalNrgConsumptionUncertainty(nrgDetails);

  console.log("render");
  console.log(nrgDetails);

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
              //onUpdate={didUpdate}
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
                //onUpdate={didUpdate}
                //ghgItem={impactsData.ghgDetails[itemData.idGHG]}
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
                //onUpdate={didUpdate}
                //ghgItem={impactsData.ghgDetails[itemData.idGHG]}
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

      {message && (
        <p className="small p-2 alert-warning">
          modifications ayant été apportées sur la consommation de produits
          énergétiques (combustibles), l'intensité d'émissions de Gaz à effet
          de serre sera également modifiée. Veuillez vérifier et (re)valider
          la déclaration en conséquence.
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

  /* ----- NEW ITEM ----- */

  // New line
const addNewLine = (type) => this.setState({ typeNewProduct: type });

  // set nrg product
const addProduct = (fuelCode) => {
    let { nrgDetails } = this.state;
    const id = getNewId(
      Object.entries(nrgDetails)
        .map(([_, item]) => item)
        .filter((item) => !isNaN(item.id))
    );
    nrgDetails[id] = {
      id: id,
      fuelCode: fuelCode,
      type: fuels[fuelCode].type,
      consumption: 0.0,
      consumptionUnit: "GJ",
      consumptionUncertainty: 25.0,
      nrgConsumption: 0.0,
      nrgConsumptionUncertainty: 0.0,
    };
    this.setState({ nrgDetails: nrgDetails, typeNewProduct: "" });
  };

  /* ----- UPDATES ----- */

  // update nrg product
const changeNrgProduct = (itemId, nextFuelCode) => {
    let itemData = this.state.nrgDetails[itemId];
    itemData.fuelCode = nextFuelCode;

    // check if the unit used is also available for the new product
    if (
      Object.keys(fuels[nextFuelCode].units).includes(itemData.consumptionUnit)
    ) {
      itemData.nrgConsumption = getNrgConsumption(itemData);
      itemData.nrgConsumptionUncertainty =
        getNrgConsumptionUncertainty(itemData);
    } else {
      itemData.consumption = 0.0;
      itemData.consumptionUnit = "GJ";
      itemData.consumptionUncertainty = 0.0;
      itemData.nrgConsumption = 0.0;
      itemData.nrgConsumptionUncertainty = 0.0;
    }

    // update total
    this.updateEnergyConsumption();
  };

const changeNrgProductUnit = (itemId, nextConsumptionUnit) => {
    let itemData = this.state.nrgDetails[itemId];
    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.nrgConsumption = getNrgConsumption(itemData);
    itemData.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    this.updateEnergyConsumption();
  };

  // update nrg consumption
const updateConsumption = (itemId, nextValue) => {
    let itemData = this.state.nrgDetails[itemId];
    if (itemData.type == "fossil" || itemData.type == "biomass") {
      this.setState({ message: true });
    }

    itemData.consumption = nextValue;
    itemData.nrgConsumption = getNrgConsumption(itemData);
    itemData.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    this.updateEnergyConsumption();
  };

  // update uncertainty
const updateConsumptionUncertainty = (itemId, nextValue) => {
    let item = this.state.nrgDetails[itemId];
    item.consumptionUncertainty = nextValue;
    item.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(item);
    this.updateEnergyConsumption();
  };

  /* ----- DELETE ----- */

const deleteItem = (itemId) => {
    let itemData = this.state.nrgDetails[itemId];
    if (itemData.type == "fossil" || itemData.type == "biomass") {
      this.setState({ message: true });
    }

    delete this.state.nrgDetails[itemId];
    this.updateEnergyConsumption();
  };

  /* ---------- STATE / PROPS ---------- */

  // update state
const updateEnergyConsumption = () => {
    // Update state
    this.setState({
      energyConsumption: getTotalNrgConsumption(this.state.nrgDetails),
      energyConsumptionUncertainty: getTotalNrgConsumptionUncertainty(
        this.state.nrgDetails
      ),
    });
  };

  // update props
  const onSubmit = async () => {
    let impactsData = this.props.impactsData;

    // --------------------------------------------------
    // update nrg data

    impactsData.nrgDetails = this.state.nrgDetails;
    impactsData.energyConsumption = getTotalNrgConsumption(
      impactsData.nrgDetails
    );
    impactsData.energyConsumptionUncertainty =
      getTotalNrgConsumptionUncertainty(impactsData.nrgDetails);

    await this.props.onUpdate("nrg");

    // --------------------------------------------------
    // update ghg data

    // ...delete
    Object.entries(impactsData.ghgDetails)
      .filter(([_, itemData]) => itemData.factorId != undefined)
      .filter(([_, itemData]) => ["1", "2"].includes(itemData.assessmentItem))
      .forEach(([itemId, _]) => {
        let nrgItem = Object.entries(impactsData.nrgDetails)
          .map(([_, nrgItemData]) => nrgItemData)
          .filter((nrgItem) => nrgItem.idGHG == itemId)[0];
        if (nrgItem == undefined) delete impactsData.ghgDetails[itemId];
      });

    // ...add & update
    Object.entries(impactsData.nrgDetails)
      .filter(([_, data]) => data.type == "fossil" || data.type == "biomass")
      .forEach(([itemId, itemData]) => {
        let ghgItem = Object.entries(impactsData.ghgDetails)
          .map(([_, ghgItemData]) => ghgItemData)
          .filter((ghgItem) => ghgItem.idNRG == itemId)[0];
        // init if undefined
        if (ghgItem == undefined) {
          const id = getNewId(
            Object.entries(impactsData.ghgDetails).map(([_, data]) => data)
          );
          impactsData.ghgDetails[id] = { id: id, idNRG: itemId };
          itemData.idGHG = id;
          ghgItem = impactsData.ghgDetails[id];
        }
        // update values
        ghgItem.assessmentItem = fuels[itemData.fuelCode].usageSourcesFixes
          ? "1"
          : "2";
        ghgItem.label = itemData.label;
        ghgItem.factorId = itemData.fuelCode;
        ghgItem.gaz = "co2e";
        ghgItem.consumption = itemData.consumption;
        ghgItem.consumptionUnit = itemData.consumptionUnit;
        ghgItem.consumptionUncertainty = itemData.consumptionUncertainty;
        ghgItem.ghgEmissions = getGhgEmissions(ghgItem);
        ghgItem.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(ghgItem);
      });

    // ...total & uncertainty
    impactsData.greenhousesGazEmissions = getTotalGhgEmissions(
      impactsData.ghgDetails
    );
    impactsData.greenhousesGazEmissionsUncertainty =
      getTotalGhgEmissionsUncertainty(impactsData.ghgDetails);
    await this.props.onUpdate("ghg");

    // --------------------------------------------------

    // go back
    this.props.onGoBack();
  };

const FirstRowAssessmentItem = ({
  nrgDetails,
  assessmentItem,
  addNewLine
}) => {
  
  return (
    <tr>
      <td width="50">
        <button
          className="btn btn-sm btn-light"
          onClick={() => addNewLine(assessmentItem)}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </td>
      <td colSpan="2">{assessmentItems[assessmentItem].label}</td>
      <td>
        {printValue(getNrgConsumptionByType(nrgDetails, assessmentItem), 0)}{" "}
        MJ
      </td>
      <td>
        {printValue(
          getNrgConsumptionUncertaintyByType(nrgDetails, assessmentItem),
          0
        )}{" "}
        %
      </td>
    </tr>
  )
}