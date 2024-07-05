import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import metaIndics from "/lib/indics.json";

// Utils
import { loadFonts } from "./utils/layout";
import { getChartImageData, loadImageAsDataURL } from "./utils";
import { getKeyIndics, isBetter, isWorst } from "../../utils";
import { getPrevPeriod } from "../../../../../utils/periodsUtils";


pdfMake.vfs = pdfFonts.pdfMake.vfs;
loadFonts();

export const buildESEReport = async ({ session, period }) => {
    const {
      legalUnit,
      financialData,
      comparativeData,
      availablePeriods
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
      createPreviousPeriodSection(availablePeriods, period, production, indicatorLabels, indicatorUnits, keyIndics, comparativeData),
      { text: "Objectifs nationaux", style: "h4", margin: [0, 10, 0, 10] },
      createNationalTargetsTable(production, period, indicatorLabels, indicatorUnits, comparativeData)
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
          fontSize: 9,
          font: "Roboto",
        },
        tableHeader: {
          fillColor: "#f0f0f8",
          bold: true,
          margin: [0, 5, 0, 5],
          color: "#191558",
        },
        tableData: {
          fontSize: 8,
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
    const tableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Enjeu', style: 'tableHeader' },
        { text: 'Empreinte', style: 'tableHeader' },
        { text: 'Incertitude', style: 'tableHeader'},
        { text: 'Branche', style: 'tableHeader'},
        { text: 'Objectif national', style: 'tableHeader'}
      ],
    ];
  
    Object.keys(indicatorLabels).sort((a, b) => {
      return indicatorLabels[a].localeCompare(indicatorLabels[b]);
    }).forEach(key => {
      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: isSectoralIssue(keyIndics, key) ? "Oui" : "Non", style: 'tableData' },
        { text: getFootprintValue(production, period, key) ? `${getFootprintValue(production, period, key)} ${indicatorUnits[key]}` : "N/A", style: 'tableData' },
        { text: getUncertainty(production, period, key) ? `${getUncertainty(production, period, key)}%` : "N/A", style: 'tableData' },
        { text: getBranchValue(comparativeData, key) ? `${getBranchValue(comparativeData, key)} ${indicatorUnits[key]}` : " - ", style: 'tableData' },
        { text: getTargetValue(comparativeData, key) ? "Oui" : "Non", style: 'tableData' },
      ]);
    });
  
    return {
      table: {
        headerRows: 1,
        widths: ["auto", 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody,
      },
      layout: tableLayout(),
      style: 'table',
    };
  };
  
  const isSectoralIssue = (keyIndics, key) => keyIndics.includes(key);
  
  const createValuableIndicatorsTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
    const valuableIndicators = getValuableIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  
    const tableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Enjeu', style: 'tableHeader'},
        { text: 'Ecart branche', style: 'tableHeader'},
        { text: 'Objectif', style: 'tableHeader'},
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
        return 0;
      }
    })
    .forEach(key => {
      const indicatorValue = getFootprintValue(production, period, key);
      const targetValue = getTargetValue(comparativeData, key);
      const branchValue = getBranchValue(comparativeData, key);
      const marginValue = (indicatorValue - branchValue).toFixed(1);
  
      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: isSectoralIssue(keyIndics, key) ? "Oui" : "Non", style: 'tableData'},
        { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData'},
        { text:  targetValue ? "Oui" : "Non", style: 'tableData'},
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
  
  const createImprovementTable = (production, period, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
    const improvementIndicators = getImprovementIndicators(production, period, indicatorLabels, keyIndics, comparativeData);
  
    const tableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Enjeu', style: 'tableHeader'},
        { text: 'Ecart branche', style: 'tableHeader'},
        { text: 'Objectif', style: 'tableHeader'},
      ],
    ];
  
    improvementIndicators.forEach(key => {
      const indicatorValue = getFootprintValue(production, period, key);
      const targetValue = getTargetValue(comparativeData, key);
      const branchValue = getBranchValue(comparativeData, key);
      const marginValue = (indicatorValue - branchValue).toFixed(1);
  
      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: isSectoralIssue(keyIndics, key) ? "Oui" : "Non", style: 'tableData'},
        { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData'},
        { text:  targetValue ? "Oui" : "Non", style: 'tableData'},
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
  
  const createPreviousPeriodSection = (availablePeriods, period, production, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
    if (availablePeriods.length < 2) {
      return { text: '' };
    }
  
    return [
      { text: "Période précédente", style: "h4", margin: [0, 10, 0, 10] },
      createPreviousPeriodTable(availablePeriods, period, production, indicatorLabels, indicatorUnits, keyIndics, comparativeData)
    ];
  };
  
  const createPreviousPeriodTable = (availablePeriods, period, production, indicatorLabels, indicatorUnits, keyIndics, comparativeData) => {
    const previousPeriod = availablePeriods.filter(p => p !== period).pop();
    const tableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Enjeu', style: 'tableHeader', alignment: 'center' },
        { text: 'Empreinte', style: 'tableHeader'},
        { text: 'Incertitude', style: 'tableHeader'},
        { text: 'Période précédente', style: 'tableHeader'},
        { text: 'Écart', style: 'tableHeader'}
      ],
    ];
  
    Object.keys(indicatorLabels).sort((a, b) => {
      return indicatorLabels[a].localeCompare(indicatorLabels[b]);
    }).forEach(key => {
      const currentValue = getFootprintValue(production, period, key);
      const previousValue = getFootprintValue(production, previousPeriod, key);
      const marginValue = previousValue !== null && currentValue !== null ? (currentValue - previousValue).toFixed(1) : ' - ';
  
      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: isSectoralIssue(keyIndics, key) ? "Oui" : "Non", style: 'tableData', alignment: 'center' },
        { text: currentValue ? `${currentValue} ${indicatorUnits[key]}` : " - ", style: 'tableData'},
        { text: getUncertainty(production, period, key) ? `${getUncertainty(production, period, key)}%` : " ", style: 'tableData'},
        { text: previousValue ? `${previousValue} ${indicatorUnits[key]}` : " - ", style: 'tableData'},
        { text: marginValue, style: 'tableData'},
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
  
  const createNationalTargetsTable = (production, period, indicatorLabels, indicatorUnits, comparativeData) => {
    const nationalTargets = getNationalTargets(indicatorLabels, comparativeData);
  
    const tableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Branche', style: 'tableHeader'},
        { text: 'Objectif', style: 'tableHeader'},
        { text: 'Atteint', style: 'tableHeader'},

      ],
    ];
  
    nationalTargets.forEach(key => {
      const branchValue = getBranchValue(comparativeData, key);
      const targetValue = getTargetValue(comparativeData, key);
      const footprintValue = getFootprintValue(production, period, key);
      const targetAchieved = isBetter(key,footprintValue,targetValue,10) ? "Oui" : "Non";
  
      tableBody.push([
        { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
        { text: branchValue ? `${branchValue} ${indicatorUnits[key]}` : " - ", style: 'tableData'},
        { text: `${targetValue} ${indicatorUnits[key]}`, style: 'tableData'},
        { text: `${targetAchieved}`, style: 'tableData'},

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
  
  const tableLayout = () => {
    return {
      hLineWidth: function (i, node) {
        return (i === 1) ? 0.5 : 0.2;
      },
      hLineColor: function (i, node) {
        console.log(node.table);
        return (i === 0 || i === 1 || i === node.table.body.length) ? '#191558' : '#f0f0f8';
      },
      vLineWidth: function (i, node) {
        return (i === 0 || i === node.table.widths.length) ? 0.5 : 0;
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
  const getTargetValue = (comparativeData,key) => {
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
  const getIndicatorCharts = async() => {
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

  
      return footprintValue !== null && branchValue !== null && isBetter(key,footprintValue,branchValue,10);
    });
  };
  
  const getImprovementIndicators = (production, period, indicatorLabels, keyIndics, comparativeData) => {
    return Object.keys(indicatorLabels).filter(key => {
      const footprintValue = getFootprintValue(production, period, key);
      const branchValue = getBranchValue(comparativeData, key);
  
      return footprintValue !== null && branchValue !== null && isWorst(key,footprintValue,branchValue,10);
    });
  };

  
  const getNationalTargets = (indicatorLabels, comparativeData) => {
    return Object.keys(indicatorLabels).filter(key => {
      return getTargetValue(comparativeData, key) !== null;
    });
  };
    









