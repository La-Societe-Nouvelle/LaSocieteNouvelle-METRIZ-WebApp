// La Société Nouvelle

// React
import React from 'react';

// Utils
import { InputText } from '/components/input/InputText';
import { InputNumber } from '/components/input/InputNumber'; 
import { valueOrDefault } from '/src/utils/Utils';
import { getNewId, roundValue } from '../../src/utils/Utils';

/* ---------- COMPANIES TABLE ---------- */

export class SocialDataTable extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = 
    {
      employees: props.employees,
      columnSorted: "id",
      reverseSort: false,
      page: 0
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props != prevProps) this.setState({employees: this.props.employees})
  }

  render() 
  {
    const {employees} = this.props;
    const {columnSorted,page} = this.state;

    this.sortCompanies(employees,columnSorted);

    const newEmployee = {
      id: getNewId(this.props.employees),
      name: "",
      sex: "",
      wage: null,
      workingHours: null,
      hourlyRate: null,
      trainingHours: null,
      trainingContract: false
    }

    return (
      <div className="table-main">
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
    )
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
    let employee = this.props.employees.filter(employee => employee.id == nextProps.id)[0];
    if (employee==undefined) {
      employee = {
        id: getNewId(this.props.employees),
        name: nextProps.name || "",
        sex: "",
        wage: null,
        workingHours: null,
        hourlyRate: null,
        trainingHours: null,
        trainingContract: false
      }
      this.props.employees.push(employee)
    } else {
      Object.entries(nextProps).forEach(([propName,propValue]) => employee[propName] = propValue);
    }
    this.setState({employees: this.props.employees});
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
        <td className={"long "+(!this.props.isNewEmployeeRow ?  (isValid ? "success" : "error") : "")}>
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