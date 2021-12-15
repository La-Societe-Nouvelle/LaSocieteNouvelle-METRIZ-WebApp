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
import metaIndics from '/lib/indics';

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
      year: props.session.year || "",

      // Statements (step 4)
      revenueFootprint: props.session.financialData.aggregates.revenue.footprint,
      validations: props.session.validations,
      comments: props.session.impactsData.comments || {},
      socialFootprint: {},

      // declarant data (step 5)
      declarant: "",
      email: "",
      phone: "",
      autorisation: false,
      forThirdParty: false,
      declarantOrganisation: "",

      // tarif (step 6)
      price: "0"
    }
  }

  render() 
  {
    const {step} = this.state;    

    return (
      <div className="section-view">
        <div className="statement-section-view">
          {this.buildView(step)}
        </div>
      </div>
    )
  }

  buildView = (step) =>
  {
    switch(step)
    {
      case 0: return <ErrorMessage />
      case 1: return <IndicatorSelection revenueFootprint={this.state.revenueFootprint} validations={this.state.validations} onCommit={this.commitSocialFootprint}/>
      case 2: return <SirenInput siren={this.state.siren} commitSiren={this.commitSiren}/>
      case 3: return <DeclarantForm {...this.state} onCommit={this.commitDeclarant} goBack={this.goBack}/>
      case 4: return <PriceInput {...this.state} commitPrice={this.commitPrice} goBack={this.goBack}/>
      case 5: return <Summary {...this.state} exportStatement={this.exportStatement} submitStatement={this.submitStatement} goBack={this.goBack}/>
      case 6: return <StatementSendingMessage />
      case 7: return <StatementSendMessage />
    }
  }

  commit = () => this.setState({step: this.state.step+1})
  goBack = () => this.setState({step: this.state.step-1})

  // Commits

  commitSiren = (siren) => this.setState({siren: siren, step: 3})

  commitSocialFootprint = (socialFootprint) => this.setState({socialFootprint: socialFootprint, step: 2})

  commitDeclarant = (declarant,email,autorisation) => this.setState({declarant: declarant, email: email, autorisation: autorisation, step: 4})

  commitPrice = (price) => this.setState({price: price, step: 5})

  exportStatement = () => exportStatementPDF(this.state);

  submitStatement = async (event) => 
  {
    event.preventDefault();
    this.setState({step: 6})
    
    const statementFile = getBinaryPDF(this.state);

    const messageToAdmin = mailToAdminWriter(this.state);
    const resAdmin = await sendStatementToAdmin(messageToAdmin,statementFile);

    const messageToDeclarant = mailToDeclarantWriter(this.state);
    const resDeclarant = await sendStatementToDeclarant(this.state.email,messageToDeclarant,statementFile);

    if (resAdmin.status<300) this.setState({step: 7})
    else this.setState({step: 0})
  }

}

/* ----- Siren Form ---- */

const SirenInput = ({siren,commitSiren}) => 
{
  const [sirenInput, setSiren] = useState(siren);
  const onSirenChange = (input) => setSiren(input);
  const onCommit = () => commitSiren(sirenInput)

  const isAllValid = /^[0-9]{9}$/.test(sirenInput);

  return(
    <div className="section-view-main">
      <h3>Numéro de siren</h3>
      <div className="inline-input short">
        <label>Numéro de siren (9 chiffres) : </label>
        <InputText value={sirenInput} 
                   unvalid={sirenInput!="" && !/^[0-9]{9}$/.test(sirenInput)}
                   onUpdate={onSirenChange}/>
      </div>
      <div className="actions">
        <div></div>
        <button disabled={!isAllValid} onClick={onCommit}>Valider</button>
      </div>
    </div> 
  )
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
        <h3>Sélection des indicateurs</h3>
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
            {Object.keys(metaIndics).map(indic =>  
              <tr key={indic}>
                <td className="auto">{metaIndics[indic].libelle+(metaIndics[indic].isBeta ? " [BETA]" : "")}</td>
                <td className="column_value">{printValue(revenueFootprint.indicators[indic].value,metaIndics[indic].nbDecimals)}</td>
                <td className="column_unit">&nbsp;{metaIndics[indic].unit}</td>
                <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(revenueFootprint.indicators[indic].uncertainty,0)}&nbsp;%</td>
                <td><input type="checkbox" 
                            value={indic}
                            checked={socialFootprint[indic]!=undefined}
                            disabled={validations.indexOf(indic) < 0}
                            onChange={this.onCheckIndicator}/></td>
              </tr>)}
          </tbody>
        </table>
        <div className="actions">
        <button onClick={this.props.goBack}>Retour</button>
          <button disabled={Object.keys(socialFootprint).length == 0} onClick={this.onCommit}>Valider ({Object.keys(socialFootprint).length}/12)</button>
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

/* ----- Siren form ----- */

class SirenForm extends React.Component {

  // form for siren number

  constructor(props)
  {
    super(props);
    this.state = {
      siren: props.siren
    }
  }

  render()
  {
    const {siren} = this.state;
    const isAllValid = /^[0-9]{9}/.test(siren);
    
    return(
      <div className="section-view-main">
        <h3>Unité légale</h3>
        <div className="inline-input">
          <label>Numéro de siren </label>
          <InputText value={siren} 
                      onUpdate={this.onSirenChange}/>
        </div>
        <div className="actions">
          <button onClick={this.onGoBack}>Retour</button>
          <button disabled={!isAllValid} onClick={this.onCommit}>Valider</button>
        </div>
      </div>
    )
  }

  onSirenChange = (input) => { this.setState({siren: input})}
  onCommit = () => this.props.onCommit(this.state.siren);
  onGoBack = () => this.props.goBack();

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
      autorisation: props.autorisation,
      forThirdParty: props.forThirdParty,
      declarantOrganisation: props.declarantOrganisation
    }
  }

  render()
  {
    const {declarant,email,autorisation,forThirdParty,declarantOrganisation} = this.state;
    const isAllValid = declarant.length > 0 
                    && /^(.*)@(.*)\.(.*)$/.test(email) 
                    && autorisation
                    && (forThirdParty || declarantOrganisation.length > 0);
    
    return(
      <div className="section-view-main">
        <h3>Déclarant</h3>
        <div className="inline-input">
          <label>Nom - Prénom </label>
          <InputText value={declarant} 
                      onUpdate={this.onDeclarantChange.bind(this)}/>
        </div>
        <div className="inline-input">
          <label>Adresse e-mail </label>
          <InputText value={email} 
                     unvalid={email!="" && !/^(.*)@(.*)\.(.*)$/.test(email)}
                     onUpdate={this.onEmailChange.bind(this)}/>
        </div>
        <div className="input" id="thirdParty">
          <input type="checkbox" 
                 onChange={this.onThirdPartyChange}/>
          <label htmlFor="thirdParty">&nbsp;Déclaration effectuée pour un tiers.</label>
        </div>
      {forThirdParty &&
        <div className="inline-input">
          <label>Structure déclarante</label>
          <InputText value={declarantOrganisation}
                     onUpdate={this.onDeclarantOrganisationChange.bind(this)}/>
        </div>}
        <div className="input" id="certification">
          <input type="checkbox" 
                 onChange={this.onAutorisationChange}/>
            <label htmlFor="certification">&nbsp;Je certifie être autorisé(e) à soumettre la déclaration ci-présente.</label>
        </div>
        <div className="actions">
          <button onClick={this.onGoBack}>Retour</button>
          <button disabled={!isAllValid} onClick={this.onCommit}>Valider</button>
        </div>
      </div>
    )
  }

  onDeclarantChange = (input) => this.setState({declarant: input})
  onEmailChange = (input) => this.setState({email: input})
  onAutorisationChange = () => this.setState({autorisation: !this.state.autorisation})
  onThirdPartyChange = () => this.setState({forThirdParty: !this.state.forThirdParty})
  onDeclarantOrganisationChange = (input) => this.setState({declarantOrganisation: input})
  onCommit = () => this.props.onCommit(this.state.declarant,this.state.email,this.state.autorisation,this.state.forThirdParty,this.state.declarantOrganisation);
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
      <h3>Coût de la formalité</h3>
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
      <h3>Récapitulatif</h3>
      <div className="summary">
        <p><b>Siren : </b>{siren}</p>
        <p><b>Dénomination : </b>{denomination}</p>
        <p><b>Année : </b>{year}</p>
        <p><b>Indicateurs : </b></p>
        {Object.entries(socialFootprint).filter(([_,indicator]) => indicator.value!=null).map(([indic,_]) => <p key={indic}>&emsp;{metaIndics[indic].libelle}</p>)}
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
    "Unité légale : "+statementData.siren + "\n"
  + "Dénomination : "+statementData.denomination + "\n"
  + "Année : "+statementData.year + "\n"
  + "\n"
  + "Valeurs à publier :" + "\n"
  + "\n"
  + Object.entries(statementData.socialFootprint).map(([_,indicator]) => (indicator.indic+" : "+indicator.value+" +/- "+indicator.uncertainty+" % "))
                                                 .reduce((a,b) => a+"\r\n"+b,"")
  + "\n"
  + "Déclarant :" + "\n"
  + "Nom : "+" - " + "\n"
  + "Mail : "+" - " + "\n"
  + "\n"
  + "Tarif :" +" - " +" €" + "\n"
)

const mailToDeclarantWriter = (statementData) => 
(
    ""
  + statementData.declarant+"," + "\n"
  + "\n"
  + "Votre demande de publication a bien été prise en compte. Vous trouverez ci-joint votre déclaration." + "\n"
  + "Le délai de traitement est de 7 jours." + "\n"
  + "\n"
  + "Pour modifier ou supprimer les données publiées, contactez-nous directement via l'adresse mail admin@lasocietenouvelle.org" + "\n"
  + "\n"
  + "Bien à vous," + "\n"
  + "\n"
  + "La Société Nouvelle."
)