// La Société Nouvelle

// Api
import { sendStatementToAdmin, sendStatementToDeclarant } from '/pages/api/mail-api'

// React
import React, { useState }  from 'react';

// Sources
import { exportStatementPDF, getBinaryPDF } from '../../src/writers/StatementWriter';
import { printValue } from '../../src/utils/Utils';

// Utils
import { InputText } from '../InputText';

// Libraries
import { metaIndicators } from '/lib/indic';

/* ----------------------------------------------------------- */
/* -------------------- STATEMENT SECTION -------------------- */
/* ----------------------------------------------------------- */

export class StatementSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state =
    {
      // Progression
      step: 1,

      // Legal entity data (steps 1 to 3)
      siren: props.session.legalUnit.siren || "",
      denomination: props.session.legalUnit.corporateName || "",
      year: props.session.legalUnit.year || "",

      // Statements (step 4)
      revenueFootprint: props.session.revenueFootprint,
      validations: props.session.validations,
      socialFootprint: {},

      // declarant data (step 5)
      declarant: "",
      email: "",
      phone: "",
      autorisation: false,

      // tarif (step 6)
      price: ""
    }
  }

  render() 
  {
    const {step} = this.state;    

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Publication des données</h1>
        </div>
        {this.buildView(step)}
      </div>
    )
  }

  buildView = (step) =>
  {
    switch(step)
    {
      case 0: return <ErrorMessage />
      case 1: return <IndicatorSelection revenueFootprint={this.state.revenueFootprint} validations={this.state.validations} onCommit={this.commitSocialFootprint}/>
      case 2: return <DeclarantForm {...this.state} onCommit={this.commitDeclarant} goBack={this.goBack}/>
      case 3: return <PriceInput {...this.state} commitPrice={this.commitPrice} goBack={this.goBack}/>
      case 4: return <Summary {...this.state} exportStatement={this.exportStatement} submitStatement={this.submitStatement} goBack={this.goBack}/>
      case 5: return <StatementSendingMessage />
      case 6: return <StatementSendMessage />
    }
  }

  commit = () => this.setState({step: this.state.step+1})
  goBack = () => this.setState({step: this.state.step-1})

  // Commits

  commitSocialFootprint = (socialFootprint) => this.setState({socialFootprint: socialFootprint, step: 2})

  commitDeclarant = (declarant,email,autorisation) => this.setState({declarant: declarant, email: email, autorisation: autorisation, step: 3})

  commitPrice = (price) => this.setState({price: price, step: 4})

  exportStatement = () => exportStatementPDF(this.state);

  submitStatement = async (event) => 
  {
    event.preventDefault();
    this.setState({step: 5})
    
    const statementFile = getBinaryPDF(this.state);

    const messageToAdmin = mailToAdminWriter(this.state);
    const resAdmin = await sendStatementToAdmin(messageToAdmin,statementFile);

    const messageToDeclarant = mailToDeclarantWriter(this.state);
    const resDeclarant = await sendStatementToDeclarant(this.state.email,messageToDeclarant,statementFile);

    if (resAdmin.status<300) this.setState({step: 6})
    else this.setState({step: 0})
  }

}

/* ----- Indicator selection ----- */

class IndicatorSelection extends React.Component
{
  constructor(props)
  {
    super(props);
    const socialFootprint = {};
    Object.entries(props.revenueFootprint.indicators).filter(([_,indicator]) => indicator.value!=null)
                                                     .forEach(([indic,indicator]) => socialFootprint[indic] = indicator);
    this.state = {
      socialFootprint: socialFootprint
    } 
  }

  //didUpdate... when indicator not valid anymore

  render()
  {
    const {revenueFootprint,validations} = this.props;
    const {socialFootprint} = this.state;

    return(
      <div className="section-view-main">
        <div className="group"><h3>Sélection des indicateurs</h3>
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
                <tr key={indic}>
                  <td className="auto">{metaIndicators[indic].libelle}</td>
                  <td className="column_value">{printValue(revenueFootprint.indicators[indic].value,metaIndicators[indic].nbDecimals)}</td>
                  <td className="column_unit">&nbsp;{metaIndicators[indic].unit}</td>
                  <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(revenueFootprint.indicators[indic].uncertainty,0)}&nbsp;%</td>
                  <td><input type="checkbox" 
                             value={indic}
                             checked={socialFootprint[indic]!=undefined}
                             disabled={validations.indexOf(indic) < 0}
                             onChange={this.onCheckIndicator}/></td>
                </tr>)}
            </tbody>
          </table>
          <div className="actions left">
            <button disabled={Object.keys(socialFootprint).length == 0} onClick={this.onCommit}>Valider ({Object.keys(socialFootprint).length}/12)</button>
          </div>
        </div>
      </div>)
  }

  onCheckIndicator = (event) => 
  {
    let footprint = this.state.socialFootprint;
    event.target.checked ? footprint[event.target.value] = this.props.revenueFootprint.indicators[event.target.value] : delete footprint[event.target.value];
    this.setState({socialFootprint: footprint});
  }

  onCommit = (event) => this.props.onCommit(this.state.socialFootprint);
  
}

/* ----- Declarant form ----- */

class DeclarantForm extends React.Component {

  // form for contact details

  constructor(props)
  {
    super(props);
    this.state = {
      declarant: props.declarant,
      email: props.declarant,
      autorisation: props.autorisation
    }
  }

  render()
  {
    const {declarant,email,autorisation} = this.state;
    const isAllValid = declarant.length > 0 && email.length > 0 && autorisation;
    
    return(
      <div className="section-view-main">
        <div className="group"><h3>Déclarant</h3>
          <div className="inline-input short">
            <label>Nom - Prénom </label>
            <InputText value={declarant} 
                        onUpdate={this.onDeclarantChange.bind(this)}/>
          </div>
          <div className="inline-input">
            <label>Adresse e-mail </label>
            <InputText value={email} 
                       onUpdate={this.onEmailChange.bind(this)}/>
          </div>
          <div className="input" id="certification">
            <input type="checkbox" onChange={this.onCheckboxChange}/><label htmlFor="certification">Je certifie être autorisé(e) à soumettre la déclaration ci-présente.</label>
          </div>
          <div className="actions">
            <button onClick={this.onGoBack}>Retour</button>
            <button disabled={!isAllValid} onClick={this.onCommit}>Valider</button>
          </div>
        </div>
      </div>
    )
  }

  onDeclarantChange = (input) => { this.setState({declarant: input})}
  onEmailChange = (input) => { this.setState({email: input}) }
  onCheckboxChange = () => { this.setState({autorisation: !this.state.autorisation})}
  onCommit = () => this.props.onCommit(this.state.declarant,this.state.email,this.state.autorisation);
  onGoBack = () => this.props.goBack();

}

/* --- Price Input --- */

const PriceInput = ({price,commitPrice,goBack}) => 
{
  const [priceInput, setPrice] = useState(price);
  const changePrice = (event) => setPrice(event.target.value);
  const onCommit = () => commitPrice(priceInput);

  return(
    <div className="section-view-main">
      <div className="group"><h3>Coût de la formalité</h3>
        <div className="radio-button-input">
          <div className="input">
            <input id="price" type="radio" value="0" checked={priceInput=="0"} onChange={changePrice}/>
            <label>Première déclaration : publication offerte</label>
          </div>
          <div className="input">
            <input id="price" type="radio" value="25" checked={priceInput=="25"} onChange={changePrice}/>
            <label>Société unipersonnelle : 25 €</label>
          </div>
          <div className="input">
            <input id="price" type="radio" value="50" checked={priceInput=="50"} onChange={changePrice}/>
            <label>Société : 50 €</label>
          </div>
          <div className="input">
            <input id="price" type="radio" value="10" checked={priceInput=="10"} onChange={changePrice}/>
            <label>Organise à but non lucratif : 10 €</label>
          </div>
        </div>
        <div>
          <p>Les revenus couvrent la réalisation des formalités, ainsi que les frais d'hébergement et de maintenance pour l'accessibilité des données.</p>
        </div>
        <div className="actions">
          <button onClick={goBack}>Retour</button>
          <button disabled={priceInput==""} onClick={onCommit}>Valider</button>
        </div>
      </div>
    </div>)
}

/* ----- Summary ----- */

const Summary = (props) =>
{
  const {siren,denomination,year,declarant,price,socialFootprint} = props;

  const isStatementValid = true;

  const today = new Date();
  const todayString = String(today.getDate()).padStart(2,'0')+"/"+String(today.getMonth()+1).padStart(2,'0')+"/"+today.getFullYear();

  return(
    <div className="section-view-main">
      <div className="group"><h3>Récapitulatif</h3>
        <div className="summary">
          <p><b>Siren : </b>{siren}</p>
          <p><b>Dénomination : </b>{denomination}</p>
          <p><b>Année : </b>{year}</p>
          <p><b>Indicateurs : </b></p>
          {Object.entries(socialFootprint).filter(([_,indicator]) => indicator.value!=null).map(([indic,_]) => <p key={indic}>&emsp;{metaIndicators[indic].libelle}</p>)}
          {Object.entries(socialFootprint).filter(([_,indicator]) => indicator.value!=null).length == 0 &&
            <p>&emsp; - </p>}
          <p><b>Fait le : </b>{todayString}</p>
          <p><b>Déclarant : </b>{declarant}</p>
          <p><b>Coût de la formalité : </b>{price} €</p>
        </div> 
        <div className="actions">
          <button onClick={props.goBack}>Retour</button>
          <button onClick={props.exportStatement}>Télécharger</button>
          <button onClick={props.submitStatement}>Envoyer</button>
        </div> 
      </div>
    </div>)
}

/* --- End message --- */

const StatementSendingMessage = () => 
{
  return(
    <div className="strip">
      <h2>Déclaration validée</h2>
      <div className="form_inner">
        <p>Envoi en cours...</p>
      </div>
    </div>
  )
}

const StatementSendMessage = () => 
{
  return(
    <div className="strip">
      <h2>Déclaration validée</h2>
      <div className="form_inner">
        <p>Demande de publication envoyée ! Merci.</p>
      </div>
    </div>
  )
}

const ErrorMessage = () => 
{
  return(
    <div className="strip">
      <div className="form_inner">
        <p>Error</p>
      </div>
    </div>
  )
}

/* ----- Builder message mails ----- */

const mailToAdminWriter = (statementData) => 
(
    "Unité légale : "+statementData.siren + "\r"
  + "Dénomination : "+statementData.denomination + "\r"
  + "Année : "+statementData.year + "\r"
  + "\r"
  + "Valeurs à publier :" + "\r"
  + "\r"
  + Object.entries(statementData.socialFootprint).map(([_,indicator]) => (indicator.indic+" : "+indicator.value+" +/- "+indicator.uncertainty+" % "+"\r"))
  + "\r"
  + "Déclarant :" + "\r"
  + "Nom : "+" - " + "\r"
  + "Mail : "+" - " + "\r"
  + "\r"
  + "Tarif :" +" - " +" €" + "\r"
)

const mailToDeclarantWriter = (statementData) => 
(
    ""
  + statementData.declarant+"," + "\r"
  + "\r"
  + "Votre demande de publication a bien été prise en compte. Vous trouverez ci-joint votre déclaration." + "\r"
  + "Le délai de traitement est de 7 jours." + "\r"
  + "\r"
  + "Pour modifier ou supprimer les données publiées, contactez-nous directement via l'adresse mail admin@lasocietenouvelle.org" + "\r"
  + "\r"
  + "Bien à vous," + "\r"
  + "\r"
  + "La Société Nouvelle." + "\r"
)