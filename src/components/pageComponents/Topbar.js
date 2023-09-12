// La Société Nouvelle

// React
import { useState } from "react";
import Select from "react-select";

// Bootstrap
import { Button } from "react-bootstrap";

// Utils
import { downloadSession } from "/src/utils/Utils";

// Styles
import { periodSelectStyles } from "../../../config/customStyles";
import { useEffect } from "react";
import { getLabelPeriod } from "../../utils/periodsUtils";

/* -------------------- TOP BAR -------------------- */

// Composant Topbar

export const Topbar = ({ session, progression, period, onSelectPeriod }) => {
  
  const [selectedPeriod, setSelectedPeriod] = useState(period.periodKey);
  const handlePeriodChange = (newSelectedPeriodKey) => {
    const newPeriodKey = newSelectedPeriodKey.value;

    setSelectedPeriod(newPeriodKey);

    let newSelectedPeriod = session.availablePeriods.find(period => period.periodKey == newPeriodKey);
    onSelectPeriod(newSelectedPeriod);
  };


  useEffect(() => {
    if (period != selectedPeriod) {
      setSelectedPeriod(period.periodKey);
    }
  }, [period]);

  const showInfo = (progression > 1) || session.financialData.status[period.periodKey].isLoaded;

  return (
    <div className="top-bar">
      <div className="nav-links">
        <ul className="nav">
          <li>
            <a
              href="https://docs.lasocietenouvelle.org/application-web"
              target="_blank"
            >
              <i className="bi bi-book-fill" /> Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/"
              target="_blank"
            >
              <i className="bi bi-github" /> GitHub
            </a>
          </li>
          <li>
            <a href="https://lasocietenouvelle.org/contact" target="_blank">
              <i className="bi bi-envelope-fill" /> Contactez-nous
            </a>
          </li>
        </ul>
      </div>
      {showInfo && (
        <div className="info-container">
          <div className="unit-info">
            <div className="info">
              <div className="label">Unité légale :</div>
              <div className="value">{session.legalUnit.corporateName}</div>
            </div>
            <div className="info">
              <div className="label">Période :</div>
              <div className="value">
                <div className="info select-container">
                  <Select
                    styles={periodSelectStyles()}
                    options={session.availablePeriods.map((period) => {
                      return {
                        label: getLabelPeriod(period.periodKey),
                        value: period.periodKey,
                      };
                    })}
                    value={{
                      label: getLabelPeriod(selectedPeriod),
                      value: selectedPeriod,
                    }}
                    onChange={handlePeriodChange}
                    placeholder="Choisissez une division"
                    isDisabled={true || session.availablePeriods.length <= 1}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="download-button">
            <Button
              className="me-4"
              variant="secondary"
              onClick={() => downloadSession(session)}
            >
              <i className="bi bi-save me-2"></i>
              Sauvegarder ma session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
