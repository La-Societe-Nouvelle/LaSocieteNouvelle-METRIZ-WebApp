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
import { getApprenticeshipRemunerations, getEmployeesTrainingCompensations, getGenderWageGap, getInterdecileRange } from "./ImportDSN";

/* -------------------- INDIVIDUALS DATA FOR SOCIAL FOOTPRINT -------------------- */

/*  The assessment tool is the same for IDR & GEQ
 *  it's also used for KNW with the training hourse and the training contracts
 */

/** Component in IndicatorSection
 *  Props :
 *    - impactsData
 *    - onGoBack -> close popup
 *  Behaviour :
 *    Edit indivualsData in state
 *    Update impacts data and footprints on validation
 *  State :
 *    inputs
 */

export class IndividualsDataPopup extends React.Component 
{
  constructor(props) 
  {
    super(props);
    this.state = {
      // gini index
      indexGini: props.impactsData.indexGini,
      // details
      hasEmployees: props.impactsData.hasEmployees,
      // individuals data
      individualsData: [...props.impactsData.individualsData],
      // display
      columnSorted: "id",
      reverseSort: false,
    };
  }

  render() 
  {
    const { individualsData } = this.state;
    const isAllValid = !individualsData.some((individualData) => ! checkIndividualData(individualData));

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
              {individualsData.map((individualData) => (
                <tr key={individualData.id}>
                  <td>
                    <i className="bi bi-trash3-fill"
                        onClick={() => this.removeIndividual(individualData.id)}/>
                  </td>
                  <Row
                    {...individualData}
                    isNewEmployeeRow={false}
                    updateSocialData={this.updateIndividualData.bind(this)}/>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="">
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={this.addEmployee}>
              <i className="bi bi-plus-lg"></i> Ajouter
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={this.deleteAll}>
              <i className="bi bi-trash3-fill"/> Supprimer tout
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
            disabled={!isAllValid || individualsData.length == 0}
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
    let {impactsData} = this.props;
    let {individualsData} = this.state;

    // indiividuals data
    impactsData.individualsData = individualsData;

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(impactsData.individualsData);
    await this.props.onUpdate("idr");

    // update geq data
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations = await getApprenticeshipRemunerations(individualsData);
    impactsData.knwDetails.employeesTrainingsCompensations = await getEmployeesTrainingCompensations(individualsData);
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
        .then((individualsData) => this.setState({individualsData}));
    
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
        .then((individualsData) => this.setState({individualsData}));

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

  /* ---------- MANAGE ROWS ---------- */

  deleteAll = () => this.setState({ individualsData: [] })

  removeIndividual = (id) => this.setState({individualsData: this.state.individualsData.filter((individualData) => individualData.id!=id)}); // use id instead

  addEmployee = () => 
  {
    const newIndividualData = {
      id: "_"+getNewId(this.state.individualsData.filter(individualData => individualData.id.startsWith("_")).map(item => ({id: item.id.substring(1)}))),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false,
    };
    this.setState({ individualsData: this.state.individualsData.concat([newIndividualData])});
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
  sortIndividuals(items, columSorted) {
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

  /* ---------- UPDATE INDIVIDUALS DATA ---------- */

  updateIndividualData = (nextProps) => 
  {
    let {individualsData} = this.state;
    let individualDataIndex = individualsData.findIndex(individualData => individualData.id==nextProps.id);
    if (individualDataIndex>=0) {
      individualsData[individualDataIndex] = {...individualsData[individualDataIndex], ...nextProps};
      this.setState({ individualsData });
    }
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
      apprenticeshipHours: props.apprenticeshipHours || null,
      apprenticeshipContract: props.apprenticeshipContract || false,
    };
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
      apprenticeshipHours,
      apprenticeshipContract,
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
            <option key="F" value="2">F</option>
            <option key="H" value="1">H</option>
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
            checked={apprenticeshipContract}
            onChange={this.updateApprenticeshipContract}/>
        </td>
        <td className="text-end">
          <InputNumber
            value={apprenticeshipHours}
            disabled={apprenticeshipContract}
            onUpdate={this.updateApprenticeshipHours}/>
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
    this.setState({ sex: input.target.value });
    this.props.updateSocialData({ id: this.props.id, sex: input.target.value });
  }

  updateWage = (input) => 
  {
    let wage = roundValue(input, 2);
    let nextProps = { wage };

    if (wage == null) {
      nextProps.hourlyRate = null;
    } else if (wage == 0) {
      nextProps.workingHours = 0;
      nextProps.hourlyRate = 0;
    } else if (this.state.workingHours >= 0) {  // wage + workingHours -> hourlyRate
      nextProps.hourlyRate = this.state.workingHours > 0 ? roundValue(wage / this.state.workingHours, 2) : null;
    } else if (this.state.hourlyRate >= 0) {    // wage + hourlyRate -> workingHours
      nextProps.workingHours = this.state.hourlyRate > 0 ? roundValue(wage * this.state.hourlyRate, 2) : null;
    }

    this.setState({...nextProps});
    this.props.updateSocialData({ id: this.props.id, ...nextProps });
  };

  updateWorkingHours = (input) => 
  {
    let workingHours = input!=null ? parseInt(input) : null;
    let nextProps = { workingHours };
    
    if (workingHours == null) {
      nextProps.hourlyRate = null;
    } else if (workingHours == 0) {
      nextProps.wage = 0;
      nextProps.hourlyRate = 0;
    } else if (this.state.wage >= 0) {
      nextProps.hourlyRate = roundValue(this.state.wage / workingHours, 2);
    } else if (this.state.hourlyRate >= 0) {
      nextProps.wage = roundValue(workingHours * this.state.hourlyRate, 2);
    }

    if (this.state.apprenticeshipContract) {
      nextProps.apprenticeshipHours = workingHours;
    }

    if (this.state.apprenticeshipHours>0 && workingHours!=null && this.state.apprenticeshipHours>workingHours) {
      nextProps.apprenticeshipHours = this.state.apprenticeshipContract ? workingHours : 0;
    }

    this.setState({...nextProps});
    this.props.updateSocialData({ id: this.props.id, ...nextProps });
  }

  updateHourlyRate = (input) => 
  {
    let hourlyRate = roundValue(input, 2);
    let nextProps = { hourlyRate };

    if (hourlyRate == null) {
      nextProps.wage = null;
    } else if (hourlyRate == 0) {
      nextProps.wage = 0;
    } else if (this.state.workingHours >= 0) {
      nextProps.wage = roundValue(this.state.workingHours * hourlyRate, 2);
    } else if (this.state.wage >= 0) {
      nextProps.workingHours = roundValue(this.state.wage / hourlyRate, 2);
    }

    this.setState({...nextProps});
    this.props.updateSocialData({ id: this.props.id, ...nextProps });
  }

  updateApprenticeshipContract = (event) => 
  {
    let apprenticeshipContract = event.target.checked;
    let apprenticeshipHours = apprenticeshipContract ? this.state.workingHours : 0;

    this.setState({ apprenticeshipContract, apprenticeshipHours });
    this.props.updateSocialData({ id: this.props.id, apprenticeshipContract, apprenticeshipHours });
  };

  updateApprenticeshipHours = (input) => 
  {
    let apprenticeshipHours = input!=null ? parseInt(input) : input;
    let nextProps = { apprenticeshipHours };

    
    if (apprenticeshipHours>0 && this.state.workingHours>0 && apprenticeshipHours>this.state.workingHours) {
      nextProps.apprenticeshipHours = this.state.workingHours;
    }

    this.setState({...nextProps});
    this.props.updateSocialData({ id: this.props.id, ...nextProps });
  }
}

/* -------------------- CHECK IF ALL DATA OK -------------------- */

const checkIndividualData = (individualData) => 
{
  if (individualData.sex!=1 && individualData.sex!=2) return false;
  else if (individualData.wage==null) return false;
  else if (individualData.workingHours==null) return false;
  else if (individualData.hourlyRate==null) return false;
  else return true;
}