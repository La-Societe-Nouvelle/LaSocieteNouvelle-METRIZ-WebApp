/* ---------------------------------------------------- */
/* -------------------- CSV READER -------------------- */
/* ---------------------------------------------------- */

/* ---------- CONTENT READER ---------- */ 

async function CSVFileReader(content)
// ...build JSON from CSV File
{
  let CSVData = [];
  let columns = {};

  // Clean content
  content = (content.replaceAll('\r\n','\n')).replaceAll('\r','\n');

  // read header
  const header = content.slice(0,content.indexOf('\n')).split(";");
  header.forEach((column) => {
    columns[column.replace(/^\"/,"").replace(/\"$/,"")] = header.indexOf(column);
  })

  // read rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');
  await rows.forEach((rowString) => {
    if (rowString!="") 
    {
      let row = rowString.split(";");
      readCSVFileRow(columns,row)
        .then((rowData) => CSVData.push(rowData));
    }
  })

  return CSVData;
}

// Read line
async function readCSVFileRow(columns,row) {
  let rowData = {}
  Object.entries(columns).forEach(([column,index]) => {
    rowData[column] = row[index].replace(/^\"/,"").replace(/\"$/,"");
  })
  return rowData;
}

/* ---------- EXPENSES FILE ---------- */ 

/*
  Header format :
    -> label : label
    -> amount : amount
    -> account : account (id)
    -> accountLib : account label [not used yet]
    -> corporateId : id of the company
    -> corporateName : name of the company
*/

async function processCSVExpensesData(CSVExpensesData)
// ...extract data to use in session
{
  let data = {};
  data.expenses = [];
  data.accounts = {};
  //data.companies = [];
  
  await CSVExpensesData.forEach((CSVExpenseData) => {
    if (CSVExpenseData.account==undefined) { CSVExpenseData.account = ""};
    if (data.accounts[CSVExpenseData.account]==undefined) { data.accounts[CSVExpenseData.account] = CSVExpenseData.accountLib }
    let expenseData = {
      label: CSVExpenseData.label,
      account: CSVExpenseData.account,
      corporateId: CSVExpenseData.corporateId,
      corporateName: CSVExpenseData.corporateName,
      amount: parseFloat(CSVExpenseData.amount),
    }
    data.expenses.push(expenseData);
  })

  console.log(data);
  return data;
}

/* ---------- COMPANIES FILE ---------- */ 

/*
  Header format :
    -> corporateId : id of the company
    -> corporateName : name of the company
*/

async function processCSVCompaniesData(CSVCompaniesData)
// ...extract data to use in session
{
  let data = {};
  
  await CSVCompaniesData.forEach((CSVCompanieData) => {
    data[CSVCompanieData.corporateName] = CSVCompanieData.corporateId;
  })

  return data;
}

export {CSVFileReader, processCSVExpensesData, processCSVCompaniesData};