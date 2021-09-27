import * as XLSX from 'xlsx';

/* ----------------------------------------------------- */
/* -------------------- XSLX WRITER -------------------- */
/* ----------------------------------------------------- */

export { XLSXFileWriterFromJSON, XLSXHeaderFileWriter };

/* ---------- CONTENT WRITER ---------- */ 

async function XLSXFileWriterFromJSON(fileProps,sheetName,jsonContent)
// ...build XLSX File from JSON
{
  const worksheet = XLSX.utils.json_to_sheet(jsonContent);
  
  if (fileProps.wsclos != undefined) worksheet['!cols'] = fileProps.wsclos;

  const workbook = XLSX.utils.book_new();
        workbook.Props = fileProps;
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}

/* ---------- HEADER WRITER ---------- */ 

async function XLSXHeaderFileWriter(fileProps,sheetName,arrayHeader)
// ...build XLSX File (empty file with header) from array
{
  const worksheet = XLSX.utils.aoa_to_sheet(arrayHeader);
  
  if (fileProps.wsclos != undefined) worksheet['!cols'] = fileProps.wsclos;

  const workbook = XLSX.utils.book_new();
        workbook.Props = fileProps;
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = worksheet;

  workbook.Sheets[sheetName] = worksheet;

  var XLSXData = XLSX.write(workbook, {bookType:'xlsx',  type: 'binary'});

  // convert to ArrayBuffer
  var buf = new ArrayBuffer(XLSXData.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=XLSXData.length; ++i) view[i] = XLSXData.charCodeAt(i) & 0xFF;

  return buf;
}