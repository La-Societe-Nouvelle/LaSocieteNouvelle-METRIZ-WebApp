// La Société Nouvelle

// React
import React from "react";

// Steps Section 

import { SectorSection } from "./SectorSection";
import { SirenSection } from "./SirenSection";

/* ----------------------------------------------------------- */
/* -------------------- PROVIDERS SECTION -------------------- */
/* ----------------------------------------------------------- */

/** Providers section
 *  Two steps :
 *    1- identified providers (with siren number)
 *    2- unidentified providers (default account & provider account without siren number) -> useDefaultFootprint
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
    // if current state is for identified providers
    if (this.state.step==1) {
      const someProvidersUnidentified = this.props.session.financialData.providers.some((provider) => provider.useDefaultFootprint);
      if (someProvidersUnidentified) {
        this.setState({step: 2});
      } else {
        this.props.submit();
      }
    }

    // if current state is for unidentified providers
    else if (this.state.step==2) {
      this.props.submit()
    }
  }

  prevStep = () => 
  {
    // if current state is for unidentified providers
    if (this.state.step==2) {
      this.setState({step: 1})
    }
  }
 
  render() 
  {
    const {step} = this.state;
    
    const financialData = this.props.session.financialData;
    const financialPeriod = this.props.session.financialPeriod;
    const unidentifiedProviders = financialData.providers.filter((provider) => provider.useDefaultFootprint); // ?

    if (step == 1) {
      return (
        <SirenSection
          financialData={financialData} 
          financialPeriod={financialPeriod}
          nextStep={this.nextStep}/>
      )
    }

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