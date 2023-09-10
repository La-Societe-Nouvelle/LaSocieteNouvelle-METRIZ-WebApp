// La Société Nouvelle

// Modules
import { jsPDF } from "jspdf";

// Fonts

// Libs
import metaIndics from "../../lib/indics";
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from "../formulas/aggregatesBuilder";

// Utils
import { printValue } from "/src/utils/formatters";

/** SOCIAL FOOTPRINT PDF GENERATOR
 * 
 *  2 pages :
 *    - Environnemental footprint (6 indicators)
 *    - Social & Economic footprint (6 indicators)
 * 
 */

export const buildSocialFootprintPDF = async ({
  session
}) => {

  // init doc
  const doc = new jsPDF("landscape", "mm", "a4", true);

  const {
    legalUnit
  } = session;

  doc.setProperties({
    title: "rapport_empreinte_societale_" + legalUnit.corporateName.replaceAll(" ", ""),
  });

  // RAPPORT - EMPREINTE ENVIRONNEMENTALE

  await buildSocialFootprintPDFPage({
    doc,
    title:"Empreinte environnementale",
    session,
    period: session.financialPeriod,
    indics: ["ghg", "nrg", "wat", "mat", "was", "haz"],
    odds: ["6", "7", "12", "13", "14", "15"]
  });

  doc.addPage();

  // RAPPORT - EMPREINTE ÉCONOMIQUE ET SOCIALE

  await buildSocialFootprintPDFPage({
    doc,
    title: "Empreinte économique et sociale",
    session,
    period: session.financialPeriod,
    indics: ["eco", "art", "soc", "idr", "geq", "knw"],
    odds: ["5", "8", "9", "10", "12"]
  });

  window.open(doc.output("bloburl"), "_blank");
}

// build page

const buildSocialFootprintPDFPage = async ({
  doc,
  title,
  session,
  period,
  indics,
  odds
}) => {

  const {
    legalUnit,
    financialData
  } = session;
  const year = period.periodKey.subString(4);

  // FINANCIAL DATA
  const { 
    revenue, 
    storedProduction, 
    immobilisedProduction 
  } = financialData.productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  // get Intermediate Aggregates
  
  const intermediateConsumptionsAggregates =
    await buildIntermediateConsumptionsAggregates(financialData, [period]);
  const fixedCapitalConsumptionsAggregates =
   await buildFixedCapitalConsumptionsAggregates(financialData, [period]);


  let x = 10;
  let y = 20;
  // HEADER
  doc.setFontSize(15);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("RAPPORT - " + title.toUpperCase(), x, y);

  // ODD PICTO
  let imgPos = 208;
  odds.forEach((element) => {
    imgPos += 11;
    let img = new Image();
    img.src = "/resources/odds/print/F_SDG_PRINT-" + element + ".jpg";
    doc.addImage(img, "JPEG", imgPos, 15, 10, 10, undefined, "FAST");
  });

  // Corporate Name
  y += 8;
  doc.setTextColor(250, 102, 106);
  doc.setFontSize(14);
  doc.text(legalUnit.toUpperCase() || " - ", x, y);
  doc.setFontSize(10);

  y += 8;

  doc.setTextColor(0);
  doc.setFont("Helvetica", "normal");
  doc.text("Année de fin d'exercice : " + (year != null ? year : " - "), x, y);
  let today = new Date();

  y += 5;

  doc.text(
    "Edition du : " +
      String(today.getDate()).padStart(2, "0") +
      "/" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "/" +
      today.getFullYear(),
    x,
    y
  );

  y += 8;

  // TITLE
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(25, 21, 88);
  doc.text("SOLDES INTERMEDIAIRES DE GESTION", x, y);

  y += 8;

  // TABLE

  let xRect = x + 17;
  doc.setDrawColor(25, 21, 88);
  // LIBELLE  
  indics.forEach((indic) => {
    doc.rect((xRect += 35), y, 37, 8);
    let img = new Image();
    img.src = "/resources/icon-ese-bleues/print/" + indic + ".jpg";
    doc.addImage(img, "JPEG", xRect + 1, y + 1.5, 4.5, 4.5, undefined, "FAST");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.text(
      doc.splitTextToSize(metaIndics[indic].libelleGrandeur, 24),
      xRect + 18.5,
      y + 3.5,
      { align: "center" }
    );
    xRect += 2;
  });

  y += 8;

  let height = 73;

  // Header table

  doc.setFillColor(240, 240, 248);
  doc.setDrawColor(240, 240, 248);
  doc.rect(x, y, 274, 10, "FD");

  // AMOUNT

  doc.setFontSize(7);
  doc.text("Montant", 51, y + 6);

  height += 2;

  let xUnit = x + 54;

  // UNITE
  indics.forEach((indic) => {
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(
      doc.splitTextToSize("Valeur\n" + metaIndics[indic].unit, 9),
      xUnit + 4.5,
      y + 5,
      { align: "center" }
    );

    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(doc.splitTextToSize("Incertitude %", 9), xUnit + 17, y + 5, {
      align: "center",
    });

    doc.text(
      doc.splitTextToSize("Impact brut " + metaIndics[indic].unitAbsolute, 9),
      xUnit + 29,
      y + 5,
      { align: "center" }
    );

    xUnit += 37;
  });



  let xAmount = 60;
  let xValue = x + 64;

  //Production

  y += 14;
  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text("Production", x + 2, y);
  doc.setFontSize(6);

  doc.text(
    printValue(production.periodsData[period.periodKey].amount, 0) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );

  indics.forEach((indic) => {
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");

    doc.text(
      printValue(
        production.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );

    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(
      printValue(
        production.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );
    doc.text(
      printValue(
        production.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getGrossImpact(production.periodsData[period.periodKey].amount),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );
    xValue += 37;
  });

  // Revenue

  xValue = x + 64;
  y += 4;
  doc.setFontSize(7);
  doc.text("dont Chiffre d'affaires", x + 2, y);
  doc.setFontSize(6);
  doc.text(
    printValue(revenue.periodsData[period.periodKey].amount, 0) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );

  indics.forEach((indic) => {
    if (
      printValue(
        revenue.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getValue(),
        1
      ) != " - "
    ) {
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(255, 138, 142);
      doc.rect(xValue - 9, y - 2.5, 10, 3, "F");
    }

    doc.setFontSize(6);
    doc.text(
      printValue(
        revenue.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );

    doc.setFont("Helvetica", "normal");

    doc.setFontSize(5);
    doc.text(
      printValue(
        revenue.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );
    doc.text(
      printValue(
        revenue.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getGrossImpact(revenue.periodsData[period.periodKey].amount),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );

    xValue += 37;
  });

  // Stock production
  xValue = x + 64;

  y += 4;
  doc.setFontSize(7);
  doc.text("dont Production stockée", x + 2, y);

  doc.setFontSize(6);
  doc.text(
    printValue(storedProduction.periodsData[period.periodKey].amount, 0) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );

  indics.forEach((indic) => {
    doc.setFontSize(6);
    doc.text(
      printValue(
        storedProduction.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );
    doc.setFontSize(5);
    doc.text(
      printValue(
        storedProduction.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );
    doc.text(
      printValue(
        storedProduction.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getGrossImpact(storedProduction.periodsData[period.periodKey].amount),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );

    xValue += 37;
  });

  height += 12;

  // // Immobilised production
  if (immobilisedProduction.periodsData[period.periodKey] > 0) {
    xValue = x + 64;
    y += 4;
    height += 4;

    doc.setFontSize(7);
    doc.text("dont Production immobilisée", x + 2, y);
    doc.setFontSize(6);

    doc.text(
      printValue(
        immobilisedProduction.periodsData[period.periodKey].amount,
        0
      ) + " €",
      xAmount,
      y,
      {
        align: "right",
      }
    );

    indics.forEach((indic) => {
      doc.text(
        printValue(
          immobilisedProduction.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getValue(),
          1
        ),
        xValue,
        y,
        { align: "right" }
      );
      doc.text(
        printValue(
          immobilisedProduction.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getUncertainty(),
          0
        ) + "%",
        xValue + 12,
        y,
        { align: "right" }
      );
      doc.text(
        printValue(
          immobilisedProduction.periodsData[
            period.periodKey
          ].footprint.indicators[indic].getGrossImpact(
            immobilisedProduction.periodsData[period.periodKey].amount
          ),
          0
        ),
        xValue + 24,
        y,
        { align: "right" }
      );

      xValue += 37;
    });
  }

  // CONSOMMATIONS INTERMEDIAIRES
  y += 6;
  height += 9;

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text(doc.splitTextToSize("Consommations intermédiaires", 35), x + 2, y);

  doc.setFontSize(6);

  doc.text(
    printValue(
      intermediateConsumptions.periodsData[period.periodKey].amount,
      0
    ) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );

  xValue = x + 64;
  indics.forEach((indic) => {
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(
      printValue(
        intermediateConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );
    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(
      printValue(
        intermediateConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );
    doc.text(
      printValue(
        intermediateConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getGrossImpact(
          intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );

    xValue += 37;
  });

  y += 2.5;

    intermediateConsumptionsAggregates
    .forEach((aggregate) => {
      height += 4;
      y += 4;
      doc.setFontSize(7);
      doc.text(aggregate.label, x + 2, y);

      doc.setFontSize(6);
      doc.text(printValue(aggregate.periodsData[period.periodKey].amount, 0) + " €", xAmount, y, {
        align: "right",
      });

      xValue = x + 64;

      indics.forEach((indic) => {
        let indicator = aggregate.periodsData[period.periodKey].footprint.indicators[indic];
        doc.setFontSize(6);
        doc.text(printValue(indicator.getValue(), 1), xValue, y, {
          align: "right",
        });
        doc.setFontSize(5);
        doc.text(
          printValue(indicator.getUncertainty(), 0) + " %",
          xValue + 12,
          y,
          { align: "right" }
        );
        doc.text(
          printValue(indicator.getGrossImpact(aggregate.periodsData[period.periodKey].amount), 0),
          xValue + 24,
          y,
          { align: "right" }
        );

        xValue += 37;
      });
    });

  height += 8;
  y += 6;
  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text(
    doc.splitTextToSize("Dotations aux Amortissements sur immobilisations", 40),
    x + 2,
    y
  );
  doc.setFontSize(6);
  doc.text(
    printValue(
      fixedCapitalConsumptions.periodsData[period.periodKey].amount,
      0
    ) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );
  xValue = x + 64;

  indics.forEach((indic) => {
    doc.setFont("Helvetica", "bold");
    doc.text(
      printValue(
        fixedCapitalConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );
    doc.setFont("Helvetica", "normal");
    doc.text(
      printValue(
        fixedCapitalConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );
    doc.text(
      printValue(
        fixedCapitalConsumptions.periodsData[
          period.periodKey
        ].footprint.indicators[indic].getGrossImpact(
          fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );

    xValue += 37;
  });

  y += 6;

    fixedCapitalConsumptionsAggregates
    .forEach((aggregate) => {
      height += 6;
      xValue = x + 64;
      doc.setFontSize(6);
      doc.text(doc.splitTextToSize(aggregate.label, 35), x + 2, y);
      doc.text(printValue(aggregate.periodsData[period.periodKey].amount, 0) + " €", xAmount, y, {
        align: "right",
      });

      indics.forEach((indic) => {
        let indicator = aggregate.periodsData[period.periodKey].footprint.indicators[indic];
        doc.setFontSize(6);
        doc.text(printValue(indicator.getValue(), 1), xValue, y, {
          align: "right",
        });
        doc.setFontSize(5);
        doc.text(
          printValue(indicator.getUncertainty(), 0) + " %",
          xValue + 12,
          y,
          { align: "right" }
        );
        doc.text(
          printValue(indicator.getGrossImpact(aggregate.periodsData[period.periodKey].amount), 0),
          xValue + 24,
          y,
          { align: "right" }
        );

        xValue += 37;
      });
      y += 6;
    });

  y += 3;
  height += 8.5;

  doc.setFillColor(251, 251, 255);
  doc.setDrawColor(251, 251, 255);
  doc.rect(x, y - 3.5, 274, 6, "FD");

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text("Valeur ajoutée nette", x + 2, y);

  doc.setFontSize(6);
  doc.text(
    printValue(netValueAdded.periodsData[period.periodKey].amount, 0) + " €",
    xAmount,
    y,
    {
      align: "right",
    }
  );

  xValue = x + 64;
  indics.forEach((indic) => {
    doc.setFontSize(6);
    doc.setFont("Helvetica", "bold");
    doc.text(
      printValue(
        netValueAdded.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getValue(),
        1
      ),
      xValue,
      y,
      { align: "right" }
    );
    doc.setFontSize(5);
    doc.setFont("Helvetica", "normal");
    doc.text(
      printValue(
        netValueAdded.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getUncertainty(),
        0
      ) + "%",
      xValue + 12,
      y,
      { align: "right" }
    );

    doc.text(
      printValue(
        netValueAdded.periodsData[period.periodKey].footprint.indicators[
          indic
        ].getGrossImpact(netValueAdded.periodsData[period.periodKey].amount),
        0
      ),
      xValue + 24,
      y,
      { align: "right" }
    );

    xValue += 37;
  });

  // BORDER  TABLE
  doc.setLineWidth(0.2);
  doc.setDrawColor(25, 21, 88);
  // TOP
  doc.line(x, 65, 284, 65);
  // LEFT
  doc.line(x, 65, x, height);
  // RIGHT
  // BOTTOM
  doc.line(x, height, 284, height);

  // COLUMNS

  let xColumn = x + 52;

  for (let index = 0; index < 7; index++) {
    doc.line(xColumn, 65, xColumn, height);

    doc.setLineWidth(0.1);
    doc.setDrawColor(216, 214, 226);

    doc.line(xColumn + 13, 65, xColumn + 13, height);
    doc.line(xColumn + 25, 65, xColumn + 25, height);

    doc.setLineWidth(0.2);
    doc.setDrawColor(25, 21, 88);
    xColumn += 37;
  }

  // BOTTOM PAGE
  y = 152;
  y += 35;
  doc.setDrawColor(203);
  doc.line(x, y, 284, y);

  y += 5;

  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(100);
  doc.text("Publiez votre performance globale !", x, y);

  y += 5;
  doc.setFont("Helvetica", "normal");
  doc.text(
    "Nous vous invitons à valoriser votre performance extra-financière en publiant les valeurs associées à votre chiffre d’affaires (données encadrées dans le tableau ci-dessus). \nAucune donnée financière n’est communiquée, seul l’estimation vos impacts par euro de chiffre d’affaires est accessible.",
    x,
    y
  );

  y += 7;

  doc.text(
    "Les données publiées sont accessibles librement, elles permettent à vos clients (et potentiels clients) de mesurer leurs impacts indirects associés à leurs factures, et elles contribuent à la construction d’une économie plus transparente.\n" +
      "Les données sont modifiables. Pour plus d’informations, contactez admin@lasocietenouvelle.org",
    x,
    y
  );

}