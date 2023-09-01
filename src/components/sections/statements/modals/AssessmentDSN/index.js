// La Société Nouvelle

// React
import React from "react";
import { useState, useEffect } from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";

import ImportSocialData from "./ImportSocialData";
import IndividualsDataTable from "./IndividualsDataTable";

import {
  getApprenticeshipRemunerations,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";

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
 */
const AssessmentDSN = ({
  impactsData
}) => {

  const [showModal, setShowModal] = useState(false);
  const [individualsData, setIndividualsData] = useState(impactsData.individualsData);

  const handleSocialStatements = async (socialStatements) => {
    const individualsData = await getIndividualsData(socialStatements);
    await updateImpactsData(socialStatements, individualsData);
  };

  const handleIndividualsData = async (individualsData) => {
    let updatedSocialStatements = impactsData.socialStatements;
    if (individualsData.length == 0) {
      updatedSocialStatements = [];
    }

    await updateImpactsData(updatedSocialStatements, individualsData);
  };

  // const updateImpactsData = async (socialStatements, individualsData) => 
  // {
  //   const interdecileRange = await getInterdecileRange(individualsData);
  //   const wageGap = await getGenderWageGap(individualsData);
  //   const apprenticesRemunerations = await getApprenticeshipRemunerations(
  //     individualsData
  //   );

  //   setImpactsData({
  //     ...impactsData,
  //     socialStatements: socialStatements,
  //     individualsData: individualsData,
  //     interdecileRange: interdecileRange,
  //     wageGap: wageGap,
  //     knwDetails: {
  //       ...impactsData.knwDetails,
  //       apprenticesRemunerations: apprenticesRemunerations,
  //     },
  //   });

  //   // await props.onUpdate("idr");
  //   // await props.onUpdate("geq");
  //   // await props.onUpdate("knw");
  // };

  // update individuals data when file imported
  const onSocialStatementsUpdate = async () => {
    console.log("there");
    impactsData.individualsData = await getIndividualsData(impactsData.socialStatements);
    console.log(impactsData.individualsData);
    setIndividualsData({...impactsData.individualsData});
  }

  // update individuals data when file imported
  const onIndividualsDataUpdate = async () => {
    //impactsData.individualsData = await getIndividualsData(impactsData.socialStatements);
    console.log(impactsData.individualsData);
    //setIndividualsData({...impactsData.individualsData});
  }

  const updateImpactsData = async () => 
  {
    console.log("here");
    const {
      socialStatements
    } = impactsData;

    const individualsData = await getIndividualsData(socialStatements);

    const interdecileRange = await getInterdecileRange(individualsData);
    const wageGap = await getGenderWageGap(individualsData);
    const apprenticesRemunerations = await getApprenticeshipRemunerations(individualsData);

    impactsData.individualsData = individualsData;
    impactsData.interdecileRange = interdecileRange;
    impactsData.wageGap = wageGap;
    impactsData.knwDetails.apprenticesRemunerations = apprenticesRemunerations;
  }

  // update individuals data when file imported
  useEffect(async () => {
    console.log("use effect triggered")
    // impactsData.individualsData = await getIndividualsData(impactsData.socialStatements);
    // setIndividualsData({...impactsData.individualsData});
  }, [impactsData.socialStatements]);

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
              <ImportSocialData
                impactsData={impactsData}
                onChange={onSocialStatementsUpdate}
                handleSocialStatements={handleSocialStatements}
              />
            </Tab>
            <Tab eventKey="socialData" title="Gérer les données sociales">
              <IndividualsDataTable
                impactsData={impactsData}
                handleIndividualsData={handleIndividualsData}
                onChange={onIndividualsDataUpdate}
              />
            </Tab>
          </Tabs>
          <hr></hr>
          <div className="text-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Valider{" "}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AssessmentDSN;
