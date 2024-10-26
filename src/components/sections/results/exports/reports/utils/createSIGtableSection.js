import { borderColor, margin } from "polished";
import { getLabelPeriod, getPrevPeriod, getYearPeriod } from "../../../../../../utils/periodsUtils";
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
  colors,
  availablePeriods
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

  const currentYear = getYearPeriod(period);
  const prevPeriod = getPrevPeriod(availablePeriods, period);
  const showPrevPeriod = prevPeriod != null;
  
  // const branchProductionFootprint = comparativeData.production.division.history.data[indic]?.[comparativeData.production.division.history.data[indic].length - 1] ?? null;
  // const branchNetValueAddedFootprint = comparativeData.netValueAdded.division.history.data[indic]?.[comparativeData.netValueAdded.division.history.data[indic].length - 1] ?? null;
  // const branchIntermediateConsumptionsFootprint = comparativeData.intermediateConsumptions.division.history.data[indic]?.[comparativeData.intermediateConsumptions.division.history.data[indic].length - 1] ?? null;
  // const branchFixedCapitalConsumptionsFootprint = comparativeData.fixedCapitalConsumptions.division.history.data[indic]?.[comparativeData.fixedCapitalConsumptions.division.history.data[indic].length - 1] ?? null;

  const tableBody = [
    [
      {
        text: [{
          text: `Empreinte exprimée en `,
          fontSize: 6,
          italics: true
        }, {
          text: unit,
          bold: true
        }], border: [false, false, false, true]
      },
      { text: '', border: [false, false, false, true] },
      { text: getLabelPeriod(period), colSpan: 2, border: [true, true, true, true], style: "darkBackground", alignment: "center" },
      { text: '', border: [false, true, true, true] },
      ...showPrevPeriod ? [
        { text: getLabelPeriod(prevPeriod), colSpan: 2, border: [true, true, true, true], alignment : "center" },
        { text: '', border: [false, true, true, true] },
      ] : [],
    ],
    [
      {
        text: "Agrégat",
        style: "tableHeader",
      },
      {
        text: `Montant`, //\n${currentYear}`,
        style: "tableHeader",
        alignment: "center",
        border : [false,false,true,false] 
      },
      {
        text: "Empreinte",
        style: "tableHeader",
        alignment: "center"
      },
      {
        text: "Incert.",
        style: "tableHeader",
        alignment: "center",
        border : [false,false,true,false] 
      },
      ...showPrevPeriod ? [
        {
          text: "Empreinte",
          style: "tableHeader",
          alignment: "center"
        },
        {
          text: "Incert.",
          style: "tableHeader",
          alignment: "center",
          border : [false,false,true,false] 
        }
      ] : [],
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
        border : [false,true,true,true], 
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  production.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
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
            printValue(production.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,true,true,true], 
          fontSize: 6
        }
      ] : [],
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
          border : [false,false,true,false],
          fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  revenue.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
                  precision
                ) + " "
            },
          ],
          style: "tableBold",
          alignment: "right",
        },
        {
          text:
            printValue(revenue.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,false,true,false], 
          fontSize: 6
        }
      ] : [],
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
        border: [false,false,true,false],
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  storedProduction.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
                  precision
                ) + " "
            },
          ],
          style: "tableBold",
          alignment: "right",
        },
        {
          text:
            printValue(storedProduction.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,false,true,false], 
          fontSize: 6
        }
      ] : [],
    ],
    [
      {
        text: "Production immobilisée",
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
          ) + " %",
        style: "data",
        border: [false,false,true,false],
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  immobilisedProduction.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
                  precision
                ) + " "
            },
          ],
          style: "tableBold",
          alignment: "right",
        },
        {
          text:
            printValue(immobilisedProduction.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,false,true,false], 
          fontSize: 6
        }
      ] : [],
    ],
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
        border: [false, true, true, true],
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  intermediateConsumptions.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
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
            printValue(intermediateConsumptions.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,true,true,true], 
          fontSize: 6
        }
      ] : [],
    ],
    ...getAggregateRow(
      intermediateConsumptionsAggregates,
      indic,
      unit,
      precision,
      period,
      prevPeriod
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
        border: [false, true, true, true],
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  fixedCapitalConsumptions.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
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
            printValue(fixedCapitalConsumptions.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,true,true,true], 
          fontSize: 6
        }
      ] : [],
    ],
    ...getAggregateRow(
      fixedCapitalConsumptionsAggregates,
      indic,
      unit,
      precision,
      period,
      prevPeriod
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
        fontSize: 6
      },
      ...showPrevPeriod ? [
        {
          text: [
            {
              text:
                printValue(
                  netValueAdded.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value,
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
            printValue(netValueAdded.periodsData[prevPeriod.periodKey].footprint.indicators[indic].uncertainty, 0) + " %",
          style: "tableBold",
          alignment: "right",
          border : [false,true,true,true], 
          fontSize: 6
        }
      ] : [],
    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: showPrevPeriod ? ['*', 'auto', 'auto', 'auto', 'auto', 'auto'] : ['*', 'auto', 'auto', 'auto'],
      body: tableBody,
    },
    layout: {
      defaultBorder : false,
      hLineWidth: function (i, node) {
        return  0.5;
      },
      hLineColor: function (i, node) {
        return  colors.primary;
      },
      vLineWidth: function (i, node) {
        return  0.5;
      },
      vLineColor: function (i, node) {
        return  colors.primary;
      },
      paddingRight: function (i, node) { return i === 1 ? 7 : 2; },
      paddingTop: function (i, node) { return 3 },
      paddingBottom: function (i, node) { return 3 },
    },
    style: 'table',
    margin : [0, 0, 0, 20]
  };
}

/* ---------- TABLE ROWS ---------- */

const getAggregateRow = (aggregates, indic, unit, precision, period, prevPeriod) => 
{
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
          border: [false, false, true, false],
          fontSize: 6
        },
        ...(prevPeriod != null) ? [
          {
            style: "data",
            text: [
              {
                text:
                  printValue(
                    periodsData[prevPeriod.periodKey]?.footprint.indicators[indic].value,
                    precision
                  ) + " ",
              },
            ],
          },
          {
            text:
              printValue(periodsData[prevPeriod.periodKey]?.footprint.indicators[indic].uncertainty, 0) +
              " %",
            style: "data",
            border: [false, false, true, false],
            fontSize: 6
          }
        ] : [],
      );
      rows.push(row);
    });
  return rows;
};
