import React from 'react';

/* ------------------------------------------------------ */
/* -------------------- DEPRECIATIONS TAB -------------------- */
/* ------------------------------------------------------ */

/* ---------- Table class ---------- */

export class TableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      financialData: props.financialData,
    }
  }

  render() {
    const depreciations = this.state.financialData.getDepreciations();
    depreciations.sort((a,b) => b.getAmount() - a.getAmount());
    return (
      <div className="depreciations-tab">
        <table className="table_depreciations">
          <thead>
            <tr>
              <td className="column_corporateId">Identifiant</td>
              <td className="column_corporateName">Denomination</td>
              <td className="column_areaCode">Pays</td>
              <td className="column_corporateActivity">Code division</td>
              <td className="column_yearInvestment">Année</td>
              <td className="column_amount">Montant (en €)</td></tr>
          </thead>
          <tbody>
            {
              depreciations.map((depreciation) => {
                return(<RowTableDepreciations
                  key={"depreciation_"+depreciation.getId()} {...depreciation} 
                  onSave={this.updateDepreciation.bind(this)}
                  onSync={this.syncDepreciation.bind(this)}
                  onDelete={this.deleteDepreciation.bind(this)}/>)
              })
            }
            <NewRowTableDepreciations onSave={this.addDepreciation.bind(this)}/>
          </tbody>
        </table>
        <button onClick={this.triggerImportFile}>Importer un fichier</button>
        <input id="import-depreciations" type="file" accept=".csv" onChange={this.importFile} visibility="collapse"/>
        <button onClick={this.synchroniseAll}>Re-Synchroniser tout</button>
        <button onClick={this.removeAll}>Supprimer tout</button>
      </div>
    )
  }

  /* ---------- OPERATIONS ON DEPRECIATION ---------- */
  
  // Update depreciation
  updateDepreciation({depreciationId,corporateIdInput,corporateNameInput,corporateActivityInput,areaCodeInput,yearInput,amountInput}) {
    let depreciation = this.state.financialData.getDepreciation(depreciationId);
        depreciation.setCorporateId(corporateIdInput);
        depreciation.setCorporateName(corporateNameInput);
        depreciation.setCorporateActivity(corporateActivityInput);
        depreciation.setAreaCode(areaCodeInput);
        depreciation.setYear(yearInput.match(/[0-9]{4}/) ? yearInput : "");
        depreciation.setAmount(!isNaN(parseFloat(amountInput)) ? parseFloat(amountInput) : null);
    this.state.financialData.updateDepreciation(depreciation);
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }
  syncDepreciation(depreciationId) {
    let depreciation = this.state.financialData.getDepreciation(depreciationId);
    this.fetchDataDepreciation(depreciation);
  }
  deleteDepreciation(depreciationId) {
    this.state.financialData.removeDepreciation(depreciationId);
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }

  async fetchDataDepreciation(depreciation) {
    await depreciation.fetchData();
    this.state.financialData.updateDepreciation(depreciation);
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }

  /* ---------- NEW LINE ---------- */

  addDepreciation(corporateId) {
    let financialData = this.state.financialData;
    let depreciation = financialData.addDepreciation({corporateId: corporateId});
    this.fetchDataDepreciation(depreciation);
  }

  /* ---------- ON CLICK EVENT ---------- */

  triggerImportFile = () => {
    document.getElementById('import-depreciations').click();
  }
  synchroniseAll = () => {
    this.state.financialData.getDepreciations().forEach((depreciation) => {
      this.fetchDataDepreciation(depreciation);
    })
    this.props.onUpdate(this.state.financialData);
  }
  removeAll = () => {
    this.state.financialData.removeDepreciations();
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }

  // TEST IMPORT CSV FILE

  importFile = (event) => {
    let files = event.target.files;
    this.read(files[0],this.importData.bind(this));
  }

  read(file,importData) {
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      importData(reader.result);
     };
    reader.readAsText(file);
  }

  async importData(content) {
    content = (content.replaceAll('\r\n','\n')).replaceAll('\r','\n');
    // read header
    const header = content.slice(0,content.indexOf('\n')).split(";");
    const columns = {
      corporate_id: header.indexOf("corporate_id"),
      corporate_name: header.indexOf("corporate_name"),
      year: header.indexOf("year"),
      amount: header.indexOf("amount")
    }
    // read rows
    const rows = content.slice(content.indexOf('\n')+1).split('\n');
    await rows.forEach((rowString) => {
      let row = rowString.split(";");
      let depreciationData = {
        corporateId: columns.corporate_id > -1 ? row[columns.corporate_id] : "",
        corporateName: columns.corporate_name > -1 ? row[columns.corporate_name] : "",
        year: columns.year > -1 ? row[columns.year] : "",
        amount: columns.amount > -1 ? (!isNaN(parseFloat(row[columns.amount])) ? parseFloat(row[columns.amount]) : 0.0) : 0.0,
      }
      let depreciation = this.state.financialData.addDepreciation(depreciationData);
      this.forceUpdate();
      this.fetchDataDepreciation(depreciation);
    })
    this.props.onUpdate(this.state.financialData);
  }

}

class RowTableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      depreciationId: props.id,
      corporateIdInput: props.corporateId,
      corporateNameInput: props.corporateName,
      areaCodeInput: props.areaCode,
      corporateActivityInput: props.corporateActivity,
      yearInput: props.year,
      amountInput: props.amount};
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState({
        expenseId: this.props.id,
        corporateIdInput: this.props.corporateId,
        corporateNameInput: this.props.corporateName,
        areaCodeInput: this.props.areaCode,
        corporateActivityInput: this.props.corporateActivity,
        yearInput: this.props.year,
        amountInput: this.props.amount});
    }
  }

  render() {
    const {corporateIdInput,corporateNameInput,areaCodeInput,corporateActivityInput,yearInput,amountInput} = this.state;
    return (
      <tr>
        <td className="column_corporateId">
          <input value={corporateIdInput} onChange={this.onCorporateIdChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_corporateName">
          <input value={corporateNameInput} onChange={this.onCorporateNameChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_areaCode">
          <input value={areaCodeInput} onChange={this.onAreaCodeChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_corporateActivity">
          <input value={corporateActivityInput} onChange={this.onCorporateActivityChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_year">
          <input value={yearInput} onChange={this.onYearChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_amount">
          <input value={amountInput} onChange={this.onAmountChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_resync">
          <img className="img" src="/resources/icon_refresh.jpg" alt="refresh" onClick={this.onSyncExpense}/></td>
        <td className="column_delete">
          <img className="img" src="/resources/icon_delete.png" alt="delete" onClick={this.onDeleteExpense}/></td>
      </tr>
    )
  }
  
  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onCorporateIdChange = (event) => {this.setState({corporateIdInput: event.target.value})}
  onCorporateNameChange = (event) => {this.setState({corporateNameInput: event.target.value})}
  onAreaCodeChange = (event) => {this.setState({areaCodeInput: event.target.value})}
  onCorporateActivityChange = (event) => {this.setState({corporateActivityInput: event.target.value})}
  onYearChange = (event) => {this.setState({yearInput: event.target.value})}
  onAmountChange = (event) => {this.setState({amountInput: event.target.value})}

  // Props functions
  onBlur = (event) => {
    this.props.onSave(this.state);
  }
  onSyncExpense = (event) => {
    this.props.onSync(this.props.id);
  }
  onDeleteExpense = (event) => {
    this.props.onDelete(this.props.id);
  }

}

class NewRowTableDepreciations extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      corporateIdInput: ""};
  }

  render() {
    return (
      <tr>
        <td><input value={this.state.corporateIdInput} onChange={this.onCorporateIdChange} onBlur={this.onCorporateIdBlur} onKeyPress={this.onEnterPress}/></td>
        <td><input value={""} disabled={true}/></td>
        <td><input value={""} disabled={true}/></td>
        <td><input value={""} disabled={true}/></td>
        <td><input value={""} disabled={true}/></td>
        <td><input value={""} disabled={true}/></td>
      </tr>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }


  onCorporateIdChange = (event) => {this.setState({corporateIdInput: event.target.value})}
  onCorporateIdBlur = (event) => {
    let id = event.target.value;
    this.setState({corporateIdInput: ""});
    this.props.onSave(id);
  }

}