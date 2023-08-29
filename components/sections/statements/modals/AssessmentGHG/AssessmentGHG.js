// La Société Nouvelle

// React
import React from "react";
import { Table, Row, Col } from "react-bootstrap";

// Components
import { InputNumber } from "../../../../input/InputNumber";

// Utils
import { getNewId, getSumItems, printValue } from "/src/utils/Utils";
import { 
  getGhgEmissions,
  getGhgEmissionsUncertainty,
  getTotalByAssessmentItem,
  getTotalGhgEmissions, 
  getTotalGhgEmissionsUncertainty, 
  getUncertaintyByAssessmentItem
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
import { RowsAssessmentType_5 } from "./RowsAssessmentType_5";
import { RowsAssessmentType_4 } from "./RowsAssessmentType_4";
import { RowsAssessmentType_3b } from "./RowsAssessmentType_3b";
import { RowsAssessmentType_3a } from "./RowsAssessmentType_3a";
import { RowsAssessmentType_2 } from "./RowsAssessmentType_2";
import { RowsAssessmentType_1 } from "./RowsAssessmentType_1";

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

export class AssessmentGHG extends React.Component {

  constructor(props) {
    super(props);
    this.state = 
    {
      // total ghg emissions & uncertainty
      greenhousesGazEmissions: props.impactsData.greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty: props.impactsData.greenhousesGazEmissionsUncertainty,
      // details
      ghgDetails: props.impactsData.ghgDetails,
      nrgTotal: props.impactsData.nrgTotal,
      // adding new factor
      newFactorAssessmentItem: "",
      // alert message
      message: false,
    };
  }

  render() 
  {
    const {
      greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty,
      ghgDetails,
      newFactorAssessmentItem,
      message,
    } = this.state;

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
            
            <RowsAssessmentType_1
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              updateGaz={this.updateGaz}
              addItem={this.addItem}
            />

            <RowsAssessmentType_2
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              updateGaz={this.updateGaz}
              addItem={this.addItem}
            />

            <RowsAssessmentType_3a
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              updateGaz={this.updateGaz}
              addItem={this.addItem}
            />

            <RowsAssessmentType_3b
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              updateGaz={this.updateGaz}
              addItem={this.addItem}
            />

            <RowsAssessmentType_4
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              updateGaz={this.updateGaz}
              addItem={this.addItem}
            />

            <RowsAssessmentType_5
              ghgDetails={ghgDetails}
              addNewLine={this.addNewLine}
              changeFactor={this.changeFactor}
              updateConsumption={this.updateConsumption}
              changeConsumptionUnit={this.changeConsumptionUnit}
              updateConsumptionUncertainty={this.updateConsumptionUncertainty}
              deleteItem={this.deleteItem}
              newFactorAssessmentItem={newFactorAssessmentItem}
              addItem={this.addItem}
            />

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
            onClick={() => this.props.onGoBack()}
          >
            <i className="bi bi-chevron-left"></i> Retour
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => this.onSubmit()}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  /* ---------- NEW ITEM ---------- */

  // New line
  addNewLine = (assessmentItem) =>
    this.setState({ newFactorAssessmentItem: assessmentItem });

  // add new ghg emissions item
  addItem = (assessmentItem, factorId) => {
    let { ghgDetails } = this.state;

    const id = getNewId(Object.entries(ghgDetails).map(([_, item]) => item));
    ghgDetails[id] = {
      id: id,
      assessmentItem: assessmentItem,
      label: emissionFactors[factorId].label,
      factorId: factorId,
      gaz: assessmentItem == "4" ? "R14" : "co2e",
      consumption: 0.0,
      consumptionUnit: Object.keys(emissionFactors[factorId].units)[0],
      consumptionUncertainty: 0.0,
      ghgEmissions: 0.0,
      ghgEmissionsUncertainty: 0.0,
    };

    this.setState({ ghgDetails: ghgDetails, newFactorAssessmentItem: "" });
  };

  /* ---------- UPDATES ---------- */

  // Source
  changeFactor = (itemId, nextFactorId) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.factorId = nextFactorId;
    itemData.label = emissionFactors[nextFactorId].label;

    // re-init if unit unvailable for new source
    if (
      !["kgCO2e", "tCO2e"].includes(itemData.consumptionUnit) &&
      !Object.keys(emissionFactors[nextFactorId].units).includes(
        itemData.consumptionUnit
      )
    ) {
      itemData.consumption = 0.0;
      itemData.consumptionUnit = Object.keys(
        emissionFactors[nextFactorId].units
      )[0];
      itemData.consumptionUncertainty = 0.0;
      itemData.ghgEmissions = 0.0;
      itemData.ghgEmissionsUncertainty = 0.0;
    }
    // ...or update amount of emission with new unit
    else {
      itemData.ghgEmissions = getGhgEmissions(itemData);
      itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    }

    // update total
    this.updateGhgEmissions();
  };

  // Consumption
  updateConsumption = (itemId, nextConsumption) => {
    let item = this.state.ghgDetails[itemId];
    if (item.assessmentItem == "1" || item.assessmentItem == "2") {
      this.setState({ message: true });
    }

    item.consumption = nextConsumption;

    // uncertainty to zero if consumption null
    if (!item.consumption) item.consumptionUncertainty = 0.0;
    // and default uncertainty to 25 % if uncertainty null
    else if (!item.consumptionUncertainty) item.consumptionUncertainty = 25.0;

    item.ghgEmissions = getGhgEmissions(item);
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);

    // update total
    this.updateGhgEmissions();
  };

  // Consumption unit
  changeConsumptionUnit = (itemId, nextConsumptionUnit) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);

    // update total
    this.updateGhgEmissions();
  };

  // Consumption uncertainty
  updateConsumptionUncertainty = (itemId, nextConsumptionUncertainty) => {
    let item = this.state.ghgDetails[itemId];

    item.consumptionUncertainty = nextConsumptionUncertainty;
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);

    // update total
    this.updateGhgEmissions();
  };

  // Gaz (only used for cooling systems)
  updateGaz = (itemId, nextGaz) => {
    let itemData = this.state.ghgDetails[itemId];

    itemData.gaz = nextGaz;
    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);

    // update total
    this.updateGhgEmissions();
  };

  // Label
  updateLabel = (itemId, nextLabel) => {
    let item = this.state.ghgDetails[itemId];
    item.label = nextLabel;
  };

  /* ---------- DELETE ---------- */

  deleteItem = (itemId) => {
    delete this.state.ghgDetails[itemId];

    // update total
    this.updateGhgEmissions();
  };

  /* ---------- STATE / PROPS ---------- */

  // update state
  updateGhgEmissions = async () => {
    this.setState({
      greenhousesGazEmissions: getTotalGhgEmissions(this.state.ghgDetails),
      greenhousesGazEmissionsUncertainty: getTotalGhgEmissionsUncertainty(
        this.state.ghgDetails
      ),
    });
  };

  // --------------------------------------------------
  // update props

  onSubmit = async () => {
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
}