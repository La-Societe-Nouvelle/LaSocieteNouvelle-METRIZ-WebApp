// La Société Nouvelle

// React
import React from 'react';


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

// Utils
import { InputNumber } from '../input/InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';

// Libs
import fuels from '/lib/emissionFactors/fuels.json';
import { getGhgEmissions, getGhgEmissionsUncertainty, getTotalGhgEmissions, getTotalGhgEmissionsUncertainty } from './AssessmentGHG';

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

export class AssessmentNRG extends React.Component {

  constructor(props) 
  {
    super(props)
    this.state = 
    {
      // total consumption & uncertainty
      energyConsumption: props.impactsData.energyConsumption,
      energyConsumptionUncertainty: props.impactsData.energyConsumptionUncertainty,
      // details (by products)
      nrgDetails: props.impactsData.nrgDetails,
      // adding new product
      typeNewProduct: "",
    }
  }

  componentDidMount() // Create basic nrg product (electricity/heat/renewable)
  {
    let {nrgDetails} = this.state;
    const productsToInit = ["electricity","heat","renewableTransformedEnergy"];
    productsToInit.filter((product) => nrgDetails[product]==undefined)
                  .forEach((product) => 
    {
      nrgDetails[product] = {
        id: product,
        fuelCode: product, 
        type: product,
        consumption: 0.0, 
        consumptionUnit: "kWh",
        consumptionUncertainty: 0.0, 
        nrgConsumption: 0.0,
        nrgConsumptionUncertainty: 0.0,
      }
    })
    this.setState({nrgDetails: nrgDetails});
  }

  render() 
  {
    const {energyConsumption,energyConsumptionUncertainty,nrgDetails,typeNewProduct} = this.state;

    return (
      <div className="assessment">

        <div className="group"><h3>Outil de mesure</h3>

          <table>
            <thead>
              <tr><td colSpan="6">Libellé</td><td colSpan="2">Valeur</td><td colSpan="2">Incertitude</td></tr>
            </thead>
            <tbody>

            {nrgDetails["electricity"] &&
              <tr>
                <td/>
                <td>Electricité</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["electricity"].consumption} 
                               onUpdate={(nextValue) => this.updateConsumption.bind(this)("electricity", nextValue)}/></td>
                <td className="short">
                  <select className="form-input" value={nrgDetails["electricity"].consumptionUnit}
                          onChange={(event) => this.changeNrgProductUnit("electricity", event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">
                  <InputNumber value={nrgDetails["electricity"].consumptionUncertainty} 
                               onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)("electricity",nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(nrgDetails["electricity"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(nrgDetails["electricity"].nrgConsumptionUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>}
              
              <tr>
                <td className="column_icon">
                <button className='btn' onClick={() => this.addNewLine("fossil")}>
                  <FontAwesomeIcon icon={faPlus} />
                  </button>
                  </td>
                <td colSpan="5">Produits énergétiques fossiles</td>
                <td className="short right">{printValue(getNrgConsumptionByType(nrgDetails,"fossil"),0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(getNrgConsumptionUncertaintyByType(nrgDetails,"fossil"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

            {Object.entries(nrgDetails)
                    .filter(([_,data]) => data.type=="fossil")
                    .map(([itemId,itemData]) => 
              <tr key={itemId}>
                <td className="column_icon">
                <button className='btn'  onClick={() => this.deleteItem(itemId)}>
                  <FontAwesomeIcon icon={faTrash} />
                  </button>
                  </td>
                <td className="sub">
                  <select className="form-input" value={itemData.fuelCode}
                          onChange={(event) => this.changeNrgProduct(itemId,event.target.value)}>
                    {Object.entries(fuels)
                            .filter(([_,data]) => data.type=="fossil")
                            .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                  </select></td>
                <td className="short right">
                  <InputNumber value={itemData.consumption} 
                                onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                <td>
                  <select className="form-input" value={itemData.consumptionUnit}
                          onChange={(event) => this.changeNrgProductUnit(itemId,event.target.value)}>
                      <option key="MJ" value="MJ">&nbsp;MJ</option>
                      <option key="kWh" value="kWh">&nbsp;kWh</option>
                      {Object.entries(fuels[itemData.fuelCode].units)
                              .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                    </select></td>
                <td className="short right">
                  <InputNumber value={itemData.consumptionUncertainty} 
                                onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(itemData.nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(itemData.nrgConsumptionUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>)}

            {typeNewProduct=="fossil" &&
              <tr>
                <td/>
                <td className="sub">
                  <select className="form-input" value="none"
                          onChange={(event) => this.addProduct(event.target.value)}>
                    <option key="none" value="none">---</option>
                    {Object.entries(fuels)
                            .filter(([_,data]) => data.type=="fossil")
                            .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                  </select></td>
              </tr>}

              <tr>
                <td className="column_icon">
                <button className='btn' onClick={() => this.addNewLine("biomass")}>
                  <FontAwesomeIcon icon={faPlus} />
                  </button>
                 </td> 
                <td colSpan="5">Biomasse</td>
                <td className="short right">{printValue(getNrgConsumptionByType(nrgDetails,"biomass"),0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(getNrgConsumptionUncertaintyByType(nrgDetails,"biomass"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

            {Object.entries(nrgDetails)
                    .filter(([_,itemData]) => itemData.type=="biomass")
                    .map(([itemId,itemData]) => 
              <tr key={itemId}>
                <td className="column_icon">
                  
                <button className='btn'  onClick={() => this.deleteItem(itemId)}>
                  <FontAwesomeIcon icon={faTrash} />
                  </button>                  
                  </td>
                <td className="sub">
                  <select className="form-input" value={itemData.fuelCode}
                          onChange={(event) => this.changeNrgProduct(itemId,event.target.value)}>
                    {Object.entries(fuels)
                            .filter(([_,data]) => data.type=="biomass")
                            .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                  </select></td>
                <td className="short right">
                  <InputNumber value={itemData.consumption} 
                                onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                <td>
                  <select className="form-input" value={itemData.consumptionUnit}
                          onChange={(event) => this.changeNrgProductUnit(itemId,event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                    {Object.entries(fuels[itemData.fuelCode].units)
                            .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                  </select></td>
                <td className="short right">
                  <InputNumber value={itemData.consumptionUncertainty} 
                                onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(itemData.nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(itemData.nrgConsumptionUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>)}

            {typeNewProduct=="biomass" &&
              <tr>
                <td/>
                <td className="sub">
                  <select className="form-input" value="none"
                          onChange={(event) => this.addProduct(event.target.value)}>
                    <option key="none" value="none">---</option>
                    {Object.entries(fuels)
                            .filter(([_,data]) => data.type=="biomass")
                            .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                  </select></td>
              </tr>}

            {nrgDetails["heat"] &&
              <tr>
                <td/>
                <td>Chaleur</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["heat"].consumption} 
                               onUpdate={(nextValue) => this.updateConsumption.bind(this)("heat",nextValue)}/></td>
                <td className="short">
                  <select className="form-input" value={nrgDetails["heat"].consumptionUnit}
                          onChange={(event) => this.changeNrgProductUnit("heat",event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">
                  <InputNumber value={nrgDetails["heat"].consumptionUncertainty} 
                               onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)("heat",nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(nrgDetails["heat"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(nrgDetails["heat"].nrgConsumptionUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>}

            {nrgDetails["renewableTransformedEnergy"] &&
              <tr>
                <td/>
                <td>Energie renouvelable transformée</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["renewableTransformedEnergy"].consumption} 
                               onUpdate={(nextValue) => this.updateConsumption.bind(this)("renewableTransformedEnergy",nextValue)}/></td>
                <td className="short">
                  <select className="form-input" value={nrgDetails["renewableTransformedEnergy"].consumptionUnit}
                          onChange={(event) => this.changeNrgProductUnit("renewableTransformedEnergy",event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">
                  <InputNumber value={nrgDetails["renewableTransformedEnergy"].consumptionUncertainty} 
                               onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)("renewableTransformedEnergy",nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(nrgDetails["renewableTransformedEnergy"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="short right">{printValue(nrgDetails["renewableTransformedEnergy"].nrgConsumptionUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>}

              <tr className="total">
                <td/>
                <td colSpan="5">Total</td>
                <td className="column_value">{printValue(energyConsumption,0)}</td>
                <td className="column_unit">&nbsp;MJ</td>
                <td className="column_value">{printValue(energyConsumptionUncertainty,0)}</td>
                <td className="column_unit">&nbsp;%</td></tr>
              
            </tbody>
          </table>
          
        <div className="view-header">
          <button className="btn" onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className={"btn btn-primary"} onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        </div>
      </div>
    ) 
  }

  /* ----- NEW ITEM ----- */

  // New line
  addNewLine = (type) => this.setState({typeNewProduct: type})

  // set nrg product
  addProduct = (fuelCode) => 
  {
    let {nrgDetails} = this.state;
    const id = getNewId(Object.entries(nrgDetails).map(([_,item]) => item).filter(item => !isNaN(item.id)));
    nrgDetails[id] = {
      id: id,
      fuelCode: fuelCode, 
      type: fuels[fuelCode].type,
      consumption: 0.0, 
      consumptionUnit: "GJ",
      consumptionUncertainty: 25.0, 
      nrgConsumption: 0.0,
      nrgConsumptionUncertainty: 0.0,
    }
    this.setState({nrgDetails: nrgDetails, typeNewProduct: ""});
  }

  /* ----- UPDATES ----- */

  // update nrg product
  changeNrgProduct = (itemId,nextFuelCode) =>
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.fuelCode = nextFuelCode;

    // check if the unit used is also available for the new product
    if (Object.keys(fuels[nextFuelCode].units)
              .includes(itemData.consumptionUnit)) {
      itemData.nrgConsumption = getNrgConsumption(itemData);
      itemData.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    } else {
      itemData.consumption = 0.0;
      itemData.consumptionUnit = "GJ";
      itemData.consumptionUncertainty = 0.0;
      itemData.nrgConsumption = 0.0;
      itemData.nrgConsumptionUncertainty = 0.0;
    }

    // update total
    this.updateEnergyConsumption(); 
  }

  changeNrgProductUnit = (itemId,nextConsumptionUnit) => 
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.nrgConsumption = getNrgConsumption(itemData);
    itemData.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    this.updateEnergyConsumption();
  }

  // update nrg consumption
  updateConsumption = (itemId,nextValue) => 
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.consumption = nextValue;
    itemData.nrgConsumption = getNrgConsumption(itemData);
    itemData.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
    this.updateEnergyConsumption();
  }

  // update uncertainty
  updateConsumptionUncertainty = (itemId,nextValue) =>
  {
    let item = this.state.nrgDetails[itemId];
    item.consumptionUncertainty = nextValue;
    item.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(item);
    this.updateEnergyConsumption();
  }

  /* ----- DELETE ----- */

  deleteItem = (itemId) =>
  {
    delete this.state.nrgDetails[itemId];
    this.updateEnergyConsumption();
  }

  /* ---------- STATE / PROPS ---------- */

  // update state
  updateEnergyConsumption = () => 
  {
    this.setState({
      energyConsumption: getTotalNrgConsumption(this.state.nrgDetails),
      energyConsumptionUncertainty: getTotalNrgConsumptionUncertainty(this.state.nrgDetails)
    })
  }

  // update props
  onSubmit = async () =>
  {
    let {impactsData} = this.props;

    // update ng data
    impactsData.nrgDetails = this.state.nrgDetails;
    impactsData.energyConsumption = getTotalNrgConsumption(impactsData.nrgDetails);
    impactsData.energyConsumptionUncertainty = getTotalNrgConsumptionUncertainty(impactsData.nrgDetails);
    await this.props.onUpdate("nrg");

    // update ghg data
    // ...delete
    Object.entries(impactsData.ghgDetails)
          .filter(([_,itemData]) => itemData.fuelCode!=undefined)
          .filter(([_,itemData]) => ["1","2"].includes(itemData.assessmentItem))
          .forEach(([itemId,_]) => 
          {
            let nrgItem = Object.entries(impactsData.nrgDetails).map(([_,nrgItemData]) => nrgItemData).filter(nrgItem => nrgItem.idGHG==itemId)[0];
            if (nrgItem==undefined) delete impactsData.ghgDetails[itemId];
          })
    // ...add & update
    Object.entries(impactsData.nrgDetails)
          .filter(([_,data]) => data.type=="fossil" || data.type=="biomass")
          .forEach(([itemId,itemData]) => 
          {
            let ghgItem = Object.entries(impactsData.ghgDetails).map(([_,ghgItemData]) => ghgItemData).filter(ghgItem => ghgItem.idNRG==itemId)[0];
            // init if undefined
            if (ghgItem==undefined) {
              const id = getNewId(Object.entries(impactsData.ghgDetails).map(([_,data]) => data));
              impactsData.ghgDetails[id] = {id: id,idNRG: itemId}
              ghgItem = impactsData.ghgDetails[id];
              itemData.idGHG = id;
            }
            // update values
            ghgItem.assessmentItem = fuels[itemData.fuelCode].usageSourcesFixes ? "1" : "2";
            ghgItem.label = itemData.label,
            ghgItem.factorId = itemData.fuelCode;
            ghgItem.gaz = "co2e",
            ghgItem.consumption = itemData.consumption;
            ghgItem.consumptionUnit = itemData.consumptionUnit;
            ghgItem.consumptionUncertainty = itemData.consumptionUncertainty;
            ghgItem.ghgEmissions = getGhgEmissions(ghgItem);
            ghgItem.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(ghgItem);
          })
    // ...total & uncertainty
    impactsData.greenhousesGazEmissions = getTotalGhgEmissions(impactsData.ghgDetails);
    impactsData.greenhousesGazEmissionsUncertainty = getTotalGhgEmissionsUncertainty(impactsData.ghgDetails);
    await this.props.onUpdate("ghg");

    // go bakc
    this.props.onGoBack();
  }
}

/* ---------- NRG FORMULAS ---------- */

export const getNrgConsumption = ({consumption,consumptionUnit,fuelCode}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption;
    case "GJ":  return consumption * 1000;
    case "tep": return consumption * 41868;
    case "kWh": return consumption * 3.6;
    default:    return consumption * fuels[fuelCode].units[consumptionUnit].coefNRG;
  }
}

const getNrgConsumptionMax = ({consumption,consumptionUnit,consumptionUncertainty,fuelCode}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption*(1+consumptionUncertainty/100);
    case "GJ":  return consumption*(1+consumptionUncertainty/100) * 1000;
    case "tep": return consumption*(1+consumptionUncertainty/100) * 41868;
    case "kWh": return consumption*(1+consumptionUncertainty/100) * 3.6;
    default:    return consumption*(1+consumptionUncertainty/100) * fuels[fuelCode].units[consumptionUnit].coefNRG*(1+fuels[fuelCode].units[consumptionUnit].coefNRGUncertainty/100);
  }
}

const getNrgConsumptionMin = ({consumption,consumptionUnit,consumptionUncertainty,fuelCode}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption*(1-consumptionUncertainty/100);
    case "GJ":  return consumption*(1-consumptionUncertainty/100) * 1000;
    case "tep": return consumption*(1-consumptionUncertainty/100) * 41868;
    case "kWh": return consumption*(1-consumptionUncertainty/100) * 3.6;
    default:    return consumption*(1-consumptionUncertainty/100) * fuels[fuelCode].units[consumptionUnit].coefNRG*(1-fuels[fuelCode].units[consumptionUnit].coefNRGUncertainty/100);
  }
}

export const getNrgConsumptionUncertainty = ({consumption,consumptionUnit,consumptionUncertainty,fuelCode}) =>
{
  const value = getNrgConsumption({consumption,consumptionUnit,fuelCode});
  const valueMax = getNrgConsumptionMax({consumption,consumptionUnit,consumptionUncertainty,fuelCode});
  const valueMin = getNrgConsumptionMin({consumption,consumptionUnit,consumptionUncertainty,fuelCode})
  return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
}

export const getTotalNrgConsumption = (nrgDetails) =>
{
  const sum = Object.entries(nrgDetails)
                    .map(([_,data]) => data.nrgConsumption)
                    .reduce((a,b) => a + b,0);
  return sum;
}

export const getTotalNrgConsumptionUncertainty = (nrgDetails) =>
{
  const items = Object.entries(nrgDetails).map(([_,itemData]) => itemData);
  if (items.length > 0)
  {
    const value = items.map((item) => item.nrgConsumption).reduce((a,b) => a + b,0);
    if (value > 0) {
      const valueMax = items.map((item) => item.nrgConsumption*(1+item.nrgConsumptionUncertainty/100)).reduce((a,b) => a + b,0);
      const valueMin = items.map((item) => item.nrgConsumption*Math.max(1-item.nrgConsumptionUncertainty/100,0)).reduce((a,b) => a + b,0);
      return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
    } else {
      return 0;
    }
  }
  else return  null;
}

const getNrgConsumptionByType = (nrgDetails,type) =>
{
  const sum = Object.entries(nrgDetails)
                    .filter(([_,data]) => data.type==type)
                    .map(([_,data]) => data.nrgConsumption)
                    .reduce((a,b) => a + b,0);
  return sum;
}

const getNrgConsumptionUncertaintyByType = (nrgDetails,type) =>
{
  const items = Object.entries(nrgDetails).filter(([_,itemData]) => itemData.type==type).map(([_,itemData]) => itemData);
  if (items.length > 0)
  {
    const value = items.map((item) => item.nrgConsumption).reduce((a,b) => a + b,0);
    if (value > 0) {
      const valueMax = items.map((item) => item.nrgConsumption*(1+item.nrgConsumptionUncertainty/100)).reduce((a,b) => a + b,0);
      const valueMin = items.map((item) => item.nrgConsumption*(1-item.nrgConsumptionUncertainty/100)).reduce((a,b) => a + b,0);
      return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
    } else {
      return 0;
    }
  }
  else return  null;
}