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
import { getEffortPercentage, getMarginPercentage } from "./summaryReportGeneratorESE";
import { hasComparativeData } from "../../utils";
import { isValidNumber, roundValue } from "../../../../../utils/Utils";
import { getStatementDetails } from "./utils/statementDetails";
import { Indicator } from "../../../../../footprintObjects/Indicator";

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

  const { legalUnit, financialData, impactsData, comparativeData, analysis, availablePeriods, } = session;

  const { mainAggregates, productionAggregates, providers, externalExpensesAccounts, immobilisations } = financialData;
  const { production, intermediateConsumptions, fixedCapitalConsumptions, netValueAdded } = mainAggregates;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);

  // get Intermediate Aggregates
  const intermediateConsumptionsAggregates = await buildIntermediateConsumptionsAggregates(financialData, [period]);
  const fixedCapitalConsumptionsAggregates = await buildFixedCapitalConsumptionsAggregates(financialData, [period]);

  const transparentProviders = getTransparentProviders(providers, period, indic);

  const prevPeriod = getPrevPeriod(availablePeriods, period);

  // Data

  const statementNotes = getStatementNote(impactsData[period.periodKey], indic);

  const analysisNotes =
    analysis[period.periodKey][indic]?.isAvailable && showAnalyses
      ? analysis[period.periodKey][indic].analysis
      : " - ";

  const isTargetDataAvailable = hasComparativeData(session, 'division', 'target', indic);

  // Metadata ------------------------------------------------------

  const { libelle, unit, nbDecimals, libelleEmpreinteDirecte, libelleEmpreinteIndirecte } = metaIndics[indic];

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
    createKeyFigures(mainAggregates, period, prevPeriod, indic, colors),

    // ---------------------------------------------------------------
    // Content

    createPublicationBloc(),

    // ---------------------------------------------------------------
    // SIG

    createSectionTitle("Tableau des résultats", colors),
    createSIGtableSection(comparativeData, mainAggregates, productionAggregates, indic, unit, intermediateConsumptionsAggregates, fixedCapitalConsumptionsAggregates, period, nbDecimals, colors),

    // ---------------------------------------------------------------
    // Statement 

    createSectionTitle(libelleEmpreinteDirecte, colors), // "Impacts directs"
    getStatementDetails(impactsData[period.periodKey], indic, colors),

    createSectionTitle(libelleEmpreinteIndirecte, colors),
    {
      text: "Les impacts indirects liés aux consommations, intermédiaies et de capital fixe, sont obtenues "+
            "à partir de l'empreinte de vos fournisseurs (Cf. Empreinte des principaux fournisseurs). Des "+
            "proxys sectoriels sont utilisés en l'absence d'informations publiées.",
    },

    // ---------------------------------------------------------------
    // Production Footprint & Analysis

    { text: '', pageBreak: 'after' },
    createSectionTitle("Performance globale", colors),
    createProductionSection(period, indic, colors, production, comparativeData, productionChart, analysisNotes),

    // ---------------------------------------------------------------
    // Trend & Target

    createSectionTitle("Evolution de la performance", colors),
    {
      image: trendChart,
      width: 515,
      alignment: "center",
      margin: [0, 0, 0, 5]
    },
    {
      text: "Note :",
      style: "h3",
    },
    {
      text: "La courbe de tendance correspond à une projection de l'empreinte macroéconomique de la branche sur les prochaines années (jusqu'à 2030). " +
        "Elle est construite à partir des évolutions sur les 10 dernières années de la performance directe de la branche et de celles situées en amont de la chaine de valeur, " +
        "et sur une projection de la structure de l'économie sur les années à venir (volumes d'activité, interactions avec l'exterieur, dynamique des prix). "
    },
    {
      text: `Source des données : ${metaTrends[indic].source}`, margin: [0, 5, 0, 0], 
      //style: "legendText"
    },
    metaTargets[indic] ?
      [
        {
          text: "Objectif de la branche :",
          style: "h3",
          margin: [0, 5, 0, 10]
        },
        {
          text: metaTargets[indic].info
        },
        {
          text: `Source : ${metaTargets[indic].source}`, 
          //style: "legendText",
          margin: [0, 5, 0, 0]
        },
      ] : [],

    // ---------------------------------------------------------------
    // Target 

    { text: '', pageBreak: 'after' },
    createSectionTitle("Détails - Ecart avec l'objectif sectoriel", colors),

    isTargetDataAvailable ?
      [
        createFinancialChartsSection(
          targetValueAddedChart,
          targetIntermediateConsumptionsChart,
          targetFixedCapitalConsumptionsChart
        ),
        createTargetTableSection(comparativeData, mainAggregates, indic, unit, period, nbDecimals, colors)
      ] :
      [
        { text: "Aucun objectif sectoriel n'est défini pour cet indicateur.", margin: [0, 0, 0, 30] }
      ],

    // ---------------------------------------------------------------
    // Branch 

    createSectionTitle("Détails - Ecart avec la moyenne sectorielle", colors),
    createFinancialChartsSection(
      valueAddedChart,
      intermediateConsumptionsChart,
      fixedCapitalConsumptionsChart
    ),
    createAggregatesTableSection(comparativeData, mainAggregates, indic, unit, period, nbDecimals, colors),

    // ---------------------------------------------------------------
    // Providers 

    { text: '', pageBreak: 'after' },
    createSectionTitle("Empreinte des principaux fournisseurs", colors),
    createMainProvidersTable(providers, period, indic, colors),
    ...transparentProviders.length > 0 ? [
      { text: "Fournisseurs ayant publié leur empreinte", style: "h2" },
      createPublishedProvidersTable(providers, period, colors),
    ] : [],

    // ---------------------------------------------------------------
    // Détails comptes de charge

    { text: '', pageBreak: 'after' },
    {
      text: `Annexes`,
      style: "h1",
      margin: [0, 10, 0, 20],
    },
    createSectionTitle("Empreinte des comptes de charges", colors),
    createExternalExpensesAccountsTable(externalExpensesAccounts, period, indic, colors),

    // ---------------------------------------------------------------
    // Détails Immo
    
    createSectionTitle("Empreinte des immobilisations", colors),
    createImmobilisationsTable(immobilisations, period, indic, colors),
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
        margin: [0, 10, 0, 10],
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
        margin: [0, 0, 0, 10],
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
        alignment: "right",
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


const createKeyFigures = (mainAggregates, period, prevPeriod, indic, colors) => 
{

  const { unit, nbDecimals, unitDeclaration, libelleEmpreinteDirecte, libelleEmpreinteIndirecte } = metaIndics[indic];
  const { production } = mainAggregates;

  // production footprint
  const productionFootprint = production.periodsData[period.periodKey].footprint.indicators[indic].value.toFixed(nbDecimals);

  // direct impact/footprint
  const directImpact = getDirectImpact(mainAggregates, period, indic);

  // indirect impact/footprint
  const indirectImpact = getIndirectImpact(mainAggregates, period, indic);

  const prevFootprint = prevPeriod ? production.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value.toFixed(nbDecimals) : " - ";

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
        return highlighted ? colors.primary : colors.light;
      },
      vLineWidth: function (i, node) {
        return 0.5;
      },
      vLineColor: function (i, node) {
        return highlighted ? colors.primary : colors.light;
      },

    },

  });

  return {
    alignment: 'center',
    margin: [0, 5, 0, 20],
    columnGap: 20,
    columns: [
      createTableColumn(productionFootprint, "Empreinte\nde la production", unit, true),
      createTableColumn(directImpact.value, libelleEmpreinteDirecte, directImpact.unit, false),
      createTableColumn(indirectImpact.value, libelleEmpreinteIndirecte, indirectImpact.unit, false),
      createTableColumn(prevFootprint, "Evolution par rapport à l'exercice précédent", prevPeriod ? unitDeclaration : "", false),
    ],
  };
};

const createFinancialChartsSection = (
  valueAddedChart,
  intermediateConsumptionsChart,
  fixedCapitalConsumptionsChart
) => {
  return {
    margin: [0, 0, 0, 10],
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

// ----------------------------------------------------------------------------------------------------
// Production

const createProductionSection = (period, indic, colors, production, comparativeData, productionChartImage, analysisNotes) => 
{
  const { unit, nbDecimals } = metaIndics[indic];
  const branchProductionFootprint = comparativeData.production.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;
  const branchProductionTarget = comparativeData.production.division.target.data[indic]?.filter(value => value.path === "GEO")?.[comparativeData.production.division.target.data[indic].filter(value => value.path === "GEO").length - 1] ?? null;
  const tableBody = [
    [
      {
        text: "",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Unité",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        border: [false, true, false, false]

      },

    ],
    [
      {
        text: "Empreinte de l'entreprise",
        border: [false, false, false, false]

      },
      {
        text: unit,
        style: "unit",
        border: [false, false, false, false]

      },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            nbDecimals
          ),
        style: "data",
        border: [false, false, false, false]

      },

    ],
    [
      {
        text: "Moyenne de la branche",
        border: [false, false, false, false]
      },
      {
        text: unit,
        style: "unit",
        border: [false, false, false, false]
      },
      {
        text: printValue(branchProductionFootprint?.value, nbDecimals) ?? " - ",
        style: "data",
        border: [false, false, false, false]
      },

    ],
    [
      {
        text: "Objectif sectoriel 2030",
        border: [false, false, false, true]

      },
      {
        text: unit,
        style: "unit",
        border: [false, false, false, true]
      },
      {
        text: printValue(branchProductionTarget?.value, nbDecimals) ?? " - ",
        style: "data",
        border: [false, false, false, true]
      },
    ],

  ];


  return {
    columnGap: 20,
    columns: [
      {
        width: '45%',
        stack: [
          {
            text: "Empreinte de la production",
            style: "h3",
            margin: [0, 0, 0, 10],
          },
          {
            image: productionChartImage,
            width: 200,
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: tableBody,
            },
            defaultBorder: false,
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
              },
              hLineColor: function (i, node) {
                return colors.primary;
              },

            },
            style: 'table',
            margin: [0, 5, 0, 20]
          }
        ],
      },
      {
        width: '*',
        stack: [

          {
            margin: [0, 0, 0, 20],
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

// ----------------------------------------------------------------------------------------------------
// Objectifs

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
        border: [false, true, false, false]
      },
      {
        text: "Unité",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Objectif\nsectoriel",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Effort à fournir\nd'ici 2030",
        style: "tableHeaderDark",
        alignment: "right",
        border: [false, true, false, false]
      },
    ],
    [
      {
        text: "Production",
        border: [false, false, false, true]
      },
      {
        text: unit, style: "unit", border: [false, false, false, true]
      },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
        border: [false, false, false, true]
      },
      {
        text: branchProductionTarget?.value ?? " - ",
        style: "data",
        border: [false, false, false, true]
      },
      {
        style: "data",
        text: branchProductionTarget ? getEffortPercentage(production.periodsData[period.periodKey].footprint.indicators[indic].value, branchProductionTarget?.value) + " %" : " - ",
        border: [false, false, false, true]

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
        margin: [5, 0, 0, 0]
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
        margin: [5, 0, 0, 0]
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
        margin: [5, 0, 0, 0],
        border: [false, false, false, true]
      },
      { text: unit, style: "unit", border: [false, false, false, true] },
      {
        text: printValue(
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
        border: [false, false, false, true]
      },
      {
        text: branchNetValueAddedTarget?.value ?? " - ",
        style: "data",
        border: [false, false, false, true]
      },
      {
        style: "data",
        text: branchNetValueAddedTarget ? getEffortPercentage(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value, branchNetValueAddedTarget?.value) + " %" : " - ",
        border: [false, false, false, true]

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
      defaultBorder: false,
      hLineWidth: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? 0.5 : 1;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? colors.primary : colors.light;
      },
    },
    style: 'table',
    margin: [0, 0, 0, 30]
  };
}
// ----------------------------------------------------------------------------------------------------
// Ecart branche

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
        border: [false, true, false, false]
      },
      {
        text: "Unité",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Empreinte\nbranche",
        style: "tableHeader",
        alignment: "right",
        border: [false, true, false, false]
      },
      {
        text: "Ecart par rapport\nà la branche",
        style: "tableHeaderDark",
        alignment: "right",
        border: [false, true, false, false]
      },

    ],
    [
      {
        text: "Production",
        border: [false, false, false, true]
      },
      {
        text: unit, style: "unit", border: [false, false, false, true]
      },
      {
        text:
          printValue(
            production.periodsData[period.periodKey].footprint.indicators[indic].value,
            precision
          ),
        style: "data",
        border: [false, false, false, true]
      },
      {
        text: branchProductionFootprint?.value ?? " - ",
        style: "data",
        border: [false, false, false, true]
      },
      createMarginTextCell(
        production.periodsData[period.periodKey].footprint.indicators[indic].value,
        branchProductionFootprint?.value,
        true
      ),

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
        margin: [5, 0, 0, 0]
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
      createMarginTextCell(
        intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
        branchIntermediateConsumptionsFootprint?.value,
        false
      ),
    ],
    [
      {
        text: "Consommations de capital fixe",
        margin: [5, 0, 0, 0]
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
      createMarginTextCell(
        fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
        branchFixedCapitalConsumptionsFootprint?.value,
        false
      ),

    ],

    [
      {
        text: "Valeur ajoutée nette",
        margin: [5, 0, 0, 0],
        border: [false, false, false, true]
      },
      {
        text: unit, style: "unit", border: [false, false, false, true]
      },
      {
        text: printValue(
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
          precision
        ),
        style: "data",
        border: [false, false, false, true]
      },
      {
        text: branchNetValueAddedFootprint?.value ?? " - ",
        style: "data",
        border: [false, false, false, true]
      },
      createMarginTextCell(
        netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
        branchNetValueAddedFootprint?.value,
        true
      ),
    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      defaultBorder: false,
      hLineWidth: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? 0.5 : 1;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? colors.primary : colors.light;
      },
    },
    style: 'table',
  };
}
const createMarginTextCell = (value, branchValue, borderRight) => {

  const marginPercentage = getMarginPercentage(value, branchValue);
  return {
    text: marginPercentage == 0.0 ? '=' : `${marginPercentage > 0 ? '+ ' : '- '}${roundValue(Math.abs(marginPercentage), 0)} %`, style: "data",
    border: [false, false, false, borderRight ? true : false]
  };
}

// ----------------------------------------------------------------------------------------------------
// Providers table

const createMainProvidersTable = (providers, period, indic, colors) => {
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

  let withLegend = true;

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 50, '*', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(colors, withLegend),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
};

const createPublishedProvidersTable = (providers, period, colors) => {


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
    layout: tableLayout(colors),
    style: 'table',
    margin: [0, 0, 0, 5],
  };
};

// ----------------------------------------------------------------------------------------------------
// External Accounts table
const createExternalExpensesAccountsTable = (externalExpensesAccounts, period, indic, colors) => {

  const { unit, nbDecimals } = metaIndics[indic];


  const mainExternalExpenses = externalExpensesAccounts
    .filter((account) => account.periodsData[period.periodKey].amount > 0)
    .sort((a, b) => b.periodsData[period.periodKey].amount - a.periodsData[period.periodKey].amount)
    .slice(0, 10);

  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'Libellé', style: 'tableHeader' },
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

    ],
  ];


  mainExternalExpenses.forEach((account) => {

    const footprintIndicator = account.periodsData[period.periodKey].footprint.indicators[indic];

    tableBody.push([
      { text: account.accountNum },
      { text: account.accountLib },
      { text: printValue(footprintIndicator.getValue(), nbDecimals), style: 'data' },
      { text: printValue(footprintIndicator.getUncertainty(), 0), style: 'data' },


    ]);
  });

  return {
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(colors),
    style: 'table',
    margin: [0, 0, 0, 30],
  };
};


// ----------------------------------------------------------------------------------------------------
// immo table
const createImmobilisationsTable = (immobilisations, period, indic, colors) => {

  const immobilisationsAccounts = immobilisations.slice(0, 10);

  const { unit, nbDecimals } = metaIndics[indic];

  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'Libellé', style: 'tableHeader' },
      {
        text: [
          {
            text: "En début d'exercice\n"
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
      {
        text: [
          {
            text: "En fin d'exercice\n"
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
    ]
  ];

  immobilisationsAccounts.forEach((account) => {

   const initialFootprint = account.initialState.footprint.indicators[indic];
    const endFootprint = account.states[period.dateEnd].footprint.indicators[indic];

    tableBody.push([
      { text: account.accountNum },
      { text: account.accountLib },
      { text: printValue(initialFootprint.getValue(), nbDecimals), style: 'data' },
      { text: printValue(initialFootprint.getUncertainty(), 0), style: 'data' },
      { text: printValue(endFootprint.getValue(), nbDecimals), style: 'data' },
      { text: printValue(endFootprint.getUncertainty(), 0), style: 'data' },

    ]);
  });

  return {
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(colors),
    style: 'table',
    margin: [0, 0, 0, 5],
  };
};

// ----------------------------------------------------------------------------------------------------
// Utils

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

const getDirectImpact = (mainAggregates, period, indic) => 
{
  const { unit, unitAbsolute, nbDecimals, type } = metaIndics[indic];
  const { netValueAdded } = mainAggregates;

  // return gross impact
  if (type == "intensité") {
    const directImpact = netValueAdded.getGrossImpact(period.periodKey, indic);
    return { value: printValue(directImpact, nbDecimals), unit: unitAbsolute };
  } 
  // return footprint value
  else {
    const directImpact = netValueAdded.getFootprint(period.periodKey, indic).getValue();
    return { value: printValue(directImpact, nbDecimals), unit: unit };
  }
};

const getIndirectImpact = (mainAggregates, period, indic) => 
{
  const { unit, unitAbsolute, nbDecimals, type } = metaIndics[indic];
  const { intermediateConsumptions, fixedCapitalConsumptions } = mainAggregates;

  // return gross impact
  if (type == "intensité") {
    const consumptionsFootprint = buildAggregatePeriodIndicator(indic, [intermediateConsumptions,fixedCapitalConsumptions], period.periodKey);
    const consumptionsAmount = intermediateConsumptions.getAmount(period.periodKey) + fixedCapitalConsumptions.getAmount(period.periodKey);
    const indirectImpact = consumptionsFootprint.getGrossImpact(consumptionsAmount);
    return { value: printValue(indirectImpact, nbDecimals), unit: unitAbsolute };
  } 
  // return footprint value
  else {
    const consumptionsFootprint = buildAggregatePeriodIndicator(indic, [intermediateConsumptions,fixedCapitalConsumptions], period.periodKey);
    const indirectImpact = consumptionsFootprint.getValue(indic);
    return { value: printValue(indirectImpact, nbDecimals), unit: unit };
  }
};

// temp
const buildAggregatePeriodIndicator = (indic,accounts,periodKey) =>
{
  const { nbDecimals } = metaIndics[indic];
  const accountsOnPeriod =  accounts.filter(account => account.periodsData.hasOwnProperty(periodKey));
  
  // init indicator
  const indicator = new Indicator({indic});
    
  let totalAmount = 0.0;
  let grossImpact = 0.0;
  let grossImpactMax = 0.0;
  let grossImpactMin = 0.0;

  let missingData = false;

  for (let account of accountsOnPeriod)
  {
    let amountAccount = account.periodsData[periodKey].amount;
    let indicatorAccount = account.periodsData[periodKey].footprint.indicators[indic];

    if (isValidNumber(amountAccount) && amountAccount!=0 && indicatorAccount.isValid()) 
    {
      grossImpact+= indicatorAccount.getValue()*amountAccount;
      grossImpactMax+= indicatorAccount.getValueMax()*amountAccount;
      grossImpactMin+= indicatorAccount.getValueMin()*amountAccount;
      totalAmount+= amountAccount;
    } 
    else if (!isValidNumber(amountAccount) || (isValidNumber(amountAccount) && amountAccount!=0 && !indicatorAccount.isValid())) {
      missingData = true;
    }
  }

  if (!missingData && totalAmount != 0) { 
    let value = roundValue(grossImpact/totalAmount, nbDecimals);
    let uncertainty = getUncertainty(grossImpact,grossImpactMax,grossImpactMin);
    indicator.setValue(value);
    indicator.setUncertainty(uncertainty);
  } else {
    indicator.setValue(null); 
    indicator.setUncertainty(null);
  }

  return indicator;
}

const getUncertainty = (value,valueMax,valueMin) => 
{
  if (Math.abs(value) > 0) {
    let gapWithMax = Math.abs( valueMax-value ); // | max - value |
    let gapWithMin = Math.abs( valueMin-value ); // | min - value |
    let uncertainty = Math.max(gapWithMax,gapWithMin) / Math.abs(value) * 100.0;
    return roundValue(uncertainty, 0);
  } else {
    return 0.0;
  }
}

// 

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
    margin: [0, 0, 0, 20],
  };
};

const createPublicationBloc = () => 
{
  const tableBody = [
    [{
      text: "L'empreinte de la production de l'entreprise n'est pas publiée au sein de la base de données ouverte SINESE.",
      color: "#dc3545",
      bold: true,
      alignment: "left",
      margin: [0, 0, 0, 0.5],
    }],[{
      text: "La publication de votre empreinte sociétale correspond à la mise en ligne de votre performance extra-financière au sein de la base de données SINESE "+
            "ouverte. Elle permet de valoriser vos résultats, d’être identifié comme acteur de la transition et de permettre à vos clients de fiabiliser la mesure de "+
            "leur propre empreinte sociétale. Seule l’empreinte de votre chiffre d’affaires est rendue publique, le détail des résultats reste à votre discretion.",
      color: "#dc3545",
      alignment: "left"
    }],[{
      text: "Vous pouvez directement publier votre empreinte via l'application Metriz.",
      color: "#dc3545",
      alignment: "left"
    }]
  ];

  return {
    table: {
      headerRows: 0,
      widths: ["*"],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === node.table.body.length) ? 0.5 : 0
      },
      hLineColor: function (i, node) {
        return "#fa595f";
      },
      vLineWidth: function (i, node) {
        return 0.5;
      },
      vLineColor: function (i, node) {
        return "#fa595f";
      },
      paddingTop: function (i, node) { return 4 },
      paddingBottom: function (i, node) { return 4 },
      paddingLeft: function (i, node) { return 4 },
      paddingRight: function (i, node) { return 4 },
    },
    fillColor: "#f8d7da",
    margin: [0, 0, 0, 20],
  };
};

const tableLayout = (colors, withLegend) => {
  return {
    hLineWidth: function (i, node) {
      return (i === 0 || i === 1 | i === (node.table.body.length - (withLegend ? 1 : 0))) ? 0.5 : 0;
    },
    hLineColor: function (i, node) {
      return colors.primary;
    },
    vLineWidth: function (i, node) {
      return 0;
    },
    vLineColor: function (i, node) {
      return colors.primary;
    },
    paddingTop: function (i, node) { return (i === 0) ? 1 : 3; },
    paddingBottom: function (i, node) { return (i === 0) ? 1 : 3; },
  };
}