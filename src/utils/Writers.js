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
  indic
) => {
  const session = {
    impactsData: impactsData,
    financialData: financialData,
    comparativeData: comparativeData,
  };

  switch (indic) {
    case "art":
      return analysisTextWriterART(session);
    case "idr":
      return analysisTextWriterIDR(session);
    case "eco":
      return analysisTextWriterECO(session);
    case "geq":
      return analysisTextWriterGEQ(session);
    case "ghg":
      return analysisTextWriterGHG(session);
    case "haz":
      return analysisTextWriterHAZ(session);
    case "knw":
      return analysisTextWriterKNW(session);
    case "mat":
      return analysisTextWriterMAT(session);
    case "nrg":
      return analysisTextWriterNRG(session);
    case "soc":
      return analysisTextWriterSOC(session);
    case "was":
      return analysisTextWriterWAS(session);
    case "wat":
      return analysisTextWriterWAT(session);
  }
};
