import React from "react";
import { useState } from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import ImportDSN from "./ImportDSN";
import IndividualsData from "./IndividualsData";
import {
  getApprenticeshipRemunerations,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./utils";

const AssessmentDSN = ({ impactsData, onUpdate }) => {
  const [showDSN, setShowDSN] = useState(false);

  const onDSNUpload = async (socialStatements) => {
    impactsData.socialStatements = socialStatements;

    // individuals data
    impactsData.individualsData = await getIndividualsData(socialStatements);
    // // update idr data
    impactsData.interdecileRange = await getInterdecileRange(
      impactsData.individualsData
    );
    await onUpdate("idr");

    // update geq data (in pct i.e. 14.2 for 14.2 %)
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    await onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations =
      await getApprenticeshipRemunerations(impactsData.individualsData);
    await onUpdate("knw");
  };

  return (
    <>
      <Button
        variant="light-secondary"
        className=" rounded-2  w-100 p-2"
        onClick={() => setShowDSN(true)}
        disabled={impactsData.hasEmployees ? false : true}
      >
        <i className="bi bi-calculator"></i>
        &nbsp;Importer les DSN
      </Button>

      <Modal show={showDSN} size="xl" centered onHide={() => setShowDSN(false)}>
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
              <ImportDSN impactsData={impactsData} onDSNUpload={onDSNUpload} />
            </Tab>
            <Tab eventKey="socialData" title="Gérer les données sociales">
              <IndividualsData impactsData={impactsData} />
            </Tab>
          </Tabs>
          <hr></hr>
          <div className="text-end">
            <Button variant="secondary" onClick={() => setShowDSN(false)}>
              Valider{" "}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AssessmentDSN;
