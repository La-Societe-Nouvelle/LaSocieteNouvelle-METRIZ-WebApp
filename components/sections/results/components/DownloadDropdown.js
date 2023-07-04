import React, { useState } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";

const DownloadDropdown = ({ onDownload }) => {
  const files = [
    { id: "sig-pdf", name: "Empreinte des soldes intermédiaires de gestion (.pdf)" },
    { id: "sig-xlx", name: "Empreinte des soldes intermédiaires de gestion (.xlx)" },
    { id: "full-report", name: "Rapport complet (.pdf)" },
    { id: "svg", name: "Fichier de sauvegarde (.json)" },
  ];

  const [selectedFileIds, setSelectedFileIds] = useState([]);

  const handleCheckboxChange = (event, fileId) => {
    if (event.target.checked) {
      setSelectedFileIds([...selectedFileIds, fileId]);
    } else {
      setSelectedFileIds(selectedFileIds.filter((id) => id !== fileId));
    }
  };

  const handleDownload = () => {
    onDownload(selectedFileIds);
  };

  return (
    <div className="me-2">
      <Dropdown autoClose={"outside"}>
        <Dropdown.Toggle variant="primary" id="dropdown-basic">
          <i className="bi bi-box-arrow-down"></i> Téléchargement
        </Dropdown.Toggle>
        <Dropdown.Menu className="download-dropdown">
          {files.map((file) => (
            <div key={file.id} className="dropdown-item">
              <Form.Check
                type="checkbox"
                id={`checkbox-${file.id}`}
                label={
                  <label htmlFor={`checkbox-${file.id}`}>{file.name}</label>
                }
                checked={selectedFileIds.includes(file.id)}
                onChange={(event) => handleCheckboxChange(event, file.id)}
              />
            </div>
          ))}
          <Dropdown.Divider></Dropdown.Divider>
          <Dropdown.Item onClick={handleDownload}>
            <Button
              size="sm"
              variant="download"
              className="w-100"
              disabled={selectedFileIds.length == 0}
            >
              Télécharger les fichiers (.zip)
            </Button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default DownloadDropdown;
