// La Société Nouvelle

// React
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { isValidInput, isValidNumber, roundValue } from '../../../../../utils/Utils';

const EmployeeRow = ({
  individualData,
  onUpdate
}) => {

  const [name, setName] = useState(individualData.name || "");
  const [sex, setSex] = useState(individualData.sex || "");
  const [wage, setWage] = useState(individualData.wage || "");
  const [workingHours, setWorkingHours] = useState(individualData.workingHours || "");
  const [hourlyRate, setHourlyRate] = useState(individualData.hourlyRate || "");
  const [apprenticeshipHours, setApprenticeshipHours] = useState(individualData.apprenticeshipHours || "");
  const [apprenticeshipContract, setApprenticeshipContract] = useState(individualData.apprenticeshipContract || "");

  // ----------------------------------------------------------------------------------------------------
   
  // from outside
  useEffect(() => 
  {
    if (individualData.name!=name) setName(individualData.name);
    if (individualData.sex!=sex) setSex(individualData.sex);
    if (individualData.wage!=wage) setWage(individualData.wage);
    if (individualData.workingHours!=workingHours) setWorkingHours(individualData.workingHours);
    if (individualData.hourlyRate!=hourlyRate) setHourlyRate(individualData.hourlyRate);
    if (individualData.apprenticeshipHours!=apprenticeshipHours) setApprenticeshipHours(individualData.apprenticeshipHours);
    if (individualData.apprenticeshipContract!=apprenticeshipContract) setApprenticeshipContract(individualData.apprenticeshipContract);

  }, [individualData]);

  // from inside
  useEffect(() => 
  {
    individualData.name = name;
    individualData.sex = sex;
    individualData.workingHours = workingHours;
    individualData.hourlyRate = hourlyRate;
    individualData.apprenticeshipHours = apprenticeshipHours;
    individualData.apprenticeshipContract = apprenticeshipContract;
    
    //updateSocialData();
    onUpdate();
  }, [name, sex, wage, workingHours, hourlyRate, apprenticeshipHours, apprenticeshipContract]);

  // ----------------------------------------------------------------------------------------------------

  // name
  const handleNameChange = (event) => {
    const nextName = event.target.value;
    setName(nextName);
  };

  // sex
  const handleSexChange = (event) => {
    const nextSex = event.target.value;
    setSex(nextSex);
  };

  // working hours
  const handleWorkingHoursChange = (event) => 
  {
    const input = event.target.value;
    const nextWorkingHours = parseFloat(input);

    isNaN(nextWorkingHours) ? setWorkingHours(input) : setWorkingHours(nextWorkingHours);

    if (isValidNumber(nextWorkingHours)
     && isValidNumber(wage,0)) {
      if (nextWorkingHours>0 && wage>0) {
        setHourlyRate(roundValue(wage / nextWorkingHours, 2));
      } else if (nextWorkingHours==0) {
        setWage(0);
        setHourlyRate(0);
      }
    }
  };

  // wage
  const handleWageChange = (event) => 
  {
    const input = event.target.value;
    const nextWage = parseFloat(input);

    isNaN(nextWage) ? setWage(input) : setWage(nextWage);

    if (isValidNumber(nextWage,0)
     && isValidNumber(workingHours,0) && workingHours>0) {
      setHourlyRate(roundValue(nextWage / workingHours, 2));
    }
  };

  // hourly rate
  const handleHourlyRateChange = (event) => 
  {
    const input = event.target.value;
    const nextHourlyRate = parseFloat(input);

    isNaN(nextHourlyRate) ? setHourlyRate(input) : setHourlyRate(nextHourlyRate);

    if (isValidNumber(nextHourlyRate,0) && isValidNumber(workingHours,0)) {
      const nextWage = roundValue(workingHours * nextHourlyRate, 2);
      setWage(nextWage);
    }
  };

  //
  const handleApprenticeshipContractChange = (event) => 
  {
    const nextApprenticeshipContract = event.target.checked;
    setApprenticeshipContract(nextApprenticeshipContract);

    const nextApprenticeshipHours = nextApprenticeshipContract ? workingHours : 0;
    setApprenticeshipHours(nextApprenticeshipHours);
  };

  //
  const handleApprenticeshipHoursChange = (event) => 
  {
    const input = event.target.value;
    const nextApprenticeshipHours = parseFloat(input);

    isNaN(nextApprenticeshipHours) ? setApprenticeshipHours(input) : setApprenticeshipHours(nextApprenticeshipHours);
  };

  /* -------------------- CHECK IF ALL DATA OK -------------------- */
  
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
          isInvalid={!["","1","2"].includes(sex)}
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
          value={workingHours}
          onChange={handleWorkingHoursChange}
          isInvalid={!isValidInput(workingHours,0)}
        />
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={wage}
          onChange={handleWageChange}
          isInvalid={!isValidInput(wage,0)}
        />
      </td>
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={hourlyRate}
          onChange={handleHourlyRateChange}
          isInvalid={!isValidInput(hourlyRate,0)}
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
          value={apprenticeshipHours}
          disabled={apprenticeshipContract}
          onChange={handleApprenticeshipHoursChange}
          isInvalid={!isValidInput(apprenticeshipHours,0,workingHours)}
        />
      </td>
    </>
  );
};

export default EmployeeRow;
