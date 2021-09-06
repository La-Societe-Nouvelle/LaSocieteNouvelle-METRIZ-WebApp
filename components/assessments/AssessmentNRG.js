import React from 'react';

import { InputNumber } from '../InputNumber';
import { getNewId, ifCondition, ifDefined, printValue } from '../../src/utils/Utils';

// Libs
import nrgProducts from '../../lib/nrgProducts.json';

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT NRG -------------------- */
/* -------------------------------------------------------- */

/* List of assessment item :
    - electricity (id: 0)
    - fossil products
    - biomass products
    - heat (id: 1)
    - renewableTranformedEnergy (id: 2)

   Each item in nrgDetails has the following properties :
    id: id of the item
    idGHG: if of the matching item in ghg details
    fuelCode: code of the energetic product (cf. base nrgProducts)
    type: fossil/biomass (used for distinction between fossil and biomass products)
    consumption: consumption
    consumptionUnit: unit for the consumption value
    uncertainty: uncertainty for the consumption value
    nrgConsumption: energetic consumption (in MJ)

   Modifications are saved only when validation button is pressed, otherwise it stay in the state
*/

export class AssessmentNRG extends React.Component {

  constructor(props) {
    super(props)
    this.state = 
    {
      // total consumption & uncertainty
      energyConsumption: props.session.impactsData.energyConsumption,
      energyConsumptionUncertainty: props.session.impactsData.energyConsumptionUncertainty,
      // details (by products)
      nrgDetails: props.session.impactsData.nrgDetails,
      // adding new product
      newFossilProduct: false,
      newBiomassProduct: false
    }
  }

  componentDidMount()
  {
    let {nrgDetails} = this.state;
    const productsToInit = {"electricity": 0,"heat": 1,"renewableTransformedEnergy": 2};
    Object.entries(productsToInit)
          .filter(([product,id]) => nrgDetails[id]==undefined)
          .forEach(([product,id]) => nrgDetails[product] = {id: id, fuelCode: product, type: product, consumption: 0.0, consumptionUnit: "kWh", uncertainty: 5.0, nrgConsumption: 0.0})
    this.setState({nrgDetails: nrgDetails});
  }

  render() 
  {
    const {netValueAdded} = this.props.session.impactsData;
    const {energyConsumption,energyConsumptionUncertainty,nrgDetails} = this.state;
    const {newFossilProduct,newBiomassProduct} = this.state;

    return (
      <div className="indicator-section-view">

        <div className="view-header">
          <button className="retour"onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className="retour"onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        <div className="group assessment"><h3>Outil de mesure</h3>

          <table>
            <thead>
              <tr><td colSpan="3">Libellé</td><td colSpan="2">Valeur</td><td></td></tr>
            </thead>
            <tbody>

              {nrgDetails["electricity"] &&
              <tr><td>Electricité</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["electricity"].consumption} 
                               onUpdate={(nextValue) => this.updateProductConsumption.bind(this)("electricity", nextValue)}/></td>
                <td className="short">
                  <select value={nrgDetails["electricity"].consumptionUnit}
                          onChange={(event) => this.changeConsumptionUnit("electricity", event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">{printValue(nrgDetails["electricity"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
              </tr>}
              
              <tr><td colSpan="3">Produits énergétiques fossiles</td>
                <td className="short right">{printValue(this.getSumByType("fossil"),0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" onClick={() => this.addNewLine("fossil")} alt="add"/></td>
              </tr>

              {Object.entries(nrgDetails)
                     .filter(([id,data]) => data.type=="fossil")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="sub">
                    <select value={itemData.fuelCode}
                            onChange={(event) => this.changeNrgProduct(itemId,event.target.value)}>
                      {Object.entries(nrgProducts)
                             .filter(([key,data]) => data.type=="fossil")
                             .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateProductConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                        <option key="MJ" value="MJ">&nbsp;MJ</option>
                        <option key="kWh" value="kWh">&nbsp;kWh</option>
                        {Object.entries(nrgProducts[itemData.fuelCode].units)
                               .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                      </select></td>
                  <td className="short right">{printValue(itemData.nrgConsumption,0)}</td>
                  <td className="column_unit"><span>&nbsp;MJ</span></td>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                </tr>
              )}

              {newFossilProduct &&
                <tr>
                  <td className="sub">
                    <select value="none"
                            onChange={(event) => this.addProduct(event.target.value)}>
                      <option key="none" value="none">---</option>
                      {Object.entries(nrgProducts)
                             .filter(([key,data]) => data.type=="fossil")
                             .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                    </select></td>
                </tr>
              }

              <tr>
                <td colSpan="3">Biomasse</td>
                <td className="short right">{printValue(this.getSumByType("biomass"),0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" onClick={() => this.addNewLine("biomass")} alt="add" /></td>
              </tr>

              {Object.entries(nrgDetails)
                     .filter(([itemId,itemData]) => itemData.type=="biomass")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="sub">
                    <select value={itemData.fuelCode}
                            onChange={(event) => this.changeNrgProduct(itemId,event.target.value)}>
                      {Object.entries(nrgProducts)
                             .filter(([key,data]) => data.type=="biomass")
                             .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateProductConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                      <option key="MJ" value="MJ">&nbsp;MJ</option>
                      <option key="kWh" value="kWh">&nbsp;kWh</option>
                      {Object.entries(nrgProducts[itemData.fuelCode].units)
                             .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                    </select></td>
                  <td className="short right">{printValue(itemData.nrgConsumption,0)}</td>
                  <td className="column_unit"><span>&nbsp;MJ</span></td>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                </tr>
              )}

              {newBiomassProduct &&
                <tr>
                  <td className="sub">
                    <select value="none"
                            onChange={(event) => this.addProduct(event.target.value)}>
                      <option key="none" value="none">---</option>
                      {Object.entries(nrgProducts)
                             .filter(([key,data]) => data.type=="biomass")
                             .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                    </select></td>
                </tr>
              }

              {nrgDetails["heat"] &&
              <tr>
                <td>Chaleur</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["heat"].consumption} 
                               onUpdate={(nextValue) => this.updateProductConsumption.bind(this)("heat",nextValue)}/></td>
                <td className="short">
                  <select value={nrgDetails["heat"].consumptionUnit}
                          onChange={(event) => this.changeConsumptionUnit("heat",event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">{printValue(nrgDetails["heat"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
              </tr>}

              {nrgDetails["renewableTransformedEnergy"] &&
              <tr>
                <td>Energie renouvelable transformée</td>
                <td className="short right">
                  <InputNumber value={nrgDetails["renewableTransformedEnergy"].consumption} 
                               onUpdate={(nextValue) => this.updateProductConsumption.bind(this)("renewableTransformedEnergy",nextValue)}/></td>
                <td className="short">
                  <select value={nrgDetails["renewableTransformedEnergy"].consumptionUnit}
                          onChange={(event) => this.changeConsumptionUnit("renewableTransformedEnergy",event.target.value)}>
                    <option key="MJ" value="MJ">&nbsp;MJ</option>
                    <option key="kWh" value="kWh">&nbsp;kWh</option>
                  </select></td>
                <td className="short right">{printValue(nrgDetails["renewableTransformedEnergy"].nrgConsumption,0)}</td>
                <td className="column_unit"><span>&nbsp;MJ</span></td>
              </tr>}

              <tr className="with-top-line">
                <td colSpan="3">Total</td>
                <td className="column_value">{printValue(this.energyConsumption,0)}</td>
                <td className="column_unit">&nbsp;MJ</td></tr>
              <tr>
                <td colSpan="3">Valeur ajoutée nette</td>
                <td className="column_value">{printValue(netValueAdded,0)}</td>
                <td className="">&nbsp;€</td></tr>
              <tr className="with-top-line with-bottom-line">
                <td colSpan="3">Intensité liée à la valeur ajoutée</td>
                <td className="column_value">{printValue(this.getIntensity(netValueAdded,energyConsumption),1)}</td>
                <td className="column_unit">&nbsp;kJ/€</td></tr>
            </tbody>
          </table>

        </div>
      </div>
    ) 
  }

  addNewLine = (type) => this.setState({newFossilProduct: (type=="fossil"), newBiomassProduct: (type=="biomass")})

  addProduct = (fuelCode) => 
  {
    let {nrgDetails} = this.state;
    const id = getNewId(Object.entries(nrgDetails)
                              .map(([id,item]) => item));
    nrgDetails[id] = {
      id: id,
      fuelCode: fuelCode, 
      type: nrgProducts[fuelCode].type,
      consumption: 0.0, 
      consumptionUnit: "MJ",
      uncertainty: 25.0, 
      nrgConsumption: 0.0
    }
    this.setState({nrgDetails: nrgDetails, newFossilProduct: false, newBiomassProduct: false});
  }

  changeNrgProduct = (itemId,nextFuelCode) =>
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.fuelCode = nextFuelCode;
    // check if the unit used is also available for the new product
    if (Object.keys(nrgProducts[nextFuelCode].units)
              .includes(itemData.consumptionUnit)) {
      itemData.nrgConsumption = this.getNrgConsumption(itemData);
    } else {
      itemData = {...itemData, consumption: 0.0, nrgConsumption: 0.0, consumptionUnit: "GJ", uncertainty: 25.0}
    }
    // update total
    this.updateEnergyConsumption(); 
  }

  updateProductConsumption = (itemId,nextValue) => 
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.consumption = nextValue;
    itemData.nrgConsumption = this.getNrgConsumption(itemData);
    this.updateEnergyConsumption();
  }

  changeConsumptionUnit = (itemId,nextConsumptionUnit) => 
  {
    let itemData = this.state.nrgDetails[itemId];
    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.nrgConsumption = this.getNrgConsumption(itemData);
    this.updateEnergyConsumption();
  }

  deleteItem = (item) =>
  {
    let {nrgDetails} = this.state;
    delete nrgDetails[item];
    this.setState({nrgDetails: nrgDetails});
  }

  updateEnergyConsumption = () => this.setState({energyConsumption: this.getTotalNrgConsumption()})

  onSubmit = async () =>
  {
    let {impactsData} = this.props.session;

    // update ng data
    impactsData.nrgDetails = this.state.nrgDetails;
    impactsData.energyConsumption = this.state.energyConsumption;
    impactsData.energyConsumptionUncertainty = this.state.energyConsumptionUncertainty;

    await this.props.session.updateRevenueIndicFootprint("nrg");

    // update ghg data
    // ...details
    Object.entries(impactsData.nrgDetails)
          .filter(([id,data]) => data.type=="fossil" || data.type=="biomass")
          .forEach(([itemId,itemData]) => 
          {
            if (itemData.idGHG==undefined) {
              const id = getNewId(Object.entries(impactsData.ghgDetails)
                                        .map(([id,data]) => data));
              impactsData.ghgDetails[id] = {
                id: id, 
                idNRG: itemId,
                fuelCode: itemData.fuelCode, 
                consumption: itemData.consumption, 
                consumptionUnit: itemData.consumptionUnit,
                uncertainty: itemData.uncertainty, 
                emissions: this.getGhgEmissions(itemData), 
                assessmentItem: "2"
              }
            } else {
              impactsData.ghgDetails[itemData.idGHG].fuelCode = itemData.fuelCode;
              impactsData.ghgDetails[itemData.idGHG].consumption = itemData.consumption;
              impactsData.ghgDetails[itemData.idGHG].consumptionUnit = itemData.consumptionUnit;
              impactsData.ghgDetails[itemData.idGHG].emissions = this.getGhgEmissions(itemData);
              impactsData.ghgDetails[itemData.idGHG].uncertainty = itemData.uncertainty;
            }
          })
    // ...total & uncertainty
    impactsData.greenhousesGazEmissions = Object.entries(impactsData.ghgDetails)
                                                .map(([key,data]) => data.ghgEmissions)
                                                .reduce((a,b) => a + b,0);

    await this.props.session.updateRevenueIndicFootprint("ghg");
  }

  getTotalNrgConsumption() 
  {
    const {nrgDetails} = this.state;
    const sum = Object.entries(nrgDetails)
                      .map(([key,data]) => data.nrgConsumption)
                      .reduce((a,b) => a + b,0);
    return sum;
  }

  getSumByType(type) 
  {
    const {nrgDetails} = this.state;
    const sum = Object.entries(nrgDetails)
                      .filter(([key,data]) => data.type==type)
                      .map(([key,data]) => data.nrgConsumption)
                      .reduce((a,b) => a + b,0);
    return sum;
  }

  getNrgConsumption({consumption,consumptionUnit,fuelCode}) 
  {
    switch(consumptionUnit) 
    {
      case "MJ": return consumption;
      case "kWh": return consumption*3.6;
      default: {
        const coef = nrgProducts[fuelCode].units[consumptionUnit].coefNRG;
        return consumption * coef;
      }
    }
  }

  getGhgEmissions({consumption,consumptionUnit,fuelCode}) 
  {
    const coef = nrgProducts[fuelCode].units[consumptionUnit].coefGHG;
    return consumption * coef;
  }

  getIntensity = (netValueAdded,energyConsumption) => 
  {
    if (netValueAdded!=null && energyConsumption!=null) {return energyConsumption*1000/netValueAdded}
    else {return null} 
  }

}