// La Société Nouvelle

// React
import React from 'react';

/* ---------- DECLARATION - INDIC #SOC ---------- */

export class StatementSOC extends React.Component {

  constructor(props) 
  {
    super(props);
  }

  render() 
  {
    const {hasSocialPurpose,netValueAdded} = this.props.impactsData;

    let isValid = hasSocialPurpose!==null && netValueAdded!=null;

    return (
      <div className="statement">
        <div className="statement-item">
          <label>L'entreprise est-elle d'utilité sociale ou dotée d'une raison d'être ?</label>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="true"
                   checked={hasSocialPurpose === true}
                   onChange={this.onSocialPurposeChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="false"
                   checked={hasSocialPurpose === false}
                   onChange={this.onSocialPurposeChange}/>
            <label>Non</label>
          </div>
        </div>
        <div className="statement-validation">
          <button disabled={!isValid}
                  onClick={this.onValidate}>Valider</button>
        </div>
      </div>
    ) 
  }

  onSocialPurposeChange = (event) => 
  {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": 
        this.props.impactsData.hasSocialPurpose = true; 
        break;
      case "false": 
        this.props.impactsData.hasSocialPurpose = false; 
        break;
    }
    this.props.onUpdate("soc");
    this.forceUpdate();
  }

  onValidate = () => this.props.onValidate()
}