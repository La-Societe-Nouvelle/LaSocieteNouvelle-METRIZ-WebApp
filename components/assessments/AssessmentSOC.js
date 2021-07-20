import React from 'react';

export class AssessmentSOC extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const hasSocialPurpose = this.props.indicator.getHasSocialPurpose();
    return (
      <div className="assessment">
        <div className="assessment-item">
          <label>L'entreprise est-elle d'utilité sociale ou dotée d'une raison d'être ?</label>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="true"
                   checked={hasSocialPurpose === true}
                   onChange={this.onHasSocialPurposeChange}/>
            <label>Oui</label>
          </div>
          <div className="input-radio">
            <input type="radio" id="hasSocialPurpose"
                   value="false"
                   checked={hasSocialPurpose === false}
                   onChange={this.onHasSocialPurposeChange}/>
            <label>Non</label>
          </div>
        </div>
      </div>
    ) 
  }

  onHasSocialPurposeChange = (event) => {
    let radioValue = event.target.value;
    switch(radioValue) {
      case "true": this.props.indicator.setHasSocialPurpose(true); break;
      case "false": this.props.indicator.setHasSocialPurpose(false); break;
    }
    this.props.onUpdate(this.props.indicator);
  }

}