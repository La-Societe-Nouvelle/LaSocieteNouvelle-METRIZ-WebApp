// La Société Nouvelle

// React
import React, { useState } from "react";
import Dropzone from "react-dropzone";

// Objects
import { Session } from "../../../../Session";
import { updateVersion } from "/src/version/updateVersion";

// Utils
import { checkLoadedSession } from "../utils";
import { ErrorAPIModal, ErrorFileModal, SuccessFileModal } from "../../../modals/userInfoModals";

/* ---------- INITIAL STATES DROPZONE  ---------- */

export const ImportBackUpView = ({
  session,
  backUpDidLoad
}) => {

  // Popup - error
  const [showPopup, setShowPopup] = useState(false);
  const [titlePopup, setTitlePopup] = useState("");
  const [messagePopup, setMessagePopup] = useState("");
  const [errorAPI, setErrorAPI] = useState(false);

  // Popup - success
  const [popupSuccess, setPopupSuccess] = useState(false);

  // files
  const [files, setFiles] = useState([]);

  // ----------------------------------------------------------------------------------------------------

  const onDrop = (files) => {
    setFiles(files);
    importFile(files);
  }

  /* ---------- BACK-UP IMPORT ---------- */

  const importFile = (files) => 
  {
    let file = files[0];

    let reader = new FileReader();
    reader.onload = async () => 
    {
      try 
      {
        // --------------------------------------------------

        // text -> JSON
        const loadedSessionData = JSON.parse(reader.result);

        // update to current version
        await updateVersion(loadedSessionData);

        // build session object
        const loadedSession = new Session(loadedSessionData);

        // --------------------------------------------------

        const loadedSessionChecking = await checkLoadedSession(session,loadedSession);
    
        if (loadedSessionChecking.checked) 
        {
          // Update session with back up
          await session.loadSessionFromBackup(loadedSession);
          setPopupSuccess(true);

          backUpDidLoad();
        }

        // if error
        else {
          setTitlePopup("Erreur - fichier");
          console.log(loadedSessionChecking.errors);
          console.log(loadedSessionChecking.errors.map((error) => error.message).join(" "))
          setMessagePopup(loadedSessionChecking.errors.map((error) => error.message).join(" "));
          setShowPopup(true);
        };

        // --------------------------------------------------
      }

      catch (error) {
        // API error
        if(error.message == "Network Error") {
          setErrorAPI(true);
        } 
        // other error
        else{
          setTitlePopup("Erreur - Fichier");
          setMessagePopup("Une erreur est survenue lors de l'import. Veuillez contacter le support.");
          setShowPopup(true);
        }
      }
    };

    try 
    {
      // read file
      reader.readAsText(file);
    } 
    catch (error) {
      setTitlePopup("Erreur - Fichier");
      setMessagePopup("Fichier non lisible. Veuillez vérifier le fichier et réessayer");
      setShowPopup(true);
    }
  };

  // ----------------------------------------------------------------------------------------------------

  return (
    <div className="box">
      <h3 className="mb-3 text-secondary"> Import de la sauvegarde de l'exercice précédent</h3>

      <label>Importer votre fichier de sauvegarde (.json)</label>
      <Dropzone onDrop={onDrop} maxFiles={1} multiple={false}>
        {({ getRootProps, getInputProps }) => (
          <div className="dropzone-section">
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>
                <i className="bi bi-file-arrow-up-fill"></i> Glisser votre
                fichier ici
              </p>
              <p className="small">OU</p>
              <p className="btn btn-primary">
                Selectionner votre fichier
              </p>
            </div>
          </div>
        )}
      </Dropzone>

      {popupSuccess && (
        <SuccessFileModal
          showModal={popupSuccess}
          message={messagePopup}
          title={titlePopup}
          closePopup={() => setPopupSuccess(false)}
        />
      )}

      {showPopup && (
        <ErrorFileModal
          showModal={showPopup}
          title={titlePopup}
          errorMessage={messagePopup}
          onClose={() => setShowPopup(false)}
        />
      )}
      
      <ErrorAPIModal
        hasError={errorAPI}
        onClose={() => setErrorAPI(false)}
      />
    </div>
  )
}