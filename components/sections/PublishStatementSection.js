// La Société Nouvelle

// Api
import { sendStatementToAdmin, sendStatementToDeclarant } from '/pages/api/mail-api'

// React
import React, { useState } from 'react';

// Sources
import { exportStatementPDF, getBinaryPDF } from '../../src/writers/StatementWriter';
import { printValue } from '../../src/utils/Utils';

// Utils
import { InputText } from '../input/InputText';

// Libraries
import metaIndics from '/lib/indics';
import { Table } from 'react-bootstrap';


/* ----------------------------------------------------------- */
/* -------------------- PUBLISH STATEMENT SECTION -------------------- */
/* ----------------------------------------------------------- */

export class PublishStatementSection extends React.Component {

    constructor(props) {
        super(props);
        const socialFootprint = {};
        Object.entries(props.session.financialData.aggregates.revenue.footprint.indicators).filter(([_, indicator]) => indicator.value != null)
            .forEach(([indic, indicator]) => socialFootprint[indic] = indicator);

        this.state =
        {
            socialFootprint: socialFootprint,
            // Legal entity data 
            siren: props.session.legalUnit.siren || "",
            denomination: props.session.legalUnit.corporateName || "",
            year: props.session.year || "",

            // Statements 
            revenueFootprint: props.session.financialData.aggregates.revenue.footprint,
            validations: props.session.validations,
            comments: props.session.impactsData.comments || {},

            // declarant 
            declarant: "",
            email: "",
            phone: "",
            autorisation: false,
            forThirdParty: false,
            declarantOrganisation: "",

            // tarif 
            price: "0",

            displayRecap : false,
            messageSend : false,
            error : ""
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0)
    }

    render() {

        const {
            revenueFootprint,
            validations,
            socialFootprint,
            siren,
            declarant,
            email,
            forThirdParty,
            declarantOrganisation,
            displayRecap,
            autorisation,
            error,
            messageSend,
        } = this.state;
      
        if(!displayRecap){
            return (
                <div className="container-fluid statement-section">
                    <section className="step">
                        <h3>Liste des indicateurs</h3>
                        <p>
                            Sélectionnez les indicateurs que vous souhaitez publier
                        </p>
                        <Table size='sm'>
                            <thead>
                                <tr>
                                    <td>Indicateur</td>
                                    <td className="column_value" colSpan="2">Valeur</td>
                                    <td className="column_uncertainty">Incertitude</td>
                                    <td>Publication</td>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(metaIndics).map(indic =>
                                    <tr key={indic}>
                                        <td className="auto">{metaIndics[indic].libelle + (metaIndics[indic].isBeta ? " [BETA]" : "")}</td>
                                        <td className="column_value">{printValue(revenueFootprint.indicators[indic].value, metaIndics[indic].nbDecimals)}</td>
                                        <td className="column_unit">&nbsp;{metaIndics[indic].unit}</td>
                                        <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(revenueFootprint.indicators[indic].uncertainty, 0)}&nbsp;%</td>
                                        <td><input type="checkbox"
                                            value={indic}
                                            defaultChecked={socialFootprint[indic] != undefined}
                                            disabled={validations.indexOf(indic) < 0}
                                            onChange={this.onCheckIndicator} /></td>
                                    </tr>)}
                            </tbody>
                        </Table>
                    </section>
                    <section className="step">
                        <h3>Informations</h3>
                        <div className="form-group">
                            <h4>Numéro de siren</h4>
                            <label>Entrez votre numéro de siren (9 chiffres) : </label>
                            <InputText value={siren}
                                unvalid={siren != "" && !/^[0-9]{9}$/.test(siren)}
                                onUpdate={this.onSirenChange}
                            />
                        </div>
                        <h4>Déclarant</h4>
                        <div className="form-group">
                            <label>Nom - Prénom </label>
                            <InputText value={declarant}
                                onUpdate={this.onDeclarantChange} />
                        </div>
                        <div className="form-group">
                            <label>Adresse e-mail </label>
                            <InputText value={email}
                                unvalid={email != "" && !/^(.*)@(.*)\.(.*)$/.test(email)}
                                onUpdate={this.onEmailChange} />
                        </div>
                        <div className="form-group">
                            <div className="custom-control-inline" id="thirdParty">
                                <input type="checkbox" className="custom-control-input"
                                    onChange={this.onThirdPartyChange} />
                                <label htmlFor="thirdParty">&nbsp;Déclaration effectuée pour un tiers.</label>
                            </div>
    
                        </div>
                        {forThirdParty &&
                            <div className="form-group">
                                <label>Structure déclarante</label>
                                <InputText value={declarantOrganisation}
                                    onUpdate={this.onDeclarantOrganisationChange} />
                            </div>}
                    
                    </section>
                    <section className="step">
                    <PriceInput {...this.state} />
                    </section>
                    <section className="step">
                        <h4>Publication</h4>    
    
                     <div className="form-group">
                            <div className="custom-control-inline" id="certification">
                                <input type="checkbox" className="custom-control-input"
                                    onChange={this.onAutorisationChange} />
                                <label htmlFor="certification">&nbsp;Je certifie être autorisé(e) à soumettre la déclaration ci-présente.</label>
                            </div>
                        </div>
                            <p className="text-end">
                            <button className="btn btn-secondary" disabled={autorisation ? false : true}  onClick={this.setDisplayRecap} > 
                                Publier mes résultats
                            </button>

                            </p>
                    </section>            
                 
                </div>
            )
        }
        else {
            return(
                <div className="container-fluid statement-section">
                         <Summary {...this.state} exportStatement={this.exportStatement} submitStatement={this.submitStatement} returnPublishForm={this.returnPublishForm} />
                    </div>
            )
        }

       
    }

    // Commits
    onSirenChange = (siren) => this.setState({ siren: siren });

    onDeclarantChange = (input) => this.setState({ declarant: input })
    onEmailChange = (input) => this.setState({ email: input })
    onAutorisationChange = () => this.setState({ autorisation: !this.state.autorisation })
    setDisplayRecap = () => this.setState({ displayRecap: true})
    returnPublishForm = () => this.setState({ displayRecap: false});
    onThirdPartyChange = () => this.setState({ forThirdParty: !this.state.forThirdParty })
    onDeclarantOrganisationChange = (input) => this.setState({ declarantOrganisation: input })

    commitSocialFootprint = (socialFootprint) => this.setState({ socialFootprint: socialFootprint })

    commitDeclarant = (declarant, email, autorisation) => this.setState({ declarant: declarant, email: email, autorisation: autorisation })

    commitPrice = (price) => this.setState({ price: price })

    exportStatement = () => exportStatementPDF(this.state);

    submitStatement = async (event) => {
        event.preventDefault();

        const statementFile = getBinaryPDF(this.state);

        const messageToAdmin = mailToAdminWriter(this.state);
        const resAdmin = await sendStatementToAdmin(messageToAdmin, statementFile);

        console.log(resAdmin);

        const messageToDeclarant = mailToDeclarantWriter(this.state);
        const resDeclarant = await sendStatementToDeclarant(this.state.email, messageToDeclarant, statementFile);

        if (resAdmin.status < 300) this.setState({ messageSend: true })
        else this.setState({ messageSend : false, error: "Erreur lors de l'envoi du message" })
    }

}


/* ----- Declarant form ----- */

class DeclarantForm extends React.Component {

    // form for contact details

    constructor(props) {
        super(props);
        this.state = {
            declarant: props.declarant,
            email: props.declarant,
            autorisation: props.autorisation,
            forThirdParty: props.forThirdParty,
            declarantOrganisation: props.declarantOrganisation
        }
    }

    render() {
        const { declarant, email, autorisation, forThirdParty, declarantOrganisation } = this.state;
        const isAllValid = declarant.length > 0
            && /^(.*)@(.*)\.(.*)$/.test(email)
            && autorisation
            && (!forThirdParty || declarantOrganisation.length > 0);

        return (
            <>

            </>
        )
    }



}

/* --- Price Input --- */

const PriceInput = ({ price }) => {
    const [priceInput, setPrice] = useState(price);
    const changePrice = (event) => setPrice(event.target.value);

    return (
        <>
            <h4>Coût de la formalité*</h4>
            <div className="radio-button-input">
                <div className={"custom-control-inline"}>
                    <input id="price" type="radio" value="0" checked={priceInput == "0"} onChange={changePrice} className="custom-control-input" />
                    <label>Première déclaration : publication offerte</label>
                </div>
                <div className={"custom-control-inline"} >
                    <input id="price" type="radio" value="10" checked={priceInput == "10"} onChange={changePrice} className="custom-control-input" />
                    <label>Organise à but non lucratif : 10 €</label>
                </div>
                <div className={"custom-control-inline"} >
                    <input id="price" type="radio" value="25" checked={priceInput == "25"} onChange={changePrice} className="custom-control-input" />
                    <label>Société unipersonnelle : 25 €</label>
                </div>
                <div className={"custom-control-inline"} >
                    <input id="price" type="radio" value="50" checked={priceInput == "50"} onChange={changePrice} className="custom-control-input" />
                    <label>Société : 50 €</label>
                </div>

            </div>
            <p className="legend">* Les revenus couvrent la réalisation des formalités, ainsi que les frais d'hébergement et de maintenance pour l'accessibilité des données.</p>

        </>)
}

/* ----- Summary ----- */
 
const Summary = (props) => {
    const { siren, denomination, year, declarant, price, socialFootprint, error, messageSend } = props;

    const isStatementValid = true;

    const today = new Date();
    const todayString = String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear();

    return (
        <section className="step">
        <h2>Récapitulatif</h2>
            <div className="summary">
                <p><b>Siren : </b>{siren}</p>
                <p><b>Dénomination : </b>{denomination}</p>
                <p><b>Année : </b>{year}</p>
                <p><b>Indicateurs : </b></p>
                {Object.entries(socialFootprint).filter(([_, indicator]) => indicator.value != null).map(([indic, _]) => <p key={indic}>&emsp;{metaIndics[indic].libelle}</p>)}
                {Object.entries(socialFootprint).filter(([_, indicator]) => indicator.value != null).length == 0 &&
                    <p>&emsp; - </p>}
                <p><b>Fait le : </b>{todayString}</p>
                <p><b>Déclarant : </b>{declarant}</p>
                <p><b>Coût de la formalité : </b>{price} €</p>
            </div>
            
            {
                messageSend && 
                <div className="alert alert-success">
                     <p>Demande de publication envoyée ! Merci.</p>
                </div>
            }
                  {
                error && 
                <div className="alert alert-error">
                     <p>Erreur lors de l'envoi de la publication. Si l'erreur persiste, contactez le support.</p>
                </div>
            }
            <div className="text-end">
            <button className={"btn btn-light"}  onClick={props.returnPublishForm}><i className="bi bi-chevron-left"></i> Retour</button>
                <button className={"btn btn-primary"} onClick={props.exportStatement}>Télécharger</button>
                <button className={"btn btn-secondary"} onClick={props.submitStatement}>Envoyer</button>
            </div>
        </section>)
}


/* ----- Builder message mails ----- */

const mailToAdminWriter = (statementData) =>
(
    "Unité légale : " + statementData.siren + "\n"
    + "Dénomination : " + statementData.denomination + "\n"
    + "Année : " + statementData.year + "\n"
    + "\n"
    + "Valeurs à publier :" + "\n"
    + "\n"
    + Object.entries(statementData.socialFootprint).map(([_, indicator]) => (indicator.indic + " : " + indicator.value + " +/- " + indicator.uncertainty + " % "))
        .reduce((a, b) => a + "\r\n" + b, "")
    + "\n"
    + "Déclarant :" + "\n"
    + "Nom : " + " - " + "\n"
    + "Mail : " + " - " + "\n"
    + "\n"
    + "Tarif :" + " - " + " €" + "\n"
)

const mailToDeclarantWriter = (statementData) =>
(
    ""
    + statementData.declarant + "," + "\n"
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