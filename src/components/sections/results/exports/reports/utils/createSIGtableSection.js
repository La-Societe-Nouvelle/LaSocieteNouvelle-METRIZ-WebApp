import { padding } from "polished";
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
        }], border: [false, false, false, false]
      },
      { text: '', border: [false, false, false, false] },
      { text: getLabelPeriod(period), colSpan: 2, border: [true, true, true, true], style: "darkBackground", alignment: "center" },
      { text: '', border: [false, false, false, false] },
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
        alignment: "right"
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "right"
      },
      {
        text: "Incertitude",
        style: "tableHeader",
        alignment: "right"
      },
      // {
      //   text: "Empreinte\nbranche",
      //   style: "tableHeader",
      //   alignment: "right"
      // },
    ],
    [
      { text: "Production", style: "tableBold" },
      {
        text: printValue(production.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right"
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
        alignment: "right"
      },
      {
        text:
          printValue(production.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
        style: "tableBold",
        alignment: "right"
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
        border: [true, true, true, true]
      },
      {
        text: printValue(intermediateConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right"
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
        alignment: "right"
      },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "tableBold",
        alignment: "right"
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
      },
      {
        text: printValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right"
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
        alignment: "right"
      },
      {
        text:
          printValue(
            fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "tableBold",
        alignment: "right"
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
      },
      {
        text: printValue(netValueAdded.periodsData[period.periodKey].amount, 0) + " €",
        style: "tableBold",
        alignment: "right"
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
        alignment: "right"
      },
      {
        text:
          printValue(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
          " %",
        style: "tableBold",
        alignment: "right"
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
      hLineWidth: function (i, node) {
        return (i === 0 || i === 1 || i === 2 || i === node.table.body.length) ? 0.5 : 0;
      },
      hLineColor: function (i, node) {
        return (i === 5 || i === 8) ? colors.light : colors.primary;
      },
      vLineWidth: function (i, node) {
        if ((i == 2|| i == 4 || (showPrevPeriod && i == 7))) {
          return 0.5;
        } else {
          return 0;
        }
      },
      vLineColor: function (i, node) {
        return '#191558';
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
