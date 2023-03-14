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
  const session = {
    impactsData: impactsData,
    financialData: financialData,
    comparativeData: comparativeData,
  };

  switch (indic) {
    case "art":
      return analysisTextWriterART(session,period);
    case "idr":
      return analysisTextWriterIDR(session,period);
    case "eco":
      return analysisTextWriterECO(session,period);
    case "geq":
      return analysisTextWriterGEQ(session,period);
    case "ghg":
      return analysisTextWriterGHG(session,period);
    case "haz":
      return analysisTextWriterHAZ(session,period);
    case "knw":
      return analysisTextWriterKNW(session,period);
    case "mat":
      return analysisTextWriterMAT(session,period);
    case "nrg":
      return analysisTextWriterNRG(session,period);
    case "soc":
      return analysisTextWriterSOC(session,period);
    case "was":
      return analysisTextWriterWAS(session,period);
    case "wat":
      return analysisTextWriterWAT(session,period);
  }
};
