import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import metaIndics from "/lib/indics.json";

// Utils
import { loadFonts } from "./utils/layout";
import { getChartImageData, loadImageAsDataURL } from "./utils";
import { getKeyIndics, isBetter, isWorst } from "../../utils";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const buildESEReport = async ({ session, period }) => {
  const {
    financialData,
    comparativeData,
  } = session;

  const { production } = financialData.mainAggregates;

  const keyIndics = getKeyIndics(comparativeData.comparativeDivision);
  const indicatorLabels = getIndicatorLabels();
  const indicatorUnits = getIndicatorUnits();

  const indicatorImages = await getIndicatorCharts();

  const margins = {
    top: 50,
    bottom: 50,
    left: 40,
    right: 40,
  };

  const pageSize = {
    width: 595.28,
    height: 841.89,
  };

  const background = createBackground(pageSize, margins);

  const content = [
    {
      text: "Rapport - Empreinte Sociétale de l'Entreprise",
      alignment: "center",
      fontSize: 16,
      bold: true,
      margin: [0, 10],
    },
    ...createIndicatorCharts(indicatorLabels, indicatorImages),
    { text: '', pageBreak: 'after' },
    { text: "Résultats", style: "h4", bold: true, margin: [0, 0, 0, 10] },
    createResultsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Indicateurs Valorisables", style: "h4", margin: [0, 10, 0, 10] },
    createValuableIndicatorsTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Points d'améliorations", style: "h4", margin: [0, 10, 0, 10] },
    createImprovementTable(production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
    { text: "Objectifs sectoriels", style: "h4", margin: [0, 10, 0, 10] },
    createNationalTargetsTable(production, period, indicatorLabels, indicatorUnits,keyIndics, comparativeData)
  ];

  const docDefinition = {
    pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    background,
    info: {
      title: "",
      author: "",
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content,
    defaultStyle: {
      columnGap: 20,
      color: "#191558",
      font: "Raleway",
    },
    styles: {
      h4: {
        bold: true,
      },
      table: {
        margin: [0, 0, 0, 10],
        fontSize: 8,
        font: "Roboto",
      },
      tableHeader: {
        fillColor: "#f0f0f8",
        bold: true,
        margin: [0, 5, 0, 5],
        color: "#191558",
        alignment: "center"
      },
      tableData: {
        fontSize: 7,
        alignment: 'right'
      },
    },
  };

  const ESEReport = pdfMake.createPdf(docDefinition);

  return ESEReport;
};

const createBackground = (pageSize, margins) => ({
  canvas: [
    {
      type: "rect",
      x: 0,
      y: 0,
      w: pageSize.width,
      h: pageSize.height,
      color: "#f1f0f4",
    },
    {
      type: "rect",
      x: margins.left - 20,
      y: margins.top - 15,
      w: pageSize.width - margins.left - margins.right + 40,
      h: pageSize.height - margins.top - 15,
      color: "#FFFFFF",
      r: 10,
    },
  ],
});

const createIndicatorCharts = (indicatorLabels, indicatorImages) => {
  const columns = [];
  let currentRow = [];

  Object.keys(indicatorImages).forEach((key, index) => {
    currentRow.push({
      margin: [0, 10],
      stack: [
        { text: indicatorLabels[key], alignment: 'center', bold: true, margin: [0, 5], fontSize: 8 },
        { image: indicatorImages[key], width: 120, alignment: 'center' }
      ],
    });

    if ((index + 1) % 3 === 0 || index === Object.keys(indicatorImages).length - 1) {
      columns.push({ columns: currentRow });
      currentRow = [];
    }
  });

  return columns;
};

const createResultsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {

  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: 'Unité légale', colSpan: 3, alignment: "center", border: [true, true, true, true], bold : true },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
    ],
    [
      { text: 'Indicateur', style: 'tableHeader', alignment: "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader' },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Incertitude', style: 'tableHeader' },
      { text: 'Branche', style: 'tableHeader' },
      { text: 'Objectif sectoriel', style: 'tableHeader' }
    ],
  ];

  Object.keys(indicatorLabels).sort((a, b) => {
    return indicatorLabels[a].localeCompare(indicatorLabels[b]);
  }).forEach(key => {
    tableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: "left" },
      { text: indicatorUnits[key], style: 'tableData' },
      isSectoralIssue(keyIndics, key) ? { svg:  exclamationIcon , width: 6, height: 6, style: 'tableData' } : { text:  '-' , style: 'tableData' },
      { text: getFootprintValue(production, period, key) ? `${getFootprintValue(production, period, key)}` : "-", style: 'tableData' },
      { text: getUncertainty(production, period, key) ? `${getUncertainty(production, period, key)}%` : "-", style: 'tableData' },
      { text: getBranchValue(comparativeData, key) ? `${getBranchValue(comparativeData, key)}` : " - ", style: 'tableData' },
      { text: getTargetValue(comparativeData, key) ? getTargetValue(comparativeData, key) : "-", style: 'tableData' },
    ]);
  });

  return {
    table: {
      headerRows: 2,
      widths: ["auto", 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return '#191558' ;
      },
      vLineWidth: function (i, node) {
        if ((i == 2 || i == 5)) {
          return 0.5;
        } else {
          return 0;
        }
      },
      vLineColor: function (i, node) {
        return '#191558';
      },
      paddingTop: function (i, node) { return 4; },
      paddingRight: function (i, node) { return 5; },
      paddingLeft: function (i, node) { return 5; },
      paddingBottom: function (i, node) { return 4; },
    },
    style: 'table',
  };
};

const isSectoralIssue = (keyIndics, key) => keyIndics.includes(key);

const createValuableIndicatorsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
  const valuableIndicators = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment : "left" },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader' },
      { text: 'Ecart branche', style: 'tableHeader' },
      { text: 'Objectif défini', style: 'tableHeader' },
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
      const hasTargetA = getTargetValue(comparativeData, a) !== null;
      const hasTargetB = getTargetValue(comparativeData, b) !== null;

      if (hasTargetA && !hasTargetB) {
        return -1;
      } else if (!hasTargetA && hasTargetB) {
        return 1;
      } else {
        return 0;
      }
    }
  }).forEach(key => {
      const indicatorValue = getFootprintValue(production, period, key);
      const targetValue = getTargetValue(comparativeData, key);
      const branchValue = getBranchValue(comparativeData, key);
      
      const marginPercentage = getMarginPercentage(indicatorValue, branchValue);
  

      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: indicatorUnits[key], style: 'tableData'},
        isSectoralIssue(keyIndics, key) ? { svg:  exclamationIcon , width: 6, height: 6, style: 'tableData' } : { text:  '-' , style: 'tableData' },
        { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+' : ''}${marginPercentage}%`, style: 'tableData' },        { text: targetValue ? "Oui" : "Non", style: 'tableData' },
      ]);
    });

  return {
    table: {
      headerRows: 1,
      widths: ["*",  'auto','auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
  };
};

const createImprovementTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
  const improvementIndicators = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment : 'left' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader' },
      { text: 'Ecart branche', style: 'tableHeader' },
      { text: 'Objectif défini', style: 'tableHeader' },
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
      const hasTargetA = getTargetValue(comparativeData, a) !== null;
      const hasTargetB = getTargetValue(comparativeData, b) !== null;

      if (hasTargetA && !hasTargetB) {
        return -1;
      } else if (!hasTargetA && hasTargetB) {
        return 1;
      } else {
        return 0;
      }
    }
  })
  .forEach(key => {
    const indicatorValue = getFootprintValue(production, period, key);
    const targetValue = getTargetValue(comparativeData, key);
    const branchValue = getBranchValue(comparativeData, key);
    const marginPercentage = getMarginPercentage(indicatorValue, branchValue);

    tableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
      { text: indicatorUnits[key], style: 'tableData' },
      isSectoralIssue(keyIndics, key) ? { svg:  exclamationIcon , width: 6, height: 6, style: 'tableData' } : { text:  '-' , style: 'tableData' },
      { text: marginPercentage === '-' ? marginPercentage : `${marginPercentage > 0 ? '+' : ''}${marginPercentage}%`, style: 'tableData' },
      { text: targetValue ? "Oui" : "Non", style: 'tableData' },
    ]);
  });

  return {
    table: {
      headerRows: 1,
      widths: ["*", 'auto','auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: tableLayout(),
    style: 'table',
  };
};

const createNationalTargetsTable = (production, period, indicatorLabels, indicatorUnits,keyIndics, comparativeData) => {
  const nationalTargets = getNationalTargets(indicatorLabels, comparativeData);
  const exclamationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="#ffc107" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M9 5v6h2V5zm0 8v2h2v-2z"/></svg>';

  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader', alignment : 'left' },
      { text: 'Unité', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader' },
      { text: 'Empreinte', style: 'tableHeader' },
      { text: 'Objectif à atteindre', style: 'tableHeader' },
      { text: 'Effort à fournir', style: 'tableHeader' },

    ],
  ];

  nationalTargets
  .sort((a, b) => {
    const isSectoralA = keyIndics.includes(a);
    const isSectoralB = keyIndics.includes(b);

    if (isSectoralA && !isSectoralB) {
      return -1;
    } else if (!isSectoralA && isSectoralB) {
      return 1;
    } else {
      const hasTargetA = getTargetValue(comparativeData, a) !== null;
      const hasTargetB = getTargetValue(comparativeData, b) !== null;

      if (hasTargetA && !hasTargetB) {
        return -1;
      } else if (!hasTargetA && hasTargetB) {
        return 1;
      } else {
        const footprintValueA = getFootprintValue(production, period, a) !== null;
        const footprintValueB = getFootprintValue(production, period, b) !== null;

        if (footprintValueA && !footprintValueB) {
          return -1;
        } else if (!footprintValueA && footprintValueB) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  })
  .forEach(key => {
    const targetValue =  getTargetValue(comparativeData, key);
    const footprintValue = getFootprintValue(production, period, key);
    const targetAchieved = footprintValue ? isBetter(key, footprintValue, targetValue, 10) : null;
    const marginPercentage = getEffortPercentage(footprintValue, targetValue);
    
    tableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
      { text:   indicatorUnits[key], style: 'tableData' },
      isSectoralIssue(keyIndics, key) ? { svg:  exclamationIcon , width: 6, height: 6, style: 'tableData' } : { text:  '-' , style: 'tableData' },
      { text: footprintValue ? `${footprintValue}` : "-", style: 'tableData' },
      { text:  footprintValue ? `${targetValue}` : "-", style: 'tableData' },
      { text: targetAchieved === null ? '-' : (targetAchieved ? "Objectif atteint" : `${marginPercentage}%`), style: 'tableData' },
    ]);
    
  });

  return {
    table: {
      headerRows: 1,
      widths: ["*", 'auto','auto','auto', 'auto', 'auto'],
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
      return '#191558' ;
    },
    vLineWidth: function (i, node) {
      return 0;
    },
    vLineColor: function (i, node) {
      return '#191558';
    },
    paddingTop: function (i, node) { return 4; },
    paddingRight: function (i, node) { return 5; },
    paddingLeft: function (i, node) { return 5; },
    paddingBottom: function (i, node) { return 4; },
  };
}

const getFootprintValue = (production, period, key) => production.periodsData[period.periodKey]?.footprint.indicators[key].value;
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
const getIndicatorCharts = async () => {
  const indicatorImages = {};

  const defaultPieImage = "/pie-no-data.png";
  const defaultImage = await loadImageAsDataURL(defaultPieImage);


  Object.keys(metaIndics).forEach(key => {
    const id = `socialfootprintvisual_${key}`;

    const imageData = getChartImageData(id) || defaultImage;
    if (imageData) {
      indicatorImages[key] = imageData;
    }
  });
  return indicatorImages;
}
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









