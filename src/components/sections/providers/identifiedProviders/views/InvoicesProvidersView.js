// La Société Nouvelle

// React
import React from "react";
import { useState } from "react";
import Dropzone from "react-dropzone";

// pdf extractor
import pdf from "pdf-extraction";

// API
import api from "/config/api";

// Modals
import { InfoModal } from "../../../../modals/userInfoModals";
import InvoicesDataModal from "../modals/InvoicesDataModal";

// Utils
import { getDefaultFootprintId } from "../utils";

const InvoicesProvidersView = ({
  providers,
  externalExpenses,
  updateProviders,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [invoicesProviders, setInvoicesProviders] = useState();

  const onInvoicesDrop = async (files) => {
    let foundIdentificationNumber = false;

    const invoicesData = await Promise.all(
      files.map(async (file) => {
        const fileContent = await readFile(file);
        const data = await pdf(fileContent);
        const identificationNumbers = extractIdentificationNumbers(data.text);

        if (identificationNumbers.length > 0) {
          foundIdentificationNumber = true;
          const dates = extractDates(data.text);
          const amounts = extractAmounts(data.text);
          return {
            identificationNumbers,
            dates,
            amounts,
          };
        } else {
          return null;
        }
      })
    );

    if (!foundIdentificationNumber) {
      setShowAlertModal(true);
      return;
    }
    const validInvoicesData = invoicesData.filter((data) => data !== null);
    const invoicesProviders = await processInvoicesData(validInvoicesData);
    setInvoicesProviders(invoicesProviders);
    setShowModal(true);
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target.result;
        resolve(fileContent);
      };

      reader.onerror = (event) => {
        reject(new Error("Error reading file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const extractIdentificationNumbers = (text) => {
    const identificationPatterns = [
      /FR[0-9]{11}( |$|\r\n|\r|\n)/g,
      /FR [0-9]{2} [0-9]{3} [0-9]{3} [0-9]{3}( |$|\r\n|\r|\n)/g,
      /(SIRET|SIREN|RCS)( |)[0-9]{9,15}( |)($|\r\n|\r|\n)/g,
      /(^|)( |)[0-9]{9,15}( |)(SIRET|SIREN|RCS)/g,
    ];

    const identificationNumbers = identificationPatterns
      .map((regex) => text.match(regex) || [])
      .reduce((accumulator, matches) => accumulator.concat(matches), [])
      .map((number) => number.replace(/( |\r\n|\r|\n|RCS|SIREN|SIRET)/g, ""))
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item === value)
      );

    return identificationNumbers;
  };

  const extractDates = (text) => {
    const dateRegex = /[0-9]{2}\/[0-9]{2}\/(20|)[0-9]{2}/g;

    const dates = (text.match(dateRegex) || [])
      .map((date) => {
        const [day, month, year] = date.split("/");
        const formattedYear = year.length === 2 ? "20" + year : year;
        return formattedYear + month + day;
      })
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item === value)
      );

    return dates;
  };

  const extractAmounts = (text) => {
    const amountRegex = /[0-9| ]+(.|,)[0-9]{0,2}( |)€/g;

    const amounts = (text.match(amountRegex) || [])
      .map((amount) =>
        parseFloat(amount.replace(/€/g, "").replace(/ /g, "").replace(",", "."))
      )
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item === value)
      );

    return amounts;
  };

  const processInvoicesData = async (invoicesData) => {
    const invoicesProviders = {};

    for (const invoiceData of invoicesData) {
      if (invoiceData.identificationNumbers.length === 1) {
        const idProvider = invoiceData.identificationNumbers[0];

        if (!invoicesProviders[idProvider]) {
          const siren = getDefaultFootprintId(idProvider);
          // loading state
          const legalUnitData = await fetchLegalUnitData(siren);

          invoicesProviders[idProvider] = {
            legalUnitData,
            invoices: [],
          };
        }

        invoicesProviders[idProvider].invoices.push({
          dates: invoiceData.dates,
          amounts: invoiceData.amounts,
        });
      }
    }

    for (const [providerId, providerData] of Object.entries(
      invoicesProviders
    )) {
      const providersMatching = {};

      for (const invoiceData of providerData.invoices) {
        const expensesMatching = matchExpensesToInvoice(
          externalExpenses,
          invoiceData
        );

        expensesMatching.forEach((expense) => {
          providersMatching[expense.providerNum] =
            (providersMatching[expense.providerNum] || 0) + 1;
        });
      }

      const matchingProviders = Object.keys(providersMatching).filter(
        (providerNum) =>
          providersMatching[providerNum] ===
          Math.max(...Object.values(providersMatching))
      );

      if (matchingProviders.length === 1) {
        const matchingProviderNum = matchingProviders[0];
        providerData.matching = matchingProviderNum;
      }
    }

    return invoicesProviders;
  };

  const matchExpensesToInvoice = (expenses, invoiceData) => {
    return expenses.filter(
      (expense) =>
        invoiceData.dates.includes(expense.date) &&
        invoiceData.amounts.includes(expense.amount)
    );
  };

  const fetchLegalUnitData = async (siren) => {
    try {
      const response = await api.get(`/legalunitfootprint/${siren}`);

      if (response.status === 200) {
        return response.data.legalUnit;
      } else {
        throw new Error("Failed to fetch legal unit data");
      }
    } catch (error) {
      throw new Error("Failed to fetch legal unit data");
    }
  };

  const handleInvoicesProvider = (providersMapping) => {
    for (let i = 0; i < providers.length; i++) {
      const matchingProvider = Object.values(providersMapping).find(mapping => mapping.matching === providers[i].providerNum);
      if (matchingProvider) {
        providers[i].corporateId = matchingProvider.legalUnitData.siren;
        providers[i].legalUnitData = matchingProvider.legalUnitData;
        providers[i].useDefaultFootprint = false;
        providers[i].footprintStatus = 200;
        providers[i].dataFetched = true;
      }
    }
    updateProviders([...providers]);
    setShowModal(false);
  };
  
  
  

  return (
    <div className="box flex-grow-1 ms-2">
      <div className="mb-4">
        <h4>Déposer des factures</h4>
      </div>

        <p className="small">
          Importez vos factures au format PDF dans la zone de dépôt et associez
          ensuite les comptes fournisseurs correspondants.
        </p>


      <Dropzone onDrop={onInvoicesDrop} accept={[".pdf"]}>
        {({ getRootProps, getInputProps }) => (
          <div className="dropzone-section">
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>
                <i className="bi bi-file-arrow-up-fill"></i>
                Glisser vos factures ici
              </p>
              <p className="small">OU</p>
              <p className="btn btn-primary">Selectionner les fichiers</p>
            </div>
          </div>
        )}
      </Dropzone>

      <InfoModal
        showModal={showAlertModal}
        title={"Association des comptes fournisseurs"}
        message="Aucun SIREN n'a pu être extrait des documents importés. Veuillez renseigner manuellement le numero SIREN des comptes fournisseurs. "
        onClose={() => setShowAlertModal(false)}
      ></InfoModal>

      {invoicesProviders && (
        <InvoicesDataModal
          showModal={showModal}
          invoicesData={invoicesProviders}
          providers={providers}
          onClose={() => setShowModal(false)}
          onSubmit={handleInvoicesProvider}
        />
      )}
    </div>
  );
};

export default InvoicesProvidersView;