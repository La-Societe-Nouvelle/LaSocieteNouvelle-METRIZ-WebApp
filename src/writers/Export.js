// La Société Nouvelle

// Libraries
import { metaAccounts } from '/lib/accounts';


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

import { metaIndicators } from '../../lib/indic';

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
  doc.text((session.getUniteLegale().corporateName || " - " ),10,y); 
  y+=10;
  doc.setFontSize(10);
  doc.setFont("Calibri","normal");
  doc.text("Numéro de siren : "+(session.legalUnit.siren!="" ? session.legalUnit.siren : " - " ),10,y); 
  y+=10;
  doc.text("Année de fin d'exercice : "+(session.getUniteLegale().year!=null ? session.getUniteLegale().year : " - " ),10,y); 
  y+=6;
  let today = new Date();
  doc.text("Edition du : "+String(today.getDate()).padStart(2,'0')+"/"+String(today.getMonth()+1).padStart(2,'0')+"/"+today.getFullYear(),10,y); 

  y+=20;
  doc.setFontSize(11);
  doc.setFont("Calibri","bold");
  doc.text(metaIndicators[indic].libelleGrandeur.toUpperCase(),10,y);
  doc.line(10,y+2,200,y+2);

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
  y+=15;
  doc.setFontSize(8);
  doc.setFont("Calibri","italic");
  doc.text("(en "+metaIndicators[indic].unit+")",10,y);
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
  doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,y+2,200,y+2);

  // Revenue
  y+=6;
  doc.text("\tdont Chiffre d'affaires",10,y);  doc.text(printValue(session.getRevenueFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getRevenueFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);
  doc.line(10,y+2,200,y+2);

  // Stock production
  y+=6;
  doc.text("\tdont Production stockée",10,y);
  doc.text(printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  // Immobilised production
  if (financialData.getImmobilisedProduction() > 0) {
    x+=6;
    doc.text("\tdont production immobilisée",10,x);
    doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getValue(),1),yValue+10,x,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,x,{align: "right"});
    doc.setFontSize(10);
  }
  
  doc.line(10,y+2,200,y+2);

  y+=6;
  doc.text("Consommations intermédiaires",10,y);
  doc.text(printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  if (financialData.getVariationPurchasesStocks() > 0) {
    y+=6;
    doc.text("Variation de stocks",10,y);
    doc.text(printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  }

  Object.entries(groupExpensesByAccounts(financialData.expenses)).forEach(([_,{account,accountLib}]) => {
    const indicator = session.getExpensesAccountIndicator(account,indic);
    y+=6;
    doc.text("\t"+accountLib,10,y);
    doc.text(printValue(indicator.getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  })

  doc.line(10,y+2,200,y+2); // Depreciations

  y+=6;
  doc.text("Dotations aux Amortissements sur immobilisations",10,y);
  doc.text(printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  Object.entries(groupDepreciationsByAccounts(financialData.depreciationExpenses)).map(([_,{account,accountLib}]) => {
    const indicator = session.getDepreciationsAccountIndicator(account,indic);
    y+=6;
    doc.text("\t"+accountLib,10,y);
    doc.text(printValue(indicator.getValue(),1),yValue+10,y,{align: "right"});
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
    doc.setFontSize(10);
  })
  
  doc.line(10,y+2,200,y+2); // Net Value Added

  y+=6;
  doc.text("Valeur ajoutée nette",10,y);
  doc.text(printValue(session.getNetValueAddedFootprint().getIndicator(indic).getValue(),1),yValue+10,y,{align: "right"});
  doc.setFontSize(8);
  doc.text(printValue(session.getNetValueAddedFootprint().getIndicator(indic).getUncertainty(),0)+" %",yUncertainty+13,y,{align: "right"});
  doc.setFontSize(10);

  doc.line(10,y+2,200,y+2);

  // Export
  doc.save("rapport_"+(session.legalUnit.siren!="" ? session.legalUnit.siren : "xxxxxxxxx")+"-"+indic.toUpperCase()+".pdf");

}

export {exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV, exportIndicPDF};

function printValue(value,precision) {
  if (value==null) {return "-"}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}

const groupExpensesByAccounts = (expenses) =>
{
  let expensesByAccounts = {};
  expenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,2);
    if (expensesByAccounts[account]==undefined) expensesByAccounts[account] = {...expense, account, accountLib: metaAccounts.accountsExpenses[account]};
    else expensesByAccounts[account].amount+= expense.amount;
  })
  return expensesByAccounts;
}

const groupDepreciationsByAccounts = (depreciationExpenses) =>
{
  let depreciationExpensesByAccounts = {};
  depreciationExpenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,5);
    if (depreciationExpensesByAccounts[account]==undefined) depreciationExpensesByAccounts[account] = {...expense, account, accountLib: metaAccounts.accountsDepreciationExpenses[account]};
    else depreciationExpensesByAccounts[account].amount+= expense.amount;
  })
  return depreciationExpensesByAccounts;
}