// La Société Nouvelle

// Modules
import { jsPDF } from 'jspdf';

// Libs
import metaIndics from '../../lib/indics';

// Sources
import { buildIndicatorAggregate } from '../formulas/footprintFormulas';

// Statement writers
import { writeStatementART } from '../../components/statements/StatementART';
import { writeStatementDIS } from '../../components/statements/StatementDIS';
import { writeStatementECO } from '../../components/statements/StatementECO';
import { writeStatementGEQ } from '../../components/statements/StatementGEQ';
import { writeStatementGHG } from '../../components/statements/StatementGHG';
import { writeStatementHAZ } from '../../components/statements/StatementHAZ';
import { writeStatementKNW } from '../../components/statements/StatementKNW';
import { writeStatementMAT } from '../../components/statements/StatementMAT';
import { writeStatementNRG } from '../../components/statements/StatementNRG';
import { writeStatementSOC } from '../../components/statements/StatementSOC';
import { writeStatementWAS } from '../../components/statements/StatementWAS';
import { writeStatementWAT } from '../../components/statements/StatementWAT';

function exportIndicDataExpensesCSV(indic,session) {

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "corporated_id;corporate_name;amount;value;uncertainty"
  
  let expenses = session.financialData.expenses;
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

function exportIndicPDF(indic,session) 
{
  const doc = new jsPDF();

  const {financialData,legalUnit} = session;

  // 
  doc.setFont("Calibri");
  let y = 10;

  // HEADER
  doc.setFontSize(16);
  doc.setFont("Calibri","bold");
  doc.text("COMPTE DE RESULTAT",10,y);
  //let imgData = 'data:image/jpeg;base64,'+ Base64.encode('../public/resources/Logo_N&B.jpg');
  //let imgData = canvas.toDataURL('../public/resources/Logo_N&B.jpg');
  //doc.addImage(imgData, "JPEG", 100, 100, 50, 50);

  y+=10;
  doc.setFontSize(11);
  doc.text((legalUnit.corporateName || " - " ),10,y); 
  y+=10;
  doc.setFontSize(10);
  doc.setFont("Calibri","normal");
  doc.text("Numéro de siren : "+(legalUnit.siren!="" ? legalUnit.siren : " - " ),10,y); 
  y+=10;
  doc.text("Année de fin d'exercice : "+(session.year!=null ? session.year : " - " ),10,y); 
  y+=6;
  let today = new Date();
  doc.text("Edition du : "+String(today.getDate()).padStart(2,'0')+"/"+String(today.getMonth()+1).padStart(2,'0')+"/"+today.getFullYear(),10,y); 

  y+=20;
  doc.setFontSize(11);
  doc.setFont("Calibri","bold");
  doc.text(metaIndics[indic].libelleGrandeur.toUpperCase(),10,y);
  doc.line(10,y+2,200,y+2);

  /*
  x+=10;
  doc.setFontSize(10);
  doc.text("Compte de résultat",10,x);
  */

  /* ----- TABLE ----- */

  const {production,
         revenue,
         storedProduction,
         immobilisedProduction,
         intermediateConsumption,
         storedPurchases,
         capitalConsumption,
         netValueAdded} = financialData.aggregates;

  let yNotes = 125;
  let yValue = 150;
  let yUncertainty = 175;

  // first line table
  y+=15;
  doc.setFontSize(8);
  doc.setFont("Calibri","italic");
  doc.text("(en "+metaIndics[indic].unit+")",10,y);
  doc.setFontSize(10);
  doc.setFont("Calibri","normal");
  doc.text("Notes",125,y);
  doc.text("Valeur",150,y);
  doc.text("Incertitude",175,y);
  
  doc.line(10,y+2,200,y+2);

  // Production
  y+=6;
  doc.setFont("Calibri","bold");
  doc.text("Production",10,y);
  doc.setFont("Calibri","normal");
  doc.text(printValue(production.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(production.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  // Revenue
  y+=6;
  doc.text("\tdont Chiffre d'affaires",10,y);  
  doc.text(printValue(revenue.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(revenue.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  // Stock production
  y+=6;
  doc.text("\tdont Production stockée",10,y);
  doc.text(printValue(storedProduction.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(storedProduction.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  // Immobilised production
  if (financialData.getImmobilisedProduction() > 0) {
    x+=6;
    doc.text("\tdont production immobilisée",10,x);
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getValue(),1),yValue+10,x,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
    doc.setFontSize(10);
  }
  
  doc.line(10,y+2,200,y+2);

  y+=6;
  doc.text("Consommations intermédiaires",10,y);
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  if (storedPurchases.amount != 0) 
  {
    y+=6;
    doc.text("\tVariation de stocks",10,y);
    doc.text(printValue(storedPurchases.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(storedPurchases.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  }

  financialData.getBasicExpensesGroups().filter(group => group.expenses.length > 0).forEach(group => 
  { 
    const amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0);
    const indicator = buildIndicatorAggregate(indic,group.expenses);
    y+=6;
    doc.text("\t"+group.label,10,y);
    doc.text(printValue(indicator.getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  })

  doc.line(10,y+2,200,y+2); // Depreciations

  y+=6;
  doc.text("Dotations aux Amortissements sur immobilisations",10,y);
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  financialData.getBasicDepreciationExpensesGroups().filter(group => group.expenses.length > 0).forEach(group => 
  {
    const amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0);
    const indicator = buildIndicatorAggregate(indic,group.expenses);
    y+=6;
    doc.text("\t"+group.label,10,y);
    doc.text(printValue(indicator.getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  })
  
  doc.line(10,y+2,200,y+2); // Net Value Added

  y+=6;
  doc.text("Valeur ajoutée nette",10,y);
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  doc.line(10,y+2,200,y+2);

  y+=20;
  doc.setFontSize(11);
  doc.setFont("Calibri","bold");
  doc.text("DECLARATION",10,y);
  doc.line(10,y+2,200,y+2);

  y+=10;
  y+= getStatementNote(doc,10,y,session.impactsData,indic);

  // Export
  doc.save("rapport_"+(legalUnit.siren!="" ? legalUnit.siren : "xxxxxxxxx")+"-"+indic.toUpperCase()+".pdf");

}

const getStatementNote = (doc,x,y,impactsData,indic) =>
{
  switch(indic)
  {
    case "art": return writeStatementART(doc,x,y,impactsData);
    case "dis": return writeStatementDIS(doc,x,y,impactsData);
    case "eco": return writeStatementECO(doc,x,y,impactsData);
    case "geq": return writeStatementGEQ(doc,x,y,impactsData);
    case "ghg": return writeStatementGHG(doc,x,y,impactsData);
    case "haz": return writeStatementHAZ(doc,x,y,impactsData);
    case "knw": return writeStatementKNW(doc,x,y,impactsData);
    case "mat": return writeStatementMAT(doc,x,y,impactsData);
    case "nrg": return writeStatementNRG(doc,x,y,impactsData);
    case "soc": return writeStatementSOC(doc,x,y,impactsData);
    case "was": return writeStatementWAS(doc,x,y,impactsData);
    case "wat": return writeStatementWAT(doc,x,y,impactsData);
  }
}

export {exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV, exportIndicPDF};

function printValue(value,precision) {
  if (value==null) {return "-"}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}

function superscript(doc,x,y,text) {
  
}