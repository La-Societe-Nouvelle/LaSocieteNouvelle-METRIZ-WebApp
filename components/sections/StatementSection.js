// La Société Nouvelle

// React
import React from 'react';
import { exportStatementPDF, getBinaryPDF } from '../../src/writers/StatementWriter';

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
      
    }
  }

  render() 
  {
    const {legalUnit,revenueFootprint} = this.props.session;
    const {} = this.state;

    const isStatementValid = true;

    const today = new Date();
    const todayString = String(today.getDate()).padStart(2,'0')+"/"+String(today.getMonth()+1).padStart(2,'0')+"/"+today.getFullYear();
    
    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Récapitulatif</h1>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Récapitulatif</h3>
            <div className="summary">
              <p><b>Siren : </b>{legalUnit.siren}</p>
              <p><b>Dénomination : </b>{legalUnit.corporateName}</p>
              <p><b>Année : </b>{legalUnit.year}</p>
              <p><b>Indicateurs : </b></p>
              {Object.entries(revenueFootprint.indicators).filter(([_,indicator]) => indicator.value!=null).map(([indic,_]) => <p key={indic}>&emsp;{metaIndicators[indic].libelle}</p>)}
              {Object.entries(revenueFootprint.indicators).filter(([_,indicator]) => indicator.value!=null).length == 0 &&
                <p>&emsp; - </p>}
              <p><b>Fait le : </b>{todayString}</p>
              <p><b>Déclarant : </b> - </p>
              <p><b>Coût de la formalité : </b>- €</p>
            </div>
            <div className="form_footer">
              <div className="actions">
                <button onClick={this.exportStatement}>Télécharger</button>
                <button onClick={this.submitStatement}>Envoyer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  exportStatement = () => exportStatementPDF({...this.props.session.legalUnit, socialfootprint: this.props.session.revenueFootprint});

  submitStatement = async (event) => 
  {
    event.preventDefault();
    
    const statementFile = getBinaryPDF(this.props.session.legalUnit,this.props.session.revenueFootprint);

    const messageToAdmin = mailToAdminWriter(this.props.session);
    const resAdmin = await sendStatementToAdmin(messageToAdmin,statementFile);

    const messageToDeclarant = mailToDeclarantWriter(this.props.session);
    const resDeclarant = await sendStatementToDeclarant(this.state.email,messageToDeclarant,statementFile);

    if (resAdmin.status<300) this.setState({step: 9})
    else this.setState({step: 0})
  }

}

/* ----- Builder message mails ----- */

const mailToAdminWriter = (session) => 
(
    "Unité légale : "+session.legalUnit.siren + "\r"
  + "Dénomination : "+session.legalUnit.corporateName + "\r"
  + "Année : "+session.legalUnit.year + "\r"
  + "\r"
  + "Valeurs à publier :" + "\r"
  + "\r"
  + session.revenueFootprint.indicators.map((indicator) => 
    (indicator.indic+" : "+indicator.value+" +/- "+indicator.uncertainty+" % "+"\r"))
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