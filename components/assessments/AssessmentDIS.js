// La Société Nouvelle

// React
import React from 'react';
import { Table, Form } from 'react-bootstrap';

// Readers / Writers
import { XLSXFileReader } from '/src/readers/XLSXReader'
import { SocialDataContentReader } from '/src/readers/SocialDataContentReader';
import { XLSXHeaderFileWriter } from '/src/writers/XLSXWriter';

// Utils
import { InputText } from '/components/input/InputText';
import { InputNumber } from '/components/input/InputNumber';
import { valueOrDefault } from '/src/utils/Utils';
import { getNewId,roundValue } from '/src/utils/Utils';

/* -------------------- ASSESSMENT DIS -------------------- */

/* The assessment tool is the same for DIS & GEQ
   it's also used for KNW with the training hourse and the training contracts 
*/

/** Component in IndicatorSection
 *  Props : 
 *    - impactsData
 *    - onGoBack -> close popup
 *  Behaviour :
 *    Edit directly impactsData (session) on inputs blur
 *    Redirect to assessment tool (if defined)
 *    Update footprints on validation
 *  State :
 *    inputs
 */

export class AssessmentDIS extends React.Component {

  constructor(props) {
    super(props);
    this.state = 
    {
      // gini index
      indexGini: props.impactsData.indexGini,
      // details
      hasEmployees: props.impactsData.hasEmployees,
      employees: props.impactsData.employees,
      // display
      columnSorted: "id",
      reverseSort: false,
    }
  }

  render() 
  {
    const {employees,columnSorted} = this.state;

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
      <div className="assessment">

          <div className="actions text-end mb-1">
            <button onClick={() => document.getElementById('import-companies-csv').click()} className="btn btn-primary btn-sm me-1">
              Importer un fichier CSV
            </button>
            <input id="import-companies-csv" visibility="collapse"
                    type="file" accept=".csv" 
                    onChange={this.importCSVFile}/>
            <button onClick={() => document.getElementById('import-companies-xlsx').click()} className="btn btn-primary btn-sm me-1">
              Importer un fichier XLSX
            </button>
              <input id="import-companies-xlsx" visibility="collapse"
                      type="file" accept=".xlsx" 
                      onChange={this.importXLSXFile}/>
            <button onClick={this.exportXLSXFile} className="btn btn-primary btn-sm me-1">
              Télécharger modèle XLSX
            </button>
            <button onClick={this.deleteAll} className="btn btn-secondary btn-sm">
                Supprimer tout
              </button>
          </div>

          <div className="table-main">
            <Table size="sm" responsive>
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
                {employees.map((employee) => 
                  <Row key={"company_"+employee.id} 
                      {...employee}
                      isNewEmployeeRow={false}
                      updateSocialData={this.updateSocialData.bind(this)}/>)}
                  <Row key="new_employee"
                      {...newEmployee}
                      isNewEmployeeRow={true}
                      updateSocialData={this.updateSocialData.bind(this)}/>
              </tbody>
            </Table>

          </div>
          

        <div className="view-footer">
        <button className="btn btn-sm" 
                  onClick = {() => this.props.onGoBack()}><i class="bi bi-chevron-left"></i> Retour</button>
          <button className="btn btn-secondary btn-sm"
                  disabled={!isAllValid}
                  onClick = {() => this.onSubmit()}>Valider</button>
        </div>

      </div>
    )
  }

  /* ---------- HEADER ACTIONS ---------- */

  // Submit
  onSubmit = async () => 
  {
    let impactsData = this.props.impactsData;

    // update dis data
    impactsData.indexGini = getIndexGini(impactsData.employees),1;
    await this.props.onUpdate("dis");

    // update geq data
    impactsData.wageGap = getGenderWageGap(impactsData.employees);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = getApprenticesRemunerations(impactsData.employees);
    impactsData.knwDetails.employeesTrainingsCompensations = getEmployeesTrainingCompensations(impactsData.employees);
    await this.props.onUpdate("knw");
    
    this.props.onGoBack();
  }

  /* ---------- TABLE ACTIONS ---------- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((content) => SocialDataContentReader(content))
        .then((data) => this.props.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.impactsData.employees}));
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
        .then((data) => this.props.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.impactsData.employees}));
    reader.readAsArrayBuffer(file);
  }

  // Export XLSX File
  exportXLSXFile = async () =>
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
  
  // Delete all
  deleteAll = () =>
  {
    this.props.impactsData.employees = [];
    this.setState({employees: []});
  }

  /* ---------- TABLE DISPLAY ---------- */

  // Column for sorting
  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})} 
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  // Sorting
  sortCompanies(items,columSorted) 
  {
    switch(columSorted) 
    {
      case "id": items.sort((a,b) => a.id - b.id); break;
      case "name": items.sort((a,b) => valueOrDefault(a.name,"").localeCompare(valueOrDefault(b.name,""))); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ---------- ROW ACTIONS ---------- */

  // Update
  updateSocialData = (nextProps) => 
  {
    let employee = this.props.impactsData.employees.filter(employee => employee.id == nextProps.id)[0];
    if (employee==undefined) {
      employee = {
        id: getNewId(this.props.impactsData.employees),
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
    this.setState({employees: this.props.impactsData.employees});
  }

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
  {
    console.log(sex)
  }
        <td className="short center">
          <Form.Select value={sex} onChange={this.updateSex}>
            <option key="" value=""> - </option>
            <option key="F" value="F">F</option>
            <option key="H" value="H">H</option>
            {sex==null && <option key="" value="">-</option>}
          </Form.Select></td>

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
                       disabled={trainingContract}
                       onUpdate={this.updateTrainingHours.bind(this)}/>
        </td>

      </tr>
    )
  }

  /* --- UPDATES --- */

  updateName = (input) => {
    this.props.updateSocialData({id: this.props.id, name: input});
    this.setState({name: input});
  }

  updateSex = (input) => this.props.updateSocialData({id: this.props.id, sex: input.target.value})

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
    if (event.target.checked) this.updateTrainingHours(null)
  }

  updateTrainingHours = (input) => this.props.updateSocialData({id: this.props.id, trainingHours: input})

}

/* -------------------- LOADER -------------------- */

const SocialDataContentReader_ = async (content) =>
// ...build data from JSON content
{
  let employees = [];
  
  Object.entries(content).forEach(([index,contentItem]) => 
  {
    let employeeData = 
    {
      id: index,
      name: contentItem['Nom - Prénom'] || contentItem.nom || "",
      sex: contentItem['Sexe (F/H)'] || contentItem.sexe || "",
      workingHours: contentItem['Heures travaillées'] || contentItem.heuresTravail || null,
      wage: contentItem['Rémunérations brutes'] || contentItem.remuneration || null,
      hourlyRate: contentItem['Taux horaire'] || contentItem.tauxHoraire || null,
      trainingContract: contentItem['Contrat de formation (O/N)'] || contentItem.contratFormation || false,
      trainingHours: contentItem['Heures de formation'] || contentItem.heuresFormation || 0
    }
    employees.push(employeeData);
  })

  return {employees};
}

/* -------------------- FORMULAS -------------------- */

// Coefficient de GINI
const getIndexGini = (employees) => 
{
  // order acoording to the hourly rate
  employees.sort((a,b) => a.hourlyRate - b.hourlyRate);

  // Nombre total d'heures travaillées
  let n = parseInt(employees.map(employee => parseInt(employee.workingHours)).reduce((a,b) => a + b,0));
  
  let s1 = 0;
  let s2 = 0;
  let i = 0;

  employees.forEach(employee =>
  {
    // S1
    for (let j = 1; j <= parseInt(employee.workingHours); j++) {
      s1+= (i+j)*employee.hourlyRate;
    }
    i+= parseInt(employee.workingHours);
    // S2
    s2+= parseInt(employee.workingHours)*employee.hourlyRate;
  })
  
  let indexGini = Math.abs( ( (2*s1)/(n*s2) ) - (n+1)/n ) *100;
  
  /*-- Other formula

  // Nombre total d'heures travaillées
  let total_workingHours = employees.map(employee => employee.workingHours).reduce((a,b) => a + b,0);
  let total_wage = employees.map(employee => employee.wage).reduce((a,b) => a + b,0);
  
  let s = 0;
  let cumul_wage = 0;

  employees.forEach(employee =>
  {
    s+= (parseInt(employee.workingHours)/total_workingHours) * ((employee.wage)/total_wage);
    console.log(s);
    cumul_wage+=employee.wage;
  })

  let indexGini = Math.abs(s-1)*100; */
  
  return roundValue(indexGini,1);
}

// Ecart de rémunération F/H
const getGenderWageGap = (employees) => 
{
  const women = employees.filter(employee => employee.sex == "F");
  const men = employees.filter(employee => employee.sex == "H");

  if (men.length > 0 && women.length > 0)
  {
    let hourlyRateWomen = women.map(employee => parseFloat(employee.wage)).reduce((a,b) => a + b,0) / women.map(employee => parseInt(employee.workingHours)).reduce((a,b) => a + b,0);
    let hourlyRateMen = men.map(employee => parseFloat(employee.wage)).reduce((a,b) => a + b,0) / men.map(employee => parseInt(employee.workingHours)).reduce((a,b) => a + b,0);
    let hourlyRateEmployees = employees.map(employee => parseFloat(employee.wage)).reduce((a,b) => a + b,0) / employees.map(employee => parseInt(employee.workingHours)).reduce((a,b) => a + b,0);
    
    let wageGap = Math.abs(hourlyRateMen-hourlyRateWomen)/hourlyRateEmployees *100;
    return roundValue(wageGap,1);
  }
  else {return 0}
}

// Rémunérations liées à des contrats d'apprentissage (stage, alternance, etc.)
const getApprenticesRemunerations = (employees) => 
{
  let apprenticesRemunerations = employees.filter(employee => employee.trainingContract)
                                          .map(employee => employee.wage || 0)
                                          .reduce((a,b) => a + b,0);
  return roundValue(apprenticesRemunerations,0);
}

// Rémunérations liées à des heures de formation
const getEmployeesTrainingCompensations = (employees) => 
{
  let employeesTrainingsCompensations = employees.filter(employee => !employee.trainingContract)
                                                 .map(employee => (employee.hourlyRate || 0)*(employee.trainingHours || 0))
                                                 .reduce((a,b) => a + b,0);
  return roundValue(employeesTrainingsCompensations,0);
}