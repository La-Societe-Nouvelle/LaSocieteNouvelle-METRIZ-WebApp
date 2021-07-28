import React from 'react';

import { printValue } from '../../src/utils/Utils';

import { metaIndicators } from '../../lib/indic';

/* ----------------------------------------------------------- */
/* -------------------- DEPRECIATIONS TAB -------------------- */
/* ----------------------------------------------------------- */

export function DepreciationsTab(props) {

  const {session,indic} = props;

  return (
    <div className="indicator-section-view">
      <div className="view-header">
        <button className="retour" onClick = {() => props.onGoBack()}>Retour</button>
      </div>
      <div className="group">
        <h3>Détails des impacts indirects des immobilisations</h3>
        <TableDepreciations
          financialData={props.session.financialData}
          indic={indic}
          immobilisations={session.financialData.immobilisations} 
          onUpdate={props.onUpdate}/>
      </div>
    </div>
  )
}

/* ---------- DEPRECIATIONS TABLE ---------- */

class TableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      page: 0
    }
  }

  render() {
    const {immobilisations} = this.props;
    const {page} = this.state;
    immobilisations.sort((a,b) => b.getFootprint().getIndicator(this.props.indic).getValueAbsolute(b.getAmount()) - a.getFootprint().getIndicator(this.props.indic).getValueAbsolute(a.getAmount()));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <td>Fournisseur</td>
              <td colSpan="2">Montant</td>
              <td colSpan="2">Valeur</td>
              <td colSpan="2">Incertitude</td>
              <td>Flag</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {
              immobilisations.slice(page*20,(page+1)*20).map((immobilisation) => {
                return(<RowTableDepreciations 
                  key={"immobilisation_"+immobilisation.getId()} 
                  immobilisation={immobilisation} 
                  onUpdate={this.updateDepreciation.bind(this)}
                  indic={this.props.indic}/>)
              })
            }
          </tbody>
        </table>
        {immobilisations.length > 20 &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*20 < immobilisations.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
      </div>
    )
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {
    let currentPage = this.state.page;
    if (currentPage > 0) this.setState({page: currentPage-1})
  }

  nextPage = () => {
    let currentPage = this.state.page;
    if ((currentPage+1)*20 < this.props.companies.length) {
      this.setState({page: currentPage+1})
    }
  }

  /* ---------- COMPANIES ---------- */

  updateDepreciation(id,value,uncertainty) {
    // REWRITE
    this.props.financialData.getDepreciation(id).getFootprint().getIndicator(this.props.indic).setValue(value);
    this.props.financialData.getDepreciation(id).getFootprint().getIndicator(this.props.indic).setUncertainty(uncertainty);
  }

}

class RowTableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    const indicator = props.immobilisation.getFootprint().getIndicator(props.indic);
    this.state = {
      valueInput: indicator.getValue(),
      uncertaintyInput: indicator.getUncertainty()
    };
  }

  render() {
    const {label,footprint,amount} = this.props.immobilisation;
    const {valueInput,uncertaintyInput} = this.state;
    return (
      <tr>
        <td className="column_auto">{label}</td>
        <td className="column_value">{printValue(amount,0)}</td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_value">
          <input value={valueInput} onChange={this.onValueChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;{metaIndicators[this.props.indic].unit}</td>
        <td className="column_value">
          <input value={uncertaintyInput} onChange={this.onUncertaintyChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;%</td>
        <td className="column_libelleFlag">&nbsp;{footprint.getIndicator(this.props.indic).getLibelleFlag()}</td>
        <td className="column_resync">
          <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" onClick={this.onSyncCompany}/></td>
      </tr>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onValueChange = (event) => {
    this.setState({valueInput: event.target.value})
  }
  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value})
  }

  onSyncCompany = (event) => {
    this.fetchData();
  }

  async fetchData() {
    let immobilisation = this.props.immobilisation;
    await immobilisation.updateIndicFootprintData(this.props.indic);
    const {value,uncertainty} = immobilisation.getFootprint().getIndicator(this.props.indic);
    this.setState({valueInput: value, uncertaintyInput: uncertainty});
    this.props.onUpdate(this.props.immobilisation.id,value,uncertainty);
  }

  onBlur = (event) => {
    let value = !isNaN(parseFloat(this.state.valueInput)) ? parseFloat(this.state.valueInput) : null;
    let uncertainty = !isNaN(parseFloat(this.state.uncertaintyInput)) ? parseFloat(this.state.uncertaintyInput) : null;
    this.props.onUpdate(this.props.immobilisation.id,value,uncertainty);
  }

}