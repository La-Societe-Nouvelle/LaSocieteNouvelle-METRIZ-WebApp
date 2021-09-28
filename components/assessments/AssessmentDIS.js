// La Société Nouvelle

// React
import React from 'react';

// Components
import { SocialDataTable } from '../tables/SocialDataTable';

// Other sources
import { XLSXFileReader } from '../../src/readers/XLSXReader'
import { SocialDataContentReader } from '../../src/readers/SocialDataContentReader';
import { XLSXHeaderFileWriter } from '../../src/writers/XLSXWriter';

// Utils
import { InputText } from '/components/InputText';
import { InputNumber } from '/components/InputNumber';
import { valueOrDefault } from '/src/utils/Utils';
import { getNewId,roundValue } from '../../src/utils/Utils';

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
      //
      columnSorted: "id",
      reverseSort: false,
      page: 0
    }
  }

  render() 
  {
    const {employees,columnSorted,page} = this.state;

    const isAllValid = employees.map(employee => employee.hourlyRate!=null && employee.workingHours!=null).reduce((a,b) => a && b,true);

    this.sortCompanies(employees,columnSorted);

    const newEmployee = {
      id: getNewId(employees),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false
    }

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

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <td className="auto" 
                      onClick={() => this.changeColumnSorted("name")}>Nom</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("sex")}>Sexe</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("workingHours")}>Heures travaillées (annuelles)</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("wage")}>Rémunération annuelle brute</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("hourlyRate")}>Taux horaire</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("trainingContract")}>Contrat de formation</td>
                  <td className="short" 
                      onClick={() => this.changeColumnSorted("trainingHours")}>Heures de formation</td>
                </tr>
              </thead>
              <tbody>
                {employees.slice(page*20,(page+1)*20)
                          .map((employee) => 
                  <Row key={"company_"+employee.id} 
                      {...employee}
                      isNewEmployeeRow={false}
                      updateSocialData={this.updateSocialData.bind(this)}/>)}
                  <Row key="new_employee"
                      {...newEmployee}
                      isNewEmployeeRow={true}
                      updateSocialData={this.updateSocialData.bind(this)}/>
              </tbody>
            </table>

            {employees.length > 20 &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*20 < employees.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
            
          </div>
          
        </div>
      </div>
    )
  }

  onSubmit = async () => 
  {
    let impactsData = this.props.session.impactsData;

    // update dis data
    impactsData.indexGini = getIndexGini(impactsData.employees),1;
    await this.props.session.updateIndicator("dis");

    // update geq data
    impactsData.wageGap = getGenderWageGap(impactsData.employees);
    await this.props.session.updateIndicator("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = getApprenticesRemunerations(impactsData.employees);
    impactsData.knwDetails.employeesTrainingsCompensations = getEmployeesTrainingCompensations(impactsData.employees);
    await this.props.session.updateIndicator("knw");
    
    this.props.onGoBack();
  }
  
  deleteAll = () =>
  {
    this.props.session.impactsData.employees = [];
    this.setState({employees: []});
  }

  /* ---------- SORTING ---------- */

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})} 
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortCompanies(items,columSorted) 
  {
    switch(columSorted) 
    {
      case "id": items.sort((a,b) => a.id - b.id); break;
      case "name": items.sort((a,b) => valueOrDefault(a.name,"").localeCompare(valueOrDefault(b.name,""))); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ---------- NAVIGATION ---------- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*20 < this.props.employees.length) this.setState({page: this.state.page+1})}

  /* ---------- OPERATIONS ON EXPENSE ---------- */

  updateSocialData = (nextProps) => 
  {
    let employee = this.props.session.impactsData.employees.filter(employee => employee.id == nextProps.id)[0];
    if (employee==undefined) {
      employee = {
        id: getNewId(this.props.session.impactsData.employees),
        name: nextProps.name || "",
        sex: "",
        wage: null,
        workingHours: null,
        hourlyRate: null,
        trainingHours: null,
        trainingContract: false
      }
      this.state.employees.push(employee)
    } else {
      Object.entries(nextProps).forEach(([propName,propValue]) => employee[propName] = propValue);
    }
    this.setState({employees: this.props.session.impactsData.employees});
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

/* -------------------- EMPLOYEE ROW -------------------- */

class Row extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = 
    {
      name: props.name || "",
      sex: props.sex || "",
      wage: props.wage || null,
      workingHours: props.workingHours || null,
      hourlyRate: props.hourlyRate || null,
      trainingHours: props.trainingHours || null,
      trainingContract: props.trainingContract || false
    };
  }

  componentDidUpdate(prevProps)
  {
    if (prevProps!==this.props) {
      this.setState({
        name: this.props.isNewEmployeeRow ? "" : this.props.name || "",
        sex: this.props.sex || "",
        wage: this.props.wage || null,
        workingHours: this.props.workingHours || null,
        hourlyRate: this.props.hourlyRate || null,
        trainingHours: this.props.trainingHours || null,
        trainingContract: this.props.trainingContract || false
      })
    }
  }

  render() 
  {
    const {id} = this.props;
    const {name,sex,wage,workingHours,hourlyRate,trainingHours,trainingContract} = this.state;

    const isValid = (hourlyRate!=null && workingHours!=null);

    return (
      <tr>
        <td className={"long"+(!this.props.isNewEmployeeRow ?  (isValid ? " valid" : " unvalid") : "")}>
          <InputText value={name}
                     onUpdate={this.updateName.bind(this)}/></td>

        <td className="short center">
          <select value={sex}
                  onChange={this.updateSex}>
            <option key="" value=""> - </option>
            <option key="F" value="F">F</option>
            <option key="H" value="H">H</option>
            {sex==null && <option key="" value="">-</option>}
          </select></td>

        <td className="short right">
          <InputNumber value={workingHours}
                       onUpdate={this.updateWorkingHours.bind(this)}/>
        </td>

        <td className="short right">
          <InputNumber value={wage}
                       onUpdate={this.updateWage.bind(this)}/>
        </td>

        <td className="short right">
          <InputNumber value={hourlyRate}
                       onUpdate={this.updateHourlyRate.bind(this)}/>
        </td>

        <td className="short">
          <input type="checkbox"
                 value={id}
                 checked={trainingContract}
                 onChange={this.updateTrainingContract.bind(this)}/>
        </td>

        <td className="short right">
          <InputNumber value={trainingHours}
                       onUpdate={this.updateTrainingHours.bind(this)}/>
        </td>

      </tr>
    )
  }

  updateName = (input) => 
  {
    this.props.updateSocialData({id: this.props.id, name: input});
    this.setState({name: input});
  }

  updateSex = (input) => 
  {
    this.props.updateSocialData({id: this.props.id, sex: input.target.value})
  }

  updateWage = (input) =>
  {
    this.state.wage = roundValue(input,0);
    if (input==null) this.updateHourlyRate(null)
    else if (this.state.workingHours > 0) this.updateHourlyRate(input/this.state.workingHours)
    else if (this.state.workingHours==null && this.state.hourlyRate > 0) this.updateWorkingHours(input/this.state.hourlyRate)
    this.props.updateSocialData({id: this.props.id, ...this.state})
  }

  updateWorkingHours = (input) => 
  {
    this.state.workingHours = parseInt(input);
    if (input==null || input==0) this.updateHourlyRate(null)
    else if (this.state.wage!=null) this.updateHourlyRate(this.state.wage/input)
    else if (this.state.hourlyRate!=null) this.updateWage(this.state.hourlyRate*input)
    this.props.updateSocialData({id: this.props.id, ...this.state})
  }

  updateHourlyRate = (input) =>
  {
    this.state.hourlyRate = roundValue(input,1);
    if (input==null && this.state.wage!=null) this.updateWage(null)
    else if (this.state.workingHours!=null) this.state.wage = input*this.state.workingHours
    else if (this.state.wage!=null && input > 0) this.state.workingHours = this.state.wage/input
    this.props.updateSocialData({id: this.props.id, ...this.state})
  }
  
  updateTrainingContract = (event) =>
  {
    this.props.updateSocialData({id: this.props.id, trainingContract: event.target.checked})
  }

  updateTrainingHours = (input) =>
  {
    this.props.updateSocialData({id: this.props.id, trainingHours: input})
  }

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

  return roundValue(indexGini,1);
}

const getGenderWageGap = (employees) => 
{
  const women = employees.filter(employee => employee.sex == "F");
  const men = employees.filter(employee => employee.sex == "H");

  if (men.length > 0 && women.length > 0)
  {
    let hourlyRateWomen = women.map(employee => employee.wage).reduce((a,b) => a + b,0) / women.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
    let hourlyRateMen = men.map(employee => employee.wage).reduce((a,b) => a + b,0) / men.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
    let hourlyRateEmployees = employees.map(employee => employee.wage).reduce((a,b) => a + b,0) / employees.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
    
    let wageGap = Math.abs(hourlyRateMen-hourlyRateWomen)/hourlyRateEmployees *100;
    return roundValue(wageGap,1);
  }
  else {return 0}
}

const getApprenticesRemunerations = (employees) => 
{
  let apprenticesRemunerations = employees.filter(employee => employee.trainingContract)
                                          .map(employee => employee.wage)
                                          .reduce((a,b) => a + b,0);
  return roundValue(apprenticesRemunerations,0);
}

const getEmployeesTrainingCompensations = (employees) => 
{
  let employeesTrainingsCompensations = employees.map(employee => employee.hourlyRate*employee.trainingHours)
                                          .reduce((a,b) => a + b,0);
  return roundValue(employeesTrainingsCompensations,0);
}