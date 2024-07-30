// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import metaIndics from "/lib/indics";
import styles from "/lib/styles"
import metaTargets from "/lib/target";
import metaTrends from "/lib/trend.json";

// Utils
import { createSIGtableSection } from "./utils/createSIGtableSection";
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";
import { generateFooter, generateHeader, loadFonts } from "./utils/layout";
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from "/src/formulas/aggregatesBuilder";
import { getStatementNote } from "/src/utils/Writers";
import { getChartImageData, getTransparentProviders } from "./utils";
import { printValue } from "/src/utils/formatters";
import { getPrevPeriod } from "../../../../../utils/periodsUtils";
import { getEffortPercentage } from "./summaryReportGeneratorESE";


// --------------------------------------------------------------------------
//  Indicator Report
// --------------------------------------------------------------------------

pdfMake.vfs = pdfFonts.pdfMake.vfs;

//Call function to load fonts
loadFonts();

export const buildStandardReport = async ({
  session,
  indic,
  period,
  showAnalyses,
}) => {
  // Session data --------------------------------------------------

  const { legalUnit, financialData, impactsData, comparativeData, analysis, availablePeriods } = session;

  const { mainAggregates, productionAggregates, providers } = financialData;
  const { production, intermediateConsumptions, fixedCapitalConsumptions } = mainAggregates;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);

  // get Intermediate Aggregates
  const intermediateConsumptionsAggregates = await buildIntermediateConsumptionsAggregates(financialData, [period]);
  const fixedCapitalConsumptionsAggregates = await buildFixedCapitalConsumptionsAggregates(financialData, [period]);

  const transparentProviders = getTransparentProviders(providers, period, indic);

  const prevPeriod = getPrevPeriod(availablePeriods, period);

  // Metadata ------------------------------------------------------

  const { libelle, unit, precision, unitDeclaration, libelleDeclaration, libelleIndirect } = metaIndics[indic];
  // ---------------------------------------------------------------
  // Charts

  const productionChart = getChartImageData(`comparative-chart-production-${indic}-print`);
  const valueAddedChart = getChartImageData(`comparative-chart-netValueAdded-${indic}-print`);
  const intermediateConsumptionsChart = getChartImageData(`comparative-chart-intermediateConsumptions-${indic}-print`);
  const fixedCapitalConsumptionsChart = getChartImageData(`comparative-chart-fixedCapitalConsumptions-${indic}-print`);

  const targetValueAddedChart = getChartImageData(`target-comparative-chart-netValueAdded-${indic}-print`);
  const targetIntermediateConsumptionsChart = getChartImageData(`target-comparative-chart-intermediateConsumptions-${indic}-print`);
  const targetFixedCapitalConsumptionsChart = getChartImageData(`target-comparative-chart-fixedCapitalConsumptions-${indic}-print`);


  const trendChart = getChartImageData(`trend-chart-${indic}-print`)

  //

  const statementValue = getStatementValue(impactsData, period, indic);
  const indirectImpact = getIndirectImpact(intermediateConsumptions, fixedCapitalConsumptions, period, indic);
  const statementNotes = getStatementNote(impactsData[period.periodKey], indic);

  const analysisNotes =
    analysis[period.periodKey][indic]?.isAvailable && showAnalyses
      ? analysis[period.periodKey][indic].analysis
      : " - ";

  // ---------------------------------------------------------------
  // Colors

  const { colors } = styles["default"];

  // ---------------------------------------------------------------
  // Document Property

  const documentTitle =
    "Rapport_" +
    currentPeriod +
    "_" +
    legalUnit.corporateName.replaceAll(" ", "") +
    "-" +
    indic.toUpperCase();


  // ---------------------------------------------------------------
  // Content

  const content = [
    {
      text: `${libelle}`,
      style: "h1",
    },
    createKeyFigures(indirectImpact, statementValue, unitDeclaration, libelleDeclaration, libelleIndirect, production, period, prevPeriod, indic, unit, colors),

    //
    createSectionTitle("Tableau des résultats", colors),

    //
    createSIGtableSection(comparativeData, mainAggregates, productionAggregates, indic, unit, intermediateConsumptionsAggregates, fixedCapitalConsumptionsAggregates, period, precision, colors),
    {
      text: "Déclaration",
      style: "h2",
    },
    statementNotes.map((note) => note),
    {
      text: `${libelleIndirect} : ${indirectImpact.value} ${indirectImpact.unit}`,
    },
    createSectionTitle("Analyse de la performance", colors),

    createProductionSection(period, indic,unit,precision, colors,production, comparativeData,productionChart, analysisNotes),

    { text: '', pageBreak: 'after' },
    createSectionTitle("Détails de la performance", colors),

    createFinancialChartsSection(
      valueAddedChart,
      intermediateConsumptionsChart,
      fixedCapitalConsumptionsChart
    ),
    createAggregatesTableSection(comparativeData, mainAggregates, indic, unit, period, precision, colors),
    createSectionTitle("Suivi de l'objectif sectoriel", colors),
    createFinancialChartsSection(
      targetValueAddedChart,
      targetIntermediateConsumptionsChart,
      targetFixedCapitalConsumptionsChart
    ),

    createTargetTableSection(comparativeData, mainAggregates, indic, unit, period, precision, colors),
    { text: '', pageBreak: 'after' },
    createSectionTitle("Evolution de la performance", colors),
    {
      image: trendChart,
      width: 515,
      alignment: "center",
      margin: [0, 0, 0, 20]
    },

    {
      text: "Tendance de la branche :",
      style: "h2",
    },

    {
      text: "La courbe de tendance correspond à une projection des empreintes observées sur les dix dernières années.Les valeurs actuelles " +
        "s'appuient sur l'hypothèse d’une structure macroéconomique inchangée.Des travaux sont en cours pour proposer des valeurs tenant compte de l’évolution tendancielle de la structure de " +
        "l'économie nationale, ses interactions avec l’extérieur et de la dynamique des prix par branche."
    },
    {
      text: `Source : ${metaTrends[indic].source}`, margin: [0, 5, 0, 10], style: "legendText"
    },

    {
      text: "Objectif de la branche :",
      style: "h2",
    },
    {
      text: metaTargets[indic] ? metaTargets[indic].info : "Aucun objectif défini."
    },
    {
      text: metaTargets[indic] ? `Source : ${metaTargets[indic].source}` : "", style: "legendText", margin: [0, 5, 0, 10]
    },


    { text: '', pageBreak: 'after' },
    createSectionTitle("Empreinte des principaux fournisseurs", colors),
    createMainProvidersTable(providers, period, indic),
    ...transparentProviders.length > 0 ? [
      { text: "Fournisseurs ayant publié leur empreinte", style: "h2" },
      createPublishedProvidersTable(providers, period),
    ] : [],

  ];

  // ---------------------------------------------------------------
  // PDF Content and Layout
  const docDefinition = {
    pageSize: pdfPageSize,
    pageMargins: [
      pdfMargins.left,
      pdfMargins.top,
      pdfMargins.right,
      pdfMargins.bottom,
    ],
    header: generateHeader(corporateName, legalUnit.siren, period, colors),
    footer: generateFooter(colors),
    info: {
      libelle: documentTitle,
      author: legalUnit.corporateName,
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content,
    // ---------------------------------------------------------------------------
    // Style
    defaultStyle: {
      color: colors.text,
      font: "Roboto",
      fontSize: 7,
      alignment: "justify"
    },
    styles: {
      h1: {
        bold: true,
        color: colors.primary,
        font: "Raleway",
        margin: [0, 10, 0, 20],
        alignment: "center",
        fontSize: 15
      },
      h2: {
        bold: true,
        margin: [0, 0, 0, 10],
        fontSize: 8,
        color: colors.primary,
        font: "Raleway",
      },
      h3: {
        bold: true,
        margin: [0, 0, 0, 10],
        color: colors.primary,
        font: "Raleway",
      },
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: colors.primary,
        font: "Raleway",
        border: "2px"
      },
      keyNumber: {
        fontSize: 14,
        bold: true,
        alignment: "center",
        font: "Raleway",
      },
      keyNumberUnit: {
        fontSize: 7,
        bold: true,
        alignment: "center",
        margin: [0, 0, 5, 0],
        font: "Raleway",
      },
      libelle: {
        margin: [0, 0, 0, 10],
        alignment: 'center'
      },
      table: {
        margin: [0, 10, 0, 10],
        fontSize: 6,
      },
      tableHeader: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 7,
        fillColor: colors.light,
      },
      tableHeaderDark: {
        margin: [0, 5, 0, 5],
        bold: true,
        fontSize: 7,
        fillColor: colors.primary,
        color: "#FFF",
      },
      darkBackground: {
        fillColor: colors.primary,
        color: "#FFF",
        bold: true,
      },
      tableBold: {
        bold: true,
      },
      data: {
        alignment: "right"
      },
      unit: {
        fontSize: 5,
        alignment: "right"
      },
      legendText: {
        fontSize: 5,
      }
    },
  };

  const standardReport = pdfMake.createPdf(docDefinition);

  return standardReport;
};


const createKeyFigures = (indirectImpact, statementValue, unitDeclaration, libelleDeclaration, libelleIndirect, production, period, prevPeriod, indic, unit, colors) => {

  const footprint = production.periodsData[period.periodKey].footprint.indicators[indic].value;

  const prevFootprint = prevPeriod ? production.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : " - ";

  const createTableColumn = (value, label, unit, highlighted) => ({
    width: '*',
    table: {
      widths: ['*'],
      body: [
        [{
          text: [
            { text: value, style: 'keyNumber' },
            { text: ` ${unit}`, style: 'keyNumberUnit' }
          ], margin: [0, 10, 0, 0]
        }],
        [{ text: label, style: 'libelle' }],
      ],
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return  highlighted ? colors.primary : colors.light;
      },
      vLineWidth: function (i, node) {
        return 0.5;
      },
      vLineColor: function (i, node) {
        return  highlighted ? colors.primary : colors.light;
      },

    },

  });

  return {
    alignment: 'center',
    margin: [0, 5, 0, 5],
    columnGap: 20,
    columns: [
      createTableColumn(footprint, "Empreinte\nde la production", unit, true),
      createTableColumn(statementValue, libelleDeclaration, unitDeclaration, false),
      createTableColumn(indirectImpact.value, libelleIndirect, indirectImpact.unit, false),
      createTableColumn(prevFootprint, "Evolution par rapport à l'exercice précédent", prevPeriod ? unitDeclaration : "", false),
    ],
  };
};

const getStatementValue = (impactsData, period, indic) => {

  const { statementUnits } = metaIndics[indic];
  const impactsDataOnPeriod = impactsData[period.periodKey];

  switch (indic) {
    case "eco":
      return printValue(impactsDataOnPeriod.domesticProduction, 0);
    case "soc":
      return impactsDataOnPeriod.hasSocialPurpose ? "Oui" : "Non";
    case "art":
      return impactsDataOnPeriod.craftedProduction > 0 ? "Oui" : "Non";
    case "idr":
      return printValue(impactsDataOnPeriod.interdecileRange, 1);
    case "geq":
      return impactsDataOnPeriod.wageGap;
    case "knw":
      return printValue(impactsDataOnPeriod.researchAndTrainingContribution, 0);
    case "ghg":
      return printValue(parseFloat(impactsDataOnPeriod.greenhouseGasEmissions) * statementUnits[impactsDataOnPeriod.greenhouseGasEmissionsUnit].coef, 0);
    case "nrg":
      return printValue(parseFloat(impactsDataOnPeriod.energyConsumption) * statementUnits[impactsDataOnPeriod.energyConsumptionUnit].coef, 0);
    case "wat":
      return printValue(parseFloat(impactsDataOnPeriod.waterConsumption) * statementUnits[impactsDataOnPeriod.waterConsumptionUnit].coef, 0);
    case "mat":
      return printValue(parseFloat(impactsDataOnPeriod.materialsExtraction) * statementUnits[impactsDataOnPeriod.materialsExtractionUnit].coef, 0);
    case "was":
      return printValue(parseFloat(impactsDataOnPeriod.wasteProduction) * statementUnits[impactsDataOnPeriod.wasteProductionUnit].coef, 0);
    case "haz":
      return printValue(parseFloat(impactsDataOnPeriod.hazardousSubstancesUse) * statementUnits[impactsDataOnPeriod.hazardousSubstancesUseUnit].coef, 0);
    default:
      return "-";
  }
};

const getIndirectImpact = (intermediateConsumptions, fixedCapitalConsumptions, period, indic) => {
  const { unit, unitAbsolute, nbDecimals } = metaIndics[indic];

  const indicsWithGrossImpact = new Set([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat"
  ]);

  const showGrossImpact = indicsWithGrossImpact.has(indic);

  const intermediateData = intermediateConsumptions.periodsData[period.periodKey];
  const fixedCapitalData = fixedCapitalConsumptions.periodsData[period.periodKey];

  const intermediateAmount = intermediateData?.amount || 0;
  const fixedCapitalAmount = fixedCapitalData?.amount || 0;

  const intermediateIndicator = intermediateData?.footprint.indicators[indic];
  const fixedCapitalIndicator = fixedCapitalData?.footprint.indicators[indic];

  if (showGrossImpact) {
    const intermediateGrossImpact = intermediateIndicator ? intermediateIndicator.getGrossImpact(intermediateAmount) : 0;
    const fixedCapitalGrossImpact = fixedCapitalIndicator ? fixedCapitalIndicator.getGrossImpact(fixedCapitalAmount) : 0;

    const totalIndirectImpact = intermediateGrossImpact + fixedCapitalGrossImpact;
    return { value: printValue(totalIndirectImpact, nbDecimals), unit: unitAbsolute };
  } else {

    const intermediateGrossImpact = intermediateIndicator ? intermediateIndicator.getValue() * intermediateAmount : 0;
    const fixedCapitalGrossImpact = fixedCapitalIndicator ? fixedCapitalIndicator.getValue() * fixedCapitalAmount : 0;

    const totalAmount = intermediateAmount + fixedCapitalAmount;
    const totalGrossImpact = intermediateGrossImpact + fixedCapitalGrossImpact;
    const indirectImpact = totalAmount > 0 ? totalGrossImpact / totalAmount : 0;

    const value = printValue(parseFloat(indirectImpact), nbDecimals)

    return { value, unit };
  }
};

const createFinancialChartsSection = (
  valueAddedChart,
  intermediateConsumptionsChart,
  fixedCapitalConsumptionsChart
) => {
  return {
    margin: [0, 20, 0, 20],
    columnGap: 20,
    columns: [
      {
        width: '*',
        stack: [
          {
            text: "Valeur ajoutée",
            style: "h3",
            alignment: "center",
          },
          {
            image: valueAddedChart,
            width: 120,
            alignment: "center",
          },
        ],
      },
      {
        width: '*',
        stack: [
          {
            text: "Consommations intermédiaires ",
            style: "h3",
            alignment: "center",
          },
          {
            image: intermediateConsumptionsChart,
            width: 120,
            alignment: "center",
          },
        ],
      },
      {

        stack: [
          {
            text: "Consommations de capital fixe ",
            style: "h3",
            alignment: "center",
          },
          {
            image: fixedCapitalConsumptionsChart,
            width: 120,
            alignment: "center",
          },
        ],
      },
    ],
  };
};

const createProductionSection = (period,indic,unit,precision ,colors,production,comparativeData,productionChartImage, analysisNotes) => {

  const branchProductionFootprint = comparativeData.production.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;

  const tableBody = [
    [
      {
        text: "",
        style : "tableHeader",
        alignment : "right",
      },
      {
        text: "Empreinte",
        style: "tableHeader",
      },
      {
        text: "Empreinte\nde la branche",
        style: "tableHeader",
        alignment : "right",
      },
    ],
    [
      {
        text: "Production",
      },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ) + " " + unit,
        style: "data",
      },
      {
        text: branchProductionFootprint?.value  + " " + unit ?? " - ",
        style: "data"
      },
    ],
   
  ];


  return {
    columns: [
      {
        width: '40%',
        columnGap: 20,
        stack: [
          {
            text: "Empreinte de la production",
            style: "h3",
            margin: [0, 10, 0, 10],
          },
          {
            image: productionChartImage,
            width: 180,
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: tableBody,
            },
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0;
              },
              hLineColor: function (i, node) {
                return (i === 5 || i === 7) ? colors.light : colors.primary;
              },
              vLineWidth: function (i, node) {
                return 0
              },
       
            },
            style: 'table',
            margin: [0, 10, 0, 0]
          }
        ],
      },
      {
        width: '*',
        stack: [

          {
            margin: [0, 10, 0, 10],
            text: "Note d'analyse",
            style: "h3",
          },
          {
            text: analysisNotes,
          },
        ],
      },
    ],
  };
};
const createAggregatesTableSection = (
  comparativeData,
  mainAggregates,
  indic,
  unit,
  period,
  precision,
  colors
) => {

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = mainAggregates;

  const branchProductionFootprint = comparativeData.production.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;
  const branchNetValueAddedFootprint = comparativeData.netValueAdded.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;
  const branchIntermediateConsumptionsFootprint = comparativeData.intermediateConsumptions.division.history.data[indic]?.[comparativeData.intermediateConsumptions.division.history.data[indic].length - 1] ?? null;
  const branchFixedCapitalConsumptionsFootprint = comparativeData.fixedCapitalConsumptions.division.history.data[indic]?.[comparativeData.fixedCapitalConsumptions.division.history.data[indic].length - 1] ?? null;


  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeader",
      },
      {
        text: "Unité",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Empreinte\nbranche",
        style: "tableHeader",
        alignment: "right"
      },
    ],
    [
      {
        text: "Production",
      },
      { text: unit, style: "unit" },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
      },
      {
        text: branchProductionFootprint?.value ?? " - ",
        style: "data"
      },
    ],
    [
      {
        text: "Details",
        bold: true, italics: true, colSpan: "4"
      },

    ],
    [
      {
        text: "Consommations intermédiaires",
      },
      { text: unit, style: "unit" },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
      },
      {
        text: branchIntermediateConsumptionsFootprint?.value ?? " - ",
        style: "data"
      },
    ],
    [
      {
        text: "Consommations de capital fixe",
      },
      { text: unit, style: "unit" },
      {
        text: printValue(
          fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchFixedCapitalConsumptionsFootprint?.value ?? " - ",
        style: "data"
      },
    ],

    [
      {
        text: "Valeur ajoutée nette",
      },
      { text: unit, style: "unit" },
      {
        text: printValue(
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchNetValueAddedFootprint?.value ?? " - ",
        style: "data"
      },
    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return (i === 5 || i === 7) ? colors.light : colors.primary;
      },
      vLineWidth: function (i, node) {
        return 0
      },
      paddingTop: function (i, node) { return i === 0 ? 2 : 3; },
      paddingBottom: function (i, node) { return i === 0 ? 2 : 3; },
    },
    style: 'table',
    margin: [0, 0, 0, 20]
  };
}
const createTargetTableSection = (
  comparativeData,
  mainAggregates,
  indic,
  unit,
  period,
  precision,
  colors
) => {

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = mainAggregates;


  const branchProductionTarget = comparativeData.production.division.target.data[indic].filter(value => value.path === "GEO")?.[comparativeData.production.division.target.data[indic].filter(value => value.path === "GEO").length - 1] ?? null;
const branchNetValueAddedTarget = comparativeData.netValueAdded.division.target.data[indic].filter(value => value.path === "GEO")?.[comparativeData.netValueAdded.division.target.data[indic].filter(value => value.path === "GEO").length - 1] ?? null;
const branchIntermediateConsumptionsTarget = comparativeData.intermediateConsumptions.division.target.data[indic].filter(value => value.path === "GEO")?.[comparativeData.intermediateConsumptions.division.target.data[indic].filter(value => value.path === "GEO").length - 1] ?? null;
const branchFixedCapitalConsumptionsTarget = comparativeData.fixedCapitalConsumptions.division.target.data[indic].filter(value => value.path === "GEO")?.[comparativeData.fixedCapitalConsumptions.division.target.data[indic].filter(value => value.path === "GEO").length - 1] ?? null;

  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeader",
      },
      {
        text: "Unité",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Objectif\nsectoriel",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Effort à fournir\nd'ici 2030",
        style: "tableHeaderDark",
        alignment: "right"
      },
    ],
    [
      {
        text: "Production",
      },
      { text: unit, style: "unit" },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
      },
      {
        text: branchProductionTarget?.value ?? " - ",
        style: "data"
      },
      {
        style: "data",
        text: branchProductionTarget ? getEffortPercentage(production.periodsData[period.periodKey].footprint.indicators[indic].value, branchProductionTarget?.value) + " %" : " - "
      },
    ],
    [
      {
        text: "Details",
        bold: true, italics: true, colSpan: "5"
      },

    ],
    [
      {
        text: "Consommations intermédiaires",
      },
      { text: unit, style: "unit" },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
      },
      {
        text: branchIntermediateConsumptionsTarget?.value ?? " - ",
        style: "data"
      },
      {
        style: "data",
        text: branchIntermediateConsumptionsTarget ? getEffortPercentage(intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value, branchIntermediateConsumptionsTarget?.value) + " %" : " - "
      },

    ],

    [
      {
        text: "Consommations de capital fixe",
      },
      { text: unit, style: "unit" },
      {
        text: printValue(
          fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchFixedCapitalConsumptionsTarget?.value ?? " - ",
        style: "data"
      },
      {
        style: "data",
        text: branchFixedCapitalConsumptionsTarget ? getEffortPercentage(fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value, branchFixedCapitalConsumptionsTarget?.value) + " %" : " - "
      },

    ],

    [
      {
        text: "Valeur ajoutée nette",
      },
      { text: unit, style: "unit" },
      {
        text: printValue(
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchNetValueAddedTarget?.value ?? " - ",
        style: "data"
      },
      {
        style: "data",
        text: branchNetValueAddedTarget ? getEffortPercentage(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value, branchNetValueAddedTarget?.value) + " %" : " - "
      },

    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return colors.primary;
      },
      vLineWidth: function (i, node) {
        return 0
      },
      paddingTop: function (i, node) { return 2; },
      paddingBottom: function (i, node) { return 2; },
    },
    style: 'table',
    margin: [0, 0, 0, 20]
  };
}

// ----------------------------------------------------------------------------------------------------
// Providers table

const createMainProvidersTable = (providers, period, indic) => {
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#36c575" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>';

  // Filtrage des fournisseurs
  const filteredProviders = providers
    .filter((provider) => !provider.isDefaultProviderAccount)
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter((provider) => !provider.useDefaultFootprint && provider.footprintStatus === 200 && provider.footprint.isValid())
    .filter((provider) => provider.periodsData[period.periodKey].amountExpenses !== 0 || provider.periodsData[period.periodKey].amountInvestments !== 0);

  // Tri des fournisseurs par montant d'achats
  const mainPurchasingProviders = filteredProviders
    .filter((provider) => provider.periodsData[period.periodKey].amountExpenses > 0)
    .sort((a, b) => b.periodsData[period.periodKey].amountExpenses - a.periodsData[period.periodKey].amountExpenses)
    .slice(0, 10);

  // Tri des fournisseurs par montant d'immobilisations
  const mainFixedAssetProviders = filteredProviders
    .filter((provider) => provider.periodsData[period.periodKey].amountInvestments > 0)
    .sort((a, b) => b.periodsData[period.periodKey].amountInvestments - a.periodsData[period.periodKey].amountInvestments)
    .slice(0, 5);

  // Préparation des données pour la table
  const { unit, nbDecimals } = metaIndics[indic];

  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'SIREN', style: 'tableHeader' },
      { text: 'Dénomination sociale / Libellé du compte', style: 'tableHeader' },
      {
        text: [
          {
            text: "Empreinte\n"
          },
          {
            text: unit,
            style: "unit"
          }
        ],
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: [
          {
            text: "Incertitude\n"
          },
          {
            text: "%",
            style: "unit"
          }
        ],
        style: "tableHeader",
        alignment: "right"
      },
      { text: 'Publication', style: 'tableHeader', alignment: "center" },

    ],
  ];

  // Ajout des fournisseurs d'achats
  tableBody.push([
    { text: "Fournisseurs d'achats", bold: true, italics: true, colSpan: "6" }
  ]);

  mainPurchasingProviders.forEach((provider) => {

    const indicatorStatus = provider.footprint.indicators[indic]?.flag;
    const footprintIndicator = provider.footprint.indicators[indic];

    tableBody.push([
      { text: provider.providerNum },
      { text: provider.legalUnitData.siren || "-" },
      { text: provider.legalUnitData.denomination || provider.providerLib },
      { text: printValue(footprintIndicator.getValue(), nbDecimals), style: 'data' },
      { text: printValue(footprintIndicator.getUncertainty(), 0), style: 'data' },
      indicatorStatus === "p"
        ? { svg: checkIcon, width: 7, height: 7, alignment: "center" }
        : indicatorStatus === "e"
          ? { text: "~", alignment: "center" }
          : { text: "-", style: 'data', alignment: "center" },
    ]);
  });

  // Ajout des fournisseurs d'immobilisations
  if (mainFixedAssetProviders.length > 0) {
    tableBody.push([
      { text: "Fournisseurs d'immobilisations", bold: true, italics: true, colSpan: "6" }
    ]);

    mainFixedAssetProviders.forEach((provider) => {

      const indicatorStatus = provider.footprint.indicators[indic]?.flag;
      const footprintIndicator = provider.footprint.indicators[indic];

      tableBody.push([
        { text: provider.providerNum },
        { text: provider.legalUnitData.siren || "-" },
        { text: provider.legalUnitData.denomination || provider.providerLib },
        { text: printValue(footprintIndicator.getValue(), nbDecimals), style: 'data' },
        { text: printValue(footprintIndicator.getUncertainty(), 0), style: 'data' },
        indicatorStatus === "p"
          ? { svg: checkIcon, width: 7, height: 7, alignment: "center" }
          : indicatorStatus === "e"
            ? { text: "~", alignment: "center" }
            : { text: "-", style: 'data', alignment: "center" },

      ]);
    });
  }


  tableBody.push([
    {
      columns: [
        { svg: checkIcon, width: 5, height: 5 },
        { width: 'auto', text: " : Valeur publiée", style: 'legendText' }
      ],
    },
    { text: '~ : Valeur estimée', style: 'legendText', },
    {
      text: '- : Valeur non publiée', style: 'legendText', colSpan: "4",
    },
  ]);

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 50, '*', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 | i === node.table.body.length - 1) ? 0.5 : 0;
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
    },
    style: 'table',
    margin: [0, 0, 0, 25],
  };
};

const createPublishedProvidersTable = (providers, period) => {


  // Tri des fournisseurs par montant d'achats
  const mainPurchasingProviders = providers
    .filter((provider) => provider.periodsData[period.periodKey].amountExpenses > 0)
    .sort((a, b) => b.periodsData[period.periodKey].amountExpenses - a.periodsData[period.periodKey].amountExpenses)
    .slice(0, 10);

  // Tri des fournisseurs par montant d'immobilisations
  const mainFixedAssetProviders = providers
    .filter((provider) => provider.periodsData[period.periodKey].amountInvestments > 0)
    .sort((a, b) => b.periodsData[period.periodKey].amountInvestments - a.periodsData[period.periodKey].amountInvestments)
    .slice(0, 5);

  // Préparation des données pour la table
  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'SIREN', style: 'tableHeader' },
      { text: 'Dénomination sociale / Libellé du compte', style: 'tableHeader' },
    ],
  ];

  // Ajout des fournisseurs d'achats publiés
  if (mainPurchasingProviders.length > 0) {
    tableBody.push([
      { text: "Fournisseurs d'achats publiés", bold: true, italics: true, colSpan: 3 }
    ]);

    mainPurchasingProviders.forEach((provider) => {
      tableBody.push([
        { text: provider.providerNum },
        { text: provider.legalUnitData.siren || "-" },
        { text: provider.legalUnitData.denomination || provider.providerLib },
      ]);
    });
  }

  // Ajout des fournisseurs d'immobilisations publiés
  if (mainFixedAssetProviders.length > 0) {
    tableBody.push([
      { text: "Fournisseurs d'immobilisations publiés", bold: true, italics: true, colSpan: 3 }
    ]);

    mainFixedAssetProviders.forEach((provider) => {
      tableBody.push([
        { text: provider.providerNum },
        { text: provider.legalUnitData.siren || "-" },
        { text: provider.legalUnitData.denomination || provider.providerLib },
      ]);
    });
  }

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 50, '*'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 5],
  };
};



const createSectionTitle = (label, colors) => {

  const tableBody = [
    [{
      text: label,
      style: "sectionTitle",
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
        return colors.primary;
      },
      vLineWidth: function (i, node) {
        return 0;
      },
      paddingLeft: function (i, node) { return 0 },
      paddingBottom: function (i, node) { return 4 },
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