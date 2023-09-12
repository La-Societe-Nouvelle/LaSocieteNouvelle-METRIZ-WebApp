import { buildRegexFinancialPeriod } from "../../../utils/periodsUtils";

export const getFinancialPeriodFECData = async (FECData) =>
{
  // periods to build
  let financialPeriod = {
    dateStart: FECData.firstDate,
    dateEnd: FECData.lastDate,
    periodKey: "FY" + FECData.lastDate.substring(0, 4),
    regex: buildRegexFinancialPeriod(FECData.firstDate, FECData.lastDate),
  };
  
  return financialPeriod;
}

export const getMonthPeriodsFECData = (FECData) =>
{
  // let periods = getListMonthsFinancialPeriod(importedData.meta.firstDate, importedData.meta.lastDate)
  //     .map(month => {
  //         return ({
  //             regex: new RegExp("^" + month),
  //             periodKey: month
  //         })
  //     })
  //     .concat(session.financialPeriod);

  return [];
}

export const getListMonthsFinancialPeriod = (dateStart, dateEnd) => {
  let datesEndMonths = getDatesEndMonths(dateStart, dateEnd);
  let months = datesEndMonths.map((date) => date.substring(0, 6));
  return months;
};