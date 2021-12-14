// La Société Nouvelle

// React
import React from 'react';

/* ---------------------------------------------------------------- */
/* -------------------- CORPORATE NAME SECTION -------------------- */
/* ---------------------------------------------------------------- */

export class CorporateNameSection extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {
      corporateName: props.session.legalUnit.corporateName || "",
    };
  }

  render ()
  {
    const {corporateName} = this.state;

    return (
      <div className="section-view"> 

        <div className="section-view-actions">
          <div className="sections-actions"></div>
          <div>
            <button id="validation-button" disabled={corporateName==""} onClick={this.submitCorporateName}>Valider</button>
          </div>
        </div>

        <div id="siren-form-container">
          <div className="siren-input input">
            <label>Dénomination sociale : </label>
            <input id="siren-input" type="text" 
                   value={corporateName} 
                   onChange={this.onCorporateNameChange} 
                   onKeyPress={this.onEnterPress}/>
          </div>
        </div>
        
      </div>)
  }

  onCorporateNameChange = (event) => this.setState({corporateName: event.target.value});
  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  submitCorporateName = () => 
  {
    this.props.session.legalUnit.corporateName = this.state.corporateName;
    this.props.submit();
  }

}