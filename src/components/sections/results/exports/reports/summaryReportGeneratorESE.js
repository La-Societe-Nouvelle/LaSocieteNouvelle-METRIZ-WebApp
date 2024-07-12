import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import metaIndics from "/lib/indics.json";

// Utils
import { generateFooter, generateHeader, loadFonts } from "./utils/layout";
import { getChartImageData, loadImageAsDataURL } from "./utils";
import { getKeyIndics, isBetter, isWorst } from "../../utils";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const buildESEReport = async ({ session, period }) => {

  const {
    legalUnit,
    financialData,
    comparativeData,
  } = session;

  const corporateName = legalUnit.corporateName;
  const currentPeriod = period.periodKey.slice(2);
  const { production, netValueAdded } = financialData.mainAggregates;

  const keyIndics = getKeyIndics(comparativeData.comparativeDivision);
  const indicatorLabels = getIndicatorLabels();
  const indicatorUnits = getIndicatorUnits();
  const absoluteUnits = getIndicatorAbsoluteUnit();

  const indicatorImages = await getIndicatorCharts();

  const colors = {
    primary : "#191558",
    secondary : "#fa595f",
    text : "#191558",
    light : "#ededff",
  }
  const pageSize = {
    width: 595.28,
    height: 841.89,
  };

  const content = [
    {
      text: "Rapport - Empreinte Sociétale de l'Entreprise",
      style: "h1",
    },
    ...createIndicatorCharts(indicatorLabels, indicatorImages),
    { text: '', pageBreak: 'after' },
    { text: "Résultats", style: "h2", },
    createResultsTable(production, currentPeriod, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Impacts directs", style: "h2" },
    createImpactsTable(netValueAdded, period, indicatorLabels, absoluteUnits, keyIndics),
    { text: '', pageBreak: 'after' },
    { text: "Indicateurs valorisables", style: "h2" },
    createValuableIndicatorsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Points d'améliorations", style: "h2" },
    createImprovementTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Objectifs sectoriels 2030", style: "h2" },
    createNationalTargetsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData)
  ];

  const docDefinition = {
    pageSize,
    pageMargins: [40, 50, 40, 50],
    header: generateHeader(corporateName, legalUnit.siren, currentPeriod),
    footer: generateFooter(corporateName),
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
        margin: [0, 0, 0, 10],
        alignment: "center",
      },
      h2: {
        bold: true,
        margin: [0, 10, 0, 10],
        color: colors.secondary,
        font: "Raleway",
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
      darkBackground : {
        fillColor: colors.primary,
        color : "#FFF",
        bold : true,
      },
      data: {
        alignment: "right"
      }

    },
  };
  console.log(docDefinition)

  const ESEReport = pdfMake.createPdf(docDefinition);

  return ESEReport;
};
// ----------------------------------------------------------------------------------
// Data

const isSectoralIssue = (keyIndics, key) => keyIndics.includes(key);

// ----------------------------------------------------------------------------------

const getFootprintValue = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].value;
const getGrossImpactValue = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].getGrossImpact(production.periodsData[period.periodKey].amount);
const getUncertainty = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].uncertainty;
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

const getIndicatorCharts = async () => {
  const indicatorImages = {
    "Création de la valeur": [],
    "Empreinte sociale": [],
    "Empreinte environnementale": []
  };

  const defaultImages = {
    "Création de la valeur": "/pie-no-data.png",
    "Empreinte sociale": "/bar-no-data.png",
    "Empreinte environnementale": "/bar-no-data.png"
  };

  const loadImage = async (key, id) => {
    const imageData = getChartImageData(id);
    return imageData || await loadImageAsDataURL(defaultImages[key]);
  };

  await Promise.all(Object.keys(metaIndics).map(async (key) => {
    const id = `socialfootprintvisual_${key}-print`;
    const category = metaIndics[key].category;

    const image = await loadImage(category, id);
    indicatorImages[category].push({ key, image });
  }));

  return indicatorImages;
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

    return footprintValue !== null && branchValue !== null && isWorst(key, footprintValue, branchValue, 10);
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

// ----------------------------- Tables ----------------------------------------------

const createIndicatorCharts = (indicatorLabels, indicatorImages) => {
  const columns = [];

  Object.keys(indicatorImages).forEach(category => {
    columns.push({
      text: category,
      style: "h2"
    });

    let currentRow = [];
    indicatorImages[category].forEach((indicator, index) => {
      currentRow.push({
        margin: [0, 10],
        stack: [
          { text: splitTitle(indicatorLabels[indicator.key]), style: "h3", alignment: "center" },
          { image: indicator.image, width: 100, alignment: "center" }
        ],
      });

      if ((index + 1) % 3 === 0 || index === indicatorImages[category].length - 1) {
        columns.push({ columns: currentRow, columnGap: 10 });
        currentRow = [];
      }
    });
  });

  return columns;
};

const createResultsTable = (production, currentPeriod, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: 'Exercice ' + currentPeriod, colSpan: 2, border: [true, true, true, true], style : "darkBackground", alignment : "center" },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
    ],
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader' },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Incertitude', style: 'tableHeader' },
      { text: 'Moyenne\nBranche', style: 'tableHeader' },
      { text: 'Objectif\nsectoriel', style: 'tableHeader' }
    ],
  ];

  Object.keys(indicatorLabels).sort((a, b) => {
    return indicatorLabels[a].localeCompare(indicatorLabels[b]);
  }).forEach(key => {
    tableBody.push([
      { text: indicatorLabels[key], alignment: "left" },
      { text: indicatorUnits[key], style: 'unit' },
      isSectoralIssue(keyIndics, key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
      { text: getFootprintValue(production, period, key) ? `${getFootprintValue(production, period, key)}` : "-", style: 'data' },
      { text: getUncertainty(production, period, key) ? `${getUncertainty(production, period, key)} %` : "-", style: 'data', fontSize : 5 },
      { text: getBranchValue(comparativeData, key) ? `${getBranchValue(comparativeData, key)}` : " - ", style: 'data' },
      { text: getTargetValue(comparativeData, key) ? getTargetValue(comparativeData, key) : "-", style: 'data' },
    ]);
  });

  return {
    table: {
      headerRows: 2,
      widths: ["*", 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return '#191558';
      },
      vLineWidth: function (i, node) {
        if ((i == 3 || i == 5)) {
          return 0.5;
        } else {
          return 0;
        }
      },
      vLineColor: function (i, node) {
        return '#191558';
      },
      paddingTop: function (i, node) { return (i === 0 || i === 1) ? 2 : 5; },
      paddingBottom: function (i, node) { return (i === 0 || i === 1) ? 2 : 5; },
    },
    style: 'table',
  };
};

const createImpactsTable = (netValueAdded, period, indicatorLabels, absoluteUnits, keyIndics,colors) => {

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [

    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader' },
      { text: 'Impact', style: 'tableHeader' },
    ],
  ];

  Object.keys(indicatorLabels).sort((a, b) => {
    return indicatorLabels[a].localeCompare(indicatorLabels[b]);
  }).forEach(key => {

    const grossImpactValue = getGrossImpactValue(netValueAdded, period, key);
    if (!grossImpactValue) {
      return;
    }

    tableBody.push([
      { text: indicatorLabels[key], alignment: "left" },
      { text: absoluteUnits[key], style: 'unit' },
      isSectoralIssue(keyIndics, key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
      { text: grossImpactValue, style: 'data' },
    ]);
  });

  return {
    table: {
      headerRows: 2,
      widths: ["*", 'auto', 'auto', 'auto'],
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
  };
};

const createValuableIndicatorsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData,colors) => {
  const valuableIndicators = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader' },
      { text: 'Ecart\nbranche', style: 'tableHeader' },
    ],
  ];

  valuableIndicators.sort((a, b) => {
    const isSectoralA = keyIndics.includes(a);
    const isSectoralB = keyIndics.includes(b);

    if (isSectoralA && !isSectoralB) {
      return -1;
    } else if (!isSectoralA && isSectoralB) {
      return 1;
    } else {
      const indicatorValueA = getFootprintValue(production, period, a);
      const indicatorValueB = getFootprintValue(production, period, b);
      const branchValueA = getBranchValue(comparativeData, a);
      const branchValueB = getBranchValue(comparativeData, b);

      const marginPercentageA = getMarginPercentage(indicatorValueA, branchValueA);
      const marginPercentageB = getMarginPercentage(indicatorValueB, branchValueB);

      return Math.abs(marginPercentageB) - Math.abs(marginPercentageA);
    }
  }).forEach(key => {
    const indicatorValue = getFootprintValue(production, period, key);
    const branchValue = getBranchValue(comparativeData, key);

    const marginPercentage = getMarginPercentage(indicatorValue, branchValue);

    tableBody.push([
      { text: indicatorLabels[key] },
      { text: indicatorUnits[key], style: 'unit' },
      isSectoralIssue(keyIndics, key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
      { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+' : ''}${marginPercentage}%`, style: 'data' },
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
  };
};

const createImprovementTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData,colors) => {
  const improvementIndicators = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader' },
      { text: 'Ecart\nbranche', style: 'tableHeader' },
    ],
  ];

  improvementIndicators
    .sort((a, b) => {
      const isSectoralA = keyIndics.includes(a);
      const isSectoralB = keyIndics.includes(b);

      if (isSectoralA && !isSectoralB) {
        return -1;
      } else if (!isSectoralA && isSectoralB) {
        return 1;
      } else {
        const indicatorValueA = getFootprintValue(production, period, a);
        const indicatorValueB = getFootprintValue(production, period, b);
        const branchValueA = getBranchValue(comparativeData, a);
        const branchValueB = getBranchValue(comparativeData, b);

        const marginPercentageA = getMarginPercentage(indicatorValueA, branchValueA);
        const marginPercentageB = getMarginPercentage(indicatorValueB, branchValueB);

        return Math.abs(marginPercentageB) - Math.abs(marginPercentageA);
      }
    })
    .forEach(key => {
      const indicatorValue = getFootprintValue(production, period, key);
      const branchValue = getBranchValue(comparativeData, key);
      const marginPercentage = getMarginPercentage(indicatorValue, branchValue);

      tableBody.push([
        { text: indicatorLabels[key] },
        { text: indicatorUnits[key], style: 'unit' },
        isSectoralIssue(keyIndics, key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
        { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+' : ''}${marginPercentage}%`, style: 'data' },
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
  };
};

const createNationalTargetsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData,colors) => {
  const nationalTargets = getNationalTargets(indicatorLabels, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="#36c575" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>';


  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu\nsectoriel', style: 'tableHeader' },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Objectif\nà atteindre', style: 'tableHeader' },
      { text: 'Effort\nà fournir', style: 'tableHeader' },

    ],
  ];

  nationalTargets
    .sort((a, b) => {
      const targetValueA = getTargetValue(comparativeData, a);
      const targetValueB = getTargetValue(comparativeData, b);

      const footprintValueA = getFootprintValue(production, period, a);
      const footprintValueB = getFootprintValue(production, period, b);

      const targetAchievedA = footprintValueA ? isBetter(a, footprintValueA, targetValueA, 10) : null;
      const targetAchievedB = footprintValueB ? isBetter(b, footprintValueB, targetValueB, 10) : null;

      if (targetAchievedA === true && targetAchievedB !== true) {
        return -1;
      } else if (targetAchievedB === true && targetAchievedA !== true) {
        return 1;
      } else {
        const marginPercentageA = getEffortPercentage(footprintValueA, targetValueA);
        const marginPercentageB = getEffortPercentage(footprintValueB, targetValueB);

        return Math.abs(marginPercentageB) - Math.abs(marginPercentageA);
      }
    })
    .forEach(key => {
      const targetValue = getTargetValue(comparativeData, key);
      const footprintValue = getFootprintValue(production, period, key);
      const targetAchieved = footprintValue ? isBetter(key, footprintValue, targetValue, 10) : null;
      const marginPercentage = getEffortPercentage(footprintValue, targetValue);

      tableBody.push([
        { text: indicatorLabels[key] },
        { text: indicatorUnits[key], style: 'unit' },
        isSectoralIssue(keyIndics, key) ? { svg: exclamationIcon, width: 6, height: 6, alignment: "center" } : { text: '-', alignment: "center" },
        { text: footprintValue ? `${footprintValue}` : "-", style: 'data' },
        { text: `${targetValue}`, style: 'data' },

        targetAchieved === true ? {
          columns: [
            { svg: checkIcon, width: 10, height: 10 },
            { width: '*', text: "atteint", alignment: "left" }
          ]
        }
          :
          { text: targetAchieved === null ? "-" : `${marginPercentage > 0 ? '+' : ''}${marginPercentage}%`, style: 'data' }

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
    paddingTop: function (i, node) { return (i === 0) ? 1 : 5; },
    paddingBottom: function (i, node) { return (i === 0) ? 1 : 5; },
  };
}

// ----------------------------- Utils ----------------------------------------------

const splitTitle = (title) => {
  const words = title.split(' ');
  const middle = Math.ceil(words.length / 2);
  return words.slice(0, middle).join(' ') + '\n' + words.slice(middle).join(' ');
};








