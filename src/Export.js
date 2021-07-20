
function exportIndicDataExpensesCSV(indic,session) {

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "corporated_id;corporate_name;amount;value;uncertainty"
  
  let expenses = session.financialData.getExpenses();
  expenses.forEach((expense) => {
    csvContent += "\r\n";
    let indicator = expense.getFootprint().getIndicator(indic);
    let row = expense.getCorporateId()+";"+expense.getCorporateName()+";"+expense.getAmount()+";"+indicator.getValue()+";"+indicator.getUncertainty();
    csvContent += row;
  })

  return csvContent;
}

function exportIndicDataDepreciationsCSV(indic,session) {

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "corporated_id;corporate_name;amount;value;uncertainty"
  
  let depreciations = session.financialData.getDepreciations();
  depreciations.forEach((depreciation) => {
    csvContent += "\r\n";
    let indicator = depreciation.getFootprint().getIndicator(indic);
    let row = depreciation.getCorporateId()+";"+depreciation.getCorporateName()+";"+depreciation.getAmount()+";"+indicator.getValue()+";"+indicator.getUncertainty();
    csvContent += row;
  })

  return csvContent;
}

import { jsPDF } from 'jspdf';

import {indic as indicData} from '../lib/indic';

function exportIndicPDF(indic,session) {
  
  const doc = new jsPDF();

  doc.setFont("Calibri");

  let x = 10;

  // HEADER
  doc.setFontSize(16);
  doc.setFont("Calibri","bold");
  doc.text("COMPTE DE RESULTAT",10,x);
  //let imgData = 'data:image/jpeg;base64,'+ Base64.encode('../public/resources/Logo_N&B.jpg');
  //let imgData = canvas.toDataURL('../public/resources/Logo_N&B.jpg');
  //doc.addImage(imgData, "JPEG", 100, 100, 50, 50);

  x+=10;
  doc.setFontSize(11);
  doc.text((session.getUniteLegale().corporateName || " - " ),10,x); 
  x+=10;
  doc.setFontSize(10);
  doc.setFont("Calibri","normal");
  doc.text("Numéro de siren : "+(session.legalUnit.siren!="" ? session.legalUnit.siren : " - " ),10,x); 
  x+=10;
  doc.text("Année de fin d'exercice : "+(session.getUniteLegale().year!=null ? session.getUniteLegale().year : " - " ),10,x); 
  x+=6;
  let today = new Date();
  doc.text("Edition du : "+String(today.getDate()).padStart(2,'0')+"/"+String(today.getMonth()+1).padStart(2,'0')+"/"+today.getFullYear(),10,x); 

  x+=20;
  doc.setFontSize(11);
  doc.setFont("Calibri","bold");
  doc.text(indicData[indic].libelleGrandeur.toUpperCase(),10,x);
  doc.line(10,x+2,200,x+2);

  /*
  x+=10;
  doc.setFontSize(10);
  doc.text("Compte de résultat",10,x);
  */

  /* ----- TABLE ----- */

  let yNotes = 125;
  let yValue = 150;
  let yUncertainty = 175;

  // first line table
  x+=15;
  doc.setFontSize(8);
  doc.setFont("Calibri","italic");
  doc.text("(en "+indicData[indic].unit+")",10,x);
  doc.setFontSize(10);
  doc.setFont("Calibri","normal");
  doc.text("Notes",125,x);
  doc.text("Valeur",150,x);
  doc.text("Incertitude",175,x);
  doc.line(10,x+2,200,x+2);

  x+=6;
  doc.setFont("Calibri","bold");
  doc.text("Chiffre d'affaires",10,x);
  doc.setFont("Calibri","normal");
  doc.text(printValue(session.getRevenueFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getRevenueFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,x+2,200,x+2);

  x+=6;
  doc.text("Production",10,x);
  doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);

  x+=6;
  doc.text("dont production stockée",15,x);
  doc.text(session.financialData.storedProduction!=null ? printValue(session.getProductionFootprint().getIndicator(indic).getValue(),1) : " - ",yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(session.financialData.storedProduction!=null ? printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %" : "- %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);

  x+=6;
  doc.text("dont production immobilisée",15,x);
  doc.text(session.financialData.immobilisedProduction!=null ? printValue(session.getProductionFootprint().getIndicator(indic).getValue(),1) : " - ",yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(session.financialData.immobilisedProduction!=null ? printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %" : "- %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);

  x+=6;
  doc.text("Production déstockée",10,x);
  doc.text(session.financialData.unstoredProduction!=null ? printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getValue(),1) : " - ",yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(session.financialData.unstoredProduction!=null ? printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %" : "- %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,x+2,200,x+2);

  x+=6;
  doc.text("Charges externes",10,x);
  doc.text(printValue(session.getExpensesFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getExpensesFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  /*doc.line(10,x+2,200,x+2);

  x+=6;
  doc.text("Valeur ajoutée brute",10,x);
  doc.text(printValue(session.getGrossValueAddedFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getGrossValueAddedFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,x+2,200,x+2);
*/  
  x+=6;
  doc.text("Amortissements",10,x);
  doc.text(printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,x+2,200,x+2);

  x+=6;
  doc.text("Valeur ajoutée nette",10,x);
  doc.text(printValue(session.getValueAddedFootprint(indic).getValue(),1),yValue+10,x,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getValueAddedFootprint(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,x+2,200,x+2);

  // Export
  doc.save("rapport_"+(session.legalUnit.siren!="" ? session.legalUnit.siren : "xxxxxxxxx")+"-"+indic.toUpperCase()+".pdf");

}

export {exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV, exportIndicPDF};

function printValue(value,precision) {
  if (value==null) {return "-"}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}