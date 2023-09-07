import React, { useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";

const DownloadDropdown = ({ onDownload, view }) => {

  const currentViewFiles = [
    {
      id: "sig-indic-xlsx",
      name: "Soldes intermédiaires de gestion (.xlsx)",
    },
    { id: "summary-report", name: "Plaquette (.pdf)" },
  ];

 
  const [selectedFileIds, setSelectedFileIds] = useState([]);


  const handleCheckboxChange = (event, fileId) => {
    if (fileId === "checkbox-all") { 
 
      // If "checkbox-all" is checked, uncheck other checkboxes and clear selectedFileIds
      setSelectedFileIds(event.target.checked ? ["checkbox-all"] : []);
    } else {
      // If a file checkbox is checked, uncheck "checkbox-all" if it is checked
      setSelectedFileIds((prevSelected) =>
        prevSelected.includes("checkbox-all")
          ? [fileId]
          : event.target.checked
          ? [...prevSelected, fileId]
          : prevSelected.filter((id) => id !== fileId)
      );
    }
  };
  

  const handleDownload = () => {
    onDownload(selectedFileIds,view);
  };

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
              id={`checkbox-all`}
              label={<label htmlFor={`checkbox-all`}>Dossier complet (.zip) </label>}
              checked={selectedFileIds.includes("checkbox-all")}
              onChange={(event) => handleCheckboxChange(event, "checkbox-all")}
            />
          </div>

          <Dropdown.Divider></Dropdown.Divider>
          <Dropdown.Item onClick={handleDownload}>
            <Button
              size="sm"
              variant="download"
              className="w-100"
              disabled={selectedFileIds.length == 0}
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
