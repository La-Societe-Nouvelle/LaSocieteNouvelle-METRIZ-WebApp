import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import metaIndics from "/lib/indics";

const UpdateDataView = (props) => {
  const [updatedLegalUnit, setUpdatedLegalUnit] = useState(null);
  const [updatedProviders, setUpdatedProviders] = useState(null);
  const [updatedAccounts, setUpdatedAccounts] = useState(null);
  const [updatedComparativeData, setUpdatedComparativeData] = useState(null);
  const [updatedFootprint, setUpdatedFootprint] = useState(null);
  const [showButton, setShowButton] = useState(true);
  const [isSessionUpdated, setIsSessionUpdated] = useState(false);
  const [isUptodate, setIsuptodate] = useState(false);

  useEffect(async () => {
    const compareLegalUnit = await compareData(
      props.prevSession.legalUnit,
      props.updatedSession.legalUnit
    );

    if (compareLegalUnit) {
      setUpdatedLegalUnit(compareLegalUnit);
    }

    const compareProviders = await compareProvidersFpt(
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

    const compareAccounts = await compareInitialStateFpt(
      prevAccounts,
      currAccounts
    );
    if (compareAccounts) {
      setUpdatedAccounts(compareAccounts);
    }

    const compareAggregates = await compareComparativeData(
      props.prevSession.comparativeData,
      props.updatedSession.comparativeData
    );

    if (compareAggregates) {
      setUpdatedComparativeData(compareAggregates);
    }

    if (
      compareLegalUnit ||
      compareProviders ||
      compareAccounts ||
      compareAggregates
    ) {
      setShowButton(true);
    }

    if (
      !compareLegalUnit &&
      !compareProviders &&
      !compareAccounts &&
      !compareAggregates
    ) {
      setIsuptodate(true);
    }
  }, [props]);

  useEffect(async () => {
    if(isSessionUpdated) {
      props.updatePrevSession(props.updatedSession)
    }

  }, [isSessionUpdated]);

  async function updateAggregatesFootprints(prevSession, currSession) {
    let compareProductionFootprint = {};

    for (let period of prevSession.availablePeriods) {
      await currSession.updateFootprints(period);
    }

    for (let period of prevSession.availablePeriods) {
      const result = compareAggregateFootprint(
        prevSession.financialData.mainAggregates.production.periodsData[
          period.periodKey
        ].footprint.indicators,
        currSession.financialData.mainAggregates.production.periodsData[
          period.periodKey
        ].footprint.indicators
      );

      if (result) {
        if (!compareProductionFootprint[period.periodKey]) {
          compareProductionFootprint[period.periodKey] = {};
        }
        compareProductionFootprint[period.periodKey] = result;
      }
    }
    setUpdatedFootprint(compareProductionFootprint);
    setIsSessionUpdated(true);
  }

  return isSessionUpdated ? (
    <>
      <div className="">
        <p>Vos données ont bien été mises à jour! </p>
        {Object.keys(updatedFootprint).length > 0 &&
          Object.entries(updatedFootprint).map(([key, value]) => {
            const indics = Object.keys(value);
            let items = [];
            indics.forEach((indic,index) => {
              const currValue = value[indic].value.currValue;
              const prevValue = value[indic].value.prevValue;
              const diff = Math.abs((currValue - prevValue) / prevValue);

              if (prevValue !== null && currValue !== null && diff >= 0.1) {
                items.push(
                  <li key={index}>
                    <b>{metaIndics[indic].libelle} </b>: L'impact de la production pour{" "}
                    {key.slice(2)} est maintenant de {currValue}{" "}
                    {metaIndics[indic].unit}. La valeur précédente était de{" "}
                    {prevValue} {metaIndics[indic].unit}.
                  </li>
                );
              }
            });
            return (
              <div>
                {items.length > 0 && (
                  <>
                    <p className="">
                      L'empreinte de certains indicateurs a été recalculée en
                      conséquence :
                    </p>
                    <ul className="small">{items}</ul>
                  </>
                )}
              </div>
            );
          })}
        <Button variant="secondary" className="me-1 mt-2" onClick={props.downloadSession} >
          Sauvegarder ma session
        </Button>
        <Button variant="primary" onClick={props.close}>
          Reprendre mon analyse
        </Button>
      </div>
    </>
  ) : (
    <>
      {isUptodate ? (
        <>
          <p>
            Toutes les données de votre session sont à jour. Vous pouvez
            reprendre votre analyse.
          </p>
          <div className="text-end">
            <Button
              variant="primary"
              size="md"
              className="me-1"
              onClick={props.close}
            >
              Fermer
            </Button>
          </div>
        </>
      ) : (
        <p className="mb-3">Des données plus récentes sont disponibles :</p>
      )}
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

      {updatedComparativeData && (
        <div className="small border-top my-3 pt-3">
          <h4 className="h6">
            {" "}
            <i className="text-info me-1 bi bi-arrow-repeat"></i>Données
            comparatives
          </h4>
          <p>Les données de comparaisons vont être mises à jour.</p>
        </div>
      )}

      {showButton && (
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() =>
            updateAggregatesFootprints(props.prevSession, props.updatedSession)
          }
        >
          Mettre à jour ma session
        </Button>
      )}
    </>
  );
};

async function compareData(prevData, currData) {
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

async function compareProvidersFpt(prevProviders, currProviders) {
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

async function compareInitialStateFpt(prevAccounts, currAccounts) {
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

async function compareComparativeData(prevData, currData) {
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
    const compareDivisionFpt = compareData(prevDivisionFpt, currDivisionFpt);
    const compareTgtArea = compareData(prevTargetAreaFpt, currTargetAreaFpt);
    const compareTgtDivision = compareData(
      prevTargetDivisionFpt,
      currTargetDivisionFpt
    );
    const comparetrendFpt = compareData(
      prevTrendsFootprint,
      currTrendsFootprint
    );

    if (!updates[aggregate]) {
      updates[aggregate] = {};
    }
    updates[aggregate] = {
      areaFootprint: compareAreaFpt,
      divisionFootprint: compareDivisionFpt,
      targetAreaFootprint: compareTgtArea,
      targetDivisionFootprint: compareTgtDivision,
      trendsFootprint: comparetrendFpt,
    };
  }
  return Object.keys(updates).length ? updates : false;
}

function compareAggregateFootprint(prevData, currData) {

  const updates = {};

  for (const indicator in prevData) {
    let diffs = {};

    const currFootprint = currData[indicator];
    const prevFootprint = prevData[indicator];

    const prevKeys = Object.keys(prevFootprint);
    // Compare the values of each key
    for (const key of prevKeys) {
      if (key == "value") {
        const prevValue = prevFootprint[key];
        const currValue = currFootprint[key];

        if (prevValue !== currValue) {
          diffs[key] = {
            prevValue,
            currValue,
          };
          updates[indicator] = diffs;
        }
      }
    }
  }
  return Object.keys(updates).length ? updates : false;
}

const LegalUnitDataPreview = ({ data }) => {
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
      <h4 className="h6">
        {" "}
        <i className="text-info me-1 bi bi-arrow-repeat"></i>Données de l'unité
        légale
      </h4>
      <p>Les données suivantes vont être mises à jour.</p>
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
  const nb = Object.entries(data).length;

  return (
    <div className="small border-top my-3 pt-3">
      <h4 className="h6">
        {" "}
        <i className="text-info me-1 bi bi-arrow-repeat"></i>Données des {label}
      </h4>
      {nb > 1
        ? nb + " " + label + " vont être mis à jour"
        : nb + " va être mis à jour"}
    </div>
  );
};

export default UpdateDataView;
