import React from 'react';
import { valueOrDefault } from '../../src/utils/Utils';
export class StatementKNW extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      researchAndTrainingContribution : valueOrDefault(props.impactsData.researchAndTrainingContribution, ""),
    }
  }

  render() {
    const {researchAndTrainingContribution} = this.state;
    return (
      <div className="statement">
        <div className="statement-item">
          <label>Valeur ajoutée nette dédiée à la recherche ou à la formation</label>
          <input className="input-value"
                 value={researchAndTrainingContribution} 
                 onChange={this.onContributionChange}
                 onBlur={this.onContributionBlur}
                 onKeyPress={this.onEnterPress}/>
          <span>&nbsp;€</span>
        </div>
      </div>
    ) 
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onContributionChange = (event) => {
    this.setState({researchAndTrainingContribution: event.target.value});
  }
  onContributionBlur = (event) => {
    let contribution = parseFloat(event.target.value);
    this.props.impactsData.researchAndTrainingContribution = !isNaN(contribution) ? contribution : null;
    this.props.onUpdate(this.props.impactsData);
  }

}