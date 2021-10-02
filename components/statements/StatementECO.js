// La Société Nouvelle

// React
import React from 'react';

// Utils
import { roundValue, valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #ECO ---------- */

export class StatementECO extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      domesticProduction: valueOrDefault(props.impactsData.domesticProduction, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.domesticProduction!=this.props.impactsData.domesticProduction) {
      this.setState({domesticProduction: this.props.impactsData.domesticProduction});
    }
  }

  render() 
  {
    const {isAllActivitiesInFrance,netValueAdded} = this.props.impactsData;
    const {domesticProduction} = this.state;
    
    let isValid = domesticProduction!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>Les activités de l'entreprise sont-elles localisées en France ?</label>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="true"
                   checked={isAllActivitiesInFrance === true}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="null"
                   checked={isAllActivitiesInFrance === null && domesticProduction !== ""}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Partiellement</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="isAllActivitiesInFrance"
                   value="false"
                   checked={isAllActivitiesInFrance === false}
                   onChange={this.onIsAllActivitiesInFranceChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-item">
          <label>Valeur ajoutée nette produite en France</label>
          <InputNumber value={roundValue(domesticProduction,0)}
                       disabled={isAllActivitiesInFrance!=null}
                       onUpdate={this.updateDomesticProduction}/>
          <span>&nbsp;€</span>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onIsAllActivitiesInFranceChange = (event) => 
  {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setIsAllActivitiesInFrance(true);
        this.props.impactsData.domesticProduction = this.props.impactsData.netValueAdded;
        break;
      case "null": 
        this.props.impactsData.setIsAllActivitiesInFrance(null);
        this.props.impactsData.domesticProduction = 0;
        break;
      case "false": 
        this.props.impactsData.setIsAllActivitiesInFrance(false);
        this.props.impactsData.domesticProduction = 0;
        break;
    }
    this.setState({domesticProduction: valueOrDefault(this.props.impactsData.domesticProduction, "")});
    this.props.onUpdate("eco");
  }

  updateDomesticProduction = (input) => 
  {
    this.props.impactsData.domesticProduction = input;
    this.setState({domesticProduction: this.props.impactsData.domesticProduction});
    this.props.onUpdate("eco");
  }
  
  onValidate = () => this.props.onValidate()
}