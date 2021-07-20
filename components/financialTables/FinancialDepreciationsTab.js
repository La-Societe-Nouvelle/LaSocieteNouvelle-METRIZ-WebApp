import React from 'react';

import { FECFileReader, processFECData } from '../../src/readers/FECReader';
import { CSVFileReader, processCSVExpensesData } from '../../src/readers/CSVReader';
import { InputText } from '../InputText';
import { InputNumber } from '../InputNumber.js';

/* ----------------------------------------------------------- */
/* -------------------- DEPRECIATIONS TAB -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDepreciationsTab extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      triggerNewDepreciation: false
    }
  }

  render() {
    const {financialData} = this.props;
    const {triggerNewDepreciation} = this.state;
    return(
      <div className="financial-tab-view-inner">
        <div className="groups">
            <div className="group">
              <h3>Liste des amortissements sur immobilisations</h3>

              <div className="actions">
                <button onClick={() => {document.getElementById('import-fec').click()}}>Importer un fichier FEC</button>
                  <input id="import-fec" type="file" accept=".csv" onChange={this.importFECFile} visibility="collapse"/>
                <button onClick={() => document.getElementById('import-depreciations').click()}>Importer un fichier CSV</button>
                  <input id="import-depreciations" type="file" accept=".csv" onChange={this.importCSVFile} visibility="collapse"/>
                <button onClick={() => this.triggerChange()}>Ajouter une immobilisation</button>
                {financialData.depreciations.length > 0 &&
                <button onClick={() => this.removeAll}>Supprimer tout</button>}
              </div>
              
              {financialData.depreciations.length > 0 &&
                <TableDepreciations financialData={financialData} 
                                    onUpdate={this.updateFinancialData.bind(this)}/>}
            </div>
            
            {triggerNewDepreciation &&
            <DepreciationPopup companies={financialData.companies}
                          onUpdate={this.addDepreciation.bind(this)}
                          onClose={this.closeChange.bind(this)}/>}
          </div>
      </div>
  )}

  /* ---------- ACTIONS ---------- */

  // Import FEC File
  importFECFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      FECFileReader(reader.result)
        .then((FECData) => processFECData(FECData))
        .then(async (nextFinancialData) => {
          this.props.financialData.removeDepreciations();
          await Promise.all(nextFinancialData.depreciations.map(async (depreciation) => {
            return this.props.financialData.addDepreciation(depreciation)
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }

  // Import CSV File
  importCSVFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVExpensesData(CSVData))
        .then(async (nextFinancialData) => {
          this.props.financialData.removeDepreciations();
          await Promise.all(nextFinancialData.depreciations.map(async (depreciation) => {
            return this.props.financialData.addDepreciation(depreciation)
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }

  // Add nex depreciation
  triggerChange() {
    this.setState({triggerNewDepreciation: true})
  }

  closeChange() {
    this.setState({triggerNewDepreciation: false})
  }
  
  // Remove all depreciations
  removeAll() {
    this.props.financialData.removeDepreciations();
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

  /* ----- PROPS METHODS ----- */

  async addDepreciation(props) {
    let depreciation = await this.props.financialData.addDepreciation(props);
    this.updateFinancialData(this.props.financialData);
  }

  updateFinancialData(financialData) {
    this.props.onUpdate(financialData);
    this.forceUpdate();
  }
}

/* ------------------------------------------------------------- */
/* -------------------- DEPRECIATIONS TABLE -------------------- */
/* ------------------------------------------------------------- */

/* ---------- TABLE DEPRECIATIONS ---------- */

class TableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      triggerChange: false,
      depreciationChange: null,
    }
  }

  render() {
    const {depreciations,companies} = this.props.financialData;
    const {columnSorted,nbItems,page,triggerChange,depreciationChange} = this.state;
    this.sortDepreciations(depreciations,columnSorted);
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="column_auto"
                  onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="column_auto"
                  onClick={() => this.changeColumnSorted("company")}>Fournisseur</td>
              <td className="column_short-input"
                  onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="column_short-input"
                  onClick={() => this.changeColumnSorted("year")}>Année</td>
              <td className="column_amount" colSpan="2"
                  onClick={() => this.changeColumnSorted("amount")}>Montant (en €)</td>
              <td colSpan="2"></td></tr>
          </thead>
          <tbody>
            {
              depreciations.slice(page*nbItems,(page+1)*nbItems).map((depreciation) => {
                return(<RowTableDepreciations
                  key={"depreciation_"+depreciation.getId()} 
                  {...depreciation}
                  companies={companies}
                  onUpdate={this.updateDepreciation.bind(this)}
                  onChange={this.changeDepreciation.bind(this)}
                  onDelete={this.deleteDepreciation.bind(this)}/>)
              })
            }
          </tbody>
        </table>
        {depreciations.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < depreciations.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
          {triggerChange &&
          <DepreciationPopup {...depreciationChange}
                        companies={companies}
                        onUpdate={this.updateDepreciation.bind(this)}
                        onClose={this.closeChange.bind(this)}/>}
      </div>
    )
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted) {
      this.setState({columnSorted: columnSorted, reverseSort: false})
    } else {
      this.setState({reverseSort: !this.state.reverseSort})
    }
  }

  sortDepreciations(depreciations,columSorted) {
    switch(columSorted) {
      case "label": depreciations.sort((a,b) => a.getLabel().localeCompare(b.getLabel())); break;
      case "company": depreciations.sort((a,b) => a.getCorporateName().localeCompare(b.getCorporateName())); break;
      case "account": depreciations.sort((a,b) => a.getAccount().localeCompare(b.getAccount())); break;
      case "year": depreciations.sort((a,b) => a.getYear().localeCompare(b.getYear())); break;
      case "amount": depreciations.sort((a,b) => b.getAmount() - a.getAmount()); break;
    }
    if (this.state.reverseSort) depreciations.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {
    let currentPage = this.state.page;
    if (currentPage > 0) this.setState({page: currentPage-1});
  }

  nextPage = () => {
    let currentPage = this.state.page;
    if ((currentPage+1)*this.state.nbItems < this.props.financialData.depreciations.length) {
      this.setState({page: currentPage+1})
    }
  }
  
  /* ----- OPERATIONS ON DEPRECIATION ----- */

  async addDepreciation(props) {
    let depreciation = await this.props.financialData.addDepreciation(props)
    this.updateFinancialData();
  }

  updateDepreciation(props) {
    this.props.financialData.updateDepreciation(props)
    this.updateFinancialData();
  }

  deleteDepreciation(depreciationId) {
    this.props.financialData.removeDepreciation(depreciationId);
    this.updateFinancialData();
  }

  changeDepreciation(depreciationId) {
    this.setState({
      triggerChange: true,
      depreciationChange: this.props.financialData.getDepreciation(depreciationId)
    })
  }

  closeChange() {
    this.setState({
      triggerChange: false
    })
  }
  
  /* ----- OPERATIONS ON DEPRECIATION ----- */
  
  updateFinancialData() {
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

}

/* ---------- ROW DEPRECIATION ---------- */

class RowTableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      label : props.label,
      corporateName: props.corporateName,
      account: props.account,
      year: props.year,
      amount: props.amount};
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState({
        label: this.props.label,
        corporateName: this.props.corporateName,
        account: this.props.account,
        year: this.props.year,
        amount: this.props.amount
      })
    }
  }

  render() {
    const {dataFetched} = this.props;
    const {label,corporateName,account,year,amount} = this.state;
    return (
      <tr>
        <td className="column_auto">
          <input value={label} 
                 onChange={this.onLabelChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className={"column_auto"+(dataFetched ? " valid" : "")}>
          <input value={corporateName} 
                 list="companies"
                 onChange={this.onCorporateNameChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/>
          <datalist id="companies">
            { this.props.companies.map((company) => {return <option key={company.id} value={company.corporateName}/>})}
          </datalist></td>
        <td className="column_short-input">
          <input value={account} 
                 onChange={this.onAccountChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_short-input">
          <input value={year} 
                 onChange={this.onYearChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_short-input">
          <input value={amount} 
                 onFocus={this.onAmountFocus}
                 onChange={this.onAmountChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_icon">
          <img className="img" src="/resources/icon_change.jpg" alt="change" 
               onClick={() => this.changeDepreciation()}/></td>
        <td className="column_icon">
          <img className="img" src="/resources/icon_delete.jpg" alt="delete" 
               onClick={() => this.onDeleteDepreciation}/></td>
      </tr>
    )
  }
  
  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onLabelChange = (event) => {
    this.setState({label: event.target.value})
  }
  onCorporateNameChange = (event) => {
    this.setState({corporateName: event.target.value})
  }
  onAccountChange = (event) => {
    this.setState({account: event.target.value})
  }
  onYearChange = (event) => {
    this.setState({year: event.target.value})
  }
  onAmountChange = (event) => {
    this.setState({amount: event.target.value})
  }

  onAmountFocus = (event) => {
    this.setState({amount: event.target.value.replace(/^0$/,"")})
  }

  onBlur = () => {
    let nextProps = {id: this.props.id, ...this.state};
    if (!nextProps.year.match(/[0-9]{4}/)) nextProps.year = undefined;
    nextProps.amount = !isNaN(parseFloat(nextProps.amount)) ? parseFloat(nextProps.amount) : undefined;
    this.props.onUpdate(props);
  }

  /* ----- PROPS METHODS ----- */

  changeDepreciation() {
    this.props.onChange(this.props.id)
  }

  onDeleteDepreciation() {
    this.props.onDelete(this.props.id)
  }

}

/* ---------- NEW / CHANGE DEPRECIATION POP-UP ---------- */

class DepreciationPopup extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        label: props.label || "",
        amount: props.amount || 0,
        corporateName: props.corporateName || "",
        account: props.account || "",
        year: props.year || "",
      }
    }
  
    render() {
      const {label,corporateName,account,amount,year} = this.state;
      return (
        <div className="popup">
          <div className="popup-inner">
            <h3>{this.props.id == undefined ? "Ajout d'une immobilisation" : "Modification"}</h3>
            <div className="inputs">
              <div className="inline-input">
                  <label>Libellé </label>
                  <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
              </div>
              <div className="inline-input short">
                  <label>Dotation </label>
                  <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                  <span>&nbsp;€</span>
              </div>
              <div className="inline-input short">
                  <label>Compte </label>
                  <InputText value={account} onUpdate={this.updateAccount.bind(this)}/>
              </div>
              <div className="inline-input short">
                  <label>Année de l'investissement </label>
                  <InputText value={year} onUpdate={this.updateYear.bind(this)}/>
              </div>
              <div className="inline-input">
                  <label>Fournisseur </label>
                  <input value={corporateName} 
                    list="companies"
                    onChange={this.onCorporateNameChange}
                    onKeyPress={this.onEnterPress}/>
                <datalist id="companies">
                  { this.props.companies.map((company) => {return <option key={company.id} value={company.corporateName}/>})}
                </datalist>
              </div>
            </div>
            <div className="footer">
              <button onClick={() => this.props.onClose()}>Fermer</button>
              <button onClick={() => this.updateDepreciation()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )
    }
  
    onEnterPress = (event) => {if (event.which==13) event.target.blur()}
  
    updateLabel(nextLabel) {
      this.setState({label: nextLabel})
    }
  
    onCorporateNameChange = (event) => {
      this.setState({corporateName: event.target.value})
    }
  
    updateAccount(nextAccount) {
      this.setState({account: nextAccount})
    }
  
    updateAmount(nextAmount) {
      if (nextAmount!=null) {
        this.setState({amount: nextAmount})  
      }
    }

    updateYear(nextYear) {
      if (nextYear.match(/[0-9]{4}/)) {
        this.setState({year: nextYear})
      }
    }
  
    /* ----- PROPS METHODS ----- */
  
    updateDepreciation() {
      this.props.onUpdate({id: this.props.id, ...this.state});
      this.props.onClose();
    }
  
  }