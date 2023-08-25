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
 * The component uses Tabs to switch between importing DSN and managing social data.
 * 
 * Modal update ImpactsData only on submit /!\
 * 
 */
const AssessmentDSN = (props) => 
{
  const [showModal, setShowModal] = useState(false);

  const [impactsData, setImpactsData] = useState(props.impactsData);
  console.log(impactsData.socialStatements);
  console.log(props.impactsData.socialStatements);

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

  const onImportChange = async () => {
    //console.log(impactsData.socialStatements);
    const individualsData = await getIndividualsData(impactsData.socialStatements);
    setImpactsData({
      ...impactsData,
      individualsData
    })
  }

  const updateImpactsData = async () => 
  {
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

  useEffect(async () => {
    console.log("impacts data updated in modal")
    const individualsData = await getIndividualsData(impactsData.socialStatements);
    setImpactsData({
      ...impactsData,
      individualsData
    })
  }, [impactsData.socialStatements]);

  return (
    <>
      <Button
        variant="light-secondary"
        className=" rounded-2  w-100 p-2"
        onClick={() => setShowModal(true)}
        disabled={props.impactsData.hasEmployees ? false : true}
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
                onChange={onImportChange}
                handleSocialStatements={handleSocialStatements}
              />
            </Tab>
            <Tab eventKey="socialData" title="Gérer les données sociales">
              <IndividualsDataTable
                impactsData={impactsData}
                handleIndividualsData={handleIndividualsData}
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
