import React, { useEffect, useState } from "react";

const UpdateDataView = (props) => {
  const [updatedLegalUnit, setUpdatedLegalUnit] = useState(null);
  const [updatedProviders, setUpdatedProviders] = useState(null);
  const [updatedAccounts, setUpdatedAccounts] = useState(null);
  const [updatedComparison, setUpdatedComparison] = useState(null);

  useEffect(() => {
    const compareLegalUnit = compareData(
      props.prevSession.legalUnit,
      props.updatedSession.legalUnit
    );

    if (compareLegalUnit) {
      setUpdatedLegalUnit(compareLegalUnit);
    }

    const compareProviders = compareProvidersFpt(
      props.prevSession.financialData.providers,
      props.updatedSession.financialData.providers
    );
    if (compareProviders) {
      setUpdatedProviders(compareProviders);
    }

    const prevAccounts = props.prevSession.financialData.immobilisations
      .concat(props.prevSession.financialData.stocks)
      .filter((asset) => asset.initialStateType == "defaultData");

    const currAccounts = props.updatedSession.financialData.immobilisations
      .concat(props.updatedSession.financialData.stocks)
      .filter((asset) => asset.initialStateType == "defaultData");

    const compareAccounts = compareInitialStateFpt(prevAccounts, currAccounts);
    if (compareAccounts) {
      setUpdatedAccounts(compareAccounts);
    }

    const compareAggregates = compareAggregatesData(
      props.prevSession.comparativeData,
      props.updatedSession.comparativeData
    );
  }, [props]);

  return (
    <>
      {updatedLegalUnit && <LegalUnitDataPreview data={updatedLegalUnit} />}

      {updatedProviders && (
        <FootprintPreview data={updatedProviders} label={"fournisseurs"} />
      )}

      {updatedAccounts && (
        <FootprintPreview
          data={updatedAccounts}
          label={"comptes de stocks et d'immobilisations"}
        />
      )}
    </>
  );
};

function compareData(prevData, currData) {
  let diffs = {};

  // Compare the keys of both objects
  const prevKeys = Object.keys(prevData);
  const currKeys = Object.keys(currData);

  // Find keys that are only in prevData
  const onlyInPrev = prevKeys.filter((key) => !currKeys.includes(key));
  for (const key of onlyInPrev) {
    diffs[key] = {
      prevValue: prevData[key],
      currValue: undefined,
    };
  }

  // Find keys that are only in currData
  const onlyInCurr = currKeys.filter((key) => !prevKeys.includes(key));
  for (const key of onlyInCurr) {
    diffs[key] = {
      prevValue: undefined,
      currValue: currData[key],
    };
  }

  // Compare the values of each key
  for (const key of prevKeys) {
    const prevValue = prevData[key];
    const currValue = currData[key];
    if (prevValue !== currValue) {
      diffs[key] = {
        prevValue,
        currValue,
      };
    }
  }

  return Object.keys(diffs).length ? diffs : false;
}

function compareProvidersFpt(prevProviders, currProviders) {
  const updates = {};

  // Parcours de tous les fournisseurs
  for (const provider in currProviders) {
    const currProvider = currProviders[provider];
    const prevProvider = prevProviders[provider];
    const providerId = prevProvider.corporateId
      ? prevProvider.corporateId
      : prevProvider.providerNum;
    // Comparaison des indicateurs pour chaque fournisseur
    for (const indicator in currProvider.footprint.indicators) {
      let diffs = {};

      const currFootprint = currProvider.footprint.indicators[indicator];
      const prevFootprint = prevProvider.footprint.indicators[indicator];

      const prevKeys = Object.keys(prevFootprint);

      // Compare the values of each key
      for (const key of prevKeys) {
        if (typeof prevFootprint[key] !== "function") {
          const prevValue = prevFootprint[key];
          const currValue = currFootprint[key];
          if (prevValue !== currValue) {
            diffs[key] = {
              prevValue,
              currValue,
            };
          }
        }
      }

      if (!updates[provider]) {
        updates[provider] = { id: providerId };
      }
      // Stockage des indicateurs modifiés dans l'objet updates
      if (!updates[provider]) {
        updates[provider] = {};
      }
      updates[provider][indicator] = diffs;
    }
  }

  return updates;
}

function compareInitialStateFpt(prevAccounts, currAccounts) {
  const updates = {};

  // Parcours de tous les fournisseurs
  for (const account in currAccounts) {
    const currAccount = currAccounts[account];
    const prevAccount = prevAccounts[account];

    // Comparaison des indicateurs pour chaque fournisseur
    for (const indicator in currAccount.initialState.footprint.indicators) {
      let diffs = {};

      const currFootprint =
        currAccount.initialState.footprint.indicators[indicator];
      const prevFootprint =
        prevAccount.initialState.footprint.indicators[indicator];

      const prevKeys = Object.keys(prevFootprint);

      // Compare the values of each key
      for (const key of prevKeys) {
        if (typeof prevFootprint[key] !== "function") {
          const prevValue = prevFootprint[key];
          const currValue = currFootprint[key];
          if (prevValue !== currValue) {
            diffs[key] = {
              prevValue,
              currValue,
            };
          }
        }
      }

      if (!updates[account]) {
        updates[account] = { accountNum: prevAccount.accountNum };
      }
      // Stockage des indicateurs modifiés dans l'objet updates
      if (!updates[account]) {
        updates[account] = {};
      }
      updates[account][indicator] = diffs;
    }
  }

  return updates;
}

function compareAggregatesData(prevData, currData) {
  const aggregates = Object.keys(prevData).filter(
    (data) => data != "activityCode"
  );
  const updates = {};

  for (const aggregate of aggregates) {
    const prevAreaFpt = prevData[aggregate].areaFootprint.indicators;
    const prevDivisionFpt = prevData[aggregate].divisionFootprint.indicators;
    const prevTargetAreaFpt =
      prevData[aggregate].targetAreaFootprint.indicators;
    const prevTargetDivisionFpt =
      prevData[aggregate].targetDivisionFootprint.indicators;
    const prevTrendsFootprint = prevData[aggregate].trendsFootprint.indicators;

    const currAreaFpt = currData[aggregate].areaFootprint.indicators;
    const currDivisionFpt = currData[aggregate].divisionFootprint.indicators;
    const currTargetAreaFpt =
      currData[aggregate].targetAreaFootprint.indicators;
    const currTargetDivisionFpt =
      currData[aggregate].targetDivisionFootprint.indicators;
    const currTrendsFootprint = currData[aggregate].trendsFootprint.indicators;

    
      const compareAreaFpt = compareData(prevAreaFpt, currAreaFpt);
      const compareDivisionFpt =  compareData(prevDivisionFpt, currDivisionFpt);
      const compareTgtArea = compareData(prevTargetAreaFpt, currTargetAreaFpt);
      const compareTgtDivision = compareData(prevTargetDivisionFpt,currTargetDivisionFpt);
      const comparetrendFpt = compareData(prevTrendsFootprint, currTrendsFootprint);


      if (!updates[aggregate]) {
        updates[aggregate] = {};
      }
      updates[aggregate] = {
        areaFootprint: compareAreaFpt,
        divisionFootprint: compareDivisionFpt,
        targetAreaFootprint: compareTgtArea,
        targetDivisionFootprint : compareTgtDivision,
        trendsFootprint : comparetrendFpt,
      };
   

  }

  console.log(updates);
}

const LegalUnitDataPreview = ({ data, title }) => {
  const propertyMap = {
    isEconomieSocialeSolidaire:
      "Est-ce une entreprise de l'économie sociale et solidaire?",
    isSocieteMission: "Est-ce une entreprise à mission ?",
    hasCraftedActivities: "A-t-elle des activités artisanales ?",
    activityCode: "Code d'activité",
    corporateHeadquarters: "Siège social",
    corporateName: "Nom de l'unité légale",
    isEmployeur: "L'entreprise est-elle employeur ?",
    trancheEffectifs: "Tranches d'effectifs",
  };

  const valueMap = {
    true: "Oui",
    false: "Non",
    null: "N/A",
  };

  function mapProperty(property) {
    return propertyMap[property] || property;
  }

  function mapValue(value) {
    if (valueMap.hasOwnProperty(String(value))) {
      return valueMap[String(value)];
    } else if (value instanceof Date) {
      // correspondance pour les dates
      return value.toLocaleDateString();
    } else {
      return value;
    }
  }

  return (
    <div className="small">
      <h5 className="text-secondary h4 ">Données de l'unité légale</h5>
      <p>Les données de l'unité légale doivent être mises à jour.</p>
      <ul>
        {Object.entries(data).map(([property, { prevValue, currValue }]) => (
          <li key={property}>
            {mapProperty(property)} : {mapValue(prevValue)} &#8594;{" "}
            {mapValue(currValue)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const FootprintPreview = ({ data, label }) => {
  return (
    <div className="small border-top my-3 pt-3">
      <h5 className="text-secondary h4 ">Données des {label}</h5>
      {Object.entries(data).length} {label} doivent être mis à jour.
      {/* <ul>
        {Object.entries(data).map(([property, data]) => (
          <li key={property}>
            {console.log(data)}
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default UpdateDataView;
