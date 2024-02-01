// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";

// Components
import { SocialStatementsTab } from "./SocialStatementsTab";
import { IndividualsDataTab } from "./IndividualsDataTab";
import { DirectorsDataTab } from "./DirectorsDataTab";

// Utils
import {
  checkIndividualData,
  getApprenticeshipRemunerations,
  getEmployeesTrainingCompensations,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";
import { isValidNumber } from "../../../../../utils/Utils";

/* -------------------- ASSESSMENT TOOL FOR SOCIAL FOOTPRINT -------------------- */

/* The AssessmentDSN component handles the assessment tool for social footprint.
 * It includes logic for handling imported social data and managing individuals' data.
 * 
 *  2 tabs :
 *    - tab to import DSN (update socialStatements -> update individualsData)
 *    - tab to visualiza social data
 * 
 * Modal update ImpactsData but set value for indicator only on submit /!\
 * 
 * 
 *  Individuals data item :
 *    - 
 * 
 */

const AssessmentDSN = ({
  impactsData,
  onGoBack,
  submit
}) => {

  const [showModal, setShowModal] = useState(false);
  const [individualsData, setIndividualsData] = useState(impactsData.individualsData);
  const [socialStatements, setSocialStatements] = useState(impactsData.socialStatements);

  const [isIndividualsDataValid, setIsIndividualsDataValid] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => checkIndividualsData(impactsData.individualsData), []);

  // ----------------------------------------------------------------------------------------------------

  // trigger when social statements update -> reset individuals data
  const handleSocialStatements = async (socialStatements) => 
  {
    // build individuals data
    const individualsData = await getIndividualsData(socialStatements);

    // update impacts data
    impactsData.socialStatements = socialStatements;
    impactsData.individualsData = individualsData;
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(individualsData);

    setSocialStatements(socialStatements);
    setIndividualsData(individualsData);
    checkIndividualsData(individualsData);
  };

  // trigger when individuals data update (manually)
  const handleIndividualsData = async (individualsData) => 
  {
    // update impacts data
    impactsData.individualsData = individualsData;
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(individualsData);

    setIndividualsData(individualsData);
    checkIndividualsData(individualsData);
  }

  const handleDirectorRemunerationAccounts = async (directorRemunerationAccounts) =>
  {
    // update impacts data
    impactsData.FECData.directorRemunerationAccounts = directorRemunerationAccounts;
  }

  const checkIndividualsData = (individualsData) => {
    // check if every items set
    let isIndividualsDataValid = individualsData.every((individualData) => checkIndividualData(individualData));
    setIsIndividualsDataValid(isIndividualsDataValid);
    setWarningMessage(isIndividualsDataValid ? "" : "Certains postes sont incomplets ou erronés.");
  }

  const resetIndividualsData = () => 
  {
    handleSocialStatements(socialStatements);
  }

  const onSubmit = async () => 
  {
    // update indicators
    impactsData.interdecileRange = await getInterdecileRange(impactsData.individualsData);
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(impactsData.individualsData);
    impactsData.knwDetails.employeesTrainingsCompensations = await getEmployeesTrainingCompensations(impactsData.individualsData);

    submit();
    setShowModal(false);
  }

  // ----------------------------------------------------------------------------------------------------

  return (
    <>
      <Button
        variant="light-secondary"
        className=" rounded-2  w-100 p-2"
        onClick={() => setShowModal(true)}
        disabled={impactsData.hasEmployees ? false : true}
      >
        <i className="bi bi-calculator"></i>
        &nbsp;Importer les DSN
      </Button>

      <Modal
        show={showModal}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Données Sociales Nominatives</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            defaultActiveKey="import"
            transition={false}
            id="noanim-tab-example"
            className="mb-3"
          >
            <Tab eventKey="import" title="Importer les DSN">
              <SocialStatementsTab
                socialStatements={socialStatements}
                onUpdateSocialStatements={handleSocialStatements}
              />
            </Tab>
            <Tab eventKey="socialData" title="Gérer les données sociales">
              <IndividualsDataTab
                individualsData={individualsData}
                onUpdateIndividualsData={handleIndividualsData}
                resetIndividualsData={resetIndividualsData}
              />
            </Tab>
            <Tab eventKey="executiveData" title="Dirigeants">
              <DirectorsDataTab
                individualsData={individualsData}
                onUpdateIndividualsData={handleIndividualsData}
                onUpdateDirectorRemunerationAccounts={handleDirectorRemunerationAccounts}
                directorRemunerationAccounts={impactsData.FECData.directorRemunerationAccounts}
              />
            </Tab>
          </Tabs>
          <hr></hr>
          <div className="text-end">
            <Button 
              variant="secondary" 
              onClick={onSubmit}
              disabled={!isIndividualsDataValid}
            >
              Valider{" "}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AssessmentDSN;
