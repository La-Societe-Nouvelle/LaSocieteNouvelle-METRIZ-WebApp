// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import metaIndicators from '/lib/indics';

/* ---------- SOCIAL FOOTPRINT TABLE ---------- */

export class SocialFootprintTable extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {
      revenueFootprint: props.revenueFootprint,
      socialFootprint: {}
    };
  }

  render() 
  {
    const {revenueFootprint,socialFootprint} = this.state;
  
    return (
      <table>
        <thead>
          <tr>
            <td >Indicateur</td>
            <td className="column_value" colSpan="2">Valeur</td>
            <td className="column_uncertainty">Incertitude</td>
            <td>Publication</td>
          </tr>
        </thead>
        <tbody>
          {Object.keys(metaIndicators).map(indic =>
            <tr>
              <td className="auto">{metaIndicators[indic].libelle}</td>
              <td className="column_value">{printValue(revenueFootprint.indicators[indic].value,metaIndicators[indic].nbDecimals)}</td>
              <td className="column_unit">&nbsp;{metaIndicators[indic].unit}</td>
              <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(revenueFootprint.indicators[indic].uncertainty,0)}&nbsp;%</td>
              <td><input type="checkbox" 
                         value={indic}
                         checked={socialFootprint[indic]!=undefined}
                         onChange={this.updateValidations}/></td>
            </tr>)}
        </tbody>
      </table>)
  }

  updateValidations = (event) => 
  {
    let indicator = this.state.revenueFootprint.indicators[event.target.value];
    this.props.onCheckIndicator(indicator,event.target.checked);
    this.setState({validations});
  }
}