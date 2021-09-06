import React from 'react';

import { InputNumber } from '../InputNumber';
import { printValue, printValueInput } from '../../src/utils/Utils';

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT KNW -------------------- */
/* -------------------------------------------------------- */

/* Liste des postes de charges:
    - Taxe d'appentissage
    - Participation à la formation professionnelle continue
    - Contrats de formation
    - Heures de formation
    - Heures de recherche
*/

export class AssessmentKNW extends React.Component {

  constructor(props) {
    super(props)
    this.state =
    {
      // details
      knwDetails: props.session.impactsData.knwDetails
    }
  }

  render() 
  {
    const {netValueAdded} = this.props.session.impactsData;
    const {knwDetails} = this.state;
    const researchAndTrainingContribution = this.getSumCosts();

    return (
      <div className="indicator-section-view">
        <div className="view-header">
          <button className="retour"onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className="retour"onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        <div className="group assessment"><h3>Outil de mesure</h3>

          <table>
            <thead>
              <tr><td>Libellé</td><td colSpan="2">Valeur</td>
              </tr>
            </thead>
            <tbody>

              <tr>
                <td>Taxe d'apprentissage</td>
                <td className="short right"><InputNumber value={printValueInput(knwDetails.apprenticeshipTax,0)} onUpdate={this.updateApprenticesShipTax.bind(this)}/></td>
                <td className="column_unit"><span>&nbsp;€</span></td></tr>
              <tr>
                <td>Participation à la formation professionnelle continue</td>
                <td className="short right"><InputNumber value={printValueInput(knwDetails.vocationalTrainingTax,0)} onUpdate={this.updateVocationalTrainingTax.bind(this)}/></td>
                <td className="column_unit"><span>&nbsp;€</span></td></tr>
              <tr>
                <td>Rémunérations liées à des contrats de formation (stage, alternance, etc.)</td>
                <td className="short right"><InputNumber value={printValueInput(knwDetails.apprenticesRemunerations,0)} onUpdate={this.updateApprenticesRemunerations.bind(this)}/></td>
                <td className="column_unit"><span>&nbsp;€</span></td></tr>
              <tr>
                <td>Rémunérations liées à des heures de suivi d'une formation</td>
                <td className="short right"><InputNumber value={printValueInput(knwDetails.employeesTrainingsCompensations,0)} onUpdate={this.updateEmployeesTrainingsCompensations.bind(this)}/></td>
                <td className="column_unit"><span>&nbsp;€</span></td></tr>
              <tr>
                <td>Rémunérations liées à des activités de recherche ou de formation</td>
                <td className="short right"><InputNumber value={printValueInput(knwDetails.researchPersonnelRemunerations,0)} onUpdate={this.updateResearchPersonnelRemunerations.bind(this)}/></td>
                <td className="column_unit"><span>&nbsp;€</span></td></tr>
              <tr className="with-top-line">
                <td>Total</td>
                <td className="column_value">{printValue(researchAndTrainingContribution,0)}</td>
                <td className="column_unit">&nbsp;€</td></tr>
              <tr>
                <td>Valeur ajoutée nette</td>
                <td className="column_value">{printValue(netValueAdded,0)}</td>
                <td className="column_unit">&nbsp;€</td></tr>
              <tr className="with-top-line with-bottom-line">
                <td>Contribution directe liée à la valeur ajoutée</td>
                <td className="column_value">{printValue(this.getIndicatorValue(netValueAdded,researchAndTrainingContribution),1)}</td>
                <td className="column_unit">&nbsp;%</td></tr>
            
            </tbody>
          </table>
        </div>
      </div>
    ) 
  }

  updateApprenticesShipTax = (nextValue) => this.setState({knwDetails: {...this.state.knwDetails, apprenticeshipTax: nextValue}});
  updateVocationalTrainingTax = (nextValue) => this.setState({knwDetails: {...this.state.knwDetails, vocationalTrainingTax: nextValue}});
  updateApprenticesRemunerations = (nextValue) => this.setState({knwDetails: {...this.state.knwDetails, apprenticesRemunerations: nextValue}});
  updateEmployeesTrainingsCompensations = (nextValue) => this.setState({knwDetails: {...this.state.knwDetails, employeesTrainingsCompensations: nextValue}});
  updateResearchPersonnelRemunerations = (nextValue) => this.setState({knwDetails: {...this.state.knwDetails, researchPersonnelRemunerations: nextValue}});

  updateResearchAndTrainingContribution = async (nextProps) => 
  {
    let impactsData = this.props.session.impactsData;
    // update knw details
    impactsData.knwDetails = {...impactsData.knwDetails,...nextProps};
    // update result
    impactsData.researchAndTrainingContribution = this.getSumCosts();
    await this.props.session.updateRevenueIndicFootprint("knw");
    this.forceUpdate();
  }

  onSubmit = async () =>
  {
    let impactsData = this.props.session.impactsData;

    // update knw data
    impactsData.knwDetails = this.state.knwDetails;
    impactsData.researchAndTrainingContribution = this.getSumCosts();
    
    await this.props.session.updateRevenueIndicFootprint("knw");
  }

  getSumCosts() 
  {
    let {apprenticeshipTax,vocationalTrainingTax,apprenticesRemunerations,employeesTrainingsCompensations,researchPersonnelRemunerations} = this.state.knwDetails;
    return( (apprenticeshipTax || 0)
          + (vocationalTrainingTax || 0)
          + (apprenticesRemunerations || 0)
          + (employeesTrainingsCompensations || 0)
          + (researchPersonnelRemunerations || 0));
  }

  getIndicatorValue = (netValueAdded,researchAndTrainingContribution) => 
  {
    if (netValueAdded!=null && researchAndTrainingContribution!=null) {return researchAndTrainingContribution/netValueAdded *100}
    else {return null} 
  }

}