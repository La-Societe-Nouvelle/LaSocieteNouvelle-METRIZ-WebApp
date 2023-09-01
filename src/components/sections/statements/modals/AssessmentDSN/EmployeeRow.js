// La Société Nouvelle

// React
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const EmployeeRow = ({
  individualData,
  updateSocialData,
  onUpdate
}) => {

  const [name, setName] = useState(individualData.name);
  const [sex, setSex] = useState(individualData.sex);
  const [wage, setWage] = useState(individualData.wage);
  const [workingHours, setWorkingHours] = useState(individualData.workingHours);
  const [hourlyRate, setHourlyRate] = useState(individualData.hourlyRate);
  const [apprenticeshipHours, setApprenticeshipHours] = useState(individualData.apprenticeshipHours);
  const [apprenticeshipContract, setApprenticeshipContract] = useState(individualData.apprenticeshipContract);
   
  useEffect(() => {
    if (individualData.name!=name) setName(individualData.name);
    //setSex(individualData.sex);
    //setWage(individualData.wage);
    // setWorkingHours(props.workingHours);
    // setHourlyRate(props.hourlyRate);
    // setApprenticeshipHours(props.apprenticeshipHours);
    // setApprenticeshipContract(props.apprenticeshipContract);
  }, [individualData]);

  useEffect(() => {
    individualData.name = name;
    console.log(individualData);
    
    onUpdate();
    //updateSocialData();
  }, [name, sex, wage, workingHours, hourlyRate, apprenticeshipHours, apprenticeshipContract]);

  // const updateSocialData = () => {
  //   const data = {
  //     id: individualData.id,
  //     name,
  //     sex,
  //     wage,
  //     workingHours,
  //     hourlyRate,
  //     apprenticeshipHours,
  //     apprenticeshipContract,
  //   };
  //   updateSocialData(data);
  // };

  const isValid = hourlyRate != null && workingHours != null;

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSexChange = (event) => {
    setSex(event.target.value);
  };

  const handleWorkingHoursChange = (event) => {
    const input = event.target.value;
    const workingHours = input !== '' ? parseInt(input) : null;
    setWorkingHours(workingHours);
  };

  const handleWageChange = (event) => {
    const input = event.target.value;
    let wage = roundValue(input, 2);
    let hourlyRate = null;

    if (wage !== null && wage !== 0) {
      hourlyRate = workingHours > 0 ? roundValue(wage / workingHours, 2) : null;
    } else if (wage === 0) {
      setWorkingHours(0);
      setHourlyRate(0);
    }

    setWage(wage);
    setHourlyRate(hourlyRate);
  };

  const handleHourlyRateChange = (event) => {
    const input = event.target.value;
    const hourlyRate = roundValue(input, 2);
    let wage = null;

    if (hourlyRate !== null && hourlyRate !== 0) {
      wage = workingHours > 0 ? roundValue(workingHours * hourlyRate, 2) : null;
    } else if (hourlyRate === 0) {
      wage = 0;
    }

    setHourlyRate(hourlyRate);
    setWage(wage);
  };

  const handleApprenticeshipContractChange = (event) => {
    const apprenticeshipContract = event.target.checked;
    const apprenticeshipHours = apprenticeshipContract ? workingHours : 0;
    setApprenticeshipContract(apprenticeshipContract);
    setApprenticeshipHours(apprenticeshipHours);
  };

  const handleApprenticeshipHoursChange = (event) => {
    const input = event.target.value;
    const apprenticeshipHours = input !== '' ? parseInt(input) : null;

    if (apprenticeshipHours > 0 && workingHours > 0 && apprenticeshipHours > workingHours) {
      setApprenticeshipHours(workingHours);
    } else {
      setApprenticeshipHours(apprenticeshipHours);
    }
  };

  const roundValue = (value, decimals) => {
    if (value === null) return null;
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  };

  /* -------------------- CHECK IF ALL DATA OK -------------------- */

  const checkIndividualData = (individualData) => {
    if (individualData.sex != 1 && individualData.sex != 2) return false;
    else if (individualData.wage == null) return false;
    else if (individualData.workingHours == null) return false;
    else if (individualData.hourlyRate == null) return false;
    else return true;
  };

  return (
    <>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </td>
      <td>
        <Form.Select
          value={sex}
          onChange={handleSexChange}
          size="sm"
          isInvalid={!isValid}
        >
          <option key="" value=""> - </option>
          <option key="F" value="2">F</option>
          <option key="H" value="1">H</option>
        </Form.Select>
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={workingHours !== null ? workingHours.toString() : ''}
          onChange={handleWorkingHoursChange}
        />
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={wage !== null ? wage.toString() : ''}
          onChange={handleWageChange}
        />
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={hourlyRate !== null ? hourlyRate.toString() : ''}
          onChange={handleHourlyRateChange}
        />
      </td>
      <td className="text-center">
        <Form.Check
          type="checkbox"
          value={apprenticeshipContract}
          checked={apprenticeshipContract}
          onChange={handleApprenticeshipContractChange}
        />
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={apprenticeshipHours !== null ? apprenticeshipHours.toString() : ''}
          disabled={apprenticeshipContract}
          onChange={handleApprenticeshipHoursChange}
        />
      </td>
    </>
  );
};

export default EmployeeRow;
