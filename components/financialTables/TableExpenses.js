import React from 'react';

/* ------------------------------------------------------ */
/* -------------------- EXPENSES TAB -------------------- */
/* ------------------------------------------------------ */

/* ---------- Main class ---------- */

export class TableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      financialData: props.financialData,
      parent: props.parent
    }
  }

  render() {
    const expenses = this.state.financialData.getExpenses();
    expenses.sort((a,b) => b.getAmount() - a.getAmount());
    return (
      <div className="expenses-tab">
        <table className="table_expenses">
          <thead>
            <tr>
              <td className="column_corporateId">Identifiant</td>
              <td className="column_corporateName">Denomination</td>
              <td className="column_areaCode">Pays</td>
              <td className="column_corporateActivity">Code division</td>
              <td className="column_amount">Montant (en €)</td></tr>
          </thead>
          <tbody>
            {
              expenses.map((expense) => {
                return(<RowTableExpenses 
                  key={"expense_"+expense.getId()} {...expense} 
                  onSave={this.updateExpense.bind(this)}
                  onSync={this.syncExpense.bind(this)}
                  onDelete={this.deleteExpense.bind(this)}/>)
              })
            }
            <NewRowTableExpenses onSave={this.addExpense.bind(this)}/>
          </tbody>
        </table>
        <button onClick={this.triggerImportFile}>Importer un fichier</button>
        <input id="import-expenses" type="file" accept=".csv" onChange={this.importFile} visibility="collapse"/>
        <button onClick={this.synchroniseAll}>Re-Synchroniser tout</button>
        <button onClick={this.removeAll}>Supprimer tout</button>
      </div>
    )
  }

  /* ---------- ON CLICK EVENT ---------- */

  triggerImportFile = () => {
    document.getElementById('import-expenses').click();
  }
  synchroniseAll = () => {
    this.state.financialData.getExpenses().forEach((expense) => {
      this.fetchDataExpense(expense);
    })
    this.props.onUpdate(this.state.financialData);
  }
  removeAll = () => {
    this.state.financialData.removeExpenses();
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }

  /* ---------- NEW LINE ---------- */

  addExpense(corporateId) {
    let financialData = this.state.financialData;
    let expense = financialData.addExpense({corporateId: corporateId});
    this.fetchDataExpense(expense);
  }

  /* ---------- OPERATIONS ON EXPENSE ---------- */
  
  async fetchDataExpense(expense) {
    await expense.fetchData();
    this.state.financialData.updateExpense(expense);
    this.props.onUpdate(this.state.financialData);
    this.forceUpdate();
  }

  updateExpense({expenseId,corporateIdInput,corporateNameInput,corporateActivityInput,areaCodeInput,amountInput}) {
    let financialData = this.state.financialData;
    financialData.getExpense(expenseId).setCorporateId(corporateIdInput);
    financialData.getExpense(expenseId).setCorporateName(corporateNameInput);
    financialData.getExpense(expenseId).setCorporateActivity(corporateActivityInput);
    financialData.getExpense(expenseId).setAreaCode(areaCodeInput);
    if (!isNaN(parseFloat(amountInput))) {
      financialData.getExpense(expenseId).setAmount(parseFloat(amountInput));
      //financialData.updateAmountExpenses();
    }
    this.setState({financialData: financialData});
    this.props.onUpdate(financialData);
  }
  syncExpense(expenseId) {
    let expense = this.state.financialData.getExpense(expenseId);
    this.fetchDataExpense(expense);
  }
  deleteExpense(expenseId) {
    this.state.financialData.removeExpense(expenseId);
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
      amount: header.indexOf("amount")
    }
    // read rows
    const rows = content.slice(content.indexOf('\n')+1).split('\n');
    let expensesAdded = [];
    await rows.forEach((rowString) => {
      let row = rowString.split(";");
      let expenseData = {
        corporateId: columns.corporate_id > -1 ? row[columns.corporate_id] : "",
        corporateName: columns.corporate_name > -1 ? row[columns.corporate_name] : "",
        amount: columns.amount > -1 ? (!isNaN(parseFloat(row[columns.amount])) ? parseFloat(row[columns.amount]) : 0.0) : 0.0,
      }
      let expense = this.state.financialData.addExpense(expenseData);
      this.forceUpdate();
      this.fetchDataExpense(expense);
    })
    this.props.onUpdate(this.state.financialData);
  }

}

class RowTableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      expenseId: props.id,
      corporateIdInput: props.corporateId,
      corporateNameInput: props.corporateName,
      areaCodeInput: props.areaCode,
      corporateActivityInput: props.corporateActivity,
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
        amountInput: this.props.amount});
    }
  }

  render() {
    const {dataFetched} = this.props;
    const {corporateIdInput,corporateNameInput,areaCodeInput,corporateActivityInput,amountInput} = this.state;

    return (
      <tr>
        <td className={"column_corporateId"+(dataFetched ? " valid" : "")}>
          <input value={corporateIdInput} onChange={this.onCorporateIdChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_corporateName">
          <input value={corporateNameInput} onChange={this.onCorporateNameChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_areaCode">
          <input value={areaCodeInput} onChange={this.onAreaCodeChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
        <td className="column_corporateActivity">
          <input value={corporateActivityInput} onChange={this.onCorporateActivityChange} onBlur={this.onBlur} onKeyPress={this.onEnterPress}/></td>
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

class NewRowTableExpenses extends React.Component {

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