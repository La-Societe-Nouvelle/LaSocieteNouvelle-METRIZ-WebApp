// Updater version from 1.0.2 to 1.0.4

export const updater_1_0_4 = async (sessionData) => 
{
  // update investments
  let investments = sessionData.financialData.investments
    ? sessionData.financialData.investments.map(
        (props, index) => new Expense({ id: index, ...props })
      )
    : [];
  let investmentsFootprint = new SocialFootprint();
  Object.keys(metaIndics).forEach(
    async (indic) =>
      (investmentsFootprint[indic] = await buildAggregateIndicator(
        indic,
        investments
      ))
  );

  // gross fixed capital formation
  let dataGrossFixedCapitalFormationAggregate = {
    label: "Formation brute de capital fixe",
    amount: getAmountItems(investments),
    footprint: investmentsFootprint,
  };
  sessionData.financialData.aggregates.grossFixedCapitalFormation =
    dataGrossFixedCapitalFormationAggregate;
};