// PDF Make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Lib
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";
import flagData from "/lib/flags";

// Utils
import { createSIGtableSection } from "./utils/createSIGtableSection";
import { colors, pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";
import { generateFooter, generateHeader, loadFonts } from "./utils/layout";
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from "/src/formulas/aggregatesBuilder";
import { getStatementNote } from "/src/utils/Writers";
import { getChartImageData } from "./utils";
import { printValue } from "/src/utils/formatters";
import { hasComparativeData } from "../../utils";


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

  const { legalUnit, financialData, impactsData, comparativeData, analysis } = session;

  const { mainAggregates, productionAggregates } = financialData;
  const { production } = mainAggregates;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);

  // get Intermediate Aggregates
  const intermediateConsumptionsAggregates = await buildIntermediateConsumptionsAggregates(financialData, [period]);
  const fixedCapitalConsumptionsAggregates = await buildFixedCapitalConsumptionsAggregates(financialData, [period]);

  const isTargetDataAvailable  = hasComparativeData(session,'division','target',indic);
  // Metadata ------------------------------------------------------

  const { libelle, unit, precision, libelleGrandeur } = metaIndics[indic];

  // ---------------------------------------------------------------
  // Charts

  const productionChart = getChartImageData(`comparative-chart-production-${indic}-print`);
  const valueAddedChart = getChartImageData(`comparative-chart-netValueAdded-${indic}-print`);
  const intermediateConsumptionsChart = getChartImageData(`comparative-chart-intermediateConsumptions-${indic}-print`);
  const fixedCapitalConsumptionsChart = getChartImageData(`comparative-chart-fixedCapitalConsumptions-${indic}-print`);
  const trendChart = getChartImageData(`trend-chart-${indic}-print`)

  //

  const statementNotes = getStatementNote(impactsData[period.periodKey], indic);
  const analysisNotes =
    analysis[period.periodKey][indic]?.isAvailable && showAnalyses
      ? analysis[period.periodKey][indic].analysis
      : null;

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
    createKeyFigures(comparativeData.production.division, production, period, indic, unit, libelleGrandeur, colors),
    createFinancialChartsSection(
      valueAddedChart,
      intermediateConsumptionsChart,
      fixedCapitalConsumptionsChart
    ),
    createSIGtableSection(mainAggregates, productionAggregates, indic, unit, intermediateConsumptionsAggregates, fixedCapitalConsumptionsAggregates, period, precision, colors),
    createProductionSection(productionChart, statementNotes, analysisNotes),
    { text: '', pageBreak: 'after' },
    {
      text: "Suivi des objectifs sectoriels 2030",
      style: "h2",
    },
    isTargetDataAvailable ? createTargetTableSection(comparativeData, mainAggregates, indic, unit, period, precision, colors) : 
    {text : "Aucun objectif défini pour cet indicateur", margin : [0,0,0,20]},
    {
      text: "Evolution de la performance",
      style: "h2",
    },
    {
      image: trendChart,
      width: 350,
      alignment: "center",
      margin: [0, 0, 0, 20]
    },
    { text: '', pageBreak: 'after' },
    createProvidersTable(financialData.providers, period,indic)
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
    header: generateHeader(corporateName, legalUnit.siren, currentPeriod),
    footer: generateFooter(""),
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
        color: colors.secondary,
        font: "Raleway",
        margin: [0, 0, 0, 20],
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
      keyNumber: {
        fontSize: 20,
        bold: true,
        alignment: "center",
        font: "Raleway",
      },
      keyNumberUnit: {
        fontSize: 10,
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
      },
      tableHeaderDark: {
        fillColor: colors.primary,
        color: "#FFF",
        margin: [0, 5, 0, 5],
        bold: true,
      },
      darkBackground: {
        fillColor: colors.primary,
        color: "#FFF",
        bold: true,
      },
      tableBold: {
        bold: true,
        fillColor: colors.light,
        margin: [0, 3, 0, 3],
      },
      data: {
        alignment: "right"
      },
      unit: {
        fontSize: 5,
        alignment: "right"
      }
    },
  };

  const standardReport = pdfMake.createPdf(docDefinition);

  return standardReport;
};


const createKeyFigures = (branchProduction, production, period, indic, unit, libelle, colors) => {
  const footprint = production.periodsData[period.periodKey].footprint.indicators[indic].value;
  const branchFootprint = branchProduction.history.data[indic].pop();
  const branchTarget = branchProduction.target.data[indic].filter(value => value.path === "GEO").pop();

  const createTableColumn = (value, label) => ({
    width: '*',
    table: {
      widths: ['*'],
      body: [
        [{
          text: [
            { text: value, style: 'keyNumber' },
            { text: ` ${unit}`, style: 'keyNumberUnit' }
          ], fillColor: colors.light, margin: [0, 10, 0, 0]
        }],
        [{ text: label, style: 'libelle', fillColor: colors.light }],
      ],
    },
    layout: {
      defaultBorder: false,
    }
  });

  return {
    alignment: 'center',
    margin: [0, 5, 0, 5],
    columnGap: 50,
    columns: [
      createTableColumn(footprint, libelle),
      createTableColumn(branchFootprint.value, "Valeur de la branche"),
      createTableColumn(branchTarget ? branchTarget.value : " - ", "Objectif national 2030"),
    ],
  };
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
            style: "h2",
            alignment: "center",
          },
          {
            image: valueAddedChart,
            width: 150,
            alignment: "center",
          },
        ],
      },
      {
        width: '*',
        stack: [
          {
            text: "Consommations intermédiaires ",
            style: "h2",
            alignment: "center",
          },
          {
            image: intermediateConsumptionsChart,
            width: 150,
            alignment: "center",
          },
        ],
      },
      {

        stack: [
          {
            text: "Consommations de capital fixe ",
            style: "h2",
            alignment: "center",
          },
          {
            image: fixedCapitalConsumptionsChart,
            width: 150,
            alignment: "center",
          },
        ],
      },
    ],
  };
};

const createProductionSection = (productionChartImage, statementNotes, analysisNotes) => {
  return {
    columns: [
      {
        width: '40%',
        columnGap: 20,
        stack: [
          {
            text: "Production",
            style: "h2",
          },
          {
            image: productionChartImage,
            width: 180,
          },
        ],
      },
      {
        width: '*',
        stack: [
          {
            text: "Impact direct",
            style: "h2",
          },
          statementNotes.map((note) => note),
          {
            margin: [0, 10, 0, 10],
            text: "Note d'analyse",
            style: "h2",
          },
          {
            text: analysisNotes,
            fontSize: 6,
          },
        ],
      },
    ],
  };
};
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

  const branchProductionTarget = comparativeData.production.division.target.data[indic].filter(value => value.path === "GEO").pop();
  const branchNetValueAddedTarget = comparativeData.netValueAdded.division.target.data[indic].filter(value => value.path === "GEO").pop();
  const branchIntermediateConsumptionsTarget = comparativeData.intermediateConsumptions.division.target.data[indic].filter(value => value.path === "GEO").pop();
  const branchFixedCapitalConsumptionsTarget = comparativeData.fixedCapitalConsumptions.division.target.data[indic].filter(value => value.path === "GEO").pop();

  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeaderDark",
      },
      {
        text: "Unité",
        style: "tableHeaderDark",
        alignment: "right"
      },
      {
        text: "Empreinte",
        style: "tableHeaderDark",
        alignment: "right"
      },
      {
        text: "Objectif à atteindre",
        style: "tableHeaderDark",
        alignment: "right"
      },
      {
        text: "Effort à fournir d'ici 2030",
        style: "tableHeaderDark",
        alignment: "right"
      },
    ],
    [
      { text: "Production" },
      { text: unit },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data"
      },
      {
        text: branchProductionTarget.value,
        style: "data"
      },
      { text: "" },

    ],

    [
      {
        text: "Consommations intermédiaires",
      },
      { text: unit },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
      },
      {
        text: branchIntermediateConsumptionsTarget.value,
        style: "data"
      },
      { text: "" },
    ],

    [
      {
        text: "Consommations de capital fixe",
      },
      { text: unit },
      {
        text: printValue(
          fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchFixedCapitalConsumptionsTarget.value,
        style: "data"
      },
      { text: "" },
    ],

    [
      {
        text: "Valeur ajoutée nette",
      },
      { text: unit },
      {
        text: printValue(
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
      },
      {
        text: branchNetValueAddedTarget.value,
        style: "data"
      },
      { text: "" },
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
        return (i === 5 || i === 8) ? colors.light : colors.primary;
      },
      vLineWidth: function (i, node) {
        return 0
      },
      paddingTop: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
      paddingBottom: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
    },
    style: 'table',
    margin: [0, 0, 0, 20]
  };
}

const createProvidersTable = (providers, period, indic) => {

  const filteredProviders = providers
  .filter((provider) => !provider.isDefaultProviderAccount)
  .filter((provider) => !provider.useDefaultFootprint)
  .filter((provider) => provider.footprintStatus === 200 && provider.footprint.isValid())
  .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
  .filter((provider) => provider.periodsData[period.periodKey].amountExpenses !== 0);


  const { unit, nbDecimals } = metaIndics[indic];

  const positiveImpact = ["eco", "art", "soc", "knw"].includes(indic);

  const sortAccountsByFootprint = (accounts, positiveImpact) => {
    accounts.sort((a, b) => {
      const impactA = a.footprint.indicators[indic].getValue();
      const impactB = b.footprint.indicators[indic].getValue();

      if (positiveImpact) {
        return impactB - impactA; 
      } else {
        return impactA - impactB; 
      }
    });
  };

  sortAccountsByFootprint(filteredProviders, positiveImpact);

  const topProviders = filteredProviders.slice(0, 10);

  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeaderDark' },
      { text: 'Libellé', style: 'tableHeaderDark' },
      { text: 'Unité', style: 'tableHeaderDark' },
      { text: 'Empreinte', style: 'tableHeaderDark' },
      { text: 'Incertitude (%)', style: 'tableHeaderDark' },
      { text: 'Empreinte publiée', style: 'tableHeaderDark' },
    ]
  ];

  topProviders
    .forEach(({ providerNum, providerLib, footprint }) => {

      const row = [
        {text : providerNum},
        {text : providerLib},
        {text : unit, style : 'unit'},
        {text : printValue(footprint.indicators[indic].getValue(), nbDecimals), style : 'data' },
        {text :  printValue(footprint.indicators[indic].getUncertainty(), 0), style : 'data'},
        {text:  flagData[footprint.indicators[indic].flag].label, style : 'data'},
      ];

      tableBody.push(row);
    });

  return {
    style: 'table',
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto','auto', 'auto','auto'],
      body: tableBody
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return (i === 5 || i === 8) ? colors.light : colors.primary;
      },
      vLineWidth: function (i, node) {
        return 0
      },
      paddingTop: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
      paddingBottom: function (i, node) { return (i === 0 || i === 1) ? 2 : 3; },
    },
  };
};

