// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

// Lib
import metaIndics from "/lib/indics";

const indics = Object.entries(metaIndics)
  .filter(([_,metaIndic]) => metaIndic.isAvailable)
  .map(([indic,_]) => indic);

import { downloadSession, isObjEmpty } from "/src/utils/Utils";
import { getInitialStatesChanges, getProductionFootprintChanges, getProvidersChanges } from "./utils";

const UpdateDataView = ({
  prevSession,
  updatedSession,
  updatePrevSession,
  close
}) => {

  const [providersChanges, setProvidersChanges] = useState([]);
  const [initialStatesChanges, setInitialStatesChanges] = useState([]);
  const [resultsChanges, setResultsChanges] = useState([]);
  const [updatedComparativeData, setUpdatedComparativeData] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [isSessionUpdated, setIsSessionUpdated] = useState(false);
  const [isUptodate, setIsuptodate] = useState(false);


  useEffect(async () => {
    // providers changes
    const providersChanges = await getProvidersChanges(
      updatedSession.financialData.providers,
      prevSession.financialData.providers
    );
    setProvidersChanges(providersChanges);

    // initial states changes
    const immobilisationsChanges = await getInitialStatesChanges(
      updatedSession.financialData.immobilisations,
      prevSession.financialData.immobilisations
    );
    const stocksChanges = await getInitialStatesChanges(
      updatedSession.financialData.stocks,
      prevSession.financialData.stocks
    );
    setInitialStatesChanges([...immobilisationsChanges,...stocksChanges]);

    const compareComparativeData = compareDataUpdates(
      prevSession.comparativeData,
      updatedSession.comparativeData
    );

    if (compareComparativeData) {
      setUpdatedComparativeData(compareComparativeData);
    }

    if (
      isObjEmpty(providersChanges) &&
      isObjEmpty(initialStatesChanges) &&
      isObjEmpty(compareComparativeData) 
    ) {
      setShowButton(false);
      setIsuptodate(true);
    } else {
      setShowButton(true);
      setIsuptodate(false);
    }
  }, [prevSession,updatedSession]);

  useEffect(async () => {

  }, [isSessionUpdated]);

  // re-compute footprints
  const applyUpdates = async () => 
  {
    // update footprints
    for (let period of updatedSession.availablePeriods) {
      await updatedSession.updateFootprints(period);
    }

    // get changes
    const resultsChanges = [];
    for (let period of prevSession.availablePeriods) {
      const resultsChangesOnPeriod = getProductionFootprintChanges(
        updatedSession.financialData.mainAggregates.production.periodsData[period.periodKey].footprint,
        prevSession.financialData.mainAggregates.production.periodsData[period.periodKey].footprint
      );
      resultsChanges.push(...resultsChangesOnPeriod);
    }
    setResultsChanges(resultsChanges);

    setIsSessionUpdated(true);
  }

  if (isSessionUpdated) {
    return (
      <>
        <p>Les données ont bien été mises à jour ! </p>
        {Object.keys(resultsChanges).length > 0 &&
          Object.entries(resultsChanges).map(([key, value]) => {
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
          onClick={() => downloadSession(updatedSession)}
        >
          Sauvegarder ma session
        </Button>
        <Button variant="primary" className="my-2" onClick={close}>
          Reprendre mon analyse
        </Button>
      </>
    )
  } else {
    return (
      <>
        {isUptodate ? (
          <div className="text-center">
            <p>
              <i className="success bi bi-check2-circle"></i> Toutes les données
              de votre session sont à jour. Vous pouvez reprendre votre analyse.
            </p>
            <div >
              <Button
                variant="primary"
                size="md"
                className="me-1"
                onClick={close}
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <p className="mb-3 ">Des données plus récentes sont disponibles :</p>
        )}
    
        {providersChanges && !isObjEmpty(providersChanges) && (
          <FootprintPreview data={providersChanges} label={"fournisseurs"} />
        )}

        {initialStatesChanges && !isObjEmpty(initialStatesChanges) && (
          <FootprintPreview
            data={initialStatesChanges}
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
              applyUpdates(prevSession, updatedSession)
            }
          >
            Mettre à jour ma session
          </Button>
        )}
      </>
    )
  }
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
