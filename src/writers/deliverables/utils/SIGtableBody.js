import { printValue } from "../../../utils/Utils";
import metaIndics from "/lib/indics";

export const SIGtableBody = (
  mainAggregates,
  productionAggregates,
  indic,
  unit,
  intermediateConsumptionsAggregates,
  fixedCapitalConsumptionsAggregates,
  period
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

  const precision = metaIndics[indic].nbDecimals;

  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeader",
        alignment: "left",
        border: [false, false, true, false],
      },
      {
        text: "Montant",
        style: "tableHeader",
        border: [false, false, true, false],
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        border: [false, false, true, false],
      },
      {
        text: "Incertitude",
        style: "tableHeader",
        border: [false, false, true, false],
      },
    ],
    [
      { text: "Production", style: "tableBold", margin: [2, 2, 2, 2] },
      {
        text: printValue(production.periodsData[period.periodKey].amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    production.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(production.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
          " %",
        bold: true,
        fontSize: "7",
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: "Chiffre d'affaires",
        style: "tableLeft",
        margin: [15, 0, 0, 0],
      },
      {
        text: printValue(revenue.periodsData[period.periodKey].amount, 0) + " €",
        margin: [2, 2, 2, 2],
      },
      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    revenue.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
        fillColor: "#fa595f",
        fillOpacity: 0.2,
        margin: [2, 2, 2, 2],
      },
      {
        fillColor: "#fa595f",
        fillOpacity: 0.2,
        margin: [2, 2, 2, 2],
        text:
          printValue(revenue.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
        fontSize: "7",
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: "Production stockée",
        style: "tableLeft",
        margin: [15, 0, 0, 0],
      },
      {
        text: printValue(storedProduction.periodsData[period.periodKey].amount, 0) + " €",

        margin: [2, 2, 2, 2],
      },
      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    storedProduction.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            storedProduction.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        fontSize: "7",
        margin: [2, 2, 2, 2],
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
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(intermediateConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },

      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        bold: true,
        fontSize: "7",
        margin: [2, 2, 2, 2],
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
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        bold: true,
        margin: [2, 2, 2, 2],
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
      },
      {
        text:
          printValue(
            fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        bold: true,
        fontSize: "7",
        margin: [2, 2, 2, 2],
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
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(netValueAdded.periodsData[period.periodKey].amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
          " %",
        bold: true,
        fontSize: "7",
        margin: [2, 2, 2, 2],
      },
    ],
  ];
  return tableBody;
};

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
        style: "tableLeft",
        margin: [15, 0, 0, 0],
      },
      {
        text: printValue(immobilisedProduction.periodsData[period.periodKey].amount, 0) + " €",
        margin: [2, 2, 2, 2],
      },
      {
        columns: [
          {
            text: [
              {
                text:
                  printValue(
                    immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
              { text: unit, fontSize: "7" },
            ],
          },
        ],

        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        fontSize: "7",
        margin: [2, 2, 2, 2],
      }
    );
  }

  return immobilisedProductionRow;
};

const getAggregateRow = (aggregates, indic, unit, precision, period) => {
  let rows = [];

  aggregates
    //.filter((aggregate) => aggregate.amount != 0)
    .forEach((aggregate) => {

      let row = [];
      row.push(
        {
          text: aggregate.label,
          style: "tableLeft",
          margin: [15, 0, 0, 0],
        },
        {
          text: printValue(aggregate.periodsData[period.periodKey].amount, 0) + " €",
          margin: [2, 2, 2, 2],
        },
        {
          columns: [
            {
              text: [
                {
                  text:
                    printValue(
                      aggregate.periodsData[period.periodKey].footprint.indicators[indic].value,
                      precision
                    ) + " ",
                },
                { text: unit, fontSize: "7" },
              ],
            },
          ],
          margin: [2, 2, 2, 2],
        },
        {
          text:
            printValue(aggregate.periodsData[period.periodKey].footprint.indicators[indic].uncertainty, 0) +
            " %",
          fontSize: "7",
          margin: [2, 2, 2, 2],
        }
      );
      rows.push(row);
    });
  return rows;
};
