import { borderColor } from "polished";
import { getLabelPeriod } from "../../../../../../utils/periodsUtils";
import { printValue } from "/src/utils/formatters";

export const createSIGtableSection = (
  comparativeData,
  mainAggregates,
  productionAggregates,
  indic,
  unit,
  intermediateConsumptionsAggregates,
  fixedCapitalConsumptionsAggregates,
  period,
  precision,
  colors
) => {
  // FINANCIAL DATA
  const {
    revenue,
    storedProduction,
    immobilisedProduction,
  } = productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = mainAggregates;

  const showPrevPeriod = false;

  
  // const branchProductionFootprint = comparativeData.production.division.history.data[indic]?.[comparativeData.production.division.history.data[indic].length - 1] ?? null;
  // const branchNetValueAddedFootprint = comparativeData.netValueAdded.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;
  // const branchIntermediateConsumptionsFootprint = comparativeData.intermediateConsumptions.division.history.data[indic]?.[comparativeData.intermediateConsumptions.division.history.data[indic].length - 1] ?? null;
  // const branchFixedCapitalConsumptionsFootprint = comparativeData.fixedCapitalConsumptions.division.history.data[indic]?.[comparativeData.fixedCapitalConsumptions.division.history.data[indic].length - 1] ?? null;

  const tableBody = [
    [
      {
        text: [{
          text: `Empreinte exprimée en `,
          fontSize: 5,
          italics: true
        }, {
          text: unit,
          bold: true
        }], border: [false, false, false, true]
      },
      { text: '', border: [false, false, false, true] },
      { text: getLabelPeriod(period), colSpan: 2, border: [true, true, true, true], style: "darkBackground", alignment: "center" },
      { text: '', border: [false, false, false, true] },
      // { text: '', border: [false, false, false, false] },
    ],
    [
      {
        text: "Agrégat",
        style: "tableHeader",
      },
      {
        text: "Montant",
        style: "tableHeader",
        alignment: "right",
        border : [false,false,true,false] 
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Incertitude",
        style: "tableHeader",
        alignment: "right",
        border : [false,false,true,true] 
      },
      // {
      //   text: "Empreinte\nbranche",
      //   style: "tableHeader",
      //   alignment: "right"
      // },
    ],
    [
      { text: "Production", style: "tableBold", border : [false,true,false,true] },
      {
        text: printValue(production.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right",
        border : [false,true,true,true] 
      },
      {
        text: [
          {
            text:
              printValue(
                production.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " "
          },
        ],
        style: "tableBold",
        alignment: "right",
        border : [false,true,false,true] 
      },
      {
        text:
          printValue(production.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
        style: "tableBold",
        alignment: "right",
        border : [false,true,true,true] 

      },
      // {
      //   text: branchProductionFootprint,
      //   style: "tableBold",
      //   alignment: "right"
      // },
    ],
    [
      {
        text: "Chiffre d'affaires",
        margin: [5, 0, 0, 0]
      },
      {
        text: printValue(revenue.periodsData[period.periodKey].amount, 0) + " €",
        style: "data",
        border : [false,false,true,false] 
      },
      {

        style: "data",
        text: [
          {
            text:
              printValue(
                revenue.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " ",
          },

        ],
      },
      {
        style: "data",
        text:
          printValue(revenue.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          border : [false,false,true,false] 

      },
      // {
      //   text: " - ",
      //   style: "tableBold",
      //   alignment: "right"
      // },
    ],
    [
      {
        text: "Production stockée",
        margin: [5, 0, 0, 0]
      },
      {
        text: printValue(storedProduction.periodsData[period.periodKey].amount, 0) + " €",
        style: "data",
        border : [false,false,true,false] 

      },
      {
        style: "data",
        text: [
          {
            text:
              printValue(
                storedProduction.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " ",
          },

        ],
      },
      {
        text:
          printValue(
            storedProduction.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "data",
        border : [false,false,true,true] 

      },
      // {
      //   text: " - ",
      //   alignment: "right"
      // },
    ],
    ...getImmobilisedProductionRow(
      immobilisedProduction,
      indic,
      unit,
      precision
    ),
    [
      {
        text: "Consommations intermédiaires",
        style: "tableBold",
        border: [false, true, false, true]
      },
      {
        text: printValue(intermediateConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right",
        border : [false,true,true,true] 
      },
      {
        text: [
          {
            text:
              printValue(
                intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ),
          },

        ],
        style: "tableBold",
        alignment: "right",
        border: [false, true, false, true]
      },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "tableBold",
        alignment: "right",
        border: [false, true, true, true]
      },
      // {
      //   text: branchIntermediateConsumptionsFootprint.value,
      //   style: "tableBold",
      //   alignment: "right"
      // },
    ],
    ...getAggregateRow(
      intermediateConsumptionsAggregates,
      indic,
      unit,
      precision,
      period
    ),
    [
      {
        text: "Consommations de capital fixe",
        style: "tableBold",
        border: [false, true, false, true]

      },
      {
        text: printValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right",
        border : [false,true,true,true] 
      },
      {
        text: [
          {
            text:
              printValue(
                fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " "
          },

        ],
        style: "tableBold",
        alignment: "right",
        border: [false, true, false, true]
      },
      {
        text:
          printValue(
            fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "tableBold",
        alignment: "right",
        border: [false, true, true, true]

      },
      // {
      //   text: branchFixedCapitalConsumptionsFootprint.value,
      //   style: "tableBold",
      //   alignment: "right"
      // },
    ],
    ...getAggregateRow(
      fixedCapitalConsumptionsAggregates,
      indic,
      unit,
      precision,
      period
    ),
    [
      {
        text: "Valeur ajoutée nette",
        style: "tableBold",
        border: [false, true, false, true]

      },
      {
        text: printValue(netValueAdded.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right",
        border : [false,true,true,true] 
      },
      {
        style: "data",
        text: [
          {
            text:
              printValue(
                netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " "
          },

        ],
        style: "tableBold",
        alignment: "right",
        border: [false, true, false, true],
      },
      {
        text:
          printValue(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
          " %",
        style: "tableBold",
        alignment: "right",
        border: [false, true, true, true],
      },
      // {
      //   text: branchNetValueAddedFootprint.value,
      //   style: "tableBold",
      //   alignment: "right"
      // },
      ...showPrevPeriod ? [
        { text: "", style: 'data' },
        { text: "", style: 'data' },
        { text: "", style: 'data', fontSize: 5 }
      ] : [],
    ],
  ];

  return {
    table: {
      headerRows: 1,
      // widths: ['*', 'auto', 'auto', 'auto', 'auto'],
      widths: ['*', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      defaultBorder : false,
      hLineWidth: function (i, node) {
        { return (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 1 }
      },
      hLineColor: function (i, node) {
        { return (i === 0 || i === 1 || i === node.table.body.length) ? colors.primary : colors.light }
      },
      vLineWidth: function (i, node) {
        return  0.5;
      },
      vLineColor: function (i, node) {
        return  colors.primary;
      },
      paddingRight: function (i, node) { return i === 1 ? 7 : 2; },
      paddingTop: function (i, node) { return 2 },
      paddingBottom: function (i, node) { return 2 },
    },
    style: 'table',
    margin: [0, 0, 0, 20]
  };
}

/* ---------- TABLE ROWS ---------- */

const getImmobilisedProductionRow = (
  immobilisedProduction,
  indic,
  unit,
  precision
) => {
  const immobilisedProductionRow = [];
  // Immobilised production
  if (immobilisedProduction > 0) {
    immobilisedProductionRow.push(
      {
        text: "dont production immobilisée",
        margin: [5, 0, 0, 0]
      },
      {
        text: printValue(immobilisedProduction.periodsData[period.periodKey].amount, 0) + " €",
        style: "data",
        border : [false,false,true,false] 
      },
      {
        style: "data",
        text: [
          {
            text:
              printValue(
                immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].value,
                precision
              ) + " ",
          },

        ],
      },
      {
        text:
          printValue(
            immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ),
        style: "data",

      },
      // {
      //   text: " - ",
      //   style: "data",
      //   alignment: "right"
      // },
    );
  }

  return immobilisedProductionRow;
};

const getAggregateRow = (aggregates, indic, unit, precision, period) => {
  let rows = [];
  aggregates
    .map(({ label, periodsData }, index) => {
      let row = [];
      row.push(
        {
          text: label,
          margin: [5, 0, 0, 0]
        },
        {
          text: printValue(periodsData[period.periodKey].amount, 0) + " €",
          style: "data",
          border: [false, false, true, false]
        },
        {
          style: "data",
          text: [
            {
              text:
                printValue(
                  periodsData[period.periodKey].footprint.indicators[indic].value,
                  precision
                ) + " ",
            },

          ],
        },
        {
          text:
            printValue(periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
            " %",
          style: "data",
          border: [false, false, true, false]

        },
        // {
        //   text: " - ",
        //   style: "tableBold",
        //   alignment: "right"
        // },
      );
      rows.push(row);
    });
  return rows;
};
