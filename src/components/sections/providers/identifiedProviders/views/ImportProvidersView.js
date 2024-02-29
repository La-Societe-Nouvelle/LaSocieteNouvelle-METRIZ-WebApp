// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Dropzone from "react-dropzone";

// Utils
import {
  CSVFileReader,
  XLSXFileReader,
  XLSXFileWriterFromJSON,
  processCSVCompaniesData,
} from "../utils";
import { triggerFileDownload } from "../../../../../utils/Utils";

// Modals
import {
  ProvidersImportSuccessModal,
  ProvidersImportWarningModal,
} from "../modals/ProvidersImportSuccessModal";

import { ErrorFileModal } from "../../../../modals/userInfoModals";

const ImportProvidersView = ({
  providers,
  updateProviders,
  handleSynchronize,
}) => {
  const [showErrorFileModal, setShowErrorFileModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [updatedProvidersCount, setUpdatedProvidersCount] = useState(0);

  const onDrop = async (files) => {
    if (files.length === 0) {
      setShowErrorFileModal(true);
      return;
    }
    const file = files[0];
    if (file.name.endsWith(".csv")) {
      await importCSVFile(file);
    } else if (file.name.endsWith(".xlsx")) {
      await importXLSXFile(file);
    }
  };
  
  // Imports 
  const importCSVFile = async (file) => {
    let reader = new FileReader();
    let updatedProvidersCount = 0;

    reader.onload = async () => {
      let CSVData = await CSVFileReader(reader.result);
      let companiesIds = await processCSVCompaniesData(CSVData);
      let updatedProviders = [...providers];

      for (const [providerNum, corporateName, corporateId] of Object.entries(
        companiesIds
      )) {
        let provider = providerNum
          ? updatedProviders.find((p) => p.providerNum === providerNum)
          : updatedProviders.find((p) => p.providerLib === corporateName);

        if (provider && provider.corporateId != corporateId) {
          provider.update({
            corporateId: corporateId,
          });
          updatedProvidersCount++;
        }
      }

      handleUpdateAndModal(updatedProvidersCount, updatedProviders);
    };

    reader.readAsText(file);
  };

  const importXLSXFile = async (file) => {
    let reader = new FileReader();
    let updatedProvidersCount = 0;

    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      let updatedProviders = [...providers];

      XLSXData.forEach(
        ({ accountNum, accountLib, corporateName, siren, account }) => {
          if (account && !accountNum) accountNum = account;
          let provider = updatedProviders.find(
            (p) => p.providerNum === accountNum || p.providerLib === accountLib
          );
          if (provider) {
            provider.update({
              corporateId: siren,
            });
            updatedProvidersCount++;
          }
        }
      );

      handleUpdateAndModal(updatedProvidersCount, updatedProviders);
    };

    reader.readAsArrayBuffer(file);
  };
  // --------------------------------------------------

  // Export
  const exportXLSXFile = async (providers) => {
    // Prepare data for export
    let jsonContent = providers
      .filter((provider) => provider.providerNum.charAt(0) !== "_")
      .map((provider) => {
        return {
          accountNum: provider.providerNum,
          denomination: provider.providerLib,
          siren: provider.corporateId,
        };
      });

    // Excel file properties
    let fileProps = { wsclos: [{ wch: 50 }, { wch: 20 }] };

    // Convert data to Excel file (JSON -> ArrayBuffer)
    let file = await XLSXFileWriterFromJSON(
      fileProps,
      "fournisseurs",
      jsonContent
    );
    // Trigger the file download
    let blob = new Blob([file], { type: "application/octet-stream" });

    await triggerFileDownload(blob,"fournisseurs.xlsx");

  
  };

  // --------------------------------------------------
  const handleModalSynchronize = () => {
    setShowSuccessModal(false);
    handleSynchronize();
  };

  const handleUpdateAndModal = (updatedProvidersCount, updatedProviders) => {
    if (updatedProvidersCount > 0) {
      updateProviders(updatedProviders);
      setUpdatedProvidersCount(updatedProvidersCount);
      setShowSuccessModal(true);
    } else {
      setShowWarningModal(true);
    }
  };

  return (
    <>
      <div className="box me-2 flex-grow-1">
        <div className="d-flex justify-content-between mb-4 align-items-center">
          <h4 className="mb-0">Importer les fournisseurs</h4>
          <Button
            variant="light-secondary"
            onClick={() => exportXLSXFile(providers)}
            size="sm"
          >
            <i className="bi bi-download"></i> Exporter les fournisseurs
          </Button>
        </div>

        <p className="small">
          Téléchargez la liste des comptes fournisseurs auxiliaires, complétez
          les numéros SIREN et réimportez ensuite le fichier.
        </p>

        <Dropzone onDrop={onDrop} accept={[".xlsx", ".csv"]} maxFiles={1}>
          {({ getRootProps, getInputProps }) => (
            <div className="dropzone-section">
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>
                  <i className="bi bi-file-arrow-up-fill"></i>
                  Glisser votre fichier ici
                </p>
                <p className="small">OU</p>
                <p className="btn btn-primary">Selectionner votre fichier</p>
              </div>
            </div>
          )}
        </Dropzone>

        {showErrorFileModal && (
          <ErrorFileModal
            title={"Fichier incorrect"}
            showModal={showErrorFileModal}
            errorMessage={
              "Format de fichier incorrect. Veuillez importer un fichier au format .xslx ou .csv"
            }
            onClose={() => setShowErrorFileModal(false)}
          />
        )}
      </div>

      <ProvidersImportWarningModal
        showModal={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      />

      <ProvidersImportSuccessModal
        showModal={showSuccessModal}
        totalProviders={providers.length}
        updatedProvidersCount={updatedProvidersCount}
        onSynchronise={handleModalSynchronize}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default ImportProvidersView;
