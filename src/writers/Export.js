// La Société Nouvelle

// Modules
import { jsPDF } from 'jspdf';
import JSZip from "jszip";
import { saveAs } from 'file-saver';

// Fonts 

// Libs
import metaIndics from '../../lib/indics';

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



function generatePDF(indic, session, comparativeDivision, idProductionCanvas, idConsumptionCanvas, idValueCanvas) {

  const doc = new jsPDF('p', 'mm', 'a4', true);
  const { financialData, legalUnit } = session;

  let x = 20;

  // HEADER
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("RAPPORT - ANALYSE EXTRA-FINANCIERE", x, 20);
  doc.setDrawColor(247, 247, 247)
  doc.setLineWidth(2)
  doc.line(20, 25, 50, 25)

  doc.setTextColor(250, 89, 95);
  doc.setFontSize(14);
  doc.text((legalUnit.corporateName || " - "), x, 30);
  doc.setFontSize(10);
  //doc.text("Numéro de siren : "+(legalUnit.siren!="" ? legalUnit.siren : " - " ),10,y); 
  //y+=10;
  doc.setTextColor(0);
  doc.setFont("Helvetica", "normal")
  doc.text("Année de fin d'exercice : " + (session.year != null ? session.year : " - "), x, 45);
  let today = new Date();
  doc.text("Edition du : " + String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear(), x, 50);

  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);
  doc.text(metaIndics[indic].libelleGrandeur.toUpperCase(), x, 60);
  doc.setDrawColor(229, 219, 241);
  doc.setLineWidth(0)

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("SOLDES INTERMEDIAIRES DE GESTION", x, 70);

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
    capitalConsumption,
    netValueAdded } = financialData.aggregates;

  let xAmount = 150;
  let xValue = 170;
  let xUncertainty = 180;
  let y = 80;

  // first line table RGB(219, 222, 241)
  doc.setFillColor(219, 222, 241);
  doc.rect(20, 74, 180, 10, 'F');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont("Helvetica", "italic");
  doc.text("(*Valeur en " + metaIndics[indic].unit + ")", x + 2, y);
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text("Montant", xAmount - 13, y);
  doc.text("Valeur*", xValue - 8, y);
  doc.text("Incertitude", xUncertainty, y);

  // Production
  y += 10;
  doc.setFont("Helvetica", "bold");
  doc.text("Production", x, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(printValue(production.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(production.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(production.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Revenue
  y += 6;
  doc.text("\tdont Chiffre d'affaires", x, y);
  doc.setFontSize(8);
  doc.text(printValue(revenue.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(revenue.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(revenue.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Stock production
  y += 6;
  doc.text("\tdont Production stockée", x, y);
  doc.setFontSize(8);
  doc.text(printValue(storedProduction.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(storedProduction.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(storedProduction.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  // Immobilised production
  if (financialData.getImmobilisedProduction() > 0) {
    x += 6;
    doc.text("\tdont production immobilisée", x, 10);
    doc.setFontSize(8);
    doc.text(printValue(immobilisedProduction.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getValue(), 1), xValue, x, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, x, { align: "right" });
    doc.setFontSize(10);
  }

  doc.line(20, y + 2, 200, y + 2);

  y += 6;
  doc.setFont("Helvetica", "bold");
  doc.text("Consommations intermédiaires", x, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(printValue(intermediateConsumption.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  financialData.getIntermediateConsumptionsAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {
    const indicator = aggregate.footprint.indicators[indic];
    y += 6;
    doc.text("\t" + aggregate.accountLib, 20, y);
    doc.setFontSize(8);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
    doc.setFontSize(10);
  })

  doc.line(20, y + 2, 200, y + 2); // Depreciations

  y += 6;
  doc.setFont("Helvetica", "bold");
  doc.text("Dotations aux Amortissements sur immobilisations", 20, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(printValue(capitalConsumption.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(capitalConsumption.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  financialData.getFixedCapitalConsumptionsAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {
    const indicator = aggregate.footprint.indicators[indic];
    y += 6;
    doc.text("\t" + aggregate.accountLib, 20, y);
    doc.setFontSize(8);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(8);
    doc.text(printValue(indicator.getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
    doc.setFontSize(10);
  })

  doc.line(20, y + 2, 200, y + 2); // Net Value Added

  y += 6;
  doc.setFont("Helvetica", "bold");
  doc.text("Valeur ajoutée nette", 20, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text(printValue(netValueAdded.amount, 0) + " €", xAmount, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
  doc.setFontSize(8);
  doc.text(printValue(netValueAdded.footprint.indicators[indic].getUncertainty(), 0) + " %", xUncertainty + 13, y, { align: "right" });
  doc.setFontSize(10);

  doc.line(20, y + 2, 200, y + 2);

  y += 15;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("DECLARATION DES IMPACTS DIRECTS", x, y);
  doc.setFont("Helvetica", "normal");

  doc.setTextColor(0);
  doc.setFontSize(10);
  y += 10;
  getStatementNote(doc, 20, y, session.impactsData, indic);

  y += 20;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("NOTE D'ANALYSE", x, y);

  y += 5;

  let analyse = getAnalyse(indic, session);
  let text = "";
  {
    analyse.map((paragraph) => (
      text += '\n' + paragraph.reduce((a, b) => a + " " + b)
    ))
  }

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(doc.splitTextToSize(text, 180), x, y);

  // PAGE 2 
  doc.addPage();

  y = 20;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("COMPARAISONS ", x, y);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(82, 98, 188);

  {
    Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([code, libelle]) => (
        code == comparativeDivision && code !== "00" ? doc.text("Branche de référence : " + libelle, x, y + 10) : ""
      ))
  }

  y = 40;

  //Production canvas
  const pdfWidth = (doc.internal.pageSize.getWidth() / 3);

  let canvas = document.querySelector(idProductionCanvas);

  let canvasImg = canvas.toDataURL("image/png", 1.0);

  const imgProps = doc.getImageProperties(canvasImg);

  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(canvasImg, 'PNG', x, y, pdfWidth, pdfHeight, undefined, 'FAST');

  //Consumption canvas
  let canvasConsumption = document.querySelector(idConsumptionCanvas);
  let canvasConsumptionImg = canvasConsumption.toDataURL("image/png", 1.0);
  const imgConsumptionProps = doc.getImageProperties(canvasConsumptionImg);
  const pdfCHeight = (imgConsumptionProps.height * pdfWidth) / imgConsumptionProps.width;

  doc.addImage(canvasConsumptionImg, 'PNG', pdfWidth + 40, y, pdfWidth, pdfCHeight, undefined, 'FAST');

  y = 110;

  //Value canvas
  let canvasValue = document.querySelector(idValueCanvas);
  let canvasValueImg = canvasValue.toDataURL("image/png", 1.0);
  const imgValueProps = doc.getImageProperties(canvasValueImg);
  const pdfVHeight = (imgValueProps.height * pdfWidth) / imgValueProps.width;

  doc.addImage(canvasValueImg, 'PNG', x, y, pdfWidth, pdfVHeight);
  doc.setProperties({ title: "rapport_" + legalUnit.corporateName.replaceAll(" ", "") + "-" + indic.toUpperCase() })

  return doc;
}

function generateFootprintPDF(doc, indic, session, title, odds) {

  const { financialData, legalUnit } = session;
  doc.setProperties({ title: "rapport_empreinte_societale_" + legalUnit.corporateName.replaceAll(" ", "") })

  let x = 10;
  let y = 20;
  // HEADER
  doc.setFontSize(15);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("RAPPORT - " + title.toUpperCase(), x, y);

  // ODD PICTO
  let imgPos = 208;
  odds.forEach(element => {
    imgPos += 11;
    let img = new Image();
    img.src = '/resources/odds/print/F_SDG_PRINT-' + element + '.jpg';
    doc.addImage(img, "JPEG", imgPos, 15, 10, 10, undefined, 'FAST')

  });

  // Corporate Name
  y += 8;
  doc.setTextColor(250, 102, 106);
  doc.setFontSize(14);
  doc.text((legalUnit.corporateName.toUpperCase() || " - "), x, y);
  doc.setFontSize(10);

  y += 8;

  doc.setTextColor(0);
  doc.setFont("Helvetica", "normal")
  doc.text("Année de fin d'exercice : " + (session.year != null ? session.year : " - "), x, y);
  let today = new Date();

  y += 5;

  doc.text("Edition du : " + String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear(), x, y);

  y += 8;

  // TITLE
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("SOLDES INTERMEDIAIRES DE GESTION", x, y);

  y += 8;

  // TABLE 

  let xRect = x + 17;
  doc.setDrawColor(25, 21, 88);

  // LIBELLE
  indic.forEach(indic => {
    doc.rect(xRect += 35, y, 37, 8);
    let img = new Image();
    img.src = '/resources/icon-ese-bleues/print/' + indic + '.jpg';
    doc.addImage(img, "JPEG", xRect + 1, y + 1.5, 4.5, 4.5, undefined, 'FAST');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(metaIndics[indic].libelleGrandeur, 24), xRect + 18.5, y + 3.5, { align: "center" });
    xRect += 2;
  });

  y += 8;

  let height = 73;

  // Header table

  doc.setFillColor(240, 240, 248);
  doc.setDrawColor(240, 240, 248);
  doc.rect(x, y, 274, 10, 'FD');

  // AMOUNT
 
  doc.setFontSize(7);
  doc.text("Montant", 51, y + 6);

  height += 2; 

  let xUnit = x + 54;

  // UNITE
  indic.forEach(indic => {

    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(doc.splitTextToSize("Valeur\n" + metaIndics[indic].unit, 9), xUnit + 4.5, y + 5, { align: "center" });

    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(doc.splitTextToSize("Incertitude %", 9), xUnit + 17, y + 5, { align: "center" });

    doc.text(doc.splitTextToSize("Impact brut " + metaIndics[indic].unitAbsolute, 9), xUnit + 29, y + 5, { align: "center" });

    xUnit += 37;

  });
  
 

  // FINANCIAL DATA 

  const { production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded } = financialData.aggregates;


  let xAmount = 60;
  let xValue = x + 64;

  //Production

  y += 14;
  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text("Production", x + 2, y);
  doc.setFontSize(6);

  doc.text(printValue(production.amount, 0) + " €", xAmount, y, { align: "right" });


  indic.forEach(indic => {

    let nbDecimals = metaIndics[indic].nbDecimals;
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(printValue(production.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(printValue(production.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(production.footprint.indicators[indic].getGrossImpact(production.amount), nbDecimals), xValue + 24, y, { align: "right" });
    xValue += 37;

  });


  // Revenue

  xValue = x + 64;
  y += 4;
  doc.setFontSize(7);
  doc.text("dont Chiffre d'affaires", x + 2, y);
  doc.setFontSize(6);
  doc.text(printValue(revenue.amount, 0) + " €", xAmount, y, { align: "right" });


  indic.forEach(indic => {

    if (
      printValue(revenue.footprint.indicators[indic].getValue(), 1) != " - "
    ) {
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(255, 138, 142);
      doc.rect(xValue - 9, y - 2.5, 10, 3, 'F');
    }

    doc.setFontSize(6);
    doc.text(printValue(revenue.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });

    doc.setFont("Helvetica", "normal");

    doc.setFontSize(5);
    doc.text(printValue(revenue.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(revenue.footprint.indicators[indic].getGrossImpact(revenue.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

    xValue += 37;

  });

  // Stock production
  xValue = x + 64;

  y += 4;
  doc.setFontSize(7);
  doc.text("dont Production stockée", x + 2, y);

  doc.setFontSize(6);
  doc.text(printValue(storedProduction.amount, 0) + " €", xAmount, y, { align: "right" });

  indic.forEach(indic => {
    doc.setFontSize(6);
    doc.text(printValue(storedProduction.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(5);
    doc.text(printValue(storedProduction.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(storedProduction.footprint.indicators[indic].getGrossImpact(storedProduction.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

    xValue += 37;

  });

  height += 12;

  // // Immobilised production
  if (financialData.getImmobilisedProduction() > 0) {
    xValue = x + 64;
    y += 4;
    height += 4;

    doc.setFontSize(7);
    doc.text("dont Production immobilisée", x + 2, y);
    doc.setFontSize(6);

    doc.text(printValue(immobilisedProduction.amount, 0) + " €", xAmount, y, { align: "right" });

    indic.forEach(indic => {
      doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
      doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
      doc.text(printValue(immobilisedProduction.footprint.indicators[indic].getGrossImpact(immobilisedProduction.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

      xValue += 37;

    });
  }

  // CONSOMMATIONS INTERMEDIAIRES 
  y += 6;
  height += 9;

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text(doc.splitTextToSize("Consommations intermédiaires", 35), x + 2, y);

  doc.setFontSize(6);

  doc.text(printValue(intermediateConsumption.amount, 0) + " €", xAmount, y, { align: "right" });

  xValue = x + 64;
  indic.forEach(indic => {

    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(intermediateConsumption.footprint.indicators[indic].getGrossImpact(intermediateConsumption.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

    xValue += 37;

  });


  y+= 2.5;

  financialData.getIntermediateConsumptionsAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {
    
    height += 4;
    y += 4;
    doc.setFontSize(7);
    doc.text(aggregate.accountLib, x + 2, y);

    doc.setFontSize(6);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });

    xValue = x + 64;

    indic.forEach(indic => {

      let indicator = aggregate.footprint.indicators[indic];
      doc.setFontSize(6);
      doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
      doc.setFontSize(5);
      doc.text(printValue(indicator.getUncertainty(), 0) + " %", xValue + 12, y, { align: "right" });
      doc.text(printValue(indicator.getGrossImpact(aggregate.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

      xValue += 37;

    });

  })

  height += 8;
  y += 6;
  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text(doc.splitTextToSize("Dotations aux Amortissements sur immobilisations", 40), x + 2, y);
  doc.setFontSize(6);
  doc.text(printValue(capitalConsumption.amount, 0) + " €", xAmount, y, { align: "right" });
  xValue = x + 64;

  indic.forEach(indic => {
    doc.setFont("Helvetica", "bold");
    doc.text(printValue(capitalConsumption.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFont("Helvetica", "normal");
    doc.text(printValue(capitalConsumption.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(capitalConsumption.footprint.indicators[indic].getGrossImpact(capitalConsumption.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

    xValue += 37;

  });

  y += 6;
  
  financialData.getFixedCapitalConsumptionsAggregates().filter(aggregate => aggregate.amount != 0).forEach(aggregate => {

    height += 6;
    xValue = x + 64;
    doc.setFontSize(6);
    doc.text(doc.splitTextToSize(aggregate.accountLib, 35), x + 2, y);
    doc.text(printValue(aggregate.amount, 0) + " €", xAmount, y, { align: "right" });

    indic.forEach(indic => {

      let indicator = aggregate.footprint.indicators[indic];
      doc.setFontSize(6);
      doc.text(printValue(indicator.getValue(), 1), xValue, y, { align: "right" });
      doc.setFontSize(5);
      doc.text(printValue(indicator.getUncertainty(), 0) + " %", xValue + 12, y, { align: "right" });
      doc.text(printValue(indicator.getGrossImpact(aggregate.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

      xValue += 37;

    });
    y += 6;
  })

  y += 3;
  height += 8.5;

  doc.setFillColor(251, 251, 255);
  doc.setDrawColor(251, 251, 255);
  doc.rect(x, y - 3.5, 274, 6, 'FD');

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text("Valeur ajoutée nette", x + 2, y);

  doc.setFontSize(6);
  doc.text(printValue(netValueAdded.amount, 0) + " €", xAmount, y, { align: "right" });

  xValue = x + 64;
  indic.forEach(indic => {
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(printValue(netValueAdded.footprint.indicators[indic].getValue(), 1), xValue, y, { align: "right" });
    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(printValue(netValueAdded.footprint.indicators[indic].getUncertainty(), 0) + "%", xValue + 12, y, { align: "right" });
    doc.text(printValue(netValueAdded.footprint.indicators[indic].getGrossImpact(netValueAdded.amount), metaIndics[indic].nbDecimals), xValue + 24, y, { align: "right" });

    xValue += 37;


  });





  // BORDER  TABLE
  doc.setLineWidth(0.2);
  doc.setDrawColor(25, 21, 88);
  // TOP
  doc.line(x, 65, 284, 65);
  // LEFT
  doc.line(x, 65, x, height);
  // RIGHT 
  // BOTTOM 
  doc.line(x, height, 284, height);

  // COLUMNS 

  let xColumn = x+52;

  for (let index = 0; index < 7; index++) {

    doc.line(xColumn, 65, xColumn, height);


    doc.setLineWidth(0.1);
    doc.setDrawColor(216, 214, 226);
    
    doc.line(xColumn + 13, 65, xColumn + 13, height);
    doc.line(xColumn + 25, 65, xColumn + 25, height);

    
    doc.setLineWidth(0.2);
    doc.setDrawColor(25, 21, 88);
    xColumn += 37;
  }


  // BOTTOM PAGE 
  y = 152;
  y += 35;
  doc.setDrawColor(203);
  doc.line(x, y, 284, y);

  y += 5;

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(100);
  doc.text("Publiez votre performance globale !", x, y);

  y += 5;
  doc.setFont("Helvetica", "normal");
  doc.text("Nous vous invitons à valoriser votre performance extra-financière en publiant les valeurs associées à votre chiffre d’affaires (données encadrées dans le tableau ci-dessus). \nAucune donnée financière n’est communiquée, seul l’estimation vos impacts par euro de chiffre d’affaires est accessible.", x, y)

  y += 7;

  doc.text("Les données publiées sont accessibles librement, elles permettent à vos clients (et potentiels clients) de mesurer leurs impacts indirects associés à leurs factures, et elles contribuent à la construction d’une économie plus transparente.\n"
    + "Les données sont modifiables. Pour plus d’informations, contactez admin@lasocietenouvelle.org", x, y)
  return doc;
}

function exportIndicPDF(indic, session, comparativeDivision, idProductionCanvas, idConsumptionCanvas, idValueCanvas) {

  // PDF Export
  let doc = generatePDF(indic, session, comparativeDivision, idProductionCanvas, idConsumptionCanvas, idValueCanvas);

  window.open(doc.output("bloburl"), "_blank");
  
}

function exportFootprintPDF(session) {

  const doc = new jsPDF("landscape", 'mm', 'a4', true);

  const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
  const seIndic = ["eco", "art", "soc", "dis", "geq", "knw"];

  const seOdds = ["5", "8", "9", "10", "12"];
  const envOdds = ["6", "7", "12", "13", "14", "15"];

  // RAPPORT - EMPREINTE ENVIRONNEMENTALE

  generateFootprintPDF(doc, envIndic, session, "Empreinte environnementale", envOdds);

  doc.addPage();

  // RAPPORT - EMPREINTE ÉCONOMIQUE ET SOCIALE

  generateFootprintPDF(doc, seIndic, session, "Empreinte économique et sociale", seOdds);

  window.open(doc.output("bloburl"), "_blank");

}

async function downloadReport(indics, session, comparativeDivision) {

  const { legalUnit, year } = session;
  // Zip Export
  let zip = new JSZip();
  indics.map((indic) => {
    let doc = generatePDF(indic, session, comparativeDivision, '#print-Production-' + indic, '#print-Consumption-' + indic, '#print-Value-' + indic);
    zip.file("rapport_" + legalUnit.corporateName.replaceAll(" ", "") + "-" + indic.toUpperCase() + '.pdf', doc.output('blob'));
  }
  );

  // add 

  const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
  const seIndic = ["eco", "art", "soc", "dis", "geq", "knw"];

  const seOdds = ["5", "8", "9", "10", "12"];
  const envOdds = ["6", "7", "12", "13", "14", "15"];

  // RAPPORT - EMPREINTE ENVIRONNEMENTALE
  const docEnv = new jsPDF("landscape");
  generateFootprintPDF(docEnv, envIndic, session, "Empreinte environnementale", envOdds);
  zip.file("rapport_empreinte_environnementale_" + legalUnit.corporateName.replaceAll(" ", "") + '.pdf', docEnv.output('blob'));

  // RAPPORT - EMPREINTE ECONOMIQUE ET SOCIALE
  const docES = new jsPDF("landscape");
  generateFootprintPDF(docES, seIndic, session, "Empreinte économique et sociale", seOdds);
  zip.file("rapport_empreinte_es_" + legalUnit.corporateName.replaceAll(" ", "") + '.pdf', docES.output('blob'));

  // RAPPORT - EMPREINTE SOCIETALE

  const docEES = new jsPDF("landscape", 'mm', 'a4', true);

  // RAPPORT - EMPREINTE ENVIRONNEMENTALE

  generateFootprintPDF(docEES, envIndic, session, "Empreinte environnementale", envOdds);

  docEES.addPage();

  // RAPPORT - EMPREINTE ÉCONOMIQUE ET SOCIALE

  generateFootprintPDF(docEES, seIndic, session, "Empreinte économique et sociale", seOdds);

  zip.file("rapport_empreinte_societale_" + legalUnit.corporateName.replaceAll(" ", "") + '.pdf', docEES.output('blob'));

  // add .json file save 
  const fileName = "enregistrement-ese-" + legalUnit.corporateName.replaceAll(" ", "-");
  const json = JSON.stringify(session);


  // build download link & activate
  const blob = new Blob([json], { type: 'application/json' });
  zip.file(fileName + '.json', blob);

  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, 'livrables_' + legalUnit.corporateName.replaceAll(" ", "") + "_" + year + '.zip');
  });


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

export { exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV, exportIndicPDF, generatePDF, exportFootprintPDF, generateFootprintPDF, downloadReport };


