// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";

// Utils
import { getNewId, } from "/src/utils/Utils";
import {
  getApprenticeshipRemunerations,
  getEmployeesTrainingCompensations,
  getGenderWageGap,
  getIndividualsData,
  getInterdecileRange,
} from "./ImportDSN";
import TableRow from "../components/TableRow";

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

export class IndividualsData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // individuals data
      individualsData: [...props.impactsData.individualsData],

    };
  }

  componentDidMount = async () => {
    if (
      this.props.impactsData.socialStatements.length > 0 &&
      this.props.impactsData.individualsData.length == 0
    ) {
      let individualsData = await getIndividualsData(
        this.props.impactsData.socialStatements
      );
      this.setState({ individualsData });
    }
  };

  render() {
    const { individualsData } = this.state;
    const isAllValid = !individualsData.some(
      (individualData) => !checkIndividualData(individualData)
    );

    return (
      <div className="assessment">
        <Table size="sm" responsive>
          <thead>
            <tr>
              <td></td>
              <td>Nom</td>
              <td>Sexe</td>
              <td>Heures travaillées (annuelles)</td>
              <td>Rémunération annuelle brute</td>
              <td>Taux horaire</td>
              <td>Contrat de formation</td>
              <td>Heures de formation</td>
            </tr>
          </thead>
          <tbody>
            {individualsData.map((individualData) => (
              <tr key={individualData.id}>
                <td>
                  <i
                    className="bi bi-trash3-fill"
                    onClick={() => this.removeIndividual(individualData.id)}
                  />
                </td>
                <TableRow
                  {...individualData}
                  isNewEmployeeRow={false}
                  updateSocialData={this.updateIndividualData.bind(this)}
                />
              </tr>
            ))}
          </tbody>
        </Table>

        <button
          className="btn btn-primary btn-sm me-2"
          onClick={this.addEmployee}
        >
          <i className="bi bi-plus-lg"></i> Ajouter
        </button>
        <button className="btn btn-secondary btn-sm" onClick={this.deleteAll}>
          <i className="bi bi-trash3-fill" /> Supprimer tout
        </button>

        <hr />
        <div className="view-footer text-end mt-2">
          <button
            className="btn btn-secondary "
            disabled={!isAllValid || individualsData.length == 0}
            onClick={() => this.onSubmit()}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  /* ---------- HEADER ACTIONS ---------- */

  // Submit
  onSubmit = async () => {
    let { impactsData } = this.props;
    let { individualsData } = this.state;

    // indiividuals data
    impactsData.individualsData = individualsData;

    // update idr data
    impactsData.interdecileRange = await getInterdecileRange(
      impactsData.individualsData
    );
    await this.props.onUpdate("idr");

    // update geq data
    impactsData.wageGap = await getGenderWageGap(impactsData.individualsData);
    await this.props.onUpdate("geq");

    // update knw data
    impactsData.knwDetails.apprenticesRemunerations =
      await getApprenticeshipRemunerations(individualsData);
    impactsData.knwDetails.employeesTrainingsCompensations =
      await getEmployeesTrainingCompensations(individualsData);
    await this.props.onUpdate("knw");

    this.props.onGoBack();
  };

  /* ---------- MANAGE ROWS ---------- */

  deleteAll = () => this.setState({ individualsData: [] });

  removeIndividual = (id) =>
    this.setState({
      individualsData: this.state.individualsData.filter(
        (individualData) => individualData.id != id
      ),
    }); // use id instead

  addEmployee = () => {
    const newIndividualData = {
      id:
        "_" +
        getNewId(
          this.state.individualsData
            .filter((individualData) => individualData.id.startsWith("_"))
            .map((item) => ({ id: item.id.substring(1) }))
        ),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false,
    };
    this.setState({
      individualsData: this.state.individualsData.concat([newIndividualData]),
    });
  };

  /* ---------- UPDATE INDIVIDUALS DATA ---------- */

  updateIndividualData = (nextProps) => {
    let { individualsData } = this.state;
    let individualDataIndex = individualsData.findIndex(
      (individualData) => individualData.id == nextProps.id
    );
    if (individualDataIndex >= 0) {
      individualsData[individualDataIndex] = {
        ...individualsData[individualDataIndex],
        ...nextProps,
      };
      this.setState({ individualsData });
    }
  };
}

/* -------------------- EMPLOYEE ROW -------------------- */

// class TableRow extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       name: props.name || "",
//       sex: props.sex || "",
//       wage: props.wage || null,
//       workingHours: props.workingHours || null,
//       hourlyRate: props.hourlyRate || null,
//       apprenticeshipHours: props.apprenticeshipHours || null,
//       apprenticeshipContract: props.apprenticeshipContract || false,
//     };
//   }

//   render() {
//     const { id } = this.props;
//     const {
//       name,
//       sex,
//       wage,
//       workingHours,
//       hourlyRate,
//       apprenticeshipHours,
//       apprenticeshipContract,
//     } = this.state;

//     const isValid = hourlyRate != null && workingHours != null;

//     return (
//       <>
//         <td

//         >
//           <Form.Control
//             className="form-control-sm"
//             type="text"
//             value={name}
//             onChange={this.updateName}
//           />
//         </td>
//         <td>
//           <Form.Select value={sex} onChange={this.updateSex} size="sm"             isInvalid={!isValid }
// >
//             <option key="" value="">
//               {" "}
//               -{" "}
//             </option>
//             <option key="F" value="2">
//               F
//             </option>
//             <option key="H" value="1">
//               H
//             </option>
//           </Form.Select>
//         </td>
//         <td>
//           <Form.Control
//             className="form-control-sm"
//             type="text"
//             value={workingHours}
//             onChange={this.updateWorkingHours}
//           />
//         </td>
//         <td>
//           <Form.Control
//             className="form-control-sm"
//             type="text"
//             value={wage}
//             onChange={this.updateWage}
//           />
//         </td>
//         <td>
//           <Form.Control
//             className="form-control-sm"
//             type="text"
//             value={hourlyRate}
//             onChange={this.updateHourlyRate}
//           />
//         </td>
//         <td className="text-center">
//           <Form.Check
//             type="checkbox"
//             value={id}
//             checked={apprenticeshipContract}
//             onChange={this.updateApprenticeshipContract}
//           />
//         </td>
//         <td>
//           <Form.Control
//             className="form-control-sm"
//             type="text"
//             value={apprenticeshipHours}
//             disabled={apprenticeshipContract}
//             onChange={this.updateApprenticeshipHours}
//           />
//         </td>
//       </>
//     );
//   }

//   /* --- UPDATES --- */

//   updateName = (input) => {
//     this.setState({ name: input });
//     this.props.updateSocialData({ id: this.props.id, name: input });
//   };

//   updateSex = (input) => {
//     this.setState({ sex: input.target.value });
//     this.props.updateSocialData({ id: this.props.id, sex: input.target.value });
//   };

//   updateWage = (input) => {
//     let wage = roundValue(input, 2);
//     let nextProps = { wage };

//     if (wage == null) {
//       nextProps.hourlyRate = null;
//     } else if (wage == 0) {
//       nextProps.workingHours = 0;
//       nextProps.hourlyRate = 0;
//     } else if (this.state.workingHours >= 0) {
//       // wage + workingHours -> hourlyRate
//       nextProps.hourlyRate =
//         this.state.workingHours > 0
//           ? roundValue(wage / this.state.workingHours, 2)
//           : null;
//     } else if (this.state.hourlyRate >= 0) {
//       // wage + hourlyRate -> workingHours
//       nextProps.workingHours =
//         this.state.hourlyRate > 0
//           ? roundValue(wage * this.state.hourlyRate, 2)
//           : null;
//     }

//     this.setState({ ...nextProps });
//     this.props.updateSocialData({ id: this.props.id, ...nextProps });
//   };

//   updateWorkingHours = (input) => {
//     let workingHours = input != null ? parseInt(input) : null;
//     let nextProps = { workingHours };

//     if (workingHours == null) {
//       nextProps.hourlyRate = null;
//     } else if (workingHours == 0) {
//       nextProps.wage = 0;
//       nextProps.hourlyRate = 0;
//     } else if (this.state.wage >= 0) {
//       nextProps.hourlyRate = roundValue(this.state.wage / workingHours, 2);
//     } else if (this.state.hourlyRate >= 0) {
//       nextProps.wage = roundValue(workingHours * this.state.hourlyRate, 2);
//     }

//     if (this.state.apprenticeshipContract) {
//       nextProps.apprenticeshipHours = workingHours;
//     }

//     if (
//       this.state.apprenticeshipHours > 0 &&
//       workingHours != null &&
//       this.state.apprenticeshipHours > workingHours
//     ) {
//       nextProps.apprenticeshipHours = this.state.apprenticeshipContract
//         ? workingHours
//         : 0;
//     }

//     this.setState({ ...nextProps });
//     this.props.updateSocialData({ id: this.props.id, ...nextProps });
//   };

//   updateHourlyRate = (input) => {
//     let hourlyRate = roundValue(input, 2);
//     let nextProps = { hourlyRate };

//     if (hourlyRate == null) {
//       nextProps.wage = null;
//     } else if (hourlyRate == 0) {
//       nextProps.wage = 0;
//     } else if (this.state.workingHours >= 0) {
//       nextProps.wage = roundValue(this.state.workingHours * hourlyRate, 2);
//     } else if (this.state.wage >= 0) {
//       nextProps.workingHours = roundValue(this.state.wage / hourlyRate, 2);
//     }

//     this.setState({ ...nextProps });
//     this.props.updateSocialData({ id: this.props.id, ...nextProps });
//   };

//   updateApprenticeshipContract = (event) => {
//     let apprenticeshipContract = event.target.checked;
//     let apprenticeshipHours = apprenticeshipContract
//       ? this.state.workingHours
//       : 0;

//     this.setState({ apprenticeshipContract, apprenticeshipHours });
//     this.props.updateSocialData({
//       id: this.props.id,
//       apprenticeshipContract,
//       apprenticeshipHours,
//     });
//   };

//   updateApprenticeshipHours = (input) => {
//     let apprenticeshipHours = input != null ? parseInt(input) : input;
//     let nextProps = { apprenticeshipHours };

//     if (
//       apprenticeshipHours > 0 &&
//       this.state.workingHours > 0 &&
//       apprenticeshipHours > this.state.workingHours
//     ) {
//       nextProps.apprenticeshipHours = this.state.workingHours;
//     }

//     this.setState({ ...nextProps });
//     this.props.updateSocialData({ id: this.props.id, ...nextProps });
//   };
// }

/* -------------------- CHECK IF ALL DATA OK -------------------- */

const checkIndividualData = (individualData) => {
  if (individualData.sex != 1 && individualData.sex != 2) return false;
  else if (individualData.wage == null) return false;
  else if (individualData.workingHours == null) return false;
  else if (individualData.hourlyRate == null) return false;
  else return true;
};
