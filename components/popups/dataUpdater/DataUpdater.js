import React, {useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Session } from "../../../src/Session";
import LegalUnitService from "../../../src/services/LegalUnitService";
import { ComparativeData } from "../../../src/ComparativeData";
import { updateComparativeData } from "../../../src/version/updateVersion";
import UpdateDataView from "./UpdatedDataView";

export const DataUpdater = ({ session }) => {
  const [show, setShow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedSession, setUpdatedSession] = useState({});
  const [isDatafetched, setIsDatafetched] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    const updatedSession = new Session({ ...session });

    await fetchLatestData(updatedSession);

    setUpdatedSession(updatedSession);
    setIsLoading(false);
    setIsDatafetched(true);
  };


  return (
    <Modal show={show} size="lg" centered>
      <Modal.Body>
        <h3 className="text-center my-4">Mise à jour des données</h3>

        {isLoading && (
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        )}
        {isDatafetched && (
          <UpdateDataView
            prevSession={session}
            updatedSession={updatedSession}
          ></UpdateDataView>
        )}
        {!isDatafetched && !isLoading && (
          <div className="text-center">
            <p>
              Des données plus récentes sont peut-être disponibles.
              Souhaitez-vous vérifier si les données sont à jour ?
            </p>
            <Button
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleRefresh()}
            >
              Actualiser
            </Button>
          </div>
        )}

        <div className="text-end">
          <Button onClick={() => setShow(false)} className="me-1">
            Fermer
          </Button>
        </div>
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

  const latestComparativeData = await fetchLatestComparativeData(
    validations,
    updatedSession.comparativeData.activityCode
  );

  updatedSession.comparativeData = latestComparativeData;
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
    console.log( res.data.legalUnit)
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

const fetchLatestComparativeData = async (validations, activityCode) => {
  let latestComparativeData = new ComparativeData();

  for await (const indic of validations) {
    // update comparative data for each validated indicators
    const updatedData = await updateComparativeData(
      indic,
      activityCode,
      latestComparativeData
    );

    latestComparativeData = updatedData;
  }

  return latestComparativeData;
};
