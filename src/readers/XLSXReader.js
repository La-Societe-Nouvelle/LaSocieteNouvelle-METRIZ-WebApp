import * as XLSX from 'xlsx';

/* ----------------------------------------------------- */
/* -------------------- XSLX READER -------------------- */
/* ----------------------------------------------------- */

export { XLSXFileReader };

/* ---------- CONTENT READER ---------- */ 

async function XLSXFileReader(content)
// ...build JSON from XLSX File
{
  let data = [];
  let columns = {};

  const workbook = XLSX.read(content, {type:'buffer'});
  const sheetName = workbook.SheetNames[0];
  const workSheet = workbook.Sheets[sheetName];

  // read header
  Object.keys(workSheet).filter(cellAdress => cellAdress.slice(1)=='1')
                        .map(cellAdress => cellAdress.charAt(0))
                        .forEach(column => columns[column]=workSheet[column+'1'].v);

  const lastRow = Object.keys(workSheet).filter(cellAdress => cellAdress.charAt(0)=='A')
                                        .map(cellAdress => parseInt(cellAdress.slice(1)))
                                        .reduce((a,b) => Math.max(a,b),0);
  
  // read rows
  for (let i = 2; i <= lastRow; i++) 
  {
    let dataCell = {};
    Object.entries(columns).forEach(([column,label]) => {
      let cell = workSheet[column+i];
      if (cell!=undefined) {dataCell[label] = cell.w} 
      else                 {dataCell[label] = null}
    })
    data.push(dataCell);
  }

  return data;
}