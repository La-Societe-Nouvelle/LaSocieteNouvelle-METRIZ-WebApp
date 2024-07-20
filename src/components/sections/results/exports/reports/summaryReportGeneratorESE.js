import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Metadata
import metaIndics from "/lib/indics.json";

// Utils
import { generateFooter, generateHeader, loadFonts } from "./utils/layout";
import { getChartImageData, loadImageAsDataURL } from "./utils";
import { getKeyIndics, isBetter, isWorst } from "../../utils";
import { roundValue } from "../../../../../utils/Utils";
import { getLabelPeriod } from "../../../../../utils/periodsUtils";
import { printValue } from "../../../../../utils/formatters";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const buildESEReport = async ({ session, period }) => 
{ 
  const {
    legalUnit,
    financialData,
    comparativeData,
    impactsData,
    validations
  } = session;

  // ---------------------------------------------------------------
  // global data

  const validatedIndics = validations[period.periodKey];

  const corporateName = legalUnit.corporateName;
  const { production } = financialData.mainAggregates;

  const keyIndics = getKeyIndics(comparativeData.comparativeDivision);
  const indicatorLabels = getIndicatorLabels();
  const indicatorUnits = getIndicatorUnits();
  const absoluteUnits = getIndicatorAbsoluteUnit();

  const valuableIndics = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const improvementIndics = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);

  // ---------------------------------------------------------------
  // Charts

  const indicatorCharts = await getIndicatorCharts(validatedIndics);

  // ---------------------------------------------------------------
  // Page Property

  // Colors
  const colors = {
    primary : "#191558",
    secondary : "#fa595f",
    text : "#191558",
    light : "#ededff",
  }

  // Page size
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };

  // ---------------------------------------------------------------
  // Content

  const content = 
  [
    // Page 1 - Graphiques récapitulatifs ----------------------------------------------------------------- //
    {
      text: "Empreinte Sociétale de l'Entreprise",
      style: "h1",
    },
    ...createSocialFootprintCharts(indicatorLabels, indicatorCharts),

    // Page 2 - Tableau des données + impacts directs déclarées ------------------------------------------- //

    { text: '', pageBreak: 'after' },
    { text: "Tableau des résultats", style: "h2", },
    createSocialFootprintTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Caractéristiques des opérations de l'entreprise", style: "h2" },
    createStatementsTable(impactsData, period, validations, indicatorLabels, absoluteUnits, keyIndics),

    // Page 3 - Analyses ---------------------------------------------------------------------------------- //

    { text: '', pageBreak: 'after' },
    { text: "Suivi des objectifs sectoriels 2030", style: "h2" },
    createSectorTargetsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Indicateurs à valoriser", style: "h2" },
    ...valuableIndics.length>0 ? [
      createValuableIndicatorsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    ] : [
      { text: "Sur aucun des indicateurs mesurés, l'empreinte de l'entreprise est meilleure que celle de la branche.", style: "paragraph"},
    ],
    ...improvementIndics.length>0 ? [
      { text: "Points d'améliorations", style: "h2" },
      createImprovementTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData)
    ] : [],

    // ---------------------------------------------------------------------------------------------------- //
  ];

  // ---------------------------------------------------------------
  // Document definition

  const docDefinition = {
    pageSize,
    pageMargins: [40, 40, 40, 50],
    header: generateHeader(corporateName, legalUnit.siren, period),
    footer: generateFooter(""),
    info: {
      title: "",
      author: "",
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content,
    defaultStyle: {
      color: colors.text,
      font: "Roboto",
    },
    styles: {
      h1: {
        bold: true,
        color: colors.primary,
        font: "Raleway",
        margin: [0, 0, 0, 20],
        alignment: "center",
        fontSize: 20
      },
      h2: {
        bold: true,
        margin: [0, 10, 0, 10],
        color: colors.primary,
        font: "Raleway",
        border: "2px"
      },
      h3: {
        bold: true,
        margin: [0, 0, 0, 10],
        fontSize: 8,
        color: colors.primary,
        font: "Raleway",
      },
      table: {
        margin: [0, 10, 0, 10],
        fontSize: 6,
      },
      unit: {
        fontSize: 5,
        alignment: "right"
      },
      tableHeader: {
        fillColor: colors.light,
        margin: [0, 5, 0, 5],
        bold : true
      },
      tableHeaderDark: {
        fillColor: colors.primary,
        color : "#FFF",
        margin: [0, 5, 0, 5],
        bold : true
      },
      darkBackground : {
        fillColor: colors.primary,
        color : "#FFF",
        bold : true,
      },
      data: {
        alignment: "right"
      },
      paragraph: {
        bold: false,
        color: colors.primary,
        font: "Raleway",
        margin: [0, 0, 0, 20],
        alignment: "left",
        fontSize: 8
      },
    },
  };

  const ESEReport = pdfMake.createPdf(docDefinition);

  return ESEReport;
};

// ################################################################################################################ //
// ################################################## COMPONENTS ################################################## //
// ################################################################################################################ //

// ----------------------------------------------------------------------------------------------------
// Footprint charts

const createSocialFootprintCharts = (indicatorLabels, indicatorImages) => {
  const content = [];

  Object.keys(indicatorImages).forEach(category => {
    
    // title category
    const title = createTableTitle(category);
    content.push(title);

    let currentRow = [];
    indicatorImages[category].forEach(({indic,image}, index) => {

      // indic footprint chart
      currentRow.push({
        margin: [0, 10],
        stack: [
          { text: splitTitle(indicatorLabels[indic]), style: "h3", alignment: "center" },
          { image: image, width: 100, alignment: "center" }
        ],
      });

      if ((index + 1) % 3 === 0 || index === indicatorImages[category].length - 1) {
        content.push({ columns: currentRow, columnGap: 10 });
        currentRow = [];
      }
    });
  });

  return content;
};

// ----------------------------------------------------------------------------------------------------
// Footprint data table

const createSocialFootprintTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const showPrevPeriod = false;

  const tableBody = [
    [
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: getLabelPeriod(period), colSpan: 2, border: [true, true, true, true], style : "darkBackground", alignment : "center" },
      ...showPrevPeriod ? [
        { text: '', border: [false, false, false, false] },
        { text: "Année N-1", colSpan: 2, border: [true, true, true, true], alignment : "center" }
      ] : [],
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
    ],
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader', alignment: "center" },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Incertitude', style: 'tableHeader' },
      ...showPrevPeriod ? [
        { text: 'Empreinte', style: 'tableHeader' },
        { text: 'Incertitude', style: 'tableHeader' }
      ] : [],
      { text: 'Moyenne\nBranche', style: 'tableHeader', alignment: "center" },
      { text: 'Objectif\nsectoriel', style: 'tableHeader', alignment: "center" }
    ],
  ];

  const indics = ["eco","soc","art","idr","geq","knw","ghg","nrg","wat","mat","was","haz"]; // ordered

  indics.forEach(indic => {
    tableBody.push([
      { text: indicatorLabels[indic], alignment: "left" },
      { text: indicatorUnits[indic], style: 'unit' },
      keyIndics.includes(indic) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
      { text: getFootprintValue(production, period, indic) ? `${getFootprintValue(production, period, indic)}` : "-", style: 'data' },
      { text: getUncertainty(production, period, indic) ? `${getUncertainty(production, period, indic)} %` : "-", style: 'data', fontSize : 5 },
      ...showPrevPeriod ? [
        { text: getFootprintValue(production, period, indic) ? `${getFootprintValue(production, period, indic)}` : "-", style: 'data' },
        { text: getUncertainty(production, period, indic) ? `${getUncertainty(production, period, indic)} %` : "-", style: 'data', fontSize : 5 }
      ] : [],
      { text: getBranchValue(comparativeData, indic) ? `${getBranchValue(comparativeData, indic)}` : " - ", style: 'data' },
      { text: getTargetValue(comparativeData, indic) ? getTargetValue(comparativeData, indic) : "-", style: 'data' },
    ]);
  });

  return {
    table: {
      headerRows: 2,
      widths: ["*", 'auto', 'auto', 'auto', 'auto', ...showPrevPeriod ? ['auto', 'auto'] : [], 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === 2 || i === 5 || i === 8 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return (i === 5 || i === 8) ? '#ededff' : '#191558';
      },
      vLineWidth: function (i, node) {
        if ((i == 3 || i == 5 || (showPrevPeriod && i == 7))) {
          return 0.5;
        } else {
          return 0;
        }
      },
      vLineColor: function (i, node) {
        return '#191558';
      },
      paddingTop: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
      paddingBottom: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
    },
    style: 'table',
    margin: [0, 0, 0, 25]
  };
};

// ----------------------------------------------------------------------------------------------------
// Statements table

const createStatementsTable = (impactsData, period, validations) => {

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Déclaration', style: 'tableHeader', alignment: "center" },
      { text: 'Incertitude', style: 'tableHeader' },
    ],
  ];

  const indics = ["eco","soc","art","idr","geq","knw","ghg","nrg","wat","mat","was","haz"]; // ordered

  indics.forEach(indic => {
    const {statement,uncertainty} = getStatementData(impactsData, period, validations, indic);
    tableBody.push([
      { text: metaIndics[indic].libelleDeclaration, alignment: "left" },
      { text: metaIndics[indic].unitDeclaration, style: 'unit' },
      { text: statement, style: 'data' },
      { text: uncertainty, style: 'data', fontSize : 5 },
    ]);
  });

  return {
    table: {
      headerRows: 2,
      widths: ["*", 'auto', 50,'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return '#191558';
      },
      vLineWidth: function (i, node) {
        return 0;
      },
      vLineColor: function (i, node) {
        return '#191558';
      },
      paddingTop: function (i, node) { return 3; },
      paddingBottom: function (i, node) { return 3; },
    },
    style: 'table',
    margin: [0, 0, 0, 10],
  };
};

// ----------------------------------------------------------------------------------------------------
// Targets table

const createSectorTargetsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => 
{
  const indicsWithTarget = Object.keys(indicatorLabels).filter(key => getTargetValue(comparativeData, key) !== null);

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#36c575" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader', alignment: "center" },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Objectif\nsectoriel', style: 'tableHeader', alignment: "center" },
      { text: "Effort à fournir\nd'ici 2030", style: 'tableHeaderDark', alignment: "center" },
    ],
  ];

  const sortTargets = (a,b) => 
  {
    const targetValueA = getTargetValue(comparativeData, a);
    const footprintValueA = getFootprintValue(production, period, a);
    const isTargetAchievedA = footprintValueA ? !isWorst(a, footprintValueA, targetValueA, 1) : null;

    const targetValueB = getTargetValue(comparativeData, b);
    const footprintValueB = getFootprintValue(production, period, b);
    const isTargetAchievedB = footprintValueB ? !isWorst(b, footprintValueB, targetValueB, 1) : null;

    if (isTargetAchievedA === true && isTargetAchievedB !== true) {
      return -1;
    } else if (isTargetAchievedB === true && isTargetAchievedA !== true) {
      return 1;
    } else {
      const effortA = getEffortPercentage(footprintValueA, targetValueA);
      const effortB = getEffortPercentage(footprintValueB, targetValueB);
      return Math.abs(effortB) - Math.abs(effortA);
    }
  }

  indicsWithTarget
    .sort((a, b) => sortTargets(a,b))
    .forEach(key => 
    {
      const targetValue = getTargetValue(comparativeData, key);
      const footprintValue = getFootprintValue(production, period, key);
      const isTargetAchieved = footprintValue ? !isWorst(key, footprintValue, targetValue, 1) : null;
      const effort = getEffortPercentage(footprintValue, targetValue);

      tableBody.push([
        { text: indicatorLabels[key] },
        { text: indicatorUnits[key], style: 'unit' },
        keyIndics.includes(key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
        { text: footprintValue ? `${footprintValue}` : "-", style: 'data' },
        { text: `${targetValue}`, style: 'data' },
        isTargetAchieved === true ? {
          columns: [
            { width: '*', text: "" },
            { svg: checkIcon, width: 7, height: 7 },
            { width: 'auto', text: "atteint", alignment: "center" }
          ]
        } : { text: isTargetAchieved === null ? "-" : `${effort > 0 ? '+ ' : '- '}${roundValue(Math.abs(effort), 0)} %`, style: 'data' }
      ]);
    });

  return {
    table: {
      headerRows: 1,
      widths: ["*", 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
};

// ----------------------------------------------------------------------------------------------------
// Valuable indicators table

const createValuableIndicatorsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => 
{
  const valuableIndics = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader', alignment: "center" },
      { text: 'Ecart par rapport\nà la branche', style: 'tableHeaderDark', alignment: "center" },
    ],
  ];

  const sortIndics = (a,b) => {
    // indic A
    const indicatorValueA = getFootprintValue(production, period, a);
    const indicatorValueB = getFootprintValue(production, period, b);
    // indic B
    const branchValueA = getBranchValue(comparativeData, a);
    const branchValueB = getBranchValue(comparativeData, b);
    // gap
    const marginPercentageA = getMarginPercentage(indicatorValueA, branchValueA);
    const marginPercentageB = getMarginPercentage(indicatorValueB, branchValueB);
    return Math.abs(marginPercentageB) - Math.abs(marginPercentageA);
  }

  valuableIndics
    .sort((a, b) => sortIndics(a,b))
    .forEach(indic => 
    {
      const indicatorValue = getFootprintValue(production, period, indic);
      const branchValue = getBranchValue(comparativeData, indic);
      const marginPercentage = getMarginPercentage(indicatorValue, branchValue);
  
      tableBody.push([
        { text: indicatorLabels[indic] },
        { text: indicatorUnits[indic], style: 'unit' },
        keyIndics.includes(indic) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
        { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+ ' : '- '}${roundValue(Math.abs(marginPercentage), 0)} %`, style: 'data' },
      ]);
    });

  return {
    table: {
      headerRows: 1,
      widths: ["*", 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
};

// ----------------------------------------------------------------------------------------------------
// Improvement indicators table

const createImprovementTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => 
{
  const improvementIndics = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader', alignment: "center" },
      { text: 'Ecart par rapport\nà la branche', style: 'tableHeaderDark', alignment: "center" },
    ],
  ];

  const sortIndics = (a,b) => 
  {
    // sort if one of the indic is a sector specific issue (and not the other one)
    if (keyIndics.includes(a) !== keyIndics.includes(b)) {
      return keyIndics.includes(a) ? -1 : 1;
    } 

    // sort based on gap with branch
    else {
      // indic A
      const indicatorValueA = getFootprintValue(production, period, a);
      const branchValueA = getBranchValue(comparativeData, a);
      // indic B
      const indicatorValueB = getFootprintValue(production, period, b);
      const branchValueB = getBranchValue(comparativeData, b);
      // gap
      const marginPercentageA = getMarginPercentage(indicatorValueA, branchValueA);
      const marginPercentageB = getMarginPercentage(indicatorValueB, branchValueB);
      return Math.abs(marginPercentageB) - Math.abs(marginPercentageA);
    }
  }

  improvementIndics
    .sort((a, b) => sortIndics(a,b))
    .forEach(key => 
    {
      const indicatorValue = getFootprintValue(production, period, key);
      const branchValue = getBranchValue(comparativeData, key);
      const marginPercentage = getMarginPercentage(indicatorValue, branchValue);

      tableBody.push([
        { text: indicatorLabels[key] },
        { text: indicatorUnits[key], style: 'unit' },
        keyIndics.includes(key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
        { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+ ' : '- '}${roundValue(Math.abs(marginPercentage), 0)} %`, style: 'data' },
      ]);
    });

  return {
    table: {
      headerRows: 1,
      widths: ["*", 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
};  

// ########################################################################################################### //
// ################################################## UTILS ################################################## //
// ########################################################################################################### //

// --------------------------------------------------
// Getters - Footprint data

const getFootprintValue = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].value;
const getUncertainty = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].uncertainty;

const getStatementData = (impactsData, period, validations, indic) => 
{
  const { nbDecimals, statementUnits } = metaIndics[indic];
  const impactsDataOnPeriod = impactsData[period.periodKey];
  if (validations[period.periodKey].includes(indic))
  {
    switch(indic) {
      case "eco": return {
        statement: printValue(impactsDataOnPeriod.domesticProduction, 0),
        uncertainty: ""
      }
      case "soc": return {
        statement: impactsDataOnPeriod.hasSocialPurpose ? "Oui" : "Non",
        uncertainty: ""
      }
      case "art": return {
        statement: impactsDataOnPeriod.craftedProduction > 0 ? "Oui" : "Non",
        uncertainty: ""
      }
      case "idr": return {
        statement: printValue(impactsDataOnPeriod.interdecileRange, 1),
        uncertainty: ""
      }
      case "geq": return {
        statement: impactsDataOnPeriod.wageGap,
        uncertainty: ""
      }
      case "knw": return {
        statement: printValue(impactsDataOnPeriod.researchAndTrainingContribution, 0),
        uncertainty: ""
      }
      case "ghg": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.greenhouseGasEmissions)*statementUnits[impactsDataOnPeriod.greenhouseGasEmissionsUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.greenhouseGasEmissionsUncertainty, 0)+" %"
      }
      case "nrg": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.energyConsumption)*statementUnits[impactsDataOnPeriod.energyConsumptionUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.energyConsumptionUncertainty, 0)+" %"
      }
      case "wat": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.waterConsumption)*statementUnits[impactsDataOnPeriod.waterConsumptionUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.waterConsumptionUncertainty, 0)+" %"
      }
      case "mat": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.materialsExtraction)*statementUnits[impactsDataOnPeriod.materialsExtractionUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.materialsExtractionUncertainty, 0)+" %"
      }
      case "was": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.wasteProduction)*statementUnits[impactsDataOnPeriod.wasteProductionUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.wasteProductionUncertainty, 0)+" %"
      }
      case "haz": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.hazardousSubstancesUse)*statementUnits[impactsDataOnPeriod.hazardousSubstancesUseUnit].coef, nbDecimals),
        uncertainty: printValue(impactsDataOnPeriod.hazardousSubstancesUseUncertainty, 0)+" %"
      }
      default: return {
        statement: "-",
        uncertainty: ""
      }
    }
  } else {
    return {
      statement: "-",
      uncertainty: ""
    };
  }
};
const getBranchValue = (comparativeData, key) => comparativeData.production.division.history.data[key]?.slice(-1)[0].value;
const getTargetValue = (comparativeData, key) => {
  const targetData = comparativeData.production.division.target.data[key];

  if (!targetData || targetData.length === 0) {
    return null;
  }

  const geoData = targetData.filter(item => item.path === "GEO");

  if (geoData.length === 0) {
    return null;
  }

  return geoData.slice(-1)[0].value;
};

// ----------------------------------------------------------------------------------

const getIndicatorLabels = () => {
  const indicatorLabels = {};
  Object.keys(metaIndics).forEach(key => {
    indicatorLabels[key] = metaIndics[key].libelle;
  });
  return indicatorLabels;
};
const getIndicatorUnits = () => {
  const indicatorUnits = {};
  Object.keys(metaIndics).forEach(key => {
    indicatorUnits[key] = metaIndics[key].unit;
  });
  return indicatorUnits;
};
const getIndicatorAbsoluteUnit = () => {
  const absoluteUnits = {};
  Object.keys(metaIndics).forEach(key => {
    absoluteUnits[key] = metaIndics[key].unitAbsolute;
  });
  return absoluteUnits;
};

const getIndicatorCharts = async (validatedIndics) => {

  const indicatorCharts = {
    "Création de la valeur": [],
    "Empreinte sociale": [],
    "Empreinte environnementale": []
  };

  const defaultIllustrations = {
    "proportion": "/no-data-doughnutchart.png", 
    "indice": "/no-data-barchart.png",
    "intensité": "/no-data-barchart.png"
  };

  await Promise.all(Object.keys(metaIndics).map(async (indic) => {
    const { category, type } = metaIndics[indic];
    if (validatedIndics.includes(indic)) {
      const id = `socialfootprintvisual_${indic}-print`;
      const image = getChartImageData(id);
      indicatorCharts[category].push({ indic, image });  
    } else {
      const image = await loadImageAsDataURL(defaultIllustrations[type])
      indicatorCharts[category].push({ indic, image });
    }
  }));

  return indicatorCharts;
};

const getValuableIndicators = (production, period, indicatorLabels, keyIndics, comparativeData) => {
  return Object.keys(indicatorLabels).filter(key => {
    const footprintValue = getFootprintValue(production, period, key);
    const branchValue = getBranchValue(comparativeData, key);


    return footprintValue !== null && branchValue !== null && isBetter(key, footprintValue, branchValue, 10);
  });
};

const getImprovementIndicators = (production, period, indicatorLabels, keyIndics, comparativeData) => {
  return Object.keys(indicatorLabels).filter(key => {
    const footprintValue = getFootprintValue(production, period, key);
    const branchValue = getBranchValue(comparativeData, key);

    return footprintValue !== null && branchValue !== null && isWorst(key, footprintValue, branchValue, 0);
  });
};

const getNationalTargets = (indicatorLabels, comparativeData) => {
  return Object.keys(indicatorLabels).filter(key => {
    return getTargetValue(comparativeData, key) !== null;
  });
};
// ----------------------------------------------------------------------------------

const getEffortPercentage = (currentValue, targetValue) => {
  if (currentValue !== null && targetValue !== null && currentValue !== 0) {
    const effortPercentage = ((targetValue - currentValue) / currentValue * 100).toFixed(1);
    return effortPercentage;
  }
  return '-';
};

const getMarginPercentage = (indicatorValue, referenceValue) => {
  if (indicatorValue !== null && referenceValue !== null && referenceValue !== 0) {
    const percentageValue = ((indicatorValue - referenceValue) / referenceValue * 100).toFixed(1);
    return percentageValue;
  }
  return '-';
};

const createTableTitle = (label) => {

  const tableBody = [
    [{ 
      text: label, 
      style: {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 10],
        color: "#fa595f",
        font: "Raleway",
        border: "2px"
      }, 
      alignment: "left" 
    }]
  ];

  return {
    table: {
      headerRows: 1,
      widths: ["*"],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return '#fa595f';
      },
      vLineWidth: function (i, node) { return 0 },
      vLineColor: function (i, node) { return '#fa595f' },
      paddingTop: function (i, node) { return 2 },
      paddingBottom: function (i, node) { return 2 },
    },
    margin: [0, 10, 0, 10],
  };
};


const tableLayout = () => {
  return {
    hLineWidth: function (i, node) {
      return (i === 0 || i === 1 | i === node.table.body.length) ? 0.5 : 0;
    },
    hLineColor: function (i, node) {
      return '#191558';
    },
    vLineWidth: function (i, node) {
      return 0;
    },
    vLineColor: function (i, node) {
      return '#191558';
    },
    paddingTop: function (i, node) { return (i === 0) ? 1 : 3; },
    paddingBottom: function (i, node) { return (i === 0) ? 1 : 3; },
  };
}

// ----------------------------- Utils ----------------------------------------------

const splitTitle = (title) => {
  const words = title.split(' ');
  const middle = Math.ceil(words.length / 2);
  return words.slice(0, middle).join(' ') + '\n' + words.slice(middle).join(' ');
};








