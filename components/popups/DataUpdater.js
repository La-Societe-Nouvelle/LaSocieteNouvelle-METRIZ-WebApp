import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Session } from "../../src/Session";

export const DataUpdater = ({ session }) => {
  const [show, setShow] = useState(true);

 
  const handleRefresh = async () => {

    const updatedSession = new Session({...session})

    console.log(session.financialData.providers[0].footprint);
    await fetchLatestData(updatedSession);
  };

  return (
    <Modal show={show} size="lg" centered>
      <Modal.Body>
        <h3 className="text-center mt-4">Mise à jour des données</h3>
        <p>
          Des données plus récentes sont peut-être disponibles. Souhaitez-vous
          vérifier si les données sont à jour ?
        </p>
        <div className="text-end">
          <Button onClick={() => setShow(false)} className="me-1">
            Fermer
          </Button>
          <Button variant="secondary" onClick={() => handleRefresh()}>
            Actualiser
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const fetchLatestData = async (sessionCopy) => {


  const prevProviders = sessionCopy.financialData.providers;
  const prevExternalExpenses = sessionCopy.financialData.externalExpenses;
  const prevInvestments = sessionCopy.financialData.investments;
  const prevStocks = sessionCopy.financialData.stocks;
  const prevImmobilisations = sessionCopy.financialData.immobilisations;
  const prevLegalUnit = sessionCopy.legalUnit;
  console.log(prevLegalUnit);
 
  // Récupère les données des fournisseurs
  await fetchLatestProviders(prevProviders, prevExternalExpenses, prevInvestments);

  // Récupère les données de l'unité légale si le Siren est renseigné
  if(prevLegalUnit.siren !== '') {
    
    await prevLegalUnit.setSiren(prevLegalUnit.siren)

  }



  function handleSiren(siren) {
    if (siren.length == 9) {
      props.session.legalUnit.setSiren(siren);
    }
    setSiren(siren);
  }


// const latestStocks = await fetchLatestStocks();
// const latestImmobilisations = await fetchLatestImmobilisations();
// const latestComparativeData = await fetchLatestComparativeData();
// const latestLegalUnit = await fetchLatestLegalUnit();


  //await updateProviders(providers, externalExpenses, investments);

  // 1. Vérifier les fournisseurs
};

const fetchLatestProviders = async (providers, externalExpenses, investments) => {


  for (let provider of providers) {
    try {
      // fetch footprint
      await provider.updateFromRemote();
      // assign to expenses & investments
      externalExpenses
        .concat(investments)
        .filter((expense) => expense.providerNum == provider.providerNum)
        .forEach((expense) => {
          expense.footprint = provider.footprint;
        });
    } catch (error) {
      console.log(error);
    }
  }
};
