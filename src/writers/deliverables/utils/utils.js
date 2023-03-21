import { printValue } from "../../../utils/Utils";


export function sortAccountsByFootprint(accounts, period, indicator, order) {

  const sortedAccounts = accounts.sort((a, b) => {
    const valueA = a.periodsData[period.periodKey].footprint.indicators[indicator].value;
    const valueB = b.periodsData[period.periodKey].footprint.indicators[indicator].value;
    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedAccounts;
}



export function sortProvidersByImpact(expensesAccounts, indicator, order) {

  const sortedExpensesAccounts = expensesAccounts.sort((a, b) => {
    const valueA = a.footprint.indicators[indicator].getGrossImpact(a.amount);
    const valueB = b.footprint.indicators[indicator].getGrossImpact(b.amount);

    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedExpensesAccounts;
}

export function sortProvidersByContrib(periodKey,expensesAccounts, indicator, order) {
  
  const sortedExpensesAccounts = expensesAccounts.sort((a, b) => {
    const valueA = a.footprint.indicators[indicator].getGrossImpact(a.periodsData[periodKey].amount);
    const valueB = b.footprint.indicators[indicator].getGrossImpact(b.periodsData[periodKey].amount);
  
    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  }).slice(0, 4).sort((a, b) => {
    let sortedAccountA = 100 - a.footprint.indicators[indicator].value;
    let sortedAccountB = 100 - b.footprint.indicators[indicator].value;
    return sortedAccountB - sortedAccountA;
  });
  

  return sortedExpensesAccounts;
}

export function getIndicDescription(indic) {
  let description;

  switch (indic) {
    case "art":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite par des entreprises artisanales, créatives ou dont le savoir-faire est reconnu.";
      break;
    case "eco":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite en France et celle issue des importations.";
      break;
    case "soc":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite dans un intérêt social défini.";
      break;
    case "knw":
      description =
        "L'indicateur permet de rendre compte de la part de la valeur produite contribuant à la recherche, à la formation ou à l'enseignement.";
      break;
    case "ghg":
      description =
        "L'indicateur informe sur la quantité de gaz à effet de serre liée à la production de l'entreprise avec pour objectif d'identifier les entreprises les plus performantes.";
      break;
    case "geq":
      description =
        "L’indicateur informe sur les écarts de salaires entre les femmes et les hommes au sein des entreprises ayant contribué à la production de la valeur.";
      break;
    case "idr":
      description =
        "L’indicateur informe sur l'écart des rémunérations au sein des entreprises ayant contribué à la production de la valeur, dans le but d'encourager celles qui ont un partage plus équitable de la valeur produite.";
      break;
    default:
      description = null;
      break;
  }
  return description;
}

export function getUncertaintyDescription(typeIndic, uncertainty) {
  let description;
  if (typeIndic == "intensite") {
    description =
      "L’incertitude provient des potentiels écarts dans l’évaluation de l’impact direct (mesure d’une grandeur physique) et de l’utilisation de données statistiques, en l’absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées. Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
  } else {
    description =
      "Incertitude : " +
      uncertainty +
      "%. " +
      "L’incertitude provient de l’utilisation de données statistiques, directement, en l’absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées (pour ces mêmes raisons). Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
  }

  return description;
}

export function getKeySuppliers(companies, indic, unit, precision) {
  const keySuppliers = [];
  companies
    .filter((company) => !company.isDefaultAccount)
    .map((company) =>
      keySuppliers.push({
        stack: [
          {
            text: cutString(company.providerLib, 40),
            fontSize: 8,
            bold: true,
          },
          {
            text:
              indic == "idr"
                ? "Rapport interdécile : " +
                  company.footprint.indicators[indic].value.toFixed(precision)
                : company.footprint.indicators[indic].value.toFixed(precision) +
                  " " +
                  unit,
            fontSize: 7,
          },
        ],
      })
    );

  return keySuppliers;
}

export function getIntensKeyProviders(
  providers,
  indic,
  unit,
  unitGrossImpact,
  precision,
  period
) {
  const keySuppliers = [];

  const precisionImpact = unitGrossImpact == "€" ? 0 : precision;
  providers
    .filter((provider) => !provider.isDefaultAccount)
    .map((provider) =>
      keySuppliers.push({
        stack: [
          {
            text: cutString(provider.providerLib, 40),
            fontSize: 8,
            bold: true,
          },
          {
            margin: [0, 2, 0, 2],
            text:
              provider.footprint.indicators[indic].value.toFixed(precision) +
              " " +
              unit +
              " - " +
              printValue(
                provider.footprint.indicators[indic].getGrossImpact(
                  provider.periodsData[period.periodKey].amount
                ),
                precisionImpact
              ) +
              " " +
              unitGrossImpact,

            fontSize: 7,
          },
        ],
      })
    );

  return keySuppliers;
}

export const getMostImpactfulExpenseAccountRows = (
  mostImpactfulExpenseAccountsPart
) => {
  let rows = [];

  mostImpactfulExpenseAccountsPart.forEach((item) => {
    let row = [];

    row.push(
      {
        text: item.impactPercentage + " %",
        fillColor: "#191558",
        color: "#FFFFFF",
        fontSize: 7,
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        alignment: "right",
        bold: true,
      },
      {
        text: cutString(item.accountLib, 40),
        fontSize: 7,
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        bold: true,
      }
    );
    rows.push(row);
  });
  return rows;
};

export function cutString(str, nbChar) {

  if (str.length <= nbChar) return str;
  return str.substring(0, nbChar) + "...";
}

export function targetAnnualReduction(data) {
  let firstYearValue = data[0].value;
  let lastYearValue = data[data.length - 1].value;
  let yearsCount = data.length - 1;
  let totalReduction = firstYearValue - lastYearValue;
  let annualReduction = totalReduction / firstYearValue / yearsCount;
  let percentageReduction = (annualReduction * 100).toFixed(0);

  isNaN(percentageReduction)
    ? (percentageReduction = undefined)
    : (percentageReduction = "- " + percentageReduction);

  return percentageReduction;
}

export function calculateAverageEvolutionRate(data) {
  let evolutionRates = [];
  let numberOfYears = 0;

  for (let i = 0; i < data.length - 1; i++) {
    const initialValue = data[i].value;
    const finalValue = data[i + 1].value;

    // Check if years are consecutive
    if (parseInt(data[i + 1].year) === parseInt(data[i].year) + 1) {
      numberOfYears++;
      const evolutionRate = ((finalValue - initialValue) / initialValue) * 100;
      evolutionRates.push(evolutionRate);
    } else {
      // Calculate annual evolution rate
      const numberOfAnnualEvolutionRates =
        parseInt(data[i + 1].year) - parseInt(data[i].year);
      const annualEvolutionRate =
        Math.pow(finalValue / initialValue, 1 / numberOfAnnualEvolutionRates) -
        1;
      numberOfYears += numberOfAnnualEvolutionRates;
      evolutionRates.push(annualEvolutionRate * 100);
    }
  }

  const sum = evolutionRates.reduce((a, b) => a + b, 0);
  const averageEvolutionRate = sum / numberOfYears;

  return averageEvolutionRate.toFixed(0);
}

export function loadFonts() {
  pdfMake.fonts = {
    Raleway: {
      normal:
        "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf",
      bold: "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Bold.ttf",
    },
    // download default Roboto font from cdnjs.com
    Roboto: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  };
}
