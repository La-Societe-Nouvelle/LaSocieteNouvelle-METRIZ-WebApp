import React from 'react';

import { FECFileReader, processFECData } from '../../src/readers/FECReader';
import { CSVFileReader, processCSVExpensesData } from '../../src/readers/CSVReader';
import { InputText } from '../InputText';
import { InputNumber } from '../InputNumber.js';
import { TableExpenses } from './ExpensesTable';
import { TableStocks } from './StocksTable';
import { TableFinalStocks } from './FinalStocksTable';
import { TableDiscounts } from './DiscountsTable';

/* ------------------------------------------------------ */
/* -------------------- EXPENSES TAB -------------------- */
/* ------------------------------------------------------ */

export class FinancialExpensesTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      triggerNewExpense: false
    }
  }

  render() 
  {
    const {financialData,onUpdate} = this.props;
    
    return(
      <div className="financial-tab-view-inner">
        <div className="groups">
          <TableStocks financialData={financialData} onUpdate={onUpdate}/>
          <TableFinalStocks financialData={financialData} onUpdate={onUpdate}/>
          <TableExpenses financialData={financialData} onUpdate={onUpdate}/>
          <TableDiscounts financialData={financialData} onUpdate={onUpdate}/>
        </div>
      </div>
  )}

  /* ----- ACTIONS ----- */

  // Import FEC File
  importFECFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      FECFileReader(reader.result)
        .then((FECData) => processFECData(FECData))
        .then(async (nextFinancialData) => {
          this.props.financialData.removeExpenses();
          await Promise.all(nextFinancialData.expenses.map(async (expense) => {
            return this.props.financialData.addExpense(expense)
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
          this.props.financialData.removeExpenses();
          await Promise.all(nextFinancialData.expenses.map(async (expense) => {
            return this.props.financialData.addExpense(expense)
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }
  
  // Add nex expense
  triggerChange() {
    this.setState({triggerNewExpense: true})
  }

  closeChange() {
    this.setState({triggerNewExpense: false})
  }

  // Remove all expenses
  removeAll() {
    this.props.financialData.removeExpenses();
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

  /* ----- PROPS METHODS ----- */

  async addExpense(props) {
    let expense = await this.props.financialData.addExpense(props);
    this.updateFinancialData(this.props.financialData);
  }

  updateFinancialData(financialData) {
    this.props.onUpdate(financialData);
    this.forceUpdate();
  }

  updateFootprints = () => this.props.session.updateRevenueFootprint();

}