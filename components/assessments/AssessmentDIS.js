// La Société Nouvelle

// React
import React from "react";
import { Table, Form } from "react-bootstrap";

// Readers / Writers
import { XLSXFileReader } from "/src/readers/XLSXReader";
import { SocialDataContentReader } from "/src/readers/SocialDataContentReader";
import { XLSXHeaderFileWriter } from "/src/writers/XLSXWriter";
import { CSVFileReader } from "/src/readers/CSVReader";
// Utils
import { InputText } from "/components/input/InputText";
import { InputNumber } from "/components/input/InputNumber";
import { valueOrDefault } from "/src/utils/Utils";
import { getNewId, roundValue } from "/src/utils/Utils";
import { XLSXSocialDataBuilder } from "../../src/readers/SocialDataContentReader";

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
    this.state = {
      // gini index
      indexGini: props.impactsData.indexGini,
      // details
      hasEmployees: props.impactsData.hasEmployees,
      employees: props.impactsData.employees,
      // display
      columnSorted: "id",
      reverseSort: false,
    };
  }

  componentDidUpdate(prevProps) 
  {
    if (prevProps.impactsData.employees != this.state.employees) {
      this.props.impactsData.employees = this.state.employees;
    }
  }

  render() 
  {
    const { employees, columnSorted } = this.state;
    const isAllValid = employees
      .map(
        (employee) =>
          employee.hourlyRate != null && employee.workingHours != null
      )
      .reduce((a, b) => a && b, true);

    //this.sortCompanies(employees, columnSorted);

    return (
      <div className="assessment">
        <div className="text-end mb-3">
          <button
            className="btn btn-light btn-sm me-1"
            onClick={() => document.getElementById("import-companies-csv").click()}>
            <i className="bi bi-upload"></i> Importer un fichier CSV
          </button>
          <input
            id="import-companies-csv"
            visibility="collapse"
            type="file"
            accept=".csv"
            onChange={this.importCSVFile}
          />
          <button
            className="btn btn-light btn-sm me-1"
            onClick={() => document.getElementById("import-companies-xlsx").click()}>
             <i className="bi bi-upload"></i>  Importer un fichier XLSX
          </button>
          <input
            id="import-companies-xlsx"
            visibility="collapse"
            type="file"
            accept=".xlsx"
            onChange={this.importXLSXFile}
          />
          <button
            className="btn btn-light btn-sm me-1"
            onClick={this.exportXLSXFile}>
             <i className="bi bi-download"></i> Télécharger modèle XLSX
          </button>

        </div>
            
        <div className="table-main">
          <Table size="sm" responsive>
            <thead>
              <tr>
                <td></td>
                <td onClick={() => this.changeColumnSorted("name")}>Nom</td>
                <td onClick={() => this.changeColumnSorted("sex")}>Sexe</td>
                <td onClick={() => this.changeColumnSorted("workingHours")}>
                  Heures travaillées (annuelles)
                </td>
                <td onClick={() => this.changeColumnSorted("wage")}>
                  Rémunération annuelle brute
                </td>
                <td onClick={() => this.changeColumnSorted("hourlyRate")}>
                  Taux horaire
                </td>
                <td onClick={() => this.changeColumnSorted("trainingContract")}>
                  Contrat de formation
                </td>
                <td onClick={() => this.changeColumnSorted("trainingHours")}>
                  Heures de formation
                </td>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td>
                    <i
                      className="bi bi-trash3-fill"
                      onClick={() => this.deleteEmployee(index)}/>
                  </td>
                  <Row
                    {...employee}
                    isNewEmployeeRow={false}
                    updateSocialData={this.updateSocialData.bind(this)}/>
                </tr>
              ))}
              {/* {employees.length == 0 && (
                <tr>
                  <td></td>
                  <Row
                  {...employees}
                    isNewEmployeeRow={true}
                    updateSocialData={this.updateSocialData.bind(this)}
                  />
                </tr>
              )} */}
         
            </tbody>
          </Table>
          <div className="">
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={this.addEmployee}>
              <i className="bi bi-plus-lg"></i> Ajouter
            </button>
            <button onClick={this.deleteAll} className="btn btn-secondary btn-sm">
              <i 
                className="bi bi-trash3-fill"/>
              Supprimer tout
          </button>
          </div>
        </div>
         <hr/>             
        <div className="view-footer text-end mt-2">
          <button
            className="btn btn-light me-2"
            onClick={() => this.props.onGoBack()}>
            <i className="bi bi-chevron-left"></i>
            Retour
          </button>
          <button
            className="btn btn-secondary "
            disabled={!isAllValid || employees.length == 0}
            onClick={() => this.onSubmit()}>
            Valider
          </button>
        </div>
      </div>
    );
  }

  /* ---------- HEADER ACTIONS ---------- */

  // Submit
  onSubmit = async () => 
  {
    let impactsData = this.props.impactsData;

    // update dis data
    //impactsData.indexGini = getIndexGini(impactsData.employees);
    //await this.props.onUpdate("dis");

    // update dis data
    impactsData.interdecileRange = getInterdecileRange(impactsData.employees);
    await this.props.onUpdate("idr");

    // update geq data
    impactsData.wageGap = getGenderWageGap(impactsData.employees);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = getApprenticesRemunerations(impactsData.employees);
    impactsData.knwDetails.employeesTrainingsCompensations = getEmployeesTrainingCompensations(impactsData.employees);
    await this.props.onUpdate("knw");

    this.props.onGoBack();
  };

  /* ---------- TABLE ACTIONS ---------- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () =>
      CSVFileReader(reader.result)
        .then((content) => SocialDataContentReader(content))
        .then((data) => this.setState({employees: data.employees}));
    
    reader.readAsText(file);
  };

  // Import XLSX File
  importXLSXFile = (event) => 
  {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () =>
      XLSXFileReader(reader.result)
        .then((XLSXData) => XLSXSocialDataBuilder(XLSXData))
        .then((socialData) => SocialDataContentReader(socialData))
        .then((data) => this.setState({employees: data.employees}));

    reader.readAsArrayBuffer(file);
  };

  // Export XLSX File (empty)
  exportXLSXFile = async () => 
  {
    let arrayHeader = [["Nom - Prénom", "Sexe (F/H)", "Heures travaillées", "Rémunérations brutes", "Taux horaire", "Contrat de formation (O/N)", "Heures de formation",,]];
    let fileProps = { wsclos: [ { wch: 40 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 },,]};

    // write file (Array -> ArrayBuffer)
    let file = await XLSXHeaderFileWriter(
      fileProps,
      "Collaborateurs",
      arrayHeader
    );

    // trig download
    let blob = new Blob([file], { type: "application/octet-stream" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Collaborateurs.xlsx";
    link.click();
  };

  // Delete all
  deleteAll = () => this.setState({ employees: [] })

  deleteEmployee = (index) => this.setState({employees: this.state.employees.filter((_, i) => i !== index)}); // use id instead

  addEmployee = () => 
  {
    const newEmployee = {
      id: getNewId(this.state.employees),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false,
    };
    this.setState({employees: this.state.employees.concat([newEmployee])});
  };

  /* ---------- TABLE DISPLAY ---------- */

  // Column for sorting
  changeColumnSorted(columnSorted) {
    if (columnSorted != this.state.columnSorted) {
      this.setState({ columnSorted: columnSorted, reverseSort: false });
    } else {
      this.setState({ reverseSort: !this.state.reverseSort });
    }
  }

  // Sorting
  sortCompanies(items, columSorted) {
    switch (columSorted) {
      case "id":
        items.sort((a, b) => a.id - b.id);
        break;
      case "name":
        items.sort((a, b) =>
          valueOrDefault(a.name, "").localeCompare(valueOrDefault(b.name, ""))
        );
        break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ---------- ROW ACTIONS ---------- */

  // Update -> needed ?
  updateSocialData = (nextProps) => 
  {
    let employee = this.props.impactsData.employees.filter((employee) => employee.id == nextProps.id)[0];
    if (employee == undefined) {
      this.addEmployee();
    } else {
      employee = {...employee, ...nextProps};
      //Object.entries(nextProps).forEach(([propName, propValue]) => employee[propName] = propValue);
    }
    //this.setState({ employees: this.props.impactsData.employees });
  };
}

/* -------------------- EMPLOYEE ROW -------------------- */

class Row extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      name: props.name || "",
      sex: props.sex || "",
      wage: props.wage || null,
      workingHours: props.workingHours || null,
      hourlyRate: props.hourlyRate || null,
      trainingHours: props.trainingHours || null,
      trainingContract: props.trainingContract || false,
    };
  }

  componentDidUpdate(prevProps) 
  {
    if (prevProps !== this.props) {
      this.setState({
        name: this.props.isNewEmployeeRow ? "" : this.props.name || "",
        sex: this.props.sex || "",
        wage: this.props.wage || null,
        workingHours: this.props.workingHours || null,
        hourlyRate: this.props.hourlyRate || null,
        trainingHours: this.props.trainingHours || null,
        trainingContract: this.props.trainingContract || false,
      });
    }
  }

  render() 
  {
    const { id } = this.props;
    const {
      name,
      sex,
      wage,
      workingHours,
      hourlyRate,
      trainingHours,
      trainingContract,
    } = this.state;

    const isValid = hourlyRate != null && workingHours != null;

    return (
      <>
        <td  className={"long "+(!this.props.isNewEmployeeRow ? isValid ? "success" : "error" : "")}>
        <InputText 
          value={name} 
          onUpdate={this.updateName}/>
        </td>
        <td className=" text-center">
        <Form.Select 
          className="mb-3" 
          value={sex} 
          onChange={this.updateSex}>
            <option key="" value="">{" "}-{" "}</option>
            <option key="F" value="F">F</option>
            <option key="H" value="H">H</option>
            {sex == null && (<option key="" value=""> - </option>)}
        </Form.Select>
        </td>
        <td className="text-end">
          <InputNumber
            value={workingHours}
            onUpdate={this.updateWorkingHours}/>
        </td>
        <td className="text-end">
          <InputNumber 
            value={wage} 
            onUpdate={this.updateWage}/>
        </td>
        <td className="text-end">
          <InputNumber
            value={hourlyRate}
            onUpdate={this.updateHourlyRate}/>
        </td>
        <td className="text-center">
          <Form.Check
            type="checkbox"
            value={id}
            checked={trainingContract}
            onChange={this.updateTrainingContract}/>
        </td>
        <td className="text-end">
          <InputNumber
            value={trainingHours}
            disabled={trainingContract}
            onUpdate={this.updateTrainingHours}/>
        </td>
      </>
    );
  }

  /* --- UPDATES --- */

  updateName = (input) => {
    this.setState({ name: input });
    this.props.updateSocialData({ id: this.props.id, name: input });
  };

  updateSex = (input) =>{
    this.props.updateSocialData({ id: this.props.id, sex: input.target.value });
  }

  updateWage = (input) => 
  {
    let wage = roundValue(input, 2);

    if (wage == null) {
      this.props.updateSocialData({ id: this.props.id, wage: null, hourlyRate: null });
    }
    else if (wage == 0) {
      this.props.updateSocialData({ id: this.props.id, wage: 0, workingHours: 0, hourlyRate: 0 });
    }
    else if (this.state.workingHours >= 0) {
      let hourlyRate = this.state.workingHours > 0 ? roundValue(wage / this.state.hourlyRate, 2) : null;
      this.props.updateSocialData({ id: this.props.id, wage, hourlyRate });
    }
    else if (this.state.hourlyRate >= 0) {
      let workingHours = this.state.hourlyRate > 0 ? roundValue(wage * this.state.hourlyRate, 2) : null;
      this.props.updateSocialData({ id: this.props.id, wage, workingHours });
    }
    else {
      this.props.updateSocialData({ id: this.props.id, wage });
    }
  };

  updateWorkingHours = (input) => 
  {
    let workingHours = parseInt(input);

    if (workingHours == null) {
      this.props.updateSocialData({ id: this.props.id, workingHours: null, hourlyRate: null });
    }
    else if (workingHours == 0) {
      this.props.updateSocialData({ id: this.props.id, workingHours: 0, wage: 0, hourlyRate: 0 });
    } 
    else if (this.state.wage >= 0) {
      let hourlyRate = roundValue(this.state.wage / workingHours, 2);
      this.props.updateSocialData({ id: this.props.id, workingHours, hourlyRate });
    }
    else if (this.state.hourlyRate >= 0) {
      let wage = roundValue(workingHours * this.state.hourlyRate, 2);
      this.props.updateSocialData({ id: this.props.id, workingHours, wage });
    }
    else {
      this.props.updateSocialData({ id: this.props.id, workingHours });
    }

  };

  updateHourlyRate = (input) => 
  {
    let hourlyRate = roundValue(input, 2);

    if (hourlyRate == null) {
      this.props.updateSocialData({ id: this.props.id, hourlyRate: null, wage: null });
    }
    else if (hourlyRate == 0) {
      this.props.updateSocialData({ id: this.props.id, hourlyRate: 0, wage: 0 });
    } 
    else if (this.state.workingHours >= 0) {
      let wage = roundValue(this.state.workingHours * hourlyRate, 2);
      this.props.updateSocialData({ id: this.props.id, hourlyRate, wage });
    }
    else if (this.state.wage >= 0) {
      let workingHours = roundValue(this.state.wage / hourlyRate, 2);
      this.props.updateSocialData({ id: this.props.id, hourlyRate, workingHours });
    }
    else {
      this.props.updateSocialData({ id: this.props.id, hourlyRate });
    }
  };

  updateTrainingContract = (event) => 
  {
    let trainingContract = event.target.checked;
    if (trainingContract) {
      this.props.updateSocialData({ id: this.props.id, trainingContract, trainingHours: null })
    } else {
      this.props.updateSocialData({ id: this.props.id, trainingContract, trainingHours: 0})
    }
  };

  updateTrainingHours = (input) => {
    let trainingHours = parseInt(input);

    if (trainingHours == null || this.state.workingHours == null) {
      this.props.updateSocialData({ id: this.props.id, trainingHours: 0 })
    }
    else if (trainingHours > this.state.workingHours) {
      this.props.updateSocialData({ id: this.props.id, trainingHours: this.state.workingHours })
    }
    else {
      this.props.updateSocialData({ id: this.props.id, trainingHours });
    }
  }
}

/* -------------------- LOADER -------------------- */

// const SocialDataContentReader_ = async (content) =>
//   // ...build data from JSON content
//   {
//     console.log(content);

//     let employees = [];

//     Object.entries(content).forEach(([index, contentItem]) => 
//     {
//       let employeeData = {
//         id: index,
//         name: contentItem["Nom - Prénom"] || contentItem.nom || "",
//         sex: /^(F|H)$/.match(contentItem["Sexe (F/H)"]) ? contentItem.sexe : "",
//         workingHours:
//           contentItem["Heures travaillées"] ||
//           contentItem.heuresTravail ||
//           null,
//         wage:
//           contentItem["Rémunérations brutes"] ||
//           contentItem.remuneration ||
//           null,
//         hourlyRate:
//           contentItem["Taux horaire"] || contentItem.tauxHoraire || null,
//         trainingContract:
//           contentItem["Contrat de formation (O/N)"] ||
//           contentItem.contratFormation ||
//           false,
//         trainingHours:
//           contentItem["Heures de formation"] ||
//           contentItem.heuresFormation ||
//           0,
//       };
//       employees.push(employeeData);
//     });

//     return { employees };
//   };

/* -------------------- FORMULAS -------------------- */

// Coefficient de GINI
const getIndexGini = (employees) => {
  // order acoording to the hourly rate
  employees.sort((a, b) => a.hourlyRate - b.hourlyRate);

  // Nombre total d'heures travaillées
  let n = parseInt(
    employees
      .map((employee) => parseInt(employee.workingHours))
      .reduce((a, b) => a + b, 0)
  );

  let s1 = 0;
  let s2 = 0;
  let i = 0;

  employees.forEach((employee) => {
    // S1
    for (let j = 1; j <= parseInt(employee.workingHours); j++) {
      s1 += (i + j) * employee.hourlyRate;
    }
    i += parseInt(employee.workingHours);
    // S2
    s2 += parseInt(employee.workingHours) * employee.hourlyRate;
  });

  let indexGini = Math.abs((2 * s1) / (n * s2) - (n + 1) / n) * 100;

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

  return roundValue(indexGini, 1);
};

// Ecart de rémunération F/H
const getGenderWageGap = (employees) => {
  const women = employees.filter((employee) => employee.sex == "F");
  const men = employees.filter((employee) => employee.sex == "H");

  if (men.length > 0 && women.length > 0) {
    let hourlyRateWomen =
      women
        .map((employee) => parseFloat(employee.wage))
        .reduce((a, b) => a + b, 0) /
      women
        .map((employee) => parseInt(employee.workingHours))
        .reduce((a, b) => a + b, 0);
    let hourlyRateMen =
      men
        .map((employee) => parseFloat(employee.wage))
        .reduce((a, b) => a + b, 0) /
      men
        .map((employee) => parseInt(employee.workingHours))
        .reduce((a, b) => a + b, 0);
    let hourlyRateEmployees =
      employees
        .map((employee) => parseFloat(employee.wage))
        .reduce((a, b) => a + b, 0) /
      employees
        .map((employee) => parseInt(employee.workingHours))
        .reduce((a, b) => a + b, 0);

    let wageGap =
      (Math.abs(hourlyRateMen - hourlyRateWomen) / hourlyRateEmployees) * 100;
    return roundValue(wageGap, 1);
  } else {
    return 0;
  }
};

// Rémunérations liées à des contrats d'apprentissage (stage, alternance, etc.)
const getApprenticesRemunerations = (employees) => {
  let apprenticesRemunerations = employees
    .filter((employee) => employee.trainingContract)
    .map((employee) => employee.wage || 0)
    .reduce((a, b) => a + b, 0);
  return roundValue(apprenticesRemunerations, 0);
};

// Rémunérations liées à des heures de formation
const getEmployeesTrainingCompensations = (employees) => {
  let employeesTrainingsCompensations = employees
    .filter((employee) => !employee.trainingContract)
    .map(
      (employee) => (employee.hourlyRate || 0) * (employee.trainingHours || 0)
    )
    .reduce((a, b) => a + b, 0);
  return roundValue(employeesTrainingsCompensations, 0);
};


const getInterdecileRange = async (employees) =>
{
  employees = employees.filter(employee => employee.hourlyRate!=null).sort((a,b) => a.hourlyRate - b.hourlyRate);
  let totalHours = getSumItems(employees.map(employee => employee.workingHours), 0);

  if (employees.length < 2 || totalHours==0) return 1;

  // Limits
  let limitD1 = Math.round(totalHours*0.1);
  let limitD9 = Math.round(totalHours*0.9);

  // D1
  let indexEmployeeD1 = 0;
  let hoursD1 = employees[indexEmployeeD1].workingHours;
  while (hoursD1 < limitD1 && indexEmployeeD1 < employees.length) {
    indexEmployeeD1+=1;
    hoursD1+= employees[indexEmployeeD1].workingHours;
  }
  let hourlyRateD1 = employees[indexEmployeeD1].hourlyRate;

  // D9
  let indexEmployeeD9 = 0;
  let hoursD9 = employees[indexEmployeeD9].workingHours;
  while (hoursD9 < limitD9 && indexEmployeeD9 < employees.length) {
    indexEmployeeD9+=1;
    hoursD9+= employees[indexEmployeeD9].workingHours;
  }
  let hourlyRateD9 = employees[indexEmployeeD9].hourlyRate;

  // Interdecile range
  let interdecileRange = roundValue(hourlyRateD9/hourlyRateD1,2);
  return interdecileRange;
}