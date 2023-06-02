import React from "react";
import { StatementART, StatementECO, StatementSOC } from "../forms";

const StatementComponent = ({indic, impactsData, handleNetValueChange, handleValidation}) => {
  console.log(handleNetValueChange)
  const componentProps = {
    impactsData: impactsData,
    onUpdate: handleNetValueChange,
    onValidate: handleValidation,
  };
  console.log(indic)
  switch (indic) {
    case "eco":
      return <StatementECO {...componentProps} />;
    case "art":
      return <StatementART {...componentProps} />;
    case "soc":
      return <StatementSOC {...componentProps} />;
    default:
      return null;
  }
};

export default StatementComponent;
