import React, { useState } from "react";
import Select from "react-select";

import { Row, Col, Image } from "react-bootstrap";
import {
  StatementART,
  StatementECO,
  StatementGEQ,
  StatementGHG,
  StatementHAZ,
  StatementIDR,
  StatementKNW,
  StatementMAT,
  StatementNRG,
  StatementSOC,
  StatementWAS,
  StatementWAT,
} from "./forms";
import indicators from "/lib/indics";
import { useEffect } from "react";

const StatementForms = ({ session, period, initialSelectedIndicators }) => {
  const [indicatorsToShow, setIndicatorsToShow] = useState([]);
  const [indicatorsOptions, setIndicatorsOptions] = useState([]);
  const [selectedIndicators, setSelectedIndicators] = useState(
    initialSelectedIndicators
  );

  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
  useEffect(() => {
    const updatedIndicatorsToShow = selectedIndicators.map((key) => {
      const indicator = indicators[key];
      return [key, indicator];
    });
    initialSelectedIndicators = updatedIndicatorsOptions;
    setIndicatorsToShow(updatedIndicatorsToShow);

    const updatedIndicatorsOptions = Object.entries(indicators)
      .filter(([indic]) => !selectedIndicators.includes(indic))
      .map(([code, indic]) => {
        return { value: code, label: indic.libelle };
      });

    setIndicatorsOptions(updatedIndicatorsOptions);
  }, [selectedIndicators]);

  // check if net value indicator will change with new value & cancel value if necessary
  const handleNetValueChange = async (indic) => {
    let nextIndicator = session.getNetValueAddedIndicator(
      indic,
      period.periodKey
    );

    if (
      nextIndicator !==
      session.financialData.mainAggregates.netValueAdded.periodsData[
        period.periodKey
      ].footprint.indicators[indic]
    ) {
      // remove validation
      session.validations[period.periodKey] = session.validations[
        period.periodKey
      ].filter((item) => item != indic);
      setValidations(validations.filter((item) => item != indic));

      // update footprint
      await session.updateFootprints(period);
    }
  };

  const handleValidation = async (indic) => {
    setValidations((validations) => [...validations, indic]);

    // add validation
    if (!session.validations[period.periodKey].includes(indic)) {
      session.validations[period.periodKey].push(indic);
    }
    // update footprint
    await session.updateFootprints(period);
  };

  const handleIndicatorChange = (selected) => {
    const updatedSelectedIndicators = [...selectedIndicators, selected.value];

    setSelectedIndicators(updatedSelectedIndicators);
  };

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: session.impactsData[period.periodKey],
      onUpdate: handleNetValueChange,
      onValidate: handleValidation,
    };

    switch (key) {
      case "eco":
        return <StatementECO {...componentProps} />;
      case "art":
        return <StatementART {...componentProps} />;
      case "soc":
        return <StatementSOC {...componentProps} />;
      case "idr":
        return <StatementIDR {...componentProps} />;
      case "geq":
        return <StatementGEQ {...componentProps} />;
      case "knw":
        return <StatementKNW {...componentProps} />;
      case "ghg":
        return <StatementGHG {...componentProps} />;
      case "nrg":
        return <StatementNRG {...componentProps} />;
      case "wat":
        return <StatementWAT {...componentProps} />;
      case "mat":
        return <StatementMAT {...componentProps} />;
      case "was":
        return <StatementWAS {...componentProps} />;
      case "haz":
        return <StatementHAZ {...componentProps} />;

      default:
        return null;
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "2px solid #dbdef1" : "2px solid #f0f0f8",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dbdef1",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#dbdef1",
      "&:hover": {
        color: "#dbdef1",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#191558" : "transparent",
      background: state.isFocused ? "#f0f0f8" : "",
      "&:hover": {
        color: "#191558",
      },
    }),
  };

  return (
    <>
    
        {indicatorsToShow.map(([key, value]) => (
          
          
              <div className="d-flex border border-1 rounded  p-3 mb-3 shadow-sm ">
                <div className="p-4">
                  <Image
                    className="me-2"
                    src={`icons-ese/${key}.svg`}
                    alt={key}
                    height={60}
                  />
                </div>
                <div className="flex-fill">
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="h6 mb-0 ">
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </h4>
                    <div className="text-end">
                      {validations.includes(key) && (
                        <span className="display-6">
                          <i className="text-success ms-3 bi bi-patch-check"></i>
                        </span>
                      )}
                    </div>
                  </div>

                  <div >{renderStatementForm(key)}</div>
                </div>
              </div>
       
         
        ))}
     
      <hr></hr>

      {indicatorsToShow.length < Object.keys(indicators).length && (
        <div className="border border-1 rounded p-3 my-3 shadow-sm bg-primary">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="h5 mb-0 text-white">
              <i className="bi bi-plus-circle me-2"></i> Ajouter un indicateur
            </h4>
            <Select
              styles={customStyles}
              components={{
                IndicatorSeparator: () => null,
              }}
              options={indicatorsOptions}
              placeholder="Ajouter un indicateur à déclarer"
              onChange={handleIndicatorChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StatementForms;
