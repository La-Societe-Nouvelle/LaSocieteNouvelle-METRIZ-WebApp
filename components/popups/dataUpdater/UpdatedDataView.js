import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import metaIndics from "/lib/indics";
import { downloadSession, isObjEmpty } from "../../../src/utils/Utils";

const UpdateDataView = (props) => {

  const [updatedProviders, setUpdatedProviders] = useState(null);
  const [updatedAccounts, setUpdatedAccounts] = useState(null);
  const [updatedComparativeData, setUpdatedComparativeData] = useState(null);
  const [updatedFootprint, setUpdatedFootprint] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isSessionUpdated, setIsSessionUpdated] = useState(false);
  const [isUptodate, setIsuptodate] = useState(false);

  useEffect(async () => {

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

    const compareComparativeData = compareDataUpdates(
      props.prevSession.comparativeData,
      props.updatedSession.comparativeData
    );

    if (compareComparativeData) {
      setUpdatedComparativeData(compareComparativeData);
    }

    if (
      isObjEmpty(compareProviders) &&
      isObjEmpty(compareAccounts) &&
      isObjEmpty(compareComparativeData) 
    ) {
      setShowButton(false);
      setIsuptodate(true);
    } else {
      setShowButton(true);
      setIsuptodate(false);
    }
  }, [props]);

  useEffect(async () => {
    if (isSessionUpdated) {
      props.updatePrevSession(props.updatedSession);
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
      <p>Les données ont bien été mises à jour ! </p>
      {Object.keys(updatedFootprint).length > 0 &&
        Object.entries(updatedFootprint).map(([key, value]) => {
          const indics = Object.keys(value);
          let items = [];
          indics.forEach((indic, index) => {
            const currValue = value[indic].value.currValue;
            const prevValue = value[indic].value.prevValue;
            const diff = Math.abs((currValue - prevValue) / prevValue);

            if (prevValue !== null && currValue !== null && diff >= 0.1) {
              items.push(
                <li key={index}>
                  <b>{metaIndics[indic].libelle} </b>: L'empreinte de la
                  production pour {key.slice(2)} est maintenant de {currValue}{" "}
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
      <Button
        variant="secondary"
        className="me-1 my-2"
        onClick={() => downloadSession(props.updatedSession)}
      >
        Sauvegarder ma session
      </Button>
      <Button variant="primary" className="my-2" onClick={props.close}>
        Reprendre mon analyse
      </Button>
    </>
  ) : (
    <>
      {isUptodate ? (
        <>
          <p>
            <i className="success bi bi-check2-circle"></i> Toutes les données
            de votre session sont à jour. Vous pouvez reprendre votre analyse.
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
        <p className="mb-3 fw-bold">Des données plus récentes sont disponibles :</p>
      )}
  
      {updatedProviders && !isObjEmpty(updatedProviders) && (
        <FootprintPreview data={updatedProviders} label={"fournisseurs"} />
      )}

      {updatedAccounts && !isObjEmpty(updatedAccounts) && (
        <FootprintPreview
          data={updatedAccounts}
          label={"comptes de stocks et d'immobilisations"}
        />
      )}
      {updatedComparativeData && !isObjEmpty(updatedComparativeData) && (
        <div className="small my-3 pt-3">
          <h4 className="h6">
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

      // Check if lastupdate is different
      if (currFootprint.lastupdate != prevFootprint.lastupdate) {
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
      // Check if lastupdate is different
      if (currFootprint.lastupdate != prevFootprint.lastupdate) {
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
  }

  return updates;
}

function compareDataUpdates(prevData, currData) {
  const compareComparativeData = {};

  // Parcours des agrégats
  for (const aggregate in prevData) {
    if (aggregate !== "activityCode") {
      const prevSector = prevData[aggregate];
      const currSector = currData[aggregate];

      // Parcours des datasets "area" et "division"
      for (const datasetKey in prevSector) {
        const prevDataset = prevSector[datasetKey];
        const currDataset = currSector[datasetKey];

        // Parcours des indicateurs dans le dataset
        for (const dataset in prevDataset) {
          const prevData = prevDataset[dataset].data;
          const currData = currDataset[dataset].data;

          for (const indic in prevData) {
            const prevValues = prevData[indic];
            const currValues = currData[indic];

            for (let i = 0; i < prevValues.length; i++) {
              const prevValue = prevValues[i];
              const currValue = currValues[i];
       
              const prevLastUpdate = new Date(prevValue.lastupdate);
              const currLastUpdate = new Date(currValue.lastupdate);

           
              if (prevLastUpdate < currLastUpdate) {
                if (!compareComparativeData[aggregate]) {
                  compareComparativeData[aggregate] = {};
                }

                if (!compareComparativeData[aggregate][dataset]) {
                  compareComparativeData[aggregate][dataset] = {
                    currLastUpdate,
                  };
                } else if (
                  compareComparativeData[aggregate][dataset].currLastUpdate <
                  currLastUpdate
                ) {
                  compareComparativeData[aggregate][dataset].currLastUpdate = currLastUpdate;
                }
              }
            }
          }
        }
      }
    }
  }

  return compareComparativeData;
}

function compareAggregateFootprint(prevData, currData) {
  const updates = {};

  for (const indicator in prevData) {
    let diffs = {};

    const currFootprint = currData[indicator];
    const prevFootprint = prevData[indicator];

    // Check if lastupdate is different

    if (currFootprint.lastupdate != prevFootprint.lastupdate) {
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
  }

  return !isObjEmpty(updates) ? updates : false;
}

const FootprintPreview = ({ data, label }) => {
  const nb = Object.entries(data).length;

  return (
    <div className="small border-top my-3 pt-3">
      <h4 className="h6">
        {" "}
        <i className="text-info me-1 bi bi-arrow-repeat"></i>Données des {label}
      </h4>
      {nb +
        " " +
        (nb > 1 ? "empreintes vont" : "empreinte va") +
        " être mise" +
        (nb > 1 ? "s" : "") +
        " à jour"}
    </div>
  );
};

export default UpdateDataView;
