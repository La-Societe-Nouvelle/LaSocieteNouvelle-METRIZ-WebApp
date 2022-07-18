import React from "react";

import { InputNumber } from "../input/InputNumber";
import { printValue, printValueInput } from "../../src/utils/Utils";
import { Table } from "react-bootstrap";

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
    super(props);
    this.state = {
      // details
      knwDetails: props.impactsData.knwDetails,
    };
  }

  render() {
    const { netValueAdded } = this.props.impactsData;
    const { knwDetails } = this.state;
    const researchAndTrainingContribution = this.getSumCosts();

    return (
      <div className="assessment">
        <Table responsive>
          <thead>
            <tr>
              <td>Libellé</td>
              <td className="text-end">Valeur</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Taxe d'apprentissage</td>
              <td className="text-end">
                <InputNumber
                  value={printValueInput(knwDetails.apprenticeshipTax, 0)}
                  onUpdate={this.updateApprenticesShipTax.bind(this)}
                />
                &euro;
              </td>
            </tr>
            <tr>
              <td>Participation à la formation professionnelle continue</td>
              <td className="text-end">
                <InputNumber
                  value={printValueInput(knwDetails.vocationalTrainingTax, 0)}
                  onUpdate={this.updateVocationalTrainingTax.bind(this)}
                />
                &euro;
              </td>
            </tr>
            <tr>
              <td>
                Rémunérations liées à des contrats de formation (stage,
                alternance, etc.)
              </td>
              <td className="text-end">
                <InputNumber
                  value={printValueInput(
                    knwDetails.apprenticesRemunerations,
                    0
                  )}
                  onUpdate={this.updateApprenticesRemunerations.bind(this)}
                />
                &euro;
              </td>
            </tr>
            <tr>
              <td>Rémunérations liées à des heures de suivi d'une formation</td>
              <td className="text-end">
                <InputNumber
                  value={printValueInput(
                    knwDetails.employeesTrainingsCompensations,
                    0
                  )}
                  onUpdate={this.updateEmployeesTrainingsCompensations.bind(
                    this
                  )}
                />
                &euro;
              </td>
            </tr>
            <tr>
              <td>
                Rémunérations liées à des activités de recherche ou de formation
              </td>
              <td className="text-end">
                <InputNumber
                  value={printValueInput(
                    knwDetails.researchPersonnelRemunerations,
                    0
                  )}
                  onUpdate={this.updateResearchPersonnelRemunerations.bind(
                    this
                  )}
                />
                &euro;
              </td>
            </tr>
            <tr className="with-top-line">
              <td>Total</td>
              <td className="column_value">
                {printValue(researchAndTrainingContribution, 0)} &euro;
              </td>
            </tr>
            <tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_value">
                {printValue(netValueAdded, 0)} &euro;
              </td>
            </tr>
            <tr className="with-top-line with-bottom-line">
              <td>Contribution directe liée à la valeur ajoutée</td>
              <td className="column_value">
                {printValue(
                  this.getIndicatorValue(
                    netValueAdded,
                    researchAndTrainingContribution
                  ),
                  1
                )}
                %
              </td>
            </tr>
          </tbody>
        </Table>
        <div className="text-end">
        <button className="btn btn-sm" 
                  onClick = {() => this.props.onGoBack()}><i class="bi bi-chevron-left"></i> Retour</button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => this.onSubmit()}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  updateApprenticesShipTax = (nextValue) =>
    this.setState({
      knwDetails: { ...this.state.knwDetails, apprenticeshipTax: nextValue },
    });
  updateVocationalTrainingTax = (nextValue) =>
    this.setState({
      knwDetails: {
        ...this.state.knwDetails,
        vocationalTrainingTax: nextValue,
      },
    });
  updateApprenticesRemunerations = (nextValue) =>
    this.setState({
      knwDetails: {
        ...this.state.knwDetails,
        apprenticesRemunerations: nextValue,
      },
    });
  updateEmployeesTrainingsCompensations = (nextValue) =>
    this.setState({
      knwDetails: {
        ...this.state.knwDetails,
        employeesTrainingsCompensations: nextValue,
      },
    });
  updateResearchPersonnelRemunerations = (nextValue) =>
    this.setState({
      knwDetails: {
        ...this.state.knwDetails,
        researchPersonnelRemunerations: nextValue,
      },
    });

  updateResearchAndTrainingContribution = async (nextProps) => {
    let impactsData = this.props.impactsData;
    // update knw details
    impactsData.knwDetails = { ...impactsData.knwDetails, ...nextProps };
    // update result
    impactsData.researchAndTrainingContribution = this.getSumCosts();
    await this.props.onUpdate("knw");
    this.forceUpdate();
  };

  onSubmit = async () => {
    let impactsData = this.props.impactsData;

    // update knw data
    impactsData.knwDetails = this.state.knwDetails;
    impactsData.researchAndTrainingContribution = this.getSumCosts();

    await this.props.onUpdate("knw");
    await this.props.onGoBack();
  };

  getSumCosts() {
    let {
      apprenticeshipTax,
      vocationalTrainingTax,
      apprenticesRemunerations,
      employeesTrainingsCompensations,
      researchPersonnelRemunerations,
    } = this.state.knwDetails;
    return (
      (apprenticeshipTax || 0) +
      (vocationalTrainingTax || 0) +
      (apprenticesRemunerations || 0) +
      (employeesTrainingsCompensations || 0) +
      (researchPersonnelRemunerations || 0)
    );
  }

  getIndicatorValue = (netValueAdded, researchAndTrainingContribution) => {
    if (netValueAdded != null && researchAndTrainingContribution != null) {
      return (researchAndTrainingContribution / netValueAdded) * 100;
    } else {
      return null;
    }
  };
}
