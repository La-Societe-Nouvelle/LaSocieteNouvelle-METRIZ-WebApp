// La Société Nouvelle

// React
import React from 'react';

// Components
import { CompaniesTable } from '../tables/CompaniesTable';

// Writers
import { XLSXFileWriterFromJSON } from '../../src/writers/XLSXWriter';

// Readers
import { CSVFileReader, processCSVCompaniesData } from '/src/readers/CSVReader';
import { XLSXFileReader } from '/src/readers/XLSXReader';
import { ProgressBar } from '../popups/ProgressBar';
import { getSignificativeCompanies } from '../../src/formulas/significativeLimitFormulas';

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class CompaniesSection extends React.Component {

  constructor(props) 
  {
    super(props)
    this.state = {
      companies: props.session.financialData.companies,
      significativeCompanies: [],
      view: "all",
      nbItems: 20,
      fetching: false,
      progression: 0,
    }
  }

  componentDidUpdate()
  {
    // change view to main if unsync empty
    if (this.state.view=="unsync" && this.state.companies.filter(company => company.status != 200).length==0) {
      this.setState({view: "all"});
    }
    if(this.state.significativeCompanies.length == 0 && this.state.companies.filter(company => company.status != 200).length == 0) {
      let significativeCompanies = getSignificativeCompanies(this.props.session.financialData);
      this.setState({significativeCompanies});
    }
  }

  render()
  {
    const {companies,significativeCompanies,view,nbItems,fetching,progression} = this.state;
    const financialData = this.props.session.financialData;

    // get amounts
    const expensesByCompanies = getExpensesByCompanies(financialData.expenses.concat(financialData.investments));
    
    // check synchro
    const isAllValid = !(companies.filter(company => company.status != 200).length > 0);

    const companiesShowed = filterCompanies(companies,view,significativeCompanies);

    return (
      <div className="section-view">

        <div className="section-view-actions">
          <div className="sections-actions">
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
                {significativeCompanies.length > 0 && <option key="5" value="significative">Affichage des comptes significatifs</option>}
              </select>}
          </div>
          <div>
            <button id="validation-button" disabled={!isAllValid} onClick={this.props.submit}>Valider</button>
          </div>
        </div>

        <div className="section-top-notes">
          <p><b>Notes : </b>
            Les comptes fournisseurs et autres comptes tiers correspondent aux entités exterieures vers lesquelles sont dirigés les charges externes et les investissements.
            Les "autres comptes tiers" font référence aux comptes par défaut résultants de l'impossibilité d'associer certains flux sortants à un compte fournisseur auxiliaire.<br/>
            L'obtention des empreintes des comptes fournisseurs s'effectuent via leur numéro de siren.
          </p>
        </div>

        <div className="section-view-header">
          <h1>Fournisseurs &amp; Comptes tiers</h1>
        </div>

        <div className="section-view-main">

          <div className="notes">
            {isAllValid && <p><img className="img" src="/resources/icon_good.png" alt="warning"/> Données complètes.</p>}
            {!isAllValid && <p><img className="img" src="/resources/icon_warning.png" alt="warning"/> L'empreinte de certains comptes ne sont pas initialisés.</p>}
          </div>

        {companies.length > 0 && 
          <div className="table-container">
            <div className="table-header">
              <div>
                <select value={nbItems}
                        onChange={this.changeNbItems}>
                  <option key="1" value="20">20 éléments</option>
                  <option key="2" value="50">50 éléments</option>
                  <option key="3" value="all">Tous les éléments</option>
                </select>
              </div>
              <button onClick={this.synchroniseShowed}>Synchroniser les données</button>
            </div>
            <CompaniesTable nbItems={nbItems=="all" ? companiesShowed.length : parseInt(nbItems)}
                            onUpdate={this.updateFootprints.bind(this)}
                            companies={companiesShowed}
                            financialData={financialData}
                            amounts={expensesByCompanies}/>
          </div>}
            
        </div>

      {fetching &&
        <div className="popup">
          <ProgressBar message="Récupération des données fournisseurs..."
                        progression={progression}/>
        </div>}

      </div>
    )
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => 
  {
    this.props.session.updateFootprints();
    this.setState({companies: this.props.session.financialData.companies});
  }

  changeView = (event) => this.setState({view : event.target.value})

  changeNbItems = (event) => this.setState({nbItems : event.target.value})

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
        .then(async (XLSXData) => await Promise.all(XLSXData.map(async ({denomination,siren}) => this.updateCorporateId(denomination,siren))))
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

  // Synchronisation all
  synchroniseAll = async () => 
  {
    await this.synchroniseCompanies(this.state.companies);
  }

  // Synchronisation showed
  synchroniseShowed = async () => 
  {
    let {companies,view} = this.state;
    let significativeAccounts = view=="significative" ? getSignificativeCompanies(financialData) : [];
    let companiesShowed = filterCompanies(companies,view,significativeAccounts);
    await this.synchroniseCompanies(companiesShowed);
  }

  synchroniseCompanies = async (companiesToSynchronise) =>
  {
    // synchronise data
    this.setState({fetching: true, progression: 0})
    let i = 0; let n = companiesToSynchronise.length;
    for (let company of companiesToSynchronise)
    {
      await company.updateFromRemote();
      i++;
      this.setState({progression: Math.round((i/n)*100)})
    }

    // update view
    if (this.state.view=="all" && this.state.companies.filter(company => company.status != 200).length > 0) this.state.view = "unsync";
    
    // update signficative companies
    if(this.state.companies.filter(company => company.status != 200).length == 0) this.state.significativeCompanies = getSignificativeCompanies(this.props.session.financialData);
    
    // update state
    this.setState({fetching: false, progression:0});
    
    // update session
    this.props.session.updateFootprints();
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

/* ---------- DISPLAY ---------- */

const filterCompanies = (companies,view,significativeCompanies) =>
{
  switch(view)
  {
    case "aux":           return companies.filter(company => !company.isDefaultAccount);
    case "expenses":      return companies.filter(company => company.isDefaultAccount);
    case "undefined":     return companies.filter(company => company.state != "siren");
    case "unsync":        return companies.filter(company => company.status != 200);
    case "significative": return significativeCompanies;
    default: return companies;
  }
}