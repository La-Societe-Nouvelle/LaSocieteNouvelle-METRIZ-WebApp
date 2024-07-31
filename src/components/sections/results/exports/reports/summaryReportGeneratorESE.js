import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Metadata
import metaIndics from "/lib/indics.json";
import styles from "/lib/styles"

// Utils
import { generateFooter, generateHeader, loadFonts } from "./utils/layout";
import { getChartImageData, loadImageAsDataURL } from "./utils";
import { getKeyIndics, isBetter, isWorst } from "../../utils";
import { roundValue } from "../../../../../utils/Utils";
import { getLabelPeriod } from "../../../../../utils/periodsUtils";
import { printValue } from "../../../../../utils/formatters";
import { pdfMargins, pdfPageSize } from "../../../../../constants/pdfConfig";

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
  const { providers, mainAggregates } = financialData;
  const { production } = mainAggregates;

  const keyIndics = getKeyIndics(comparativeData.comparativeDivision);
  const indicatorLabels = getIndicatorLabels();
  const indicatorUnits = getIndicatorUnits();
  const absoluteUnits = getIndicatorAbsoluteUnit();

  const valuableIndics = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const improvementIndics = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);

  const transparentProviders = getTransparentProviders(providers,period);

  // ---------------------------------------------------------------
  // Charts

  const indicatorCharts = await getIndicatorCharts(validatedIndics);

  // ---------------------------------------------------------------
  // Page Property

  // ---------------------------------------------------------------
  // Colors

  const { colors } = styles["default"];

  // ---------------------------------------------------------------
  // Content

  const content = 
  [
    // Page 1 - Graphiques récapitulatifs ----------------------------------------------------------------- //

    {
      text: "Empreinte Sociétale de l'Entreprise",
      style: "h1",
    },
    ...createSocialFootprintCharts(indicatorLabels, indicatorCharts,colors),

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

    // Page 5 - Fournisseurs ------------------------------------------------------------------------------ //

    { text: '', pageBreak: 'after' },
    // table with main providers
    { text: "Coopération des principaux fournisseurs (comptes auxiliaires)", style: "h2" },
    createMainProvidersTable(providers, validatedIndics, period),
    // table with provider who have published
    ...transparentProviders.length>0 ? [
      { text: "Fournisseurs ayant publié leur empreinte", style: "h2" },
      createPublishedProviderFootprintsTable(providers, validatedIndics, period),
    ] : [],

    // Page 4 - Notice ------------------------------------------------------------------------------------ //

    { text: '', pageBreak: 'after' },
    buildNotePage(),

    // ---------------------------------------------------------------------------------------------------- //
  ];

  // ---------------------------------------------------------------
  // Document definition

  const docDefinition = {
    pageSize: pdfPageSize,
    pageMargins: [
      pdfMargins.left,
      pdfMargins.top,
      pdfMargins.right,
      pdfMargins.bottom,
    ],
    header: generateHeader(corporateName, legalUnit.siren, period,colors),
    footer: generateFooter(colors),
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
        margin: [0, 10, 0, 10],
        alignment: "center",
        fontSize: 15
      },
      h2: {
        bold: true,
        margin: [0, 10, 0, 10],
        color: colors.primary,
        font: "Raleway",
        border: "2px",
        fontSize: 7,
      },
      h3: {
        bold: true,
        margin: [0, 10, 0, 5],
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
        margin: [0, 0, 0, 5],
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

const createSocialFootprintCharts = (indicatorLabels, indicatorImages,colors) => {
  const content = [];

  Object.keys(indicatorImages).forEach(category => {
    
    // title category
    const title = createTableTitle(category,colors);
    content.push(title);

    let currentRow = [];
    indicatorImages[category].forEach(({indic,image}, index) => {

      // indic footprint chart
      currentRow.push({
        margin: [0, 0,0, 5],
        stack: [
          { text: splitTitle(indicatorLabels[indic]), style: "h2", alignment: "center" },
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

// ----------------------------------------------------------------------------------------------------
// Main providers table

const createMainProvidersTable = (providers, validatedIndics, period) => 
{
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#36c575" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>';

  // Main providers - purchasing
  const mainPurchasingProviders = providers
    .filter((provider) => !provider.isDefaultProviderAccount)
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey) && provider.periodsData[period.periodKey].amountExpenses>0)
    .sort((a,b) => b.periodsData[period.periodKey].amountExpenses - a.periodsData[period.periodKey].amountExpenses)
    .slice(0,10)
  
  // Main providers - fixed asset
  const mainFixedAssetProviders = providers
    .filter((provider) => !provider.isDefaultProviderAccount)
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey) && provider.periodsData[period.periodKey].amountInvestments>0)
    .sort((a,b) => b.periodsData[period.periodKey].amountInvestments - a.periodsData[period.periodKey].amountInvestments)
    .slice(0,5)

  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'SIREN', style: 'tableHeader' },
      { text: 'Dénomination sociale / Libellé du compte', style: 'tableHeader' },
      { text: 'Publication', style: 'tableHeader', alignment: "center" },
      { text: 'Indicateurs publiés', style: 'tableHeader', alignment: "center" }
    ],
  ];

  // Purchasing
  tableBody.push([
    { text: "Fournisseurs d'achats", bold: true, italics: true, colSpan: "5" }
  ])

  mainPurchasingProviders
    .forEach((provider) => 
    {
      const isProviderIdentified = !provider.useDefaultFootprint;
      const nbPublishedIndics = Object.values(provider.footprint.indicators)
        .filter((indicator) => indicator.flag == "p").length;
        // .filter((indicator) => validatedIndics.includes(indicator.indic) && indicator.flag == "p").length;

      tableBody.push([
        { text: provider.providerNum },
        { text: provider.legalUnitData.siren || "-" },
        { text: provider.legalUnitData.denomination || provider.providerLib },
        nbPublishedIndics > 0 ? { svg: checkIcon, width: 7, height: 7, alignment: "center" } : { text: "-", style: 'data', alignment: "center" },
        { text: isProviderIdentified ? nbPublishedIndics+"/"+"12" : "-", alignment: "center" }
      ]);
    });

  // Fixes asset
  if (mainFixedAssetProviders.length>0)
  {
    tableBody.push([
      { text: "Fournisseurs d'immobilisations", bold: true, italics: true, colSpan: "5" }
    ])
  
    mainFixedAssetProviders
      .forEach((provider) => 
      {
        const isProviderIdentified = !provider.useDefaultFootprint;
        const nbPublishedIndics = Object.values(provider.footprint.indicators)
          .filter((indicator) => indicator.flag == "p").length;
          // .filter((indicator) => validatedIndics.includes(indicator.indic) && indicator.flag == "p").length;
  
        tableBody.push([
          { text: provider.providerNum },
          { text: provider.legalUnitData.siren || "-" },
          { text: provider.legalUnitData.denomination || provider.providerLib },
          nbPublishedIndics > 0 ? { svg: checkIcon, width: 7, height: 7, alignment: "center" } : { text: "-", style: 'data', alignment: "center" },
          { text: isProviderIdentified ? nbPublishedIndics+"/"+"12" : "-", alignment: "center" }
        ]);
      });
  }

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 50, '*', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
}; 


// ----------------------------------------------------------------------------------------------------
// Published provider footprints table

const createPublishedProviderFootprintsTable = (providers, validatedIndics, period) => 
{
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#36c575" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>';

  // Main providers - purchasing
  const transparentProviders = providers
    .filter((provider) => !provider.isDefaultProviderAccount)
    .filter((provider) => !provider.useDefaultFootprint)
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter((provider) => Object.values(provider.footprint.indicators).some((indicator) => indicator.flag == "p"))
    .sort((a,b) => a.legalUnitData.denomination.localeCompare(b.legalUnitData.denomination))
  
  const tableBody = [
    [
      { text: 'Compte', style: 'tableHeader' },
      { text: 'SIREN', style: 'tableHeader' },
      { text: 'Dénomination sociale', style: 'tableHeader' },
      { text: 'Indicateurs publiés', style: 'tableHeader', alignment: "center" }
    ],
  ];

  transparentProviders
    .forEach((provider) => 
    {
      const nbPublishedIndics = Object.values(provider.footprint.indicators)
        .filter((indicator) => indicator.flag == "p").length;
        // .filter((indicator) => validatedIndics.includes(indicator.indic) && indicator.flag == "p").length;

      tableBody.push([
        { text: provider.providerNum },
        { text: provider.legalUnitData.siren || "error" },
        { text: provider.legalUnitData.denomination || "error" },
        { text: nbPublishedIndics+"/"+"12", alignment: "center" }
      ]);
    });

  return {
    table: {
      headerRows: 1,
      widths: ['auto', 50, '*', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
    margin: [0, 0, 0, 25],
  };
}; 
  
// ----------------------------------------------------------------------------------------------------
// Notes

const buildNotePage = () => 
{
  const indicsNotes = {
    eco: "L'indicateur exprime la part (en %) du chiffre d'affaires produit en France i.e. dont la valeur ajoutée est localisée en France. Le complément indique la part des importations directes ou indirectes liées à la production de l'entreprise.",
    art: "L'indicateur exprime la part (en %) du chiffre d'affaires faisant intervenir la valeur ajoutée d'entreprises artisanales ou dont le savoir faire est reconnu (ex. label EPV). Comem pour l'intérêt social, l'indicateur inclut la valeur ajoutée nette de l'entreprise si celle-ci répond à ces critères. L'indicateur vise à valoriser les savoir-faire et les métiers de l'artisanat.",
    soc: "L'indicateur exprime la part (en %) du chiffre d'affaires faisant intervenir la valeur ajoutée de structures de l'Economie Sociale et Solidaire (ESS), de sociétés à mission ou d'entreprises ayant défini une raison d'être (dans le sens de la loi Pacte). Il inclut la valeur ajoutée nette de l'entreprise si celle-ci cherche à répondre à un enjeu sociétal. L'indicateur vise ainsi à soutenir l'ESS et à encourager chaque entreprise à définir sa raison d'être.",
    idr: "L'indice correspond au rapport interdécile D9/D1 des taux horaires au sein des effectifs (rapport entre le taux horaire le plus bas des 10% les plus élevés et le plus haut des 10% les plus faibles) ; sa valeur est de 1 pour les entreprises individuelles. L'indicateur fait intervenir l'indice interne de l'entreprise mais également celui associé aux fournisseurs, au prorata de leur poids dans les consommations et investissements.",
    geq: "L'indicateur correspond à l'écart brut entre le taux horaire brut moyen des femmes et des hommes (exprimé en pourcentage du taux horaire moyen). De la même manière que pour les autres indicateurs, il fait les écarts asociés aux fournisseurs, au prorata de leur poids dans les consommations et investissements.",
    knw: "L'indicateur exprime la part (en %) du chiffre d'affaires fléchée vers la recherche, la formation ou l'enseignement. A l'échelle de l'entreprise, il prend en compte les rémunérations des contrats d'apprentissages et de professionnalisation (et gratification de stages), les rémunérations liées à du temps de formation (participant ou animateur) ou des travaux de recherche, aux divers taxes et participations à la formation professionnelle.",
    ghg: "L'indicateur exprime la quantité émise de gaz à effet de serre par euro de chiffre d'affaires (en gCO2e/€).",
    nrg: "L'indicateur exprime la quantité consommée d'énergie par euro de chiffre d'affaires (en kJ/€).",
    mat: "L'indicateur exprime la quantité extraite de matières premières (biomasse, matières fossiles et minerais) par euro de chiffre d'affaires (en g/€).",
    wat: "L'indicateur exprime la quantité consommée d'eau par euro de chiffre d'affaires (en L/€). Il ne prend pas les prélèvements avec restitution dans le milieu d'origine sans traitement (sans modification de l'état).",
    was: "L'indicateur exprime la quantité produite de déchets par euro de chiffre d'affaires (en g/€).",
    haz: "L'indicateur exprime la quantité utilisée de produits chimiques dangereux par euro de chiffre d'affaires (en g/€). L'indicateur s'appuie sur la réglementation REACH pour les déclarations."
  }

  const methodologyNotes = [
    "L'empreinte sociétale est un panel d'indicateurs relatif aux externalités sociales et environnementales de la production de l'entreprise. Pour chaque indicateur, la mesure prend donc en compte les impacts liées à la valeur ajoutée (impacts directs des opérations) et les impacts indirects liés aux consommations, intermédiaires et de capital fixe. La méthodologie est publique et libre d'exploitation.",
    "Pour les impacts directs, la mesure s'appuie sur les caractéristiques de l'entreprise et des données d'activités : consommations (eau, énergie, carburants, etc.), données sociales, etc.",
    "Pour les impacts indirects liés aux consommations, ceux-ci sont estimés à partir de l'empreinte sociétale de vos fournisseurs. Elles sont disponibles au sein de notre base de données ouverte. En l'absence de données pubiées, des données statistiques sont utilisées selon le profil de l'entreprise (activité, taille, etc.). De la même manière, votre empreinte sera utilisée par vos clients pour la mesure de l'empreinte de leurs activités.",
    "La description complète de la méthodologie est accessible ici : https://docs.lasocietenouvelle.org/empreinte-societale/mesure"
  ]

  const uncertaintyNotes = [
    "Les incertitudes sont exprimées en pourcentage de la valeur concernée. Elles proviennent de l'utilisation de valeurs statistiques pour l'estimation des impacts indirects, dès lors qu'un fournisseur ne fait pas preuve de transparence sur l'empreinte de ses activités. Dans une moindre mesure et uniquement pour les indicateurs environnementaux, une incertitude intervient lors de la mesure des impacts directs (la mesure d'une grandeur physique ne pouvant être exacte).",
    "Selon les indicateurs et les secteurs, la statistique publique et les remontées de données microcéconomiques ne permettent pas toujours de confirmer l'empreinte par défaut affectée à une entreprise selon ses caractéristiques publiques (activité, taille, catégorie juridique, etc.) : certaines valeurs sont donc fournies avec une incertitude parfois élevée (supérieure à 75 %).",
    "La réduction de l'incertitude liée aux résultats obtenus passe par la publication de l'empreinte sociétale de chaque entreprise, et par l'envoi de rapports statistiques anonymes permettant d'accélérer les travaux de modélisation."
  ]

  const targetNotes = [
    " - Ecart de rémunérations femmes/hommes : Objectif d'écart de 0% en 2050 (source: La Société Nouvelle)",
    " - Emissions de gaz à effet de serre : Budgets carbone sectoriels de la Stratégie Nationale Bas-Carbone (SNBC), étendus jusqu'à 2030",
    " - Contribution à l'évolution des compétences et des connaissances : Augmentation de 0.8 pt (pourcentage du PIB) d'ici 2030 par rapport à 2020, pour atteindre les 3% du PIB",
    " - Extraction de matières premières : Quantité extraite de matières premières stable (source: La Société Nouvelle)",
    " - Consommation d'énergie : Planification Pluriannuelle de l'Energie (PPE)",
    " - Contribution aux acteurs d'intérêt social : Objectif de 100% en 2050 (source: La Société Nouvelle)",
    " - Production de déchets : Plan national de prévention des déchets (PNPD)",
    " - Consommation d'eau : Consommation d'eau stable (source: La Société Nouvelle)"
  ]

  const indics = ["eco","soc","art","idr","geq","knw","ghg","nrg","wat","mat","was","haz"]; // ordered

  const content = 
  [
    { text: "Notice", style: "h1" },
    { text: "Description des indicateurs", style: "h2" },
    ...indics.map((indic) => 
    [
      { text: metaIndics[indic].libelle, style: "h3" },
      { text: indicsNotes[indic], style: "paragraph", alignment: "justify"}
    ]),
    { text: '', pageBreak: 'after' },
    { text: "Méthodologie de mesure", style: "h2" },
    methodologyNotes.map((note) => {return({ text: note, style: "paragraph", alignment: "justify"})}),
    { text: "Données utilisées", style: "h2" },
    { text: "Les données utilisées sont des données ouvertes fournies par La Société Nouvelle (https://lasocietenouvelle.org). Elles proviennent de publications volontaires de la part d'entreprises et de travaux statistiques réalisés par La Société Nouvelle.", style: "paragraph"},
    { text: "Incertitudes", style: "h2" },
    uncertaintyNotes.map((note) => {return({ text: note, style: "paragraph", alignment: "justify"})}),
    { text: "Moyennes et objectifs sectoriels", style: "h2" },
    { text: "Les moyennes sectorielles correspondent à l'empreinte de la production de la branche de référence de l'entreprise (obtenue à partir de son code APE). Les valeurs sont obtenues à partir des travaux de modélisation statistiques de La Société Nouvelle.", style: "paragraph"},
    { text: "La méthodologie et les sources de données utilisées pour chaque indicateur sont accessibles ici : https://docs.lasocietenouvelle.org/series-donnees/macro_fpt_a88.", style: "paragraph"},
    { text: "Les objectifs sectiels 2030 s'appuie sur les travaux de prospectives économiques (modélisation de l'économie française sur les années à venir) et les cibles suivantes : \n"+targetNotes.join("\n"), style: "paragraph"}
  ];

  return content;
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
        statement: printValue(parseFloat(impactsDataOnPeriod.greenhouseGasEmissions)*statementUnits[impactsDataOnPeriod.greenhouseGasEmissionsUnit].coef, 0),
        uncertainty: printValue(impactsDataOnPeriod.greenhouseGasEmissionsUncertainty, 0)+" %"
      }
      case "nrg": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.energyConsumption)*statementUnits[impactsDataOnPeriod.energyConsumptionUnit].coef, 0),
        uncertainty: printValue(impactsDataOnPeriod.energyConsumptionUncertainty, 0)+" %"
      }
      case "wat": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.waterConsumption)*statementUnits[impactsDataOnPeriod.waterConsumptionUnit].coef, 0),
        uncertainty: printValue(impactsDataOnPeriod.waterConsumptionUncertainty, 0)+" %"
      }
      case "mat": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.materialsExtraction)*statementUnits[impactsDataOnPeriod.materialsExtractionUnit].coef, 0),
        uncertainty: printValue(impactsDataOnPeriod.materialsExtractionUncertainty, 0)+" %"
      }
      case "was": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.wasteProduction)*statementUnits[impactsDataOnPeriod.wasteProductionUnit].coef, 0),
        uncertainty: printValue(impactsDataOnPeriod.wasteProductionUncertainty, 0)+" %"
      }
      case "haz": return {
        statement: printValue(parseFloat(impactsDataOnPeriod.hazardousSubstancesUse)*statementUnits[impactsDataOnPeriod.hazardousSubstancesUseUnit].coef, 0),
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

const getTransparentProviders = (providers,period) => {
  const transparentProviders = providers
    .filter((provider) => !provider.isDefaultProviderAccount)
    .filter((provider) => !provider.useDefaultFootprint)
    .filter((provider) => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter((provider) => Object.values(provider.footprint.indicators).some((indicator) => indicator.flag == "p"))
    .sort((a,b) => a.legalUnitData.denomination.localeCompare(b.legalUnitData.denomination));
  return transparentProviders
}

// ----------------------------------------------------------------------------------

export const getEffortPercentage = (currentValue, targetValue) => {
  if (currentValue !== null && targetValue !== null && currentValue !== 0) {
    const effortPercentage = ((targetValue - currentValue) / currentValue * 100).toFixed(1);
    return effortPercentage;
  }
  return '-';
};

export const getMarginPercentage = (indicatorValue, referenceValue) => {
  if (indicatorValue !== null && referenceValue !== null && referenceValue !== 0) {
    const percentageValue = ((indicatorValue - referenceValue) / referenceValue * 100).toFixed(1);
    return percentageValue;
  }
  return '-';
};

const createTableTitle = (label,colors) => {

  const tableBody = [
    [{ 
      text: label, 
      style: {
        fontSize: 11,
        bold: true,
        color: colors.secondary,
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
        return colors.secondary;
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

// ----------------------------- Utils ----------------------------------------------

const splitTitle = (title) => {
  const words = title.split(' ');
  const middle = Math.ceil(words.length / 2);
  return words.slice(0, middle).join(' ') + '\n' + words.slice(middle).join(' ');
};








