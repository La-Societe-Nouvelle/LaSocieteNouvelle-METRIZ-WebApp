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
  // Session data --------------------------------------------------

  const {
    legalUnit,
    financialData,
    comparativeData,
    availablePeriods
  } = session;

  const { production } = financialData.mainAggregates;

  const keyIndics = getKeyIndics(comparativeData.comparativeDivision);

  const indicatorLabels = getIndicatorLabels();
  const indicatorImages = await getIndidcatorCharts();
  const indicatorUnits = getIndicatorUnits();


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

  const background = {
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
  };

  const content = [
    {
      text: "Rapport - Empreinte Sociétale de l'Entreprise",
      alignment: "center",
      fontSize: 16,
      bold: true,
      margin: [0, 10],
    },
  ];

  // Adding the charts and labels
  const columns = [];
  let currentRow = [];
  Object.keys(indicatorImages).forEach((key, index) => {
    currentRow.push({
      margin: [0, 10],
      stack: [
        { text: indicatorLabels[key], alignment: 'center', bold: true, margin: [0, 5], fontSize: 8, },
        { image: indicatorImages[key], width: 120, alignment: 'center' }
      ],
    });

    if ((index + 1) % 3 === 0 || index === Object.keys(indicatorImages).length - 1) {
      columns.push({ columns: currentRow });
      currentRow = [];
    }
  });

  content.push(...columns);

  content.push({ text: '', pageBreak: 'after' });

  content.push({
    text: "Résultats",
    style: "h4",
    bomld: true,
    margin: [0, 0, 0, 10],
  });


  const tableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader', alignment: 'center' },
      { text: 'Empreinte', style: 'tableHeader', alignment: 'right' },
      { text: 'Incertitude', style: 'tableHeader', alignment: 'right' },
      { text: 'Branche', style: 'tableHeader', alignment: 'right' },
      { text: 'Objectif', style: 'tableHeader', alignment: 'right' }
    ],
  ];


  const isSectoralIssue = (key) => {


    return keyIndics.includes(key) ? true : false;
  };


  const getFootprint = (key) => {
    const footprintData = production.periodsData[period.periodKey].footprint.indicators[key];

    if (!footprintData) {
      return null;
    }

    const { value } = footprintData;

    return value;
  };

  const getUncertainty = (key) => {
    return production.periodsData[period.periodKey].footprint.indicators[key].uncertainty;
  };

  const getBranchAverage = (key) => {

    const branchValue = comparativeData.production.division.history.data[key]?.slice(-1)[0].value;

    if(!branchValue) {
      return null;
    }

    return branchValue;
  };

  const getTarget = (key) => {
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


  const sortedIndicators = Object.keys(indicatorLabels).sort((a, b) => {
    const labelA = indicatorLabels[a].toLowerCase();
    const labelB = indicatorLabels[b].toLowerCase();
    return labelA.localeCompare(labelB);
  });

  

  sortedIndicators.forEach(key => {
    tableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
      { text: isSectoralIssue(key) ? "Oui" : "Non", style: 'tableData', alignment: 'center' },
      { text: getFootprint(key) ? getFootprint(key) + " " + indicatorUnits[key] : " - ", style: 'tableData', alignment: 'right' },
      { text: getUncertainty(key) ? getUncertainty(key) + "%" : " - ", style: 'tableData', alignment: 'right' },
      { text: getBranchAverage(key) ? getBranchAverage(key) + indicatorUnits[key] : " - ", style: 'tableData', alignment: 'right' },
      { text: getTarget(key) ? getTarget(key) + indicatorUnits[key] : " - ", style: 'tableData', alignment: 'right' },
    ]);
  });


  content.push({
    table: {
      headerRows: 1,
      widths: ["*", 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 1) ? 0.5 : 0.2;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === 1) ? '#191558' : '#f0f0f8';
      },
      vLineWidth: function (i, node) {
        return 0;
      },
      paddingTop: function (i, node) { return 4; },
      paddingBottom: function (i, node) { return 4; },
    },
    style: 'table',
  });



  
  const getValuablesIndicators = () => {
    const valuableIndicators = Object.keys(indicatorLabels).filter(key => {
      const indicatorValue = getFootprint(key);
      if (!indicatorValue) {
        return false;
      }
      const branchValue = getBranchAverage(key);
      if (!branchValue) {
        return false;
      }
      return isBetter(key, indicatorValue, branchValue, 10);
    });
  
    valuableIndicators.sort((keyA, keyB) => {
      const isSectoralA = isSectoralIssue(keyA);
      const isSectoralB = isSectoralIssue(keyB);
      if (isSectoralA && !isSectoralB) {
        return -1; 
      } else if (!isSectoralA && isSectoralB) {
        return 1; 
      } else {
        return 0; 
      }
    });
  
    return valuableIndicators;
  };

const valuableIndicators = getValuablesIndicators();
  console.log('valuable', valuableIndicators);

  const valuableIndicatorsTableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader', alignment: 'right' },
      { text: 'Écart par rapport à la branche', style: 'tableHeader', alignment: 'right' },
      { text: 'Objectif atteint', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  valuableIndicators.forEach(key => {
    const indicatorValue = production.periodsData[period.periodKey].footprint.indicators[key].value;
    const targetValue = getTarget(key);
    const branchValue = getBranchAverage(key);
    const marginValue = (indicatorValue - branchValue).toFixed(1);
    const isGoalAchieved =  targetValue !== null ? isBetter(key, indicatorValue, targetValue, 10) ? "Oui" : "Non" : "-";

    valuableIndicatorsTableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left'},
      { text:  isSectoralIssue(key) ? "Oui" : "Non", style: 'tableData', alignment: 'right'},
      { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData', alignment: 'right'},
      { text: isGoalAchieved , style: 'tableData', alignment: 'right'},
    ]);
  });

  content.push({
    text: "Indicateurs Valorisables",
    style: "h4",
    margin: [0, 10, 0, 10],
  });

  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: valuableIndicatorsTableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 1) ? 0.5 : 0.2;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === 1) ? '#191558' : '#f0f0f8';
      },
      vLineWidth: function (i, node) {
        return 0; 
      },
      paddingTop: function (i, node) { return 4; },
      paddingBottom: function (i, node) { return 4; },
    },
    style: 'table',
  });



  const getIndicatorsToImprove = () => {
    const indicatorsToImprove = Object.keys(indicatorLabels).filter(key => {
      const indicatorValue = getFootprint(key);
      if (!indicatorValue) {
        return false;
      }
      const branchValue = getBranchAverage(key);
      if (!branchValue) {
        return false;
      }
      return isWorst(key, indicatorValue, branchValue, 10);
    });
  
    indicatorsToImprove.sort((keyA, keyB) => {
      const isSectoralA = isSectoralIssue(keyA);
      const isSectoralB = isSectoralIssue(keyB);
      if (isSectoralA && !isSectoralB) {
        return -1; 
      } else if (!isSectoralA && isSectoralB) {
        return 1; 
      } else {
        return 0; 
      }
    });
  
    return indicatorsToImprove;
  };

  
const indicatorsToImprove  = getIndicatorsToImprove();
  console.log(indicatorsToImprove)

  const indicatorsToImproveTableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Enjeu', style: 'tableHeader', alignment: 'right' },
      { text: 'Écart par rapport à la branche', style: 'tableHeader', alignment: 'right' },
      { text: 'Objectif', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  indicatorsToImprove .forEach(key => {
    const indicatorValue = production.periodsData[period.periodKey].footprint.indicators[key].value;
    const targetValue = getTarget(key);
    const branchValue = getBranchAverage(key);
    const marginValue = (indicatorValue - branchValue).toFixed(1);

    indicatorsToImproveTableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left'},
      { text:  isSectoralIssue(key) ? "Oui" : "Non", style: 'tableData', alignment: 'right'},
      { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData', alignment: 'right'},
      { text: targetValue ? "Oui" : "Non ", style: 'tableData', alignment: 'right' },

    ]);
  });

  content.push({
    text: "Points d'améliorations",
    style: "h4",
    margin: [0, 10, 0, 10],
  });

  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: indicatorsToImproveTableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 1) ? 0.5 : 0.2;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === 1) ? '#191558' : '#f0f0f8';
      },
      vLineWidth: function (i, node) {
        return 0; 
      },
      paddingTop: function (i, node) { return 4; },
      paddingBottom: function (i, node) { return 4; },
    },
    style: 'table',
  });



  const prevPeriod = getPrevPeriod(availablePeriods, period);
  console.log(prevPeriod);

  if (prevPeriod) {

    content.push({
      text: "Dynamique positive",
      style: "h4",
      margin: [0, 10, 0, 10],
    });




    const prevTableBody = [
      [
        { text: 'Indicateur', style: 'tableHeader' },
        { text: 'Enjeu', style: 'tableHeader', alignment: 'center' },
        { text: 'Ecart N/N-1', style: 'tableHeader', alignment: 'right' },

      ],
    ];

    sortedIndicators.forEach(key => {

      const currentFootprint = getFootprint(key);
      const prevFootprint = production.periodsData[prevPeriod.periodKey].footprint.indicators[key].value;


      if (currentFootprint && prevFootprint) {

  
        const isBetterCurrent = isBetter(key, currentFootprint, prevFootprint, 0);

        const marginValue = (currentFootprint - prevFootprint).toFixed(2);

        if (isBetterCurrent) {
          prevTableBody.push([
            { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
            { text: isSectoralIssue(key) ? "Oui" : "Non", style: 'tableData', alignment: 'center' },
            { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData', alignment: 'right' },
          ]);
        }
      }
    });

    // TO DO : don't push if no rows 
    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto'],
        body: prevTableBody,
      },
      layout: {
        hLineWidth: function (i, node) {
          return (i === 1) ? 0.5 : 0.2;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === 1) ? '#191558' : '#f0f0f8';
        },
        vLineWidth: function (i, node) {
          return 0; 
        },
        paddingTop: function (i, node) { return 4; },
        paddingBottom: function (i, node) { return 4; },
      },
      style: 'table',
    });



  }


  const getIndicatorsWithFootprint = () => {
    const indicatorsWithFootprint = Object.keys(indicatorLabels).filter(key => {
      const footprintData = getFootprint(key);
      const targetData = getTarget(key);
  
      return (footprintData  && targetData );
    });
  
    return indicatorsWithFootprint;
  };
  
  const indicatorsWithFootprint = getIndicatorsWithFootprint()


  const footprintTableBody = [
    [
      { text: 'Indicateur', style: 'tableHeader' },
      { text: 'Objectif 2030', style: 'tableHeader', alignment: 'right' },
      { text: 'Ecart', style: 'tableHeader', alignment: 'right' },
      { text: 'Objectif atteint', style: 'tableHeader', alignment: 'right' },

    ],
  ]

  indicatorsWithFootprint.forEach(key => {
    const footprintValue = getFootprint(key);
    const targetValue = getTarget(key);
  
    const marginValue = (footprintValue - targetValue).toFixed(2);
  
    footprintTableBody.push([
      { text: indicatorLabels[key], style: 'tableData', alignment: 'left' },
      { text: `${targetValue} ${indicatorUnits[key]}`, style: 'tableData', alignment: 'right' },
      { text: `${marginValue} ${indicatorUnits[key]}`, style: 'tableData', alignment: 'right' },
      { text: isBetter(key, footprintValue, targetValue, 0) ? "Oui" : "Non", style: 'tableData', alignment: 'right' },
    ]);
  });

  content.push({
    text: "Objectifs nationaux",
    style: "h4",
    margin: [0, 10, 0, 10],
  });
  
  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: footprintTableBody,
    },
    layout: {
      hLineWidth: function (i, node) {
        return (i === 1) ? 0.5 : 0.2;
      },
      hLineColor: function (i, node) {
        return (i === 0 || i === 1) ? '#191558' : '#f0f0f8';
      },
      vLineWidth: function (i, node) {
        return 0; 
      },
      paddingTop: function (i, node) { return 4; },
      paddingBottom: function (i, node) { return 4; },
    },
    style: 'table',
  });

  

  const docDefinition = {
    pageSize: pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    background: background,
    info: {
      title: "",
      author: "",
      subject: "Rapport des impacts de votre entreprise",
      creator: "Metriz - La Société Nouvelle",
      producer: "Metriz - La Societé Nouvelle",
    },
    content: content,
    defaultStyle: {
      columnGap: 20,
      color: "#191558",
      font: "Raleway",
    },
    styles: {
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

const getIndidcatorCharts = async () => {
  const indicatorImages = {};

  const defaultPieImage = "/pie-no-data.png";
  const defaultImage = await loadImageAsDataURL(defaultPieImage);


  Object.keys(metaIndics).forEach(key => {
    const id = `socialfootprintvisual_${key}`;
    console.log( getChartImageData(id) )

    const imageData = getChartImageData(id) || defaultImage;
    if (imageData) {
      indicatorImages[key] = imageData;
    }
  });
  console.log(indicatorImages);
  return indicatorImages;
};

