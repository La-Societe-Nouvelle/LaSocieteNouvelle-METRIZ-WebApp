import React from "react";
import {
  StatementGHG,
  StatementHAZ,
  StatementMAT,
  StatementNRG,
  StatementWAS,
  StatementWAT,
} from "../forms";

import StatementART from "../forms/StatementART";
import  StatementECO   from "../forms/StatementECO";
import StatementSOC from "../forms/StatementSOC";
import StatementIDR from "../forms/StatementIDR";
import StatementGEQ from "../forms/StatementGEQ";
import StatementKNW from "../forms/StatementKNW";

const StatementComponent = ({
  indic,
  impactsData,
  handleNetValueChange,
  handleValidation,
}) => {
  const componentProps = {
    impactsData: impactsData,
    onUpdate: handleNetValueChange,
    onValidate: handleValidation,
  };

  switch (indic) {
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

export default StatementComponent;
