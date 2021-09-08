// La Société Nouvelle

// React
import React from 'react';

// Components
import { CompaniesTable } from '../tables/CompaniesTable';

// Readers
import { CSVFileReader, processCSVCompaniesData } from '/src/readers/CSVReader';
import { XLSXFileReader } from '/src/readers/XLSXReader';

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class CompaniesSection extends React.Component {

  constructor(props) 
  {
    super(props)
    this.state = {
      companies: props.session.financialData.getCompanies(),
    }
  }

  render()
  {
    const companies = this.state.companies;
    const financialData = this.props.session.financialData;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Fournisseurs et Comptes externes</h1>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Liste des fournisseurs</h3>

            <div className="actions">
              <button onClick={() => document.getElementById('import-companies-csv').click()}>
                Importer un fichier CSV
              </button>
              <input id="import-companies-csv" visibility="collapse"
                     type="file" accept=".csv" 
                     onChange={this.importCSVFile}/>
              <button onClick={() => document.getElementById('import-companies-xlsx').click()}>
                Importer un fichier XLSX
              </button>
                <input id="import-companies-xlsx" visibility="collapse"
                       type="file" accept=".xlsx" 
                       onChange={this.importXLSXFile}/>
              <button onClick={() => location.href="/classeurTiers.xlsx"}>
                Télécharger modèle XLSX
              </button>
              <button onClick={this.synchroniseAll}>
                Synchroniser les données
              </button>
            </div>

            {companies.length > 0 && 
              <CompaniesTable companies={companies} 
                              financialData={financialData}/>}

          </div>
            
        </div>
      </div>
    )
  }

  /* ----- IMPORTS ----- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVCompaniesData(CSVData))
        .then(async (companiesId) => await Promise.all(Object.entries(companiesId).map(async ([corporateName,corporateId]) => this.updateCorporateId(corporateName,corporateId))))
        .then(() => this.setState({companies: this.props.session.financialData.getCompanies()}));
    reader.readAsText(file);
  }

  // Import XLSX File
  importXLSXFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      XLSXFileReader(reader.result)
        .then(async (XLSXData) => await Promise.all(XLSXData.map(async ({identifiant,denomination}) => this.updateCorporateId(denomination,identifiant))))
        .then(() => this.setState({companies: this.props.session.financialData.getCompanies()}));
    reader.readAsArrayBuffer(file);
  }

  updateCorporateId = async (corporateName,corporateId) => 
  {
    let company = this.props.session.financialData.getCompanyByName(corporateName);
    if (company!=undefined) await this.props.session.financialData.updateCompany({id: company.id,corporateId});
  }

  /* ----- SYNCHRONISATION ----- */

  // Synchronisation
  synchroniseAll = async () => 
  {
    await Promise.all(this.props.session.financialData.companies.map(async (company) => await company.updateFootprintFromRemote()));
    this.setState({companies: this.props.session.financialData.getCompanies()});
  }

}