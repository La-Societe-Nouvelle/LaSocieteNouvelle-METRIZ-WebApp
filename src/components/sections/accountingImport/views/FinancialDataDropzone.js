// La Société Nouvelle

//
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

// Modal
import { ErrorFileModal } from "../../../modals/userInfoModals";

// Utils
import { FECFileReader } from "../utils/FECReader";

export const FinancialDataDropzone = ({
  setImportedData,
  setFileRead
}) => {

  const [showErrorFileModal, setErrorFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onDrop = async (acceptedFiles) => {
    setFileRead(false);
    setErrorFile(false);

    if (acceptedFiles.length === 0) {
      setErrorFile(true);
      setErrorMessage('L\'extension du fichier doit être en .txt ou .csv');
      return;
    }

    const file = acceptedFiles[0];
    const fileName = file.name.split('.')[0];

    try {
      const FECData = await readFECFile(file);
      if (FECData.valid) {
        setImportedData(FECData.data);
        setFileRead(fileName);
      } else {
        setErrorFile(true);
        setErrorMessage(FECData.error);
      }
    } catch (error) {
      setErrorFile(true);
      setErrorMessage('Une erreur est survenue lors de la lecture du fichier.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.txt, .csv',
    multiple: false,
    onDrop,
  });



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


      {/* Errors reading */}
      {showErrorFileModal && (
        <ErrorFileModal
          title={"Erreur lors de la lecture du FEC"}
          showModal={showErrorFileModal}
          errorMessage={errorMessage}
          onClose={() => setErrorFile(false)}
        />
      )}
    </>
  )
} 

const readFECFile = async (file) => 
{
  let reader = new FileReader();
  try 
  {
    reader.readAsText(file, "iso-8859-1");

    // Wait for the reader to finish loading the file
    await new Promise((resolve) => {
      reader.onload = resolve;
    });

    // Parse the file content
    let FECData = await FECFileReader(reader.result);

    // console logs
    console.log("Lecture du fichier déposé FEC : ");
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
};