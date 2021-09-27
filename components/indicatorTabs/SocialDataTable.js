// La Société Nouvelle

// React
import React from 'react';

// Components
import { InputNumber } from '../InputNumber';
import { InputText } from '../InputText';

// Other sources
import { XLSXFileWriterFromJSON, XLSXHeaderFileWriter } from '../../src/writers/XLSXWriter';

/* ----------------------------------------------------------- */
/* -------------------- SOCIAL DATA TABLE -------------------- */
/* ----------------------------------------------------------- */
/* ---------- TABLE ---------- */

export class TableSocialData extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      columnSorted: "name",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      employeeToEdit: null,
    }
  }

  render() 
  {
    const {employees} = this.props;
    const {columnSorted,nbItems,page} = this.state;

    this.sortEmployees(employees,columnSorted);

    return (
      <div className="group"><h3>Liste des collaborateurs</h3>

        <div className="actions">
          <button onClick={exportXLSXFile}>
            Télécharger modèle XLSX
          </button>
          <button onClick={() => this.triggerEditor()}>Ajouter un collaborateur</button>
          {employees.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>

        {employees.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("name")}>Nom - Prénom</td>
                  <td className="auto" onClick={() => this.changeColumnSorted("sex")}>Sexe</td>
                  <td className="auto" onClick={() => this.changeColumnSorted("wage")}>Rémunération annuelle brute (en €)</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("hours")}>Nombre d'heures travaillées</td>
                  <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("trainingContract")}>Contrat de formation</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("trainingHours")}>Nombre d'heures de formation</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {employees.slice(page*nbItems,(page+1)*nbItems)
                          .map(employee => {
                    return(<EmployeeRow key={"employee_"+employee.id} 
                                       {...employee}
                                       onUpdate={this.updateEmployee.bind(this)}
                                       onDelete={this.deleteEmployee.bind(this)}/>)
                })}
              </tbody>
            </table>
            {employees.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < employees.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>}

        {showEditor &&
          <EmployeePopup {...employeeToEdit}
                        onAdd={this.addEmployee.bind(this)}
                        onUpdate={this.updateEmployee.bind(this)}
                        onClose={this.closeEditor.bind(this)}/>}

      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, employeeToEdit: null}) // New Expense
  closeEditor = () => this.setState({showEditor: false})
  
  // Remove all expenses
  removeAll = () => {this.props.financialData.removeExpenses();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortEmployees(employees,columSorted) 
  {
    switch(columSorted) {
      case "name": employees.sort((a,b) => a.name.localeCompare(b.name)); break;
      case "sex": employees.sort((a,b) => a.sex.localeCompare(b.sex)); break;
      case "wage": employees.sort((a,b) => b.wage - a.wage); break;
      case "hours": employees.sort((a,b) => b.hours - a.hours); break;
    }
    if (this.state.reverseSort) employees.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.expenses.length) this.setState({page: this.state.page+1})}

  /* ----- OPERATIONS ON EMPLOYEE ----- */

  updateEmployee = (id) => {this.setState({showEditor: true, employeeToEdit: this.props.employees.filer(employee => employee.id==id)})}
  async addEmployee(props) {await this.props.employees.addExpense(props);this.props.onUpdate();this.forceUpdate()}
  async updateEmployee(nextProps) {await this.props.financialData.updateExpense(nextProps);this.props.onUpdate();this.forceUpdate()}
  deleteEmployee = (id) => {this.props.financialData.removeExpense(id);this.props.onUpdate();this.forceUpdate()}

}

/* ---------- ROW EXPENSE ---------- */

function EmployeeRow(props) 
{
  const {name,sex,wage,hours} = props
  
  const updateEmployee = (nextProps) => props.onUpdate({id: id,...nextProps})

  return (
    <tr>
      <td className="auto">
        <InputText value={name} 
                   onUpdate={(value) => updateEmployee({name: value})}/>
      </td>
      <td className="auto">
        <select value={sex}
                onChange={(event) => updateEmployee({sex: event.target.value})}>
          <option key="F" value="F">F</option>
          <option key="M" value="M">M</option>
        </select></td>
      <td className="short center">
          <InputNumber value={wage}
                       onUpdate={(value) => updateEmployee({wage: value})}/></td>
      <td className="column_unit">&nbsp;€</td>
      <td className="short center">
          <InputNumber value={hours}
                       onUpdate={(value) => updateEmployee({hours: value})}/></td>
      <td className="column_unit">&nbsp;€</td>
      <td className="column_icon">
        <img className="img" src="/resources/icon_delete.jpg" alt="delete" 
              onClick={() => props.onDelete(id)}/></td>
    </tr>
  )
}

/* --------------------------------------------------------- */
/* -------------------- EMPLOYEE POP-UP -------------------- */
/* --------------------------------------------------------- */

/* ---------- NEW / CHANGE EXPENSE POP-UP ---------- */

class EmployeePopup extends React.Component {

  constructor(props) 
  {
    super(props)
    this.state = {
      name: props.name || "",
      sex: props.sex || "",
      wage: props.wage || "",
      hours: props.hours || "",
    }
  }

  render() 
  {
    const {name,sex,wage,hours} = this.state;

    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>{this.props.id == undefined ? "Ajout d'un collaborateur" : "Modification"}</h3>
          <div className="inputs">
            <div className="inline-input">
                <label>Nom* </label>
                <InputText value={name} 
                           onUpdate={this.updateName.bind(this)}/>
            </div>
            <div className="inline-input short">
                <label>Sexe* </label>
                <select value={sex}
                        onChange={(event) => this.updateSex(event.target.value)}>
                  {sex=="" && <option>-</option>}
                  <option>F</option>
                  <option>M</option>
                </select>
            </div>
            <div className="inline-input short">
                <label>Rémunération annuelle brute </label>
                <InputNumber value={wage} onUpdate={this.updateWage.bind(this)}/>
                <span>&nbsp;€</span>
            </div>
            <div className="inline-input short">
                <label>Temps de travail </label>
                <InputNumber value={hours} onUpdate={this.updateHours.bind(this)}/>
                <span>&nbsp;h</span>
            </div>
          </div>
          <div className="footer">
            <button onClick={() => this.props.onClose()}>Fermer</button>
            <button disabled={label=="" || amount=="" || companyName==""} onClick={() => this.updateEmployee()}>Enregistrer</button>
          </div>
        </div>
      </div>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  updateName = (nextName) => this.setState({name: nextName})
  updateSex = (nextSex) => this.setState({sex: nextSex})
  updateWage = (nextWage) => this.setState({wage: nextWage})
  updateHours = (nextHours) => this.setState({hours: nextHours})

  /* ----- PROPS METHODS ----- */

  updateEmployee() 
  {
    if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
    else                          {this.props.onAdd({...this.state})}
    this.props.onClose();
  }

}

// Export CSV File
const exportXLSXFile = async () =>
{
  let arrayHeader = [["Nom - Prénom","Sexe"]];
  let fileProps = {wsclos: [{wch:50},{wch:20}]};
  // write file (Array -> ArrayBuffer)
  let file = await XLSXHeaderFileWriter(fileProps,"Données sociales",arrayHeader);
  // trig download
  let blob = new Blob([file],{type:"application/octet-stream"});
  let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "employees.xlsx";
      link.click();
}