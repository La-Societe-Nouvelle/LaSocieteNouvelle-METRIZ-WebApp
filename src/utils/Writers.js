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
}