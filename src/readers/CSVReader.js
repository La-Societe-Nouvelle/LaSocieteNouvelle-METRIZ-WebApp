/* -------------------------------------------------------------------------------------------- */
/* ---------------------------------------- CSV READER ---------------------------------------- */
/* -------------------------------------------------------------------------------------------- */

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
  await rows.forEach((rowString) => 
  {
    if (rowString!="") {
      let row = rowString.split(";");
      readCSVFileRow(columns,row)
        .then((rowData) => CSVData.push(rowData));
    }
  })

  return CSVData;
}

// Read line
async function readCSVFileRow(columns,row) 
{
  let rowData = {}
  Object.entries(columns).forEach(([column,index]) => {
    rowData[column] = row[index].replace(/^\"/,"").replace(/\"$/,"");
  })
  return rowData;
}

/* -------------------------------------------------------------------------------------------- */

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
    data[CSVCompanieData.providerNum] = {
      corporateName: CSVCompanieData.corporateName,
      corporateId: CSVCompanieData.corporateId,
    }
  })

  return data;
}

export {CSVFileReader, processCSVCompaniesData};