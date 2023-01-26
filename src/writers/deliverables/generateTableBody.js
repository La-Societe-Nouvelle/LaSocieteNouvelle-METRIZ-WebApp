import { printValue } from "../../utils/Utils";

export const generateIndicTableBody = (
  aggregates,
  indic,
  unit,
  intermediateConsumptionAggregates,
  fixedCapitalConsumptionsAggregates
) => {
  // FINANCIAL DATA
  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = aggregates;
  const tableBody = [
    [
      {
        text: "Agrégat",
        style: "tableHeader",
        alignment : "left",
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
        text: printValue(production.amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(production.footprint.indicators[indic].value, 1) +
          " " +
          unit,
          bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(production.footprint.indicators[indic].uncertainty, 1) +
          " %",
          bold: true,
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: "Chiffre d'affaire",
        style: "tableLeft",
        margin: [15, 0, 0, 0],
      },
      {
        text: printValue(revenue.amount, 0) + " €",
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(revenue.footprint.indicators[indic].value, 1) + " " + unit,

        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(revenue.footprint.indicators[indic].uncertainty, 1) + " %",

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
        text: printValue(storedProduction.amount, 0) + " €",

        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(storedProduction.footprint.indicators[indic].value, 1) +
          " " +
          unit,

        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            storedProduction.footprint.indicators[indic].uncertainty,
            1
          ) + " %",

        margin: [2, 2, 2, 2],
      },
    ],
    ...getImmobilisedProductionRow(immobilisedProduction, indic, unit),
    [
      {
        text: "Consommations intermédiaires",
        style: "tableBold",
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(intermediateConsumption.amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            intermediateConsumption.footprint.indicators[indic].value,
            1
          ) +
          " " +
          unit,
          bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            intermediateConsumption.footprint.indicators[indic].uncertainty,
            1
          ) + " %",
          bold: true,
        margin: [2, 2, 2, 2],
      },
    ],
    ...getAggregateRow(intermediateConsumptionAggregates, indic, unit),
    [
      {
        text: "Dotations aux Amortissements sur immobilisations",
        style: "tableBold",
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(capitalConsumption.amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(capitalConsumption.footprint.indicators[indic].value, 1) +
          " " +
          unit,
          bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            capitalConsumption.footprint.indicators[indic].uncertainty,
            0
          ) + " %",
          bold: true,
        margin: [2, 2, 2, 2],
      },
    ],
    ...getAggregateRow(fixedCapitalConsumptionsAggregates, indic, unit),
    [
      {
        text: "Valeur ajoutée nette",
        style: "tableBold",
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(netValueAdded.amount, 0) + " €",
        bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(netValueAdded.footprint.indicators[indic].value, 0) +
          " " +
          unit,
          bold: true,
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(netValueAdded.footprint.indicators[indic].uncertainty, 0) +
          " %",
          bold: true,
        margin: [2, 2, 2, 2],
      },
    ],
  ];
  return tableBody;
};

const getImmobilisedProductionRow = (immobilisedProduction, indic, unit) => {
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
        text: printValue(immobilisedProduction.amount, 0) + " €",
        margin: [2, 2, 2, 2],
      },
      {
        text: printValue(
          immobilisedProduction.footprint.indicators[indic].value + " " + unit,
          1
        ),
        margin: [2, 2, 2, 2],
      },
      {
        text:
          printValue(
            immobilisedProduction.footprint.indicators[indic].uncertainty,
            0
          ) + " %",
        margin: [2, 2, 2, 2],
      }
    );
  }

  return immobilisedProductionRow;
};

const getAggregateRow = (aggregates, indic, unit) => {
  let rows = [];
  aggregates
    .filter((aggregate) => aggregate.amount != 0)
    .forEach((aggregate) => {
      let row = [];
      row.push(
        {
          text: aggregate.accountLib,
          style: "tableLeft",
          margin: [15, 0, 0, 0],
        },
        {
          text: printValue(aggregate.amount, 0) + " €",
          margin: [2, 2, 2, 2],
        },
        {
          text:
            printValue(aggregate.footprint.indicators[indic].value, 1) +
            " " +
            unit,
          margin: [2, 2, 2, 2],
        },
        {
          text:
            printValue(aggregate.footprint.indicators[indic].uncertainty, 0) +
            " %",
          margin: [2, 2, 2, 2],
        }
      );
      rows.push(row);
    });
  return rows;
};
