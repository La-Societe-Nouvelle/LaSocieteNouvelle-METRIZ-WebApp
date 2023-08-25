import React, { useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import { Session } from "../../../src/Session";
import LegalUnitService from "../../../src/services/LegalUnitService";
import { fetchComparativeData } from "../../../src/services/MacrodataService";
import UpdateDataView from "./UpdatedDataView";

// Libraries
import metaIndics from "/lib/indics.json";

export const DataUpdater = ({ session, updatePrevSession }) => {
  const [show, setShow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedSession, setUpdatedSession] = useState({});
  const [isDatafetched, setIsDatafetched] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    const updatedSession = new Session(JSON.parse(JSON.stringify(session)));

    await fetchLatestData(updatedSession);

    setUpdatedSession(updatedSession);
    setIsLoading(false);
    setIsDatafetched(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <Modal show={show} size="lg" onHide={handleClose}>
      <Modal.Header closeButton closeLabel="Fermer">
        <h3>Actualisation des données...</h3>
      </Modal.Header>
      <Modal.Body>
      <Image
              src="/illus/sync.svg"
              alt=""
              className="d-block mx-auto mb-4"
              height={150}
            />
        {isDatafetched && (
          <UpdateDataView
            prevSession={session}
            updatedSession={updatedSession}
            close={() => setShow(false)}
            updatePrevSession={updatePrevSession}
          ></UpdateDataView>
        )}
        {!isDatafetched && !isLoading && (
          <div className="text-center">
            
            <p className="">
              Il se pourrait que des données plus récentes soient disponibles.
              Souhaitez-vous vérifier si les données sont à jour ?
            </p>
            <Button
              className="mt-2"
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleRefresh()}
            >
              Vérifier mes données
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

const fetchLatestData = async (updatedSession) => {
  const prevLegalUnit = updatedSession.legalUnit;
  const prevProviders = updatedSession.financialData.providers;
  const prevExternalExpenses = updatedSession.financialData.externalExpenses;
  const prevInvestments = updatedSession.financialData.investments;
  const prevStocks = updatedSession.financialData.stocks;
  const prevImmobilisations = updatedSession.financialData.immobilisations;
  const validations =
    updatedSession.validations[updatedSession.financialPeriod.periodKey];

  // Récupère les données de l'unité légale si le Siren est renseigné

  if (prevLegalUnit.siren !== "") {
    await fetchLatestLegalUnit(prevLegalUnit);
  }

  // Récupère les données des fournisseurs
  await fetchLatestProviders(
    prevProviders,
    prevExternalExpenses,
    prevInvestments
  );

  // Récupère les dernières données pour les comptes de stocks et  d'immobilisation

  await fetchLatestAccountsData(prevImmobilisations, prevStocks);

  // Récupère les dernières données comparatives

  if (validations.length > 0) {
    await fetchComparativeData(updatedSession.comparativeData);
  }
};

const fetchLatestProviders = async (
  providers,
  externalExpenses,
  investments
) => {
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

const fetchLatestLegalUnit = async (legalUnit) => {
  await LegalUnitService.getLegalUnitData(legalUnit.siren).then((res) => {
    let status = res.data.header.code;
    if (status == 200) {
      legalUnit.corporateName = res.data.legalUnit.denomination;
      legalUnit.corporateHeadquarters =
        res.data.legalUnit.communeSiege +
        " (" +
        res.data.legalUnit.codePostalSiege +
        ")";
      legalUnit.activityCode = res.data.legalUnit.activitePrincipaleCode;

      legalUnit.isEmployeur = res.data.legalUnit.caractereEmployeur;
      legalUnit.trancheEffectifs = res.data.legalUnit.trancheEffectifs;
      legalUnit.isEconomieSocialeSolidaire =
        res.data.legalUnit.economieSocialeSolidaire;
      legalUnit.isSocieteMission = res.data.legalUnit.societeMission;
      legalUnit.hasCraftedActivities = res.data.legalUnit.hasCraftedActivities;
    }
  });
};

const fetchLatestAccountsData = async (immobilisations, stocks) => {
  const accounts = immobilisations
    .concat(stocks)
    .filter((asset) => asset.initialStateType == "defaultData");

  for (let account of accounts) {
    try {
      await account.updateInitialStateFootprintFromRemote();
    } catch (error) {
      break;
    }
  }
};
