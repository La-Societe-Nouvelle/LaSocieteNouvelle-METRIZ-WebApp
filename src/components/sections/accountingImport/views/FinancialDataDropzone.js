// La Société Nouvelle

// React
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

// Modal
import { ErrorFileModal } from "../../../modals/userInfoModals";

// Utils
import { FECFileReader } from "../utils/FECReader";

/* ---------- FINANCIAL DATA DROPZONE  ---------- */

/** Dropzone for FEC
 *    setImportedData -> load FEC Data (JSON)
 *    setFileName -> update file name
 */

export const FinancialDataDropzone = ({
  setImportedData,
  setFileName
}) => {

  const [showErrorFileModal, setErrorFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ----------------------------------------------------------------------------------------------------

  const onDrop = async (acceptedFiles) => 
  {
    setFileName("");
    setErrorFile(false);

    if (acceptedFiles.length === 1) 
    {
      const file = acceptedFiles[0];
      const fileName = file.name.split('.')[0];
  
      try {
        // read data from file (file -> JSON)
        const FECData = await readFECFile(file);
        if (FECData.valid) {
          setImportedData(FECData.data);
          setFileName(fileName);
        } else {
          setErrorFile(true);
          setErrorMessage(FECData.error);
        }
      }
      // error on reading
      catch (error) {
        setErrorFile(true);
        setErrorMessage('Une erreur est survenue lors de la lecture du fichier.');
      }
    }
    // file error
    else if (acceptedFiles.length === 0) {
      setErrorFile(true);
      setErrorMessage('L\'extension du fichier doit être en .txt ou .csv');
      return;
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.txt, .csv',
    multiple: false,
    onDrop,
  });

  // ----------------------------------------------------------------------------------------------------

  return (
    <>
      {/* Dropzone */}
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>
          <i className="bi bi-file-arrow-up-fill"></i> 
          Glisser votre fichier ici
        </p>
        <p className="small">OU</p>
        <p className="btn btn-primary">Selectionner votre fichier</p>
      </div>

      {/* Errors Modal */}
      <ErrorFileModal
        title={"Erreur lors de la lecture du FEC"}
        showModal={showErrorFileModal}
        errorMessage={errorMessage}
        onClose={() => setErrorFile(false)}
      />
    </>
  )
}

/* ---------- FILE READER  ---------- */

const readFECFile = async (file) => 
{
  let reader = new FileReader();

  try {
    // read text
    reader.readAsText(file, "iso-8859-1");

    // Wait for the reader to finish loading the file
    await new Promise((resolve) => {
      reader.onload = resolve;
    });

    // Parse the file content
    let FECData = await FECFileReader(reader.result);

    // console logs
    console.log("Lecture du fichier (FEC) déposé : ");
    console.log(FECData.meta);
    console.log(FECData.books);

    return {
      valid: true,
      data: FECData,
      error: null,
    };
  } 
  catch (error) {
    return {
      valid: false,
      data: {},
      error,
    };
  }
}