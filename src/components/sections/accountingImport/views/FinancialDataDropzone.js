// La Société Nouvelle

//
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ErrorFileModal } from "../../../modals/userInfoModals";
import { FECFileReader } from "../utils/FECReader";

export const FinancialDataDropzone = ({
  setImportedData
}) => {

  const [files, setFiles] = useState([]);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileRead, setFileRead] = useState(false);

  // dropzone
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: ".txt, .csv",
      multiple: false,
      onDrop: (files) => {
        setFileRead(false);
        setErrorFile(false);
        setFiles(files);
      },
    });

  // on drop
  useEffect(async () => 
  {
    if (files[0]) {
      let FECData = await readFECFile(files[0]);
      if (FECData.valid) {
        setImportedData(FECData.data);
      } else {
        setErrorFile(true);
        setErrorMessage(FECData.error);
      }
      setFileRead(true)
    }
  }, [files]);

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
      {/* Rejections */}
      {fileRejections.length > 0 && (
        <div className="alert alert-danger">
          <ul className="list-group list-unstyled">
            {fileRejections.map(({ errors }) => (
              <>
                {errors.map((e) => (
                  <li key={e.code} className="">
                    <i className="bi bi-exclamation-triangle" />{" "}
                    L'extension du fichier doit être en .txt ou .csv
                  </li>
                ))}
              </>
            ))}
          </ul>
        </div>
      )}
      {/* Files */}
      {acceptedFiles.length > 0 && (
        <div className="alert alert-info">
          <p className="font-weight-bold">Fichier à analyser :</p>
          {acceptedFiles.map((file) => (
            <p key={file.path}>
              <i className="bi bi-upload" /> {file.path}
            </p>
          ))}
        </div>
      )}
      {/* Errors reading */}
      {errorFile && (
        <ErrorFileModal
          title={"Erreur lors de la lecture du FEC"}
          errorFile={errorFile}
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