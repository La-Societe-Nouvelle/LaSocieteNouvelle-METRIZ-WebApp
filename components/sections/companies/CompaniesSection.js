// La Société Nouvelle

// React
import React from "react";

// Steps Section 

import { SectorSection } from "./SectorSection";
import { SirenSection } from "./SirenSection";

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class CompaniesSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companies: props.session.financialData.companies,
      companyStep: 1,
    };

  }
  setCompanyStep = (step) => {

    this.setState({
      companyStep: step
    })
  }

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  render() {

    const {
      companyStep,
    } = this.state;
    const financialData = this.props.session.financialData;
    // check synchro
    const defaultCompanies = this.state.companies.filter((company) => company.state == "default");

    // Synchro with corporate ID 

    if (companyStep == 1) {
      return (
        <SirenSection {...this.props} financialData={financialData} setCompanyStep={this.setCompanyStep} companyStep={companyStep} />
      )
    }
   if (companyStep == 2 ) {
      return (
        <SectorSection {...this.props} financialData={financialData} companies={defaultCompanies} companyStep={companyStep} />

      )
    }

  }
}
/* -------------------------------------------------- ANNEXES -------------------------------------------------- */



