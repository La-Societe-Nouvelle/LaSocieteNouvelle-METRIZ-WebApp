// La Société Nouvelle

export const getProgression = (session,period) => 
{
  // ckeck financial data
  if (session.financialData.isFinancialDataLoaded) // check if valid !
  {
    let initialStatesValid = checkInitialStates(session,period);
    if (initialStatesValid) 
    {
      // check external flows footprint
      let externalFlows = [
        ...session.financialData.externalExpenses,
        ...session.financialData.investments
      ].filter((flow) => period.regex.test(flow.date));

      if (externalFlows.some((flow) => !flow.isSocialFootprintSet))
      {
        // check assessments
        let validations = session.validations[period.periodKey];
        //let statementsStatus = validations.map((indic) => )
        return 4;
      }
      // back to provider section
      else {
        return 3;
      }
    }
    // back to initial states section 
    else {
      return 2;
    }
  }
  // back to accounting import 
  else {
    return 1;
  }
}

const checkFinancialData = (session,period) => {

}

export const checkInitialStates = (session,period) => 
{
  let assetAccounts = [
    ...session.financialData.immobilisations,
    ...session.financialData.stocks
  ];
  return assetAccounts.some((account) => !account.initialStateSet);
}

const checkExternalFootprints = (session,period) => {

}

const checkImpactsStatements = (session,period) => {

}