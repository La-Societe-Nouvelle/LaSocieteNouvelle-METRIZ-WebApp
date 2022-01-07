// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputNumber } from '../InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';

// Libraries
import fuels from '/lib/fuels.json';
import industrialProcesses from '/lib/industrialProcesses.json';
import coolingSystems from '/lib/coolingSystems.json';
import ghg from '/lib/ghg.json';
import landChanges from '/lib/landChanges.json';

const allSources = {...fuels,
                    ...industrialProcesses,
                    ...coolingSystems,
                    ...landChanges};

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT GHG -------------------- */
/* -------------------------------------------------------- */

/* [FR] Liste des postes d'émissions :
    - emissions directes de sources fixes [1]
    - emissions directes de sources mobiles [2]
    - emissions directes de procédés hors énergie [3]
    - emissions fugitives [4]
    - emissions de la biomasse (sols et forêts) [5]

   Each item in ghgDetails has the following properties :
    id: id of the item,
    assessmentItem : id of the assessment item (1 -> 5)
    label: name of the source
    code: code to fetch data (fuelCode, coolingSystemsCode, etc.)
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
    super(props)
    this.state = 
    {
      // total ghg emissions & uncertainty
      greenhousesGazEmissions: props.impactsData.greenhousesGazEmissions,
      greenhousesGazEmissionsUncertainty: props.impactsData.greenhousesGazEmissionsUncertainty,
      // details (by products)
      ghgDetails: props.impactsData.ghgDetails,
      // adding new product
      itemNewProduct: ""
    }
  }

  render() 
  {
    const {greenhousesGazEmissions,greenhousesGazEmissionsUncertainty,ghgDetails,itemNewProduct} = this.state;

    return (
      <div className="assessment">
        <div className="view-header">
          <button className="retour"onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className="retour"onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        <div className="group"><h3>Outil de mesure</h3>

          <table>
            <thead>
              <tr><td colSpan="6">Libellé</td><td colSpan="2">Valeur</td><td colSpan="2">Incertitude</td></tr>
            </thead>
            <tbody>
              
              <tr>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" alt="add" 
                  onClick={() => this.addNewLine("1")}/></td>
                <td colSpan="5">Emissions directes des sources fixes de combustion</td>
                <td className="short right">{printValue(getTotalByAssessmentItem(ghgDetails,"1"),0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(getUncertaintyByAssessmentItem(ghgDetails,"1"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

              {Object.entries(ghgDetails)
                     .filter(([_,itemData]) => itemData.assessmentItem=="1")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                  <td className="sub">
                    <select value={itemData.source} onChange={(event) => this.changeSource(itemId,event.target.value)}>
                      {Object.entries(fuels)
                             .filter(([_,data]) => data.usageSourcesFixes)
                             .map(([_,data]) => data.group)
                             .filter((value, index, self) => index === self.findIndex(item => item === value))
                             .sort((a,b) => a!="Autres" && b!="Autres" ? a.localeCompare(b) : (a=="Autres" ? 1 : -1))
                             .map((groupName) => 
                        <optgroup label={groupName}>
                          {Object.entries(fuels)
                                 .filter(([_,data]) => data.usageSourcesFixes && data.group==groupName)
                                 .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                        </optgroup>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)} 
                            value={itemData.consumptionUnit}>
                      {Object.entries(fuels[itemData.source].units)
                             .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumptionUncertainty} 
                                 onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissions,0)}</td>
                  <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissionsUncertainty,0)}</td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                </tr>
              )}

              {itemNewProduct=="1" &&
                <tr>
                  <td/>
                  <td className="sub">
                    <select value="0"
                            onChange={(event) => this.addItem("1",event.target.value)}>
                      <option key="none" value="none">---</option>
                      {Object.entries(fuels)
                             .filter(([_,data]) => data.usageSourcesFixes)
                             .map(([_,data]) => data.group)
                             .filter((value, index, self) => index === self.findIndex(item => item === value))
                             .sort((a,b) => a!="Autres" && b!="Autres" ? a.localeCompare(b) : (a=="Autres" ? 1 : -1))
                             .map((groupName) => 
                        <optgroup label={groupName}>
                          {Object.entries(fuels)
                                 .filter(([_,data]) => data.usageSourcesFixes && data.group==groupName)
                                 .sort()
                                 .map(([key,data]) => <option key={"new_"+key} value={key}>{data.label}</option>)}
                        </optgroup>)}
                    </select></td>
                </tr>
              }

              <tr>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" onClick={() => this.addNewLine("2")} alt="add"/></td>
                <td colSpan="5">Emissions directes des sources mobiles de combustion</td>
                <td className="short right">{printValue(getTotalByAssessmentItem(ghgDetails,"2"),0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(getUncertaintyByAssessmentItem(ghgDetails,"2"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

              {Object.entries(ghgDetails)
                     .filter(([_,itemData]) => itemData.assessmentItem=="2")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                  <td className="sub">
                    <select value={itemData.source} onChange={(event) => this.changeSource(itemId,event.target.value)}>
                      {Object.entries(fuels)
                             .filter(([_,data]) => data.usageSourcesMobiles)
                             .map(([_,data]) => data.group)
                             .filter((value, index, self) => index === self.findIndex(item => item === value))
                             .sort((a,b) => a!="Autres" && b!="Autres" ? a.localeCompare(b) : (a=="Autres" ? 1 : -1))
                             .map((groupName) => 
                        <optgroup label={groupName}>
                          {Object.entries(fuels)
                                 .filter(([_,data]) => data.usageSourcesMobiles && data.group==groupName)
                                 .map(([key,data]) => <option key={itemId+"_"+key} value={key}>{data.label}</option>)}
                        </optgroup>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                      {Object.entries(fuels[itemData.source].units)
                             .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumptionUncertainty} 
                                 onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissions,0)}</td>
                  <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissionsUncertainty,0)}</td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                </tr>
              )}

            {itemNewProduct=="2" &&
              <tr>
                <td/>
                <td className="sub">
                  <select value="0"
                          onChange={(event) => this.addItem("2",event.target.value)}>
                    <option key="none" value="none">---</option>
                    {Object.entries(fuels)
                           .filter(([_,data]) => data.usageSourcesMobiles)
                           .map(([_,data]) => data.group)
                           .filter((value, index, self) => index === self.findIndex(item => item === value))
                           .sort((a,b) => a!="Autres" && b!="Autres" ? a.localeCompare(b) : (a=="Autres" ? 1 : -1))
                           .map((groupName) => 
                      <optgroup label={groupName}>
                        {Object.entries(fuels)
                               .filter(([_,data]) => data.usageSourcesMobiles && data.group==groupName)
                               .map(([key,data]) => <option key={"new_"+key} value={key}>{data.label}</option>)}
                      </optgroup>)}
                  </select></td>
              </tr>}

              <tr>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" alt="add" 
                    onClick={() => this.addNewLine("3")}/></td>
                <td colSpan="5">Emissions directes des process industriels (hors énergie)</td>
                <td className="short right">{printValue(getTotalByAssessmentItem(ghgDetails,"3"),0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(getUncertaintyByAssessmentItem(ghgDetails,"3"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

              {Object.entries(ghgDetails)
                     .filter(([_,itemData]) => itemData.assessmentItem=="3")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                  <td className="sub">
                    <select value={itemData.source}
                            onChange={(event) => this.changeSource(itemId,event.target.value)}>
                      {Object.entries(industrialProcesses.industrialProcesses)
                             .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                      {Object.entries(industrialProcesses.industrialProcesses[itemData.source].units)
                             .map(([unit,_]) => <option key={unit} value={unit}>{unit}</option>)}
                      <option key={"kgCO2e"} value={"kgCO2e"}>{"kgCO2e"}</option>
                      <option key={"tCO2e"} value={"tCO2e"}>{"tCO2e"}</option>
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumptionUncertainty} 
                                 onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissions,0)}</td>
                  <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissionsUncertainty,0)}</td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                </tr>
              )}

            {itemNewProduct=="3" &&
            <tr>
              <td/>
              <td className="sub">
                <select value="0"
                        onChange={(event) => this.addItem("3",event.target.value)}>
                  <option key="none" value="none">---</option>
                  {Object.entries(industrialProcesses.industrialProcesses)
                         .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                </select></td>
            </tr>}
              
              <tr>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" alt="add" 
                  onClick={() => this.addNewLine("4")}/></td>
                <td colSpan="5">Emissions directes fugitives</td>
                <td className="short right">{printValue(getTotalByAssessmentItem(ghgDetails,"4"),0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(getUncertaintyByAssessmentItem(ghgDetails,"4"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

              {Object.entries(ghgDetails)
                     .filter(([_,itemData]) => itemData.assessmentItem=="4")
                     .map(([itemId,itemData]) => 
                <tr key={itemId}>
                  <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                  <td className="sub">
                    <select value={itemData.source} onChange={(event) => this.changeSource(itemId,event.target.value)}>
                      {Object.entries(coolingSystems)
                             .map(([_,data]) => data.group)
                             .filter((value, index, self) => index === self.findIndex(item => item === value))
                             .sort()
                             .map((groupName) => 
                        <optgroup label={groupName}>
                          {Object.entries(coolingSystems)
                                 .filter(([_,data]) => data.group==groupName)
                                 .sort()
                                 .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                        </optgroup>)}
                    </select></td>
                  <td className="short right">
                    <InputNumber value={itemData.consumption} 
                                 onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                  <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                      <option key={coolingSystems[itemData.source].unit} value={coolingSystems[itemData.source].unit}>{coolingSystems[itemData.source].unit}</option>
                      <option key={"kgCO2e"} value={"kgCO2e"}>{"kgCO2e"}</option>
                      <option key={"tCO2e"} value={"tCO2e"}>{"tCO2e"}</option>
                    </select></td>
                  {(itemData.consumptionUnit=="kgCO2e" || itemData.consumptionUnit=="tCO2e") &&
                    <td className="short right">
                      <InputNumber value={itemData.consumptionUncertainty} 
                                  onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>}
                  {(itemData.consumptionUnit=="kgCO2e" || itemData.consumptionUnit=="tCO2e") && <td className="column_unit"><span>&nbsp;%</span></td>}
                  {(itemData.consumptionUnit!="kgCO2e" && itemData.consumptionUnit!="tCO2e") &&
                    <td colSpan="2">
                      <select value={itemData.gaz}
                              onChange={(event) => this.changeGaz(itemId,event.target.value)}>
                        {Object.entries(ghg)
                               .filter(([_,data]) => data.label!="")
                               .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                      </select></td>}
                  <td className="short right">{printValue(itemData.ghgEmissions,0)}</td>
                  <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                  <td className="short right">{printValue(itemData.ghgEmissionsUncertainty,0)}</td>
                  <td className="column_unit"><span>&nbsp;%</span></td>
                </tr>)}

            {itemNewProduct=="4" &&
              <tr>
                <td/>
                <td className="sub">
                  <select value="0"
                          onChange={(event) => this.addItem("4",event.target.value)}>
                    <option key="none" value="none">---</option>
                    {Object.entries(coolingSystems)
                           .map(([_,data]) => data.group)
                           .filter((value, index, self) => index === self.findIndex(item => item === value))
                           .sort()
                           .map((groupName) => 
                      <optgroup label={groupName}>
                        {Object.entries(coolingSystems)
                               .filter(([_,data]) => data.group==groupName)
                               .sort()
                               .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                      </optgroup>)}
                  </select></td>
              </tr>}
              
              <tr>
                <td className="column_icon"><img className="img" src="/resources/icon_add.jpg" alt="add" 
                    onClick={() => this.addNewLine("5")}/></td>
                <td colSpan="5">Emissions issues de la biomasse (sols et forêts)</td>
                <td className="short right">{printValue(getTotalByAssessmentItem(ghgDetails,"5"),0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(getUncertaintyByAssessmentItem(ghgDetails,"5"),0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>

            {Object.entries(ghgDetails)
                    .filter(([_,itemData]) => itemData.assessmentItem=="5")
                    .map(([itemId,itemData]) => 
              <tr key={itemId}>
                <td className="column_icon"><img className="img" src="/resources/icon_delete.jpg" onClick={() => this.deleteItem(itemId)} alt="delete"/></td>
                <td className="sub">
                    <select value={itemData.sour} onChange={(event) => this.changeSource(itemId,event.target.value)}>
                    {Object.entries(landChanges)
                           .map(([_,data]) => data.from)
                           .filter((value, index, self) => index === self.findIndex(item => item === value))
                           .sort()
                           .map((from) => 
                      <optgroup label={from}>
                        {Object.entries(landChanges)
                               .filter(([_,data]) => data.from==from)
                               .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                      </optgroup>)}
                    </select></td>
                <td className="short right">
                  <InputNumber value={itemData.consumption}
                                onUpdate={(nextValue) => this.updateConsumption.bind(this)(itemId,nextValue)}/></td>
                <td>
                    <select value={itemData.consumptionUnit}
                            onChange={(event) => this.changeConsumptionUnit(itemId,event.target.value)}>
                      <option key={"ha"} value={"ha"}>{"ha"}</option>
                      <option key={"kgCO2e"} value={"kgCO2e"}>{"kgCO2e"}</option>
                      <option key={"tCO2e"} value={"tCO2e"}>{"tCO2e"}</option>
                    </select></td>
                <td className="short right">
                    <InputNumber value={itemData.consumptionUncertainty} 
                                 onUpdate={(nextValue) => this.updateConsumptionUncertainty.bind(this)(itemId,nextValue)}/></td>
                <td className="column_unit"><span>&nbsp;%</span></td>
                <td className="short right">{printValue(itemData.ghgEmissions,0)}</td>
                <td className="column_unit"><span>&nbsp;kgCO2e</span></td>
                <td className="short right">{printValue(itemData.ghgEmissionsUncertainty,0)}</td>
                <td className="column_unit"><span>&nbsp;%</span></td>
              </tr>)}

            {itemNewProduct=="5" &&
              <tr>
                <td/>
                <td className="sub">
                  <select value="0" onChange={(event) => this.addItem("5",event.target.value)}>
                    <option key="none" value="none">---</option>
                    {Object.entries(landChanges)
                           .map(([_,data]) => data.from)
                           .filter((value, index, self) => index === self.findIndex(item => item === value))
                           .sort()
                           .map((from) => 
                      <optgroup label={from}>
                        {Object.entries(landChanges)
                               .filter(([_,data]) => data.from==from)
                               .map(([key,data]) => <option key={key} value={key}>{data.label}</option>)}
                      </optgroup>)}
                  </select></td>
              </tr>}

              <tr className="with-top-line">
                <td colSpan="6">Total</td>
                <td className="column_value">{printValue(greenhousesGazEmissions,0)}</td>
                <td className="column_unit">&nbsp;kgCO2e</td>
                <td className="column_value">{printValue(greenhousesGazEmissionsUncertainty,0)}</td>
                <td className="column_unit">&nbsp;%</td></tr>

            </tbody>
          </table>
        </div>
      </div>
    ) 
  }

  /* ---------- NEW ITEM ---------- */

  // New line
  addNewLine = (type) => this.setState({itemNewProduct: type})

  // add new ghg emissions item
  addItem = (assessmentItem,source) =>
  {
    let {ghgDetails} = this.state;
    const id = getNewId(Object.entries(ghgDetails).map(([_,item]) => item));
    ghgDetails[id] = {
      id: id,
      assessmentItem: assessmentItem,
      label: allSources[source].label,
      source: source,
      gaz: assessmentItem=="4" ? "R14" : "co2e",
      consumption: 0.0, 
      consumptionUnit: Object.keys(allSources[source].units)[0], 
      consumptionUncertainty: 0.0,
      ghgEmissions: 0.0,
      ghgEmissionsUncertainty: 0.0, 
    }
    this.setState({ghgDetails: ghgDetails, itemNewProduct: ""});
  }

  /* ---------- UPDATES ---------- */

  // Source
  changeSource = (itemId,nextSourceId) =>
  {
    let itemData = this.state.ghgDetails[itemId];
    itemData.source = nextSourceId;
    itemData.label = allSources[nextSourceId].label;

    // re-init if unit unvailable for new source
    if (!["kgCO2e","tCO2e"].includes(itemData.consumptionUnit) && 
        !Object.keys(allSources[nextSourceId].units).includes(itemData.consumptionUnit))
    {
      itemData.consumption = 0.0;
      itemData.consumptionUnit = Object.keys(allSources[source].units)[0];
      itemData.consumptionUncertainty = 0.0;
      itemData.ghgEmissions = 0.0;
      itemData.ghgEmissionsUncertainty = 0.0;
    }
    else
    {
      itemData.ghgEmissions = getGhgEmissions(itemData);
      itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    }

    // update total
    this.updateGhgEmissions();
  }

  // Consumption
  updateConsumption = (itemId,nextConsumption) => 
  {
    let item = this.state.ghgDetails[itemId];
    item.consumption = nextConsumption;

    // uncertainty to zero if consumption null
    if (!item.consumption) item.consumptionUncertainty = 0.0;
    // and default uncertainty to 25 % if uncertainty null
    else if (!item.consumptionUncertainty) item.consumptionUncertainty = 25.0;

    item.ghgEmissions = getGhgEmissions(item);
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);
    this.updateGhgEmissions();
  }

  // Consumption unit
  changeConsumptionUnit = (itemId,nextConsumptionUnit) => 
  {
    let itemData = this.state.ghgDetails[itemId];
    itemData.consumptionUnit = nextConsumptionUnit;
    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    this.updateGhgEmissions();
  }

  // Consumption uncertainty
  updateConsumptionUncertainty = (itemId,nextConsumptionUncertainty) =>
  {
    let item = this.state.ghgDetails[itemId];
    item.consumptionUncertainty = nextConsumptionUncertainty;
    item.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(item);
    this.updateGhgEmissions();
  }

  // Gaz (only used for cooling systems)
  changeGaz = (itemId,nextGaz) =>
  {
    let itemData = this.state.ghgDetails[itemId];
    itemData.gaz = nextGaz;

    itemData.ghgEmissions = getGhgEmissions(itemData);
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    this.updateGhgEmissions();
  }
  
  // Label
  changeLabel = (itemId,nextLabel) => 
  {
    let item = this.state.ghgDetails[itemId];
    item.label = nextLabel;
  }

  /* ---------- DELETE ---------- */

  deleteItem = (itemId) =>
  {
    delete this.state.ghgDetails[itemId];
    this.updateGhgEmissions();
  }

  /* ---------- STATE / PROPS ---------- */

  // update state
  updateGhgEmissions = async () =>
  { 
    this.setState({
      greenhousesGazEmissions: getTotalGhgEmissions(this.state.ghgDetails), 
      greenhousesGazEmissionsUncertainty: getTotalGhgEmissionsUncertainty(this.state.ghgDetails)
    })
  }

  // update props
  onSubmit = async () =>
  {
    let impactsData = this.props.impactsData;

    // update ghg data
    impactsData.ghgDetails = this.state.ghgDetails;
    impactsData.greenhousesGazEmissions = getTotalGhgEmissions(impactsData.ghgDetails);
    impactsData.greenhousesGazEmissionsUncertainty = getTotalGhgEmissionsUncertainty(impactsData.ghgDetails);
    await this.props.onUpdate("ghg");

    // update nrg data
    // ...delete
    Object.entries(impactsData.nrgDetails)
          .filter(([_,itemData]) => itemData.type=="fossil" || itemData.type=="biomass")
          .forEach(([itemId,_]) => 
          {
            let ghgItem = Object.entries(impactsData.ghgDetails).map(([_,ghgItemData]) => ghgItemData).filter(ghgItem => ghgItem.idNRG==itemId)[0];
            if (ghgItem==undefined) delete impactsData.nrgDetails[itemId];
          })
    // ...add & update
    Object.entries(impactsData.ghgDetails)
          .filter(([_,itemData]) => ["1","2"].includes(itemData.assessmentItem))
          .forEach(([itemId,itemData]) => 
          {
            let nrgItem = Object.entries(impactsData.nrgDetails).map(([_,nrgItemData]) => nrgItemData).filter(nrgItem => nrgItem.idGHG==itemId)[0];
            if (nrgItem==undefined) {
              const id = getNewId(Object.entries(impactsData.nrgDetails).map(([_,data]) => data).filter(item => !isNaN(item.id)));
              impactsData.nrgDetails[id] = {id: id,idGHG: itemId}
              nrgItem = impactsData.nrgDetails[id];
              itemData.idNRG = id;
            }
            // update values
            nrgItem.fuelCode = itemData.source;
            nrgItem.consumption = itemData.consumption;
            nrgItem.consumptionUnit = itemData.consumptionUnit;
            nrgItem.consumptionUncertainty = itemData.consumptionUncertainty;
            nrgItem.nrgConsumption = getNrgConsumption(itemData);
            nrgItem.nrgConsumptionUncertainty = getNrgConsumptionUncertainty(itemData);
            nrgItem.type = fuels[itemData.source].type;
          })
    // ...total & uncertainty
    impactsData.energyConsumption = getTotalNrgConsumption(impactsData.nrgDetails)
    impactsData.energyConsumptionUncertainty = getTotalNrgConsumptionUncertainty(impactsData.nrgDetails)
    await this.props.onUpdate("nrg");

    // back to statement
    this.props.onGoBack();
  }
}

/* -------------------- GHG FORMULAS -------------------- */

const getGhgEmissions = ({consumption,consumptionUnit,source,gaz}) =>
{
  switch(consumptionUnit) {
    case "kgCO2e":  return consumption;
    case "tCO2e":   return consumption * 1000;
    default:        return consumption * allSources[source].units[consumptionUnit].coefGHG * ghg[gaz].prg;
  }
}

const getGhgEmissionsMax = ({consumption,consumptionUnit,consumptionUncertainty,source,gaz}) =>
{
  switch(consumptionUnit) {
    case "kgCO2e":  return consumption*(1+consumptionUncertainty/100);
    case "tCO2e":   return consumption*(1+consumptionUncertainty/100) * 1000;
    default:        return consumption*(1+consumptionUncertainty/100) * allSources[source].units[consumptionUnit].coefGHG*(1+allSources[source].units[consumptionUnit].coefGHGUncertainty/100) * ghg[gaz].prg;
  }
}

const getGhgEmissionsMin = ({consumption,consumptionUnit,consumptionUncertainty,source,gaz}) =>
{
  switch(consumptionUnit) {
    case "kgCO2e":  return consumption*(1-consumptionUncertainty/100);
    case "tCO2e":   return consumption*(1-consumptionUncertainty/100) * 1000;
    default:        return consumption*(1-consumptionUncertainty/100) * allSources[source].units[consumptionUnit].coefGHG*(1-allSources[source].units[consumptionUnit].coefGHGUncertainty/100) * ghg[gaz].prg;
  }
}

const getGhgEmissionsUncertainty = (item) =>
{
  const value = getGhgEmissions(item);
  const valueMax = getGhgEmissionsMax(item);
  const valueMin = getGhgEmissionsMin(item);
  return value != 0 ? Math.round(Math.max(valueMax-value,value-valueMin)/value *100) : 0;
}

const getTotalGhgEmissions = (ghgDetails) =>
{
  const sum = Object.entries(ghgDetails)
                    .map(([_,data]) => data.ghgEmissions)
                    .reduce((a,b) => a + b,0);
  return sum;
}

const getTotalGhgEmissionsUncertainty = (ghgDetails) =>
{
  const items = Object.entries(ghgDetails).map(([_,itemData]) => itemData);
  if (items.length > 0)
  {
    const value = items.map((item) => item.ghgEmissions).reduce((a,b) => a + b,0);
    if (value != 0) {
      const valueMax = items.map((item) => item.ghgEmissions*(1+item.ghgEmissionsUncertainty/100)).reduce((a,b) => a + b,0);
      const valueMin = items.map((item) => item.ghgEmissions*Math.max(1-item.ghgEmissionsUncertainty/100,0)).reduce((a,b) => a + b,0);
      return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
    } else {
      return 0;
    }
  }
  else return  null;
}

const getTotalByAssessmentItem = (ghgDetails,assessmentItem) =>
  {
    const sum = Object.entries(ghgDetails).filter(([_,itemData]) => itemData.assessmentItem==assessmentItem).map(([_,itemData]) => itemData.ghgEmissions).reduce((a,b) => a + b,0);
    return sum;
  }

const getUncertaintyByAssessmentItem = (ghgDetails,assessmentItem) =>
{
  const items = Object.entries(ghgDetails).filter(([_,itemData]) => itemData.assessmentItem==assessmentItem).map(([_,itemData]) => itemData);
  if (items.length > 0)
  {
    const value = items.map((item) => item.ghgEmissions).reduce((a,b) => a + b,0);
    if (value > 0) {
      const valueMax = items.map((item) => item.ghgEmissions*(1+item.ghgEmissionsUncertainty/100)).reduce((a,b) => a + b,0);
      const valueMin = items.map((item) => item.ghgEmissions*Math.max(1-item.ghgEmissionsUncertainty/100,0)).reduce((a,b) => a + b,0);
      return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
    } else {
      return 0;
    }
  }
  else return  null;
}

/* ---------- NRG FORMULAS ---------- */

const getNrgConsumption = ({consumption,consumptionUnit,source}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption;
    case "GJ":  return consumption * 1000;
    case "tep": return consumption * 41868;
    case "kWh": return consumption * 3.6;
    default:    return consumption * fuels[source].units[consumptionUnit].coefNRG;
  }
}

const getNrgConsumptionMax = ({consumption,consumptionUnit,consumptionUncertainty,source}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption*(1+consumptionUncertainty/100);
    case "GJ":  return consumption*(1+consumptionUncertainty/100) * 1000;
    case "tep": return consumption*(1+consumptionUncertainty/100) * 41868;
    case "kWh": return consumption*(1+consumptionUncertainty/100) * 3.6;
    default:    return consumption*(1+consumptionUncertainty/100) * fuels[source].units[consumptionUnit].coefNRG*(1+fuels[source].units[consumptionUnit].coefNRGUncertainty/100);
  }
}

const getNrgConsumptionMin = ({consumption,consumptionUnit,consumptionUncertainty,source}) =>
{
  switch(consumptionUnit) {
    case "MJ":  return consumption*(1-consumptionUncertainty/100);
    case "GJ":  return consumption*(1-consumptionUncertainty/100) * 1000;
    case "tep": return consumption*(1-consumptionUncertainty/100) * 41868;
    case "kWh": return consumption*(1-consumptionUncertainty/100) * 3.6;
    default:    return consumption*(1-consumptionUncertainty/100) * fuels[source].units[consumptionUnit].coefNRG*(1-fuels[source].units[consumptionUnit].coefNRGUncertainty/100);
  }
}

const getNrgConsumptionUncertainty = ({consumption,consumptionUnit,consumptionUncertainty,source}) =>
{
  const value = getNrgConsumption({consumption,consumptionUnit,source});
  const valueMax = getNrgConsumptionMax({consumption,consumptionUnit,consumptionUncertainty,source});
  const valueMin = getNrgConsumptionMin({consumption,consumptionUnit,consumptionUncertainty,source})
  return Math.round(Math.max(valueMax-value,value-valueMin)/value *100);
}

const getTotalNrgConsumption = (nrgDetails) =>
{
  const sum = Object.entries(nrgDetails)
                    .map(([_,data]) => data.nrgConsumption)
                    .reduce((a,b) => a + b,0);
  return sum;
}

const getTotalNrgConsumptionUncertainty = (nrgDetails) =>
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