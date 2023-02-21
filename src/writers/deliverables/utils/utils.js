export function sortExpensesByFootprint(expenses, indicator, order) {
  const sortedExpenses = expenses.sort((a, b) => {
    const valueA = a.footprint.indicators[indicator].value;
    const valueB = b.footprint.indicators[indicator].value;
    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedExpenses;
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
        "L’indicateur vise à fournir un élément d’information sur l'écart des rémunérations au sein des entreprises ayant contribué à la production de la valeur, dans le but d'encourager celles qui ont un partage plus équitable de la valeur produite.";
      break;
    default:
      description = null;
      break;
  }
  return description;
}

export function getUncertaintyDescription(typeIndic, uncertainty) {
  let description;

  switch (typeIndic) {
    case "proportion":
      description =
        "Incertitude : " +
        uncertainty +
        " %. L’incertitude provient des potentiels écarts dans l’évaluation de l’impact direct (mesure d’une grandeur physique) et de l’utilisation de données statistiques, en l’absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées. Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";

      break;
    case "intensite":
      description =
        "L’incertitude provient de l’utilisation de données statistiques, directement, en l’absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées (pour ces mêmes raisons). Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
    case "indice":
      description =
        "Incertitude : " +
        uncertainty +
        " %. L’incertitude provient des potentiels écarts dans l’évaluation de l’impact direct (mesure d’une grandeur physique) et de l’utilisation de données statistiques, en l’absence de données publiées pour un fournisseur, et/ou en amont, pour les empreintes publiées. Elle vise à se réduire avec la contribution de chaque acteur de la chaine de valeur et grâce aux retours statistiques obtenus.";
    default:
      break;
  }

  if (typeIndic == "intensite") {
  } else {
  }

  return description;
}

export function getKeySuppliers(companies, indic, unit, precision) {
  const keySuppliers = [];

  companies.map((company) =>
    keySuppliers.push({
      stack: [
        {
          text:
            cutString(company.corporateName, 30) +
            " ( SIREN " +
            company.corporateId +
            ")",
          fontSize: 8,
          bold: true,
        },
        {
          text:
            company.footprint.indicators[indic].value.toFixed(precision) +
            " " +
            unit,
          fontSize: 7,
        },
      ],
    })
  );

  return keySuppliers;
}

export const getPercentageForConsumptionRows = (
  totalAmount,
  intermediateConsumption,
  indic
) => {
  let rows = [];

  intermediateConsumption
    .filter(
      (consumption) =>
        consumption.footprint.indicators[indic].getGrossImpact(
          consumption.amount
        ) != 0
    )
    .sort((a, b) => {
      let percentageA =
        (a.footprint.indicators[indic].getGrossImpact(a.amount) / totalAmount) *
        100;
      let percentageB =
        (b.footprint.indicators[indic].getGrossImpact(b.amount) / totalAmount) *
        100;
      return percentageB - percentageA;
    })
    .slice(0, 3)
    .forEach((consumption) => {
      let row = [];
      let percentage =
        (consumption.footprint.indicators[indic].getGrossImpact(
          consumption.amount
        ) /
          totalAmount) *
        100;

      row.push(
        {
          text: percentage.toFixed(0) + " %",
          fillColor: "#191558",
          color: "#FFFFFF",
          fontSize: 7,
          borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
          alignment: "right",
          bold: true,
        },
        {
          text: consumption.accountLib,
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

export function currentAnnualReduction(data, year) {
  const filteredData = data.filter((item) => item.year <= year);

  let firstYearValue = filteredData[0].value;
  let lastYearValue = filteredData[filteredData.length - 1].value;
  let yearsCount = filteredData.length - 1;
  let totalReduction = firstYearValue - lastYearValue;
  let annualReduction = totalReduction / firstYearValue / yearsCount;
  let percentageReduction = (annualReduction * 100).toFixed(0);

  if (percentageReduction < 0) {
    percentageReduction = percentageReduction * -1;
    percentageReduction = "+ " + percentageReduction;
  }
  if (percentageReduction > 0) {
    percentageReduction = " - " + percentageReduction;
  }

  return percentageReduction;
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
