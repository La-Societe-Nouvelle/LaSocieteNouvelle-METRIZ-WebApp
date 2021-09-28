// La Société Nouvelle

// React
import React from 'react';

// Components
import { SocialDataTable } from '../tables/SocialDataTable';

// Other sources
import { XLSXFileReader } from '../../src/readers/XLSXReader'
import { SocialDataContentReader } from '../../src/readers/SocialDataContentReader';
import { XLSXHeaderFileWriter } from '../../src/writers/XLSXWriter';

/* -------------------------------------------------------- */
/* -------------------- ASSESSMENT DIS -------------------- */
/* -------------------------------------------------------- */

/* The table is the same than the one for GEQ / DIS

*/

export class AssessmentDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = 
    {
      // gini index
      indexGini: props.session.impactsData.indexGini,
      // details
      hasEmployees: props.session.impactsData.hasEmployees,
      employees: props.session.impactsData.employees,
    }
  }

  render() 
  {
    const {employees} = this.state;

    const isAllValid = employees.map(employee => employee.hourlyRate!=null && employee.workingHours!=null).reduce((a,b) => a && b,true);

    return(
      <div className="indicator-section-view">
        <div className="view-header">
          <button className="retour" 
                  onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className="retour" 
                  disabled={!isAllValid}
                  onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        <div className="group assessment"><h3>Outil de mesure</h3>
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
            <button onClick={exportXLSXFile}>
              Télécharger modèle XLSX
            </button>
            <button onClick={this.deleteAll}>
                Supprimer tout
              </button>
          </div>

          <SocialDataTable employees={employees}/>
          
        </div>
      </div>
    )
  }

  onSubmit = async () => 
  {
    let impactsData = this.props.session.impactsData;

    // update dis data
    impactsData.indexGini = getIndexGini(impactsData.employees);

    // update geq data
    impactsData.wageGap = getGenderGap(impactsData.employees);
    
    await this.props.session.updateIndicator("dis");
    await this.props.session.updateIndicator("geq");    
  }
  
  deleteAll = () =>
  {
    this.props.session.impactsData.employees = [];
    this.setState({employees: []});
  }

  /* ----- IMPORTS ----- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((content) => SocialDataContentReader(content))
        .then((data) => this.props.session.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.session.impactsData.employees}));
    reader.readAsText(file);
  }

  // Import XLSX File
  importXLSXFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      XLSXFileReader(reader.result)
        .then((XLSXData) => SocialDataContentReader(XLSXData))
        .then((data) => this.props.session.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.session.impactsData.employees}));
    reader.readAsArrayBuffer(file);
  }

}

// Export XLSX File
const exportXLSXFile = async () =>
{
  let arrayHeader = [["Nom - Prénom","Sexe (F/H)","Heures travaillées","Rémunérations brutes","Taux horaire","Contrat de formation (O/N)","Heures de formation"]];
  let fileProps = {wsclos: [{wch:40},{wch:15},{wch:25},{wch:25},{wch:25},{wch:25},{wch:25}]};
  // write file (Array -> ArrayBuffer)
  let file = await XLSXHeaderFileWriter(fileProps,"Collaborateurs",arrayHeader);
  // trig download
  let blob = new Blob([file],{type:"application/octet-stream"});
  let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Collaborateurs.xlsx";
      link.click();
}

/* ----- Formulas ----- */

const getIndexGini = (employees) => 
{
  // order acoording to the hourly rate
  employees.sort((a,b) => a.hourlyRate - b.hourlyRate);

  // Nombre total d'heures travaillées
  let n = employees.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
  
  let s1 = 0;
  let s2 = 0;
  let i = 0;

  employees.forEach(employee =>
  {
    // S1
    for (let j = 1; j <= parseInt(employee.workingHours); j++) {
      s1+= 2*(i+j)*employee.hourlyRate;
    }
    i+= parseInt(employee.workingHours);
    // S2
    s2+= n*parseInt(employee.workingHours)*employee.hourlyRate;
  })

  let indexGini = ((s1/s2) - (n+1)/n)*100;
  
  /*
  // order acoording to the hourly rate
  employees.sort((a,b) => a.hourlyRate - b.hourlyRate);

  // Nombre total d'heures travaillées
  let total_workingHours = employees.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
  let total_wage = employees.map(employee => employee.wage).reduce((a,b) => a + b,0);
  
  let s = 0;
  //let n_hours = 0;
  let cumul_wage = 0;

  employees.forEach(employee =>
  {
    s+= (parseInt(employee.workingHours)/total_workingHours)*((cumul_wage+employee.wage)/total_wage);
    cumul_wage+=employee.wage;
  })

  let indexGini = 1-s;
  console.log(indexGini*100);
  */

  return indexGini;
}

const getGenderGap = (employees) => 
{
  const women = employees.filter(employee => employee.sex == "F");
  const men = employees.filter(employee => employee.sex == "M");

  let hourlyRateWomen = women.map(employee => employee.wage).reduce((a,b) => a + b,0) / women.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
  let hourlyRateMen = men.map(employee => employee.wage).reduce((a,b) => a + b,0) / men.map(employee => employee.workingHours).reduce((a,b) => a + b,0);

  let hourlyRateEmployees = employees.map(employee => employee.wage).reduce((a,b) => a + b,0) / employees.map(employee => employee.workingHours).reduce((a,b) => a + b,0);

  let wageGap = Math.abs(hourlyRateMen-hourlyRateWomen)/hourlyRateEmployees *100;

  return wageGap;
}