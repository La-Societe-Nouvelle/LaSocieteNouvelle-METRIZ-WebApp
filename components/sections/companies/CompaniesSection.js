// La Société Nouvelle

// React
import React from "react";

// Steps Section 

import { SectorSection } from "./SectorSection";
import { SirenSection } from "./SirenSection";

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class ProvidersSection extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      providers: props.session.financialData.providers,
      companyStep: 1,
    };

  }

  setCompanyStep = (step) => {
    this.setState({
      companyStep: step
    })
  }

  nextStep = () => 
  {

    // if current state is for identified companies
    if (this.state.companyStep==1) {
      const unidentifiedCompanies = this.state.providers.filter((provider) => provider.state == "default");
      if (unidentifiedCompanies.length > 0) {
        this.setState({companyStep: 2});
      } else {
        this.props.submit();
      }
    }
    // if current state is for unidentified companies
    else if (this.state.companyStep==2) {
      this.props.submit()
    }
  }

  prevStep = () => 
  {
    // if current state is for unidentified companies
    if (this.state.companyStep==2) {
      this.setState({companyStep: 1})
    }
  }
 
  render() 
  {
    const {
      companyStep,
    } = this.state;
    
    const financialData = this.props.session.financialData;
    const financialPeriod = this.props.session.financialPeriod;
    const unidentifiedCompanies = this.state.providers.filter((provider) => provider.isDefaultProviderAccount); // ?

    // Synchro with corporate ID 

    if (companyStep == 1) {
      return (
        <SirenSection {...this.props}
          financialData={financialData} 
          financialPeriod={financialPeriod}
          nextStep={this.nextStep}/>
      )
    }

   if (companyStep == 2) {
      return (
        <SectorSection {...this.props}
          financialData={financialData} 
          financialPeriod={financialPeriod}
          unidentifiedCompanies={unidentifiedCompanies} 
          prevStep={this.prevStep} 
          nextStep={this.nextStep}/>
      )
    }

  }
}