import React from 'react';

export class AssessmentSOC extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: props.session.getValueAddedFootprint("soc"),
    }
  }

  render() {
    const indicator = this.state.indicator;
    return (
      <table>
        <thead>
          <tr><td>Libelle</td><td>Valeur</td></tr>
        </thead>
        <tbody>
          <tr className="with-bottom-line">
            <td>Raison d'être - Intérêt social (oui/non)</td>
            <td><input type="checkbox"
                        checked={indicator.getHasSocialPurpose()!=null ? indicator.getHasSocialPurpose() : false} 
                        onChange={this.onHasSocialPurposeChange}/></td></tr>
          <tr>
            <td>Valeur ajoutée nette (en €)</td>
            <td className="column_value"><input value={printValue(indicator.getNetValueAdded(),0)} disabled={true}/></td></tr>
          <tr>
            <td>Contribution directe (en %)</td>
            <td className="column_value"><input value={printValue(indicator.getValue(),1)} disabled={true}/></td></tr>
        </tbody>
      </table>
    ) 
  }

  onHasSocialPurposeChange = (event) => {
    this.state.indicator.setHasSocialPurpose(event.target.checked);
    this.props.onUpdate(this.state.indicator);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}