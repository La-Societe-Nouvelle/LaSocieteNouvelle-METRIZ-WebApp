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

// Modals
import { ProvidersImportSuccessModal } from "../modals/ProvidersImportSuccessModal";
import { ErrorFileModal } from "../../../../modals/userInfoModals";

const ImportProvidersView = ({
  providers,
  updateProviders,
  handleSynchronize,
}) => {
  const [errorFile, setErrorFile] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleModalSynchronize = () => {
    setShowModal(false);
    handleSynchronize();
  };

  const onDrop = async (files) => {
    if (files.length) {
      const file = files[0];
      const extension = file.name.split(".").pop();

      if (extension === "csv") {
        await importCSVFile(file);
      } else if (extension === "xlsx") {
        await importXLSXFile(file);
      }

      setErrorFile(false);
      setShowModal(true);
    } else {
      setErrorFile(true);
    }
  };

  const importCSVFile = async (file) => {
    let reader = new FileReader();

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

        if (provider) {
          provider.corporateId = corporateId;
          provider.legalUnitData.denomination = denomination;
          provider.useDefaultFootprint = false;
          provider.footprintStatus = 0; // Check if changes or use update()
        }
      }

      updateProviders(updatedProviders);
    };

    reader.readAsText(file);
  };

  const importXLSXFile = async (file) => {
    let reader = new FileReader();

    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      let updatedProviders = [...providers];

      XLSXData.forEach(
        ({ accountNum, accountLib, denomination, siren, account }) => {
          if (account && !accountNum) accountNum = account;
          let provider = updatedProviders.find(
            (p) => p.providerNum === accountNum || p.providerLib === accountLib
          );
          if (provider) {
            provider.corporateId = siren;
            provider.legalUnitData.denomination = denomination;
            provider.useDefaultFootprint = false;
            provider.footprintStatus = 0; // Check if changes or use update()
          }
        }
      );

      updateProviders(updatedProviders);
    };

    reader.readAsArrayBuffer(file);
  };

  const exportXLSXFile = async (providers) => {
    // Prepare data for export
    let jsonContent = providers
      .filter((provider) => provider.providerNum.charAt(0) !== "_")
      .map((provider) => {
        return {
          accountNum: provider.providerNum,
          denomination: provider.corporateName,
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
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fournisseurs.xlsx";
    link.click();
  };

  return (
    <>
      <div className="box">
       
        
        <div className="d-flex justify-content-between mb-4 align-items-center">
        <h4 className="mb-0">Importer les fournisseurs</h4>
            <Button variant="secondary" onClick={() => exportXLSXFile(providers)} size="sm">
              <i className="bi bi-download"></i> Exporter les fournisseurs
            </Button>
        </div>
      
        <p className="small">
            Téléchargez la liste des comptes fournisseurs auxiliaires, complétez
            les numéros SIREN et réimportez le fichier.
            <br/>Vous pourrez ensuite synchroniser les données de vos
            fournisseurs.
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

        {errorFile && (
          <ErrorFileModal
            title={"Fichier incorrect"}
            errorFile={errorFile}
            errorMessage={
              "Format de fichier incorrect. Veuillez importer un fichier au format .xslx ou .csv"
            }
            onClose={() => setErrorFile(false)}
          />
        )}
      </div>
      <ProvidersImportSuccessModal
        showModal={showModal}
        onSynchronise={handleModalSynchronize}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ImportProvidersView;
