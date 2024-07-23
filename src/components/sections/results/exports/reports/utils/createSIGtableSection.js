import { printValue } from "/src/utils/formatters";

export const createSIGtableSection = (
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

  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeaderDark",
      },
      {
        text: "Montant",
        style: "tableHeaderDark",
        alignment: "right"
      },
      {
        text: "Empreinte",
        style: "tableHeaderDark",
        alignment: "right"
      },
      {
        text: "Incertitude",
        style: "tableHeaderDark",
        alignment: "right"
      },
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
          { text: unit },
        ],
        style: "tableBold",
        alignment: "right"
      },
      {
        text:
          printValue(production.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
          " %",
        style: "tableBold",
        alignment: "right"
      },
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
          { text: unit },
        ],
      },
      {
        style: "data",
        text:
          printValue(revenue.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
      },
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
          { text: unit },
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
              ) + " ",
          },
          { text: unit },
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
        alignment : "right"
      },
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
          { text: unit },
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
          { text: unit },
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
          { text: unit },
        ],
      },
      {
        text:
          printValue(
            immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        style: "data",

      }
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
            { text: unit },
          ],
        },
        {
          text:
            printValue(periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
            " %",
          style: "data",
        }
      );
      rows.push(row);
    });
  return rows;
};
