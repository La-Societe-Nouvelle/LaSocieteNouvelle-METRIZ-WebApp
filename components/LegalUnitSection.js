import React from 'react';
import {indic as indicData} from '../lib/indic'

/* The base URL of the API */
const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class LegalUnitSection extends React.Component {

  constructor(props) {
    super(props);
    const legalUnit = this.props.session.getUniteLegale();
    this.state = {
      siren: legalUnit.siren!=null ? legalUnit.siren : "",
      corporateName: legalUnit.corporateName!=null ? legalUnit.corporateName : "",
      corporateHeadquarters: legalUnit.corporateHeadquarters!=null ? legalUnit.corporateHeadquarters : "",
      year: legalUnit.year!=null ? legalUnit.year : "",
    }
  }
  
  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      const legalUnit = this.props.session.getUniteLegale();
      this.setState({
        siren: legalUnit.siren!=null ? legalUnit.siren : "",
        corporateName: legalUnit.corporateName!=null ? legalUnit.corporateName : "",
        corporateHeadquarters: legalUnit.corporateHeadquarters!=null ? legalUnit.corporateHeadquarters : "",
        year: legalUnit.year!=null ? legalUnit.year : "",
       })
    }
    /*if (this.state.siren.length===9 & !isNaN(parseFloat(this.state.siren))) {
      this.getLegalUnitData(this.state.siren);
    }*/
  }

  render() {
    return (
      <div className="section-view">
        <h1>Informations générales</h1>
        {this.buildMain()}
      </div>
    )
  }

  buildMain() {

    const {siren,corporateName,corporateHeadquarters,year} = this.state;
    return (
      <div className="legal_unit_main_view">
        <h3>Informations légales</h3>
        <div className="inline-input short">
          <label>Numéro de siren </label>
          <input id="siren-input" type="text" value={siren} onChange={this.onSirenChange} onBlur={this.updateSession} onKeyPress={this.onEnterPress}/>
        </div><div className="inline-input">
          <label>Dénomination </label>
          <input id="siren-input" type="text" value={corporateName} disabled={true}/>
        </div><div className="inline-input">
          <label>Domiciliation du siège </label>
          <input id="siren-input" type="text" value={corporateHeadquarters} disabled={true}/>
        </div>
        <h3>Exercice comptable</h3>
        <div className="inline-input short">
          <label>Année de fin de l'exercice</label>
          <input id="year-input" type="text" value={year} onChange={this.onYearChange} onBlur={this.updateSession} onKeyPress={this.onEnterPress}/>
        </div><div className="coporate-social-footprint">
          <h3>Empreinte Sociétale de l'Entreprise</h3>
          {buildTableMain(this.props.session)}
        </div>
      </div>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  /* --- SIREN --- */
  onSirenChange = (event) => {
    this.setState({siren: event.target.value})
    if (event.target.value.length===9 & !isNaN(parseFloat(event.target.value))) {
      this.getLegalUnitData(event.target.value);
    } else {
      this.setState({corporateName: "", corporateHeadquarters: ""})
    }
  }
  // Fetch legal unit data
  getLegalUnitData = async (siren) => {
    try{
      const endpoint = `${apiBaseUrl}/siren/${siren}`;
      const response = await fetch(endpoint, {method:'get'});
      const data = await response.json();
      if (data.header.statut===200) {
        this.setState({
          corporateName: data.profil.descriptionUniteLegale.denomination, 
          corporateHeadquarters: data.profil.descriptionUniteLegale.communeSiege + " (" + data.profil.descriptionUniteLegale.codePostalSiege + ")" })
      } else {
        this.setState({corporateName: "", corporateHeadquarters: ""})
      }
      this.updateSession();
    } catch(error){
      throw error;
    }
  }

  /* --- EXERCICE --- */
  onYearChange = (event) => {
    this.setState({year: event.target.value})
  }

  updateSession = () => {
    let session = this.props.session;
    let legalUnit = session.getUniteLegale();
    legalUnit.setSiren(this.state.siren);
    legalUnit.corporateName = this.state.corporateName;
    legalUnit.corporateHeadquarters = this.state.corporateHeadquarters;
    legalUnit.setYear(this.state.year);
    session.legalUnit = legalUnit;
    this.props.onUpdate(session);
  }

}

function buildTableMain(session) {
  return (
    <table>
      <thead>
        <tr>
          <td>Code</td><td>Indicateur</td><td>Valeur</td><td>Incertitude</td>
        </tr>
      </thead>
      <tbody>
        {
          indics.map((indic) => {
            return(
              <tr key={indic}>
                <td className="column_">{indic.toUpperCase()}</td>
                <td>{indicData[indic].libelle}</td>
                <td><input value={session.getProductionFootprint().getIndicator(indic).printValue()} disabled={true}/></td>
                <td><input value={session.getProductionFootprint().getIndicator(indic).printUncertainty()} disabled={true}/></td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}