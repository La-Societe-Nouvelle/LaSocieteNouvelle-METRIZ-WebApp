// La Société Nouvelle

// React
import React, { useState } from "react";

// Views
import { UnidentifiedProviders } from "./unidentifiedProviders";
import IdentifiedProviders from "./identifiedProviders";

/* ----------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- PROVIDERS SECTION -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------- */

/** Providers section
 *  Two steps :
 *    1- identified providers (with siren number)
 *    2- unidentified providers (default account & provider account without siren number) -> useDefaultFootprint == true
 *  State :
 *    -> step (1 or 2)
 *
 */

const ProvidersSection = (props) => {
  const { financialData, financialPeriod } = props.session;
  const [step, setStep] = useState(1);

  const nextStep = () => {
    let submit =
      step === 2 ||
      !props.session.financialData.providers.some(
        (provider) => provider.useDefaultFootprint
      );
    if (submit) {
      props.submit();
    } else if (step === 1) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  if (step === 1) {
    return (
      <IdentifiedProviders
        financialData={financialData}
        financialPeriod={financialPeriod}
        nextStep={nextStep}
        submit={props.submit}
      />
    );
  }

  if (step === 2) {
    return (
      <UnidentifiedProviders
        financialData={financialData}
        financialPeriod={financialPeriod}
        prevStep={prevStep}
        nextStep={nextStep}
      />
    );
  }

  return null;
};

export default ProvidersSection;
