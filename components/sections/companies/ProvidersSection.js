// La Société Nouvelle

// React
import React from "react";

// Steps Section
import { SectorSection } from "./SectorSection";
import { SirenSection } from "./SirenSection";

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

export class ProvidersSection extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
    };
  }

  nextStep = () => 
  {
    // submit if step 2 or step 1 & no default fpt
    let submit = this.state.step==2 || !this.props.session.financialData.providers.some((provider) => provider.useDefaultFootprint);
    if (submit) {
      this.props.submit();
    } else if (this.state.step==1) {
      this.setState({step: 2});
    }
  }

  prevStep = () => 
  {
    this.setState({step: 1})
  }
 
  render() 
  {
    const { financialData, financialPeriod } = this.props.session;
    const {step} = this.state;

    // Step 1 - Identified providers
    if (step == 1) {
      return (
        <SirenSection
          financialData={financialData} 
          financialPeriod={financialPeriod}
          nextStep={this.nextStep}/>
      )
    }

  // Step 2 - Unidentified providers (default footprints)
   if (step == 2) {
      return (
        <SectorSection
          financialData={financialData} 
          financialPeriod={financialPeriod}
          prevStep={this.prevStep} 
          nextStep={this.nextStep}/>
      )
    }
  }
}