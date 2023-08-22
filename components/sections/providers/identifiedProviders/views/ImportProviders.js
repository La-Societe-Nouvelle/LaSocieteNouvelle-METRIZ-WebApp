// La Société Nouvelle

// React
import React, { useState } from "react";
import Dropzone from "react-dropzone";

// Utils 
import {
  CSVFileReader,
  XLSXFileReader,
  processCSVCompaniesData,
} from "../utils";

// Modals
import { ProvidersImportSuccessModal } from "../modals/ProvidersImportSuccessModal";
import { ErrorFileModal } from "../../../../modals/userInfoModals";

const ImportProviders = ({
  providers,
  updateProviders,
  synchroniseProviders,
}) => {
  const [errorFile, setErrorFile] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSynchronise = () => {
    setShowModal(false);
    synchroniseProviders();
  };
  const onDrop = async (files) => {
    if (files.length) {
      handleFile(files[0]);
      setErrorFile(false);
      setShowModal(true);
    } else {
      setErrorFile(true);
    }
  };

  const handleFile = (file) => {
    let extension = file.name.split(".").pop();

    switch (extension) {
      case "csv":
        importCSVFile(file);
        break;
      case "xlsx":
        importXLSXFile(file);
        break;
    }
  };

  // Import CSV File
  const importCSVFile = (file) => {
    let reader = new FileReader();

    reader.onload = async () => {
      let CSVData = await CSVFileReader(reader.result);

      let companiesIds = await processCSVCompaniesData(CSVData);
      let updatedProviders = [...providers];

      await Promise.all(
        Object.entries(companiesIds).map(
          async ([providerNum, corporateName, corporateId]) => {
            let provider = providerNum
              ? updatedProviders.find(
                  (provider) => provider.providerNum == providerNum
                )
              : updatedProviders.find(
                  (provider) => provider.providerLib == corporateName
                );
            if (provider) {
              provider.corporateId = corporateId;
              provider.legalUnitData.denomination = denomination;
              provider.useDefaultFootprint = false;
              provider.footprintStatus = 0; // check if changes or use update()
            }
          }
        )
      );
      updateProviders(updatedProviders);
    };

    reader.readAsText(file);
  };

  // Import XLSX File
  const importXLSXFile = async (file) => {
    let reader = new FileReader();

    reader.onload = async () => {
      let XLSXData = await XLSXFileReader(reader.result);
      let updatedProviders = [...providers];

      await Promise.all(
        XLSXData.map(
          async ({ accountNum, accountLib, denomination, siren, account }) => {
            if (account && !accountNum) accountNum = account;
            let provider = accountNum
              ? updatedProviders.filter(
                  (provider) => provider.providerNum == accountNum
                )[0] // based on num
              : updatedProviders.filter(
                  (provider) => provider.providerLib == accountLib
                )[0]; // based on lib
            if (provider) {
              provider.corporateId = siren;
              provider.legalUnitData.denomination = denomination;
              provider.useDefaultFootprint = false;
              provider.footprintStatus = 0; // check if changes or use update()
            }
            return;
          }
        )
      );

      updateProviders(providers);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="step">
        <h4>2. Importer le fichier excel complété</h4>
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
        onSynchronise={handleSynchronise}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ImportProviders;
