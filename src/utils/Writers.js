import {
  analysisTextWriterART,
  analysisTextWriterECO,
  analysisTextWriterGEQ,
  analysisTextWriterGHG,
  analysisTextWriterHAZ,
  analysisTextWriterIDR,
  analysisTextWriterKNW,
  analysisTextWriterMAT,
  analysisTextWriterNRG,
  analysisTextWriterSOC,
  analysisTextWriterWAS,
  analysisTextWriterWAT,
} from "../writers/analysis/analysis";

import {
  writeStatementART,
  writeStatementECO,
  writeStatementGEQ,
  writeStatementGHG,
  writeStatementHAZ,
  writeStatementIDR,
  writeStatementKNW,
  writeStatementMAT,
  writeStatementNRG,
  writeStatementSOC,
  writeStatementWAS,
  writeStatementWAT,
} from "../writers/deliverables/utils/writeIndicstatement";

export const getStatementNote = (impactsData, indic) => {
  switch (indic) {
    case "art":
      return writeStatementART(impactsData);
    case "idr":
      return writeStatementIDR(impactsData);
    case "eco":
      return writeStatementECO(impactsData);
    case "geq":
      return writeStatementGEQ(impactsData);
    case "ghg":
      return writeStatementGHG(impactsData);
    case "haz":
      return writeStatementHAZ(impactsData);
    case "knw":
      return writeStatementKNW(impactsData);
    case "mat":
      return writeStatementMAT(impactsData);
    case "nrg":
      return writeStatementNRG(impactsData);
    case "soc":
      return writeStatementSOC(impactsData);
    case "was":
      return writeStatementWAS(impactsData);
    case "wat":
      return writeStatementWAT(impactsData);
  }
};

export const getAnalyse = (
  impactsData,
  financialData,
  comparativeData,
  indic,
  period
) => {
  const props = {
    impactsData: impactsData[period.periodKey],
    financialData: financialData,
    comparativeData: comparativeData,
    period: period
  };

  switch (indic) {
    case "art":
      return analysisTextWriterART(props);
    case "idr":
      return analysisTextWriterIDR(props);
    case "eco":
      return analysisTextWriterECO(props);
    case "geq":
      return analysisTextWriterGEQ(props);
    case "ghg":
      return analysisTextWriterGHG(props);
    case "haz":
      return analysisTextWriterHAZ(props);
    case "knw":
      return analysisTextWriterKNW(props);
    case "mat":
      return analysisTextWriterMAT(props);
    case "nrg":
      return analysisTextWriterNRG(props);
    case "soc":
      return analysisTextWriterSOC(props);
    case "was":
      return analysisTextWriterWAS(props);
    case "wat":
      return analysisTextWriterWAT(props);
  }
};
