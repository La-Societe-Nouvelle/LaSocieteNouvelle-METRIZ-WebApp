// La Société Nouvelle

// React
import React from 'react';

// Utils
import { valueOrDefault } from '../../src/utils/Utils';
import { InputNumber } from '../InputNumber';

/* ---------- DECLARATION - INDIC #DIS ---------- */
export class StatementDIS extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      indexGini: valueOrDefault(props.impactsData.indexGini, ""),
    }
  }

  componentDidUpdate() 
  {
    if (this.state.indexGini!=this.props.impactsData.indexGini) {
      this.setState({indexGini: this.props.impactsData.indexGini});
    }
  }

  render() 
  {
    const {hasEmployees,netValueAdded} = this.props.impactsData;
    const {indexGini} = this.state;

    let isValid = indexGini!=null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle employeur ?</label>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="true"
                   checked={hasEmployees === true}
                   onChange={this.onHasEmployeesChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasEmployees"
                   value="false"
                   checked={hasEmployees === false}
                   onChange={this.onHasEmployeesChange}/>
            <label>Non</label>
          </div>
          {false && <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Détails</button>
          </div>}
        </div>
        <div className="statement-item">
          <label>Indice de GINI des taux horaires bruts</label>
          <InputNumber value={indexGini}
                       disabled={hasEmployees === false}
                       onUpdate={this.updateIndexGini}/>
          <span>&nbsp;/100</span>
          <div className="assessment-button-container">
            <button className="assessment-button" onClick={this.props.toAssessment}>Outil d'évaluation</button>
          </div>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onHasEmployeesChange = (event) => 
  {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.setHasEmployees(true);
        this.props.impactsData.wageGap = null; 
        break;
      case "false": 
        this.props.impactsData.setHasEmployees(false);
        this.props.impactsData.wageGap = 0;
        break;
    }
    this.setState({indexGini: valueOrDefault(this.props.impactsData.indexGini, "")});
    this.props.onUpdate("dis");
    this.props.onUpdate("geq");
  }
  
  updateIndexGini = (input) => 
  {
    this.props.impactsData.indexGini = input;
    this.setState({indexGini: this.props.impactsData.indexGini});
    this.props.onUpdate("dis");
  }

  onValidate = () => this.props.onValidate()
}