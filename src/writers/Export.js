// La Société Nouvelle

// Modules
import { jsPDF } from 'jspdf';

// Fonts 

// Libs
import metaIndics from '../../lib/indics';

// Sources
import { buildIndicatorAggregate } from '../formulas/footprintFormulas';

// Utils
import { printValue } from '/src/utils/Utils';

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


// Analysis writers
import { analysisTextWriterECO } from "../../src/writers/analysis/analysisTextWriterECO";
import { analysisTextWriterGHG } from "../../src/writers/analysis/analysisTextWriterGHG";
import { analysisTextWriterART } from "../../src/writers/analysis/analysisTextWriterART";
import { analysisTextWriterDIS } from "../../src/writers/analysis/analysisTextWriterDIS";
import { analysisTextWriterGEQ } from "../../src/writers/analysis/analysisTextWriterGEQ";
import { analysisTextWriterHAZ } from "../../src/writers/analysis/analysisTextWriterHAZ";
import { analysisTextWriterKNW } from "../../src/writers/analysis/analysisTextWriterKNW";
import { analysisTextWriterMAT } from "../../src/writers/analysis/analysisTextWriterMAT";
import { analysisTextWriterNRG } from "../../src/writers/analysis/analysisTextWriterNRG";
import { analysisTextWriterSOC } from "../../src/writers/analysis/analysisTextWriterSOC";
import { analysisTextWriterWAS } from "../../src/writers/analysis/analysisTextWriterWAS";
import { analysisTextWriterWAT } from "../../src/writers/analysis/analysisTextWriterWAT";

import divisions from "/lib/divisions";

function exportIndicDataExpensesCSV(indic, session) {

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "corporated_id;corporate_name;amount;value;uncertainty"

  let expenses = session.financialData.expenses;
  expenses.forEach((expense) => {
    csvContent += "\r\n";
    let indicator = expense.getFootprint().getIndicator(indic);
    let row = expense.getCorporateId() + ";" + expense.getCorporateName() + ";" + expense.getAmount() + ";" + indicator.getValue() + ";" + indicator.getUncertainty();
    csvContent += row;
  })

  return csvContent;
}

function exportIndicDataDepreciationsCSV(indic, session) {

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "corporated_id;corporate_name;amount;value;uncertainty"

  let depreciations = session.financialData.getDepreciations();
  depreciations.forEach((depreciation) => {
    csvContent += "\r\n";
    let indicator = depreciation.getFootprint().getIndicator(indic);
    let row = depreciation.getCorporateId() + ";" + depreciation.getCorporateName() + ";" + depreciation.getAmount() + ";" + indicator.getValue() + ";" + indicator.getUncertainty();
    csvContent += row;
  })

  return csvContent;
}

function exportIndicPDF(indic, session, comparativeDivision) {
  const doc = new jsPDF();
  const { financialData, legalUnit } = session;
  // 
  let x = 20;
  // HEADER
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("RAPPORT - ANALYSE EXTRA-FINANCIERE", x, 20);
  doc.setDrawColor(247, 247, 247) // draw red lines
  doc.setLineWidth(2)
  doc.line(20, 25, 50, 25)
  //let imgData = 'data:image/jpeg;base64,'+ Base64.encode('../public/resources/Logo_N&B.jpg');
  //let imgData = canvas.toDataURL('../public/resources/Logo_N&B.jpg');
  //doc.addImage(imgData, "JPEG", 100, 100, 50, 50);

  doc.setTextColor(250, 102, 106);
  doc.setFontSize(14);
  doc.text((legalUnit.corporateName || " - "), x, 35);
  doc.setFontSize(10);
  //doc.text("Numéro de siren : "+(legalUnit.siren!="" ? legalUnit.siren : " - " ),10,y); 
  //y+=10;
  doc.setTextColor(0);
  doc.setFont("Helvetica", "normal")
  doc.text("Année de fin d'exercice : " + (session.year != null ? session.year : " - "), x, 45);
  let today = new Date();
  doc.text("Edition du : " + String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear(), x, 50);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);
  doc.text(metaIndics[indic].libelleGrandeur.toUpperCase(), x, 60);
  doc.setDrawColor(229, 219, 241);
  doc.setLineWidth(0)


  /*
  x+=10;
  doc.setFontSize(10);
  doc.text("Compte de résultat",10,x);
  */

  /* ----- TABLE ----- */

  const { production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    storedPurchases,
    capitalConsumption,
    netValueAdded } = financialData.aggregates;

  let xNotes = 115;
  let xAmount = 150;
  let xValue = 170;
  let xUncertainty = 180;
  let y = 72;

  // first line table
  doc.setFillColor(229, 219, 241);
  doc.rect(20, 66, 180, 10, 'F');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont("Helvetica", "italic");
  doc.text("(en " + metaIndics[indic].unit + ")", x + 2, y);
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text("Notes", xNotes, y);
  doc.text("Montant", xAmount - 13, y);
  doc.text("Valeur", xValue - 8, y);
  doc.text("Incertitude", xUncertainty, y);


  // Production
  y += 10;
  doc.setFont("Helvetica", "bold");
  doc.text("Production", x, y);
  doc.setFont("Helvetica", "normal");
  doc.text(printValue(production.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(production.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(production.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Revenue
  y += 6;
  doc.text("\tdont Chiffre d'affaires", x, y);
  doc.text(printValue(revenue.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(revenue.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(revenue.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Stock production
  y += 6;
  doc.text("\tdont Production stockée", x, y);
  doc.text(printValue(storedProduction.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(storedProduction.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(storedProduction.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Immobilised production
  if (financialData.getImmobilisedProduction() > 0) {
    x += 6;
    doc.text("\tdont production immobilisée", x, 10);
    doc.text(printValue(immobilisedProduction.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getValue(), 1), xValue, x, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, x, { align: "right" });
    doc.setFontSize(10);
  }

  doc.line(20, y + 2, 200, y + 2);

  y += 6;
  doc.text("Consommations intermédiaires", x, y);
  doc.text(printValue(intermediateConsumption.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  if (storedPurchases.amount != 0) {
    y += 6;
    doc.text("\tVariation de stocks", 20, y);
    doc.text(printValue(storedPurchases.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.text(printValue(storedPurchases.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(storedPurchases.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
    doc.setFontSize(10);
  }

  financialData.getExternalExpensesAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {
    const indicator = aggregate.footprint.indicators[indic];
    y += 6;
    doc.text("\t" + aggregate.accountLib, 20, y);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
    doc.setFontSize(10);
  })

  doc.line(20, y + 2, 200, y + 2); // Depreciations

  y += 6;
  doc.text("Dotations aux Amortissements sur immobilisations", 20, y);
  doc.text(printValue(capitalConsumption.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  financialData.getBasicDepreciationExpensesAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {
    const indicator = aggregate.footprint.indicators[indic];
    y += 6;
    doc.text("\t" + aggregate.accountLib, 20, y);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
    doc.setFontSize(10);
  })

  doc.line(20, y + 2, 200, y + 2); // Net Value Added

  y += 6;
  doc.text("Valeur ajoutée nette", 20, y);
  doc.text(printValue(netValueAdded.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  doc.line(20, y + 2, 200, y + 2);

  y += 15;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);
  doc.text("DECLARATION", x, y);

  doc.setTextColor(0);
  doc.setFontSize(10);
  y += 10;
  getStatementNote(doc, 20, y, session.impactsData, indic);

  y += 20;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);
  doc.text("CLE DE CRYPTAGE", x, y);

  y += 10;

  // let analyse = getAnalyse(indic, session);
  // let text = "";
  // {
  //   analyse.map((paragraph) => (
  //     text += paragraph.reduce((a, b) => a + " " + b, "")
  //   ))
  // }

  // doc.setFontSize(10);
  // doc.setFont("Helvetica", "normal");
  // doc.setTextColor(0, 0, 0);
  // doc.text(doc.splitTextToSize(text, 150), x, y);

  // PAGE 2 
  doc.addPage();

  y = 20;
  doc.setTextColor(250, 102, 106);
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text("COMPARAISON ", x, y);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);
  
  {Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([code, libelle]) => (
      code == comparativeDivision ?  doc.text("Branche de référence : " + libelle, x, y + 10) : ""
    ))}

  y = 40;

  //Production canvas
  const pdfWidth = (doc.internal.pageSize.getWidth()/ 3);

  let canvas = document.querySelector('#Production');
  let canvasImg = canvas.toDataURL("image/png", 1.0);
  const imgProps = doc.getImageProperties(canvasImg);
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  console.log(pdfHeight);
  doc.addImage(canvasImg, 'PNG', x, y, pdfWidth, pdfHeight);

  //Consumption canvas
  let canvasConsumption = document.querySelector('#Consumption');
  let canvasConsumptionImg = canvasConsumption.toDataURL("image/png", 1.0);
  const imgConsumptionProps = doc.getImageProperties(canvasConsumptionImg);
  const pdfCHeight = (imgConsumptionProps.height * pdfWidth) / imgConsumptionProps.width;

  doc.addImage(canvasConsumptionImg, 'PNG', pdfWidth + 40, y, pdfWidth, pdfCHeight);

  y = 110;

  //Value canvas
  let canvasValue = document.querySelector('#Value');
  let canvasValueImg = canvasValue.toDataURL("image/png", 1.0);
  const imgValueProps = doc.getImageProperties(canvasValueImg);
  const pdfVHeight = (imgValueProps.height * pdfWidth) / imgValueProps.width;

  doc.addImage(canvasValueImg, 'PNG', x, y, pdfWidth, pdfVHeight);


  // Export
  doc.save("rapport_" + legalUnit.corporateName.replaceAll(" ", "") + "-" + indic.toUpperCase() + ".pdf");
 
}

const getAnalyse = (indic, session) => {
  switch (indic) {
    case "art":
      return analysisTextWriterART(session);
    case "dis":
      return analysisTextWriterDIS(session);
    case "eco":
      return analysisTextWriterECO(session);
    case "geq":
      return analysisTextWriterGEQ(session);
    case "ghg":
      return analysisTextWriterGHG(session);
    case "haz":
      return analysisTextWriterHAZ(session);
    case "knw":
      return analysisTextWriterKNW(session);
    case "mat":
      return analysisTextWriterMAT(session);
    case "nrg":
      return analysisTextWriterNRG(session);
    case "soc":
      return analysisTextWriterSOC(session);
    case "was":
      return analysisTextWriterWAS(session);
    case "wat":
      return analysisTextWriterWAT(session);
  }
}

const getStatementNote = (doc, x, y, impactsData, indic) => {
  switch (indic) {
    case "art": return writeStatementART(doc, x, y, impactsData);
    case "dis": return writeStatementDIS(doc, x, y, impactsData);
    case "eco": return writeStatementECO(doc, x, y, impactsData);
    case "geq": return writeStatementGEQ(doc, x, y, impactsData);
    case "ghg": return writeStatementGHG(doc, x, y, impactsData);
    case "haz": return writeStatementHAZ(doc, x, y, impactsData);
    case "knw": return writeStatementKNW(doc, x, y, impactsData);
    case "mat": return writeStatementMAT(doc, x, y, impactsData);
    case "nrg": return writeStatementNRG(doc, x, y, impactsData);
    case "soc": return writeStatementSOC(doc, x, y, impactsData);
    case "was": return writeStatementWAS(doc, x, y, impactsData);
    case "wat": return writeStatementWAT(doc, x, y, impactsData);
  }
}

export { exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV, exportIndicPDF };

/*function printValue(value,precision) {
  if (value==null) {return "-"}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}*/

function superscript(doc, x, y, text) {

}