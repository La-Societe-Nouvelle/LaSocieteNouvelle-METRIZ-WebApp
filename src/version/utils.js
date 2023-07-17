import { endpoints } from "../../config/endpoint";
import {
  fetchComparativeDataForArea,
  fetchComparativeDataForDivision,
} from "../services/MacrodataService";

export const fetchComparativeData = async (sessionData, indicatorCode) => {
  await fetchComparativeDataForArea(
    sessionData.comparativeData,
    indicatorCode,
    endpoints
  );
  if (sessionData.comparativeData.activityCode !== "00" ) {
    await fetchComparativeDataForDivision(
      sessionData.comparativeData,
      indicatorCode,
      endpoints
    );
  }
};
