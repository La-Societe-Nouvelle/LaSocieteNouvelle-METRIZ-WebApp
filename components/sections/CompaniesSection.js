// La Société Nouvelle

// React
import React from 'react';
import { XLSXFileWriterFromJSON } from '../../src/writers/XLSXWriter';

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
      companies: props.session.financialData.companies,
      view: "all",
    }
  }

  render()
  {
    const {companies,view} = this.state;
    const financialData = this.props.session.financialData;

    const expensesByCompanies = getExpensesByCompanies(financialData.expenses.concat(financialData.investments));
    
    let companiesShowed = companies;
    if (view=="aux") companiesShowed = companies.filter(company => company.account.charAt(0) != "_");
    if (view=="expenses") companiesShowed = companies.filter(company => company.account.charAt(0) == "_");

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
              {/*<button onClick={() => location.href="/classeurTiers.xlsx"}>
                Télécharger modèle XLSX
              </button>*/}
              <button onClick={this.exportXLSXFile}>
                Télécharger modèle XLSX
              </button>
              {companiesShowed.length > 0 &&
                <select value={view}
                        onChange={this.changeView}>
                  <option key="1" value="all">Affichage de tous les comptes externes</option>
                  <option key="2" value="aux">Affichage des comptes fournisseurs uniquement</option>
                  <option key="3" value="expenses">Affichage des dépenses non rattachées</option>
                </select>}
              <button onClick={this.synchroniseAll}>
                Synchroniser les données
              </button>
            </div>

            {companiesShowed.length > 0 && 
              <CompaniesTable view={view}
                              companies={companiesShowed} 
                              financialData={financialData}
                              amounts={expensesByCompanies}/>}

          </div>
            
        </div>
      </div>
    )
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateFootprints()

  changeView = (event) => this.setState({view : event.target.value})

  /* ----- IMPORTS ----- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVCompaniesData(CSVData))
        .then(async (companiesIds) => await Promise.all(Object.entries(companiesIds).map(async ([corporateName,corporateId]) => this.updateCorporateId(corporateName,corporateId))))
        .then(() => this.setState({companies: this.props.session.financialData.companies}));
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
        .then(() => this.setState({companies: this.props.session.financialData.companies}));
    reader.readAsArrayBuffer(file);
  }

  updateCorporateId = async (corporateName,corporateId) => 
  {
    let company = this.props.session.financialData.getCompanyByName(corporateName);
    if (company!=undefined) await this.props.session.financialData.updateCompany({id: company.id,corporateId});
  }

  // Export CSV File
  exportXLSXFile = async () =>
  {
    let jsonContent = await this.props.session.financialData.companies.filter(company => company.account.charAt(0) != "_")
                                                                      .map(company => {return({denomination: company.corporateName, siren: company.corporateId})});
    let fileProps = {wsclos: [{wch:50},{wch:20}]};
    // write file (JSON -> ArrayBuffer)
    let file = await XLSXFileWriterFromJSON(fileProps,"fournisseurs",jsonContent);
    // trig download
    let blob = new Blob([file],{type:"application/octet-stream"});
    let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "fournisseurs.xlsx";
        link.click();
  }

  /* ----- SYNCHRONISATION ----- */

  // Synchronisation
  synchroniseAll = async () => 
  {
    await Promise.all(this.props.session.financialData.companies.map(async (company) => await company.updateFootprintFromRemote()));
    this.setState({companies: this.props.session.financialData.companies});
  }

}

const getExpensesByCompanies = (expenses) => 
{
    let expensesByCompanies = {};
    expenses.forEach((expense) => 
    {
        if (expensesByCompanies[expense.accountAux] == undefined) expensesByCompanies[expense.accountAux] = expense.amount;
        else expensesByCompanies[expense.accountAux]+= expense.amount;
    })
    return expensesByCompanies;
}