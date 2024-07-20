import React, { useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";

const DownloadDropdown = ({ onDownload, view }) => {
  const currentViewFiles = [
    {
      id: "sig-indic-xlsx",
      name: "Soldes intermédiaires de gestion (.xlsx)",
    },
    { id: "summary-report", name: "Plaquette (.pdf)" },

    { id: "standard-report", name: "Rapport (.pdf)" },

  ];

  const [selectedFileIds, setSelectedFileIds] = useState([]);

  const handleCheckboxChange = (event, fileId) => {
    const isCheckboxAll = fileId === "checkbox-all";
    const isCheckboxReport = fileId === "checkbox-report";
    const isWithAnalyses = fileId === "with-analyses";

    const handleCheckboxReport = () => {
      setSelectedFileIds((prevSelected) =>
        event.target.checked
          ? [
              "checkbox-report",
              ...(prevSelected.includes("with-analyses")
                ? ["with-analyses"]
                : []),
            ]
          : prevSelected.filter((id) => id !== fileId)
      );
    };

    const handleCheckboxAll = () => {
      setSelectedFileIds((prevSelected) =>
        event.target.checked
          ? [
              "checkbox-all",
              ...(prevSelected.includes("with-analyses")
                ? ["with-analyses"]
                : []),
            ]
          : prevSelected.filter((id) => id !== fileId)
      );
    };

    const handleWithAnalyses = () => {
      setSelectedFileIds((prevSelected) =>
        event.target.checked
          ? [...prevSelected, fileId]
          : prevSelected.filter((id) => id !== fileId)
      );
    };

    const handleOtherCheckboxes = () => {
      setSelectedFileIds((prevSelected) => {
        const newSelected = event.target.checked
          ? [
              ...prevSelected.filter(
                (id) => id !== "checkbox-all" && id !== "checkbox-report"
              ),
              fileId,
            ]
          : prevSelected.filter((id) => id !== fileId);
        return newSelected;
      });
    };

    if (isCheckboxAll) {
      handleCheckboxAll();
    } else if (isCheckboxReport) {
      handleCheckboxReport();
    } else if (isWithAnalyses) {
      handleWithAnalyses();
    } else {
      handleOtherCheckboxes();
    }
  };

  const handleDownload = () => {
    onDownload(selectedFileIds, view);
  };

  const isDisabled =
    selectedFileIds.length === 0 ||
    (selectedFileIds.length === 1 && selectedFileIds[0] === "with-analyses");
  
  return (
    <div className="me-2">
      <Dropdown autoClose={"outside"}>
        <Dropdown.Toggle variant="primary" id="dropdown-basic">
          <i className="bi bi-box-arrow-down"></i> Téléchargement
        </Dropdown.Toggle>
        <Dropdown.Menu className="download-dropdown">
          <Dropdown.Header>Vue courante</Dropdown.Header>
          {currentViewFiles.map((file) => (
            <div key={file.id} className="dropdown-item">
              <Form.Check
                type="checkbox"
                id={`checkbox-${file.id}`}
                disabled={view == "default"}
                label={
                  <label htmlFor={`checkbox-${file.id}`}>{file.name}</label>
                }
                checked={selectedFileIds.includes(file.id)}
                onChange={(event) => handleCheckboxChange(event, file.id)}
              />
            </div>
          ))}
          <Dropdown.Header> Ensemble des résultats </Dropdown.Header>
          <div className="dropdown-item">
            <Form.Check
              type="checkbox"
              id={`checkbox-report`}
              label={
                <label htmlFor={`checkbox-report`}>Rapport global (.pdf) </label>
              }
              checked={selectedFileIds.includes("checkbox-report")}
              onChange={(event) => handleCheckboxChange(event, "checkbox-report")}
            />
          </div>
          <div className="dropdown-item">
            <Form.Check
              type="checkbox"
              id={`checkbox-all`}
              label={
                <label htmlFor={`checkbox-all`}>Dossier complet (.zip) </label>
              }
              checked={selectedFileIds.includes("checkbox-all")}
              onChange={(event) => handleCheckboxChange(event, "checkbox-all")}
            />
          </div>

          <Dropdown.Divider></Dropdown.Divider>
          <div className="dropdown-item">
            <Form.Check
              type="checkbox"
              id={`with-analyses`}
              label={
                <label htmlFor={`with-analyses`}>
                  {" "}
                  Inclure les notes d'analyse{" "}
                </label>
              }
              checked={selectedFileIds.includes("with-analyses")}
              onChange={(event) => handleCheckboxChange(event, "with-analyses")}
            />
          </div>

          <Dropdown.Item onClick={handleDownload}>
            <Button
              size="sm"
              variant="download"
              className="w-100"
              disabled={isDisabled}
            >
              Télécharger les fichiers
            </Button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default DownloadDropdown;
