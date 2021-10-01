// La Société Nouvelle

// React
import React from 'react';
import Popup from 'reactjs-popup';

// Components
import { CompaniesTable } from '../tables/CompaniesTable';

// Writers
import { XLSXFileWriterFromJSON } from '../../src/writers/XLSXWriter';

// Readers
import { CSVFileReader, processCSVCompaniesData } from '/src/readers/CSVReader';
import { XLSXFileReader } from '/src/readers/XLSXReader';
import { ProgressBar } from '../popups/ProgressBar';

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
      fetching: false,
      progression: 0,
    }
  }

  componentDidUpdate()
  {
    if (this.state.view=="unsync" && this.state.companies.filter(company => company.status != 200).length==0) {
      this.setState({view: "all"});
    }
  }

  render()
  {
    const {companies,view,fetching,progression} = this.state;
    const financialData = this.props.session.financialData;

    const expensesByCompanies = getExpensesByCompanies(financialData.expenses.concat(financialData.investments));

    const isAllValid = !(companies.filter(company => company.status != 200).length > 0);

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Fournisseurs</h1>
        </div>

        <div>
          <p>Informations : {isAllValid ? "Données synchronisées" : "Données manquantes (cf. Affichage des comptes non synchronisés)"}</p>
        </div>

        <div className="section-view-main">

          <div className="group"><h3>Liste des fournisseurs</h3>

            <div className="actions">
              <button onClick={() => document.getElementById('import-companies').click()}>
                Importer un fichier (.csv, .xlsx)
              </button>
              <input id="import-companies" visibility="collapse"
                     type="file" accept=".csv,.xlsx" 
                     onChange={this.importFile}/>
              <button onClick={this.exportXLSXFile}>
                Exporter (.xlsx)
              </button>
              {companies.length > 0 &&
                <select value={view}
                        onChange={this.changeView}>
                  <option key="1" value="all">Affichage de tous les comptes externes</option>
                  <option key="2" value="aux">Affichage des comptes fournisseurs uniquement</option>
                  <option key="3" value="expenses">Affichage des autres comptes tiers</option>
                  {!isAllValid && <option key="4" value="unsync">Affichage des comptes non synchronisés</option>}
                </select>}
              <button onClick={this.synchroniseAll}>
                Synchroniser les données
              </button>
            </div>

            {companies.length > 0 && 
              <CompaniesTable view={view}
                              onUpdate={this.updateFootprints.bind(this)}
                              companies={companies}
                              financialData={financialData}
                              amounts={expensesByCompanies}/>}

          </div>
            
        </div>

        <Popup open={fetching}>
          <ProgressBar message="Récupération des données fournisseurs..."
                        progression={progression}/>
        </Popup>

      </div>
    )
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => 
  {
    this.props.session.updateFootprints();
    this.setState({companies: this.props.session.financialData.companies});
    this.props.updateMenu();
  }

  changeView = (event) => this.setState({view : event.target.value})

  /* ----- IMPORTS ----- */

  importFile = (event) =>
  {
    let file = event.target.files[0];
    let extension = file.name.split('.').pop();
    switch (extension)
    {
      case "csv": this.importCSVFile(file); break;
      case "xlsx": this.importXLSXFile(file); break;
    }
  }

  // Import CSV File
  importCSVFile = (file) => 
  {    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVCompaniesData(CSVData))
        .then(async (companiesIds) => await Promise.all(Object.entries(companiesIds).map(async ([corporateName,corporateId]) => this.updateCorporateId(corporateName,corporateId))))
        .then(() => this.setState({companies: this.props.session.financialData.companies}));
    reader.readAsText(file);
  }

  // Import XLSX File
  importXLSXFile = (file) => 
  {    
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
    if (company!=undefined) {
      company.update({id: company.id,corporateId});
    }
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
    this.setState({fetching: true, progression: 0})
    let i = 0; let n = this.props.session.financialData.companies.length;
    for (let company of this.props.session.financialData.companies) 
    {
      await company.updateFromRemote();
      i++;
      this.setState({progression: Math.round((i/n)*100)})
    }
    if (this.props.session.financialData.companies.filter(company => company.status != 200).length > 0) this.state.view = "unsync";
    this.setState({fetching: false, progression:0, companies: this.props.session.financialData.companies});
    this.props.session.updateFootprints();
    this.props.updateMenu();
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