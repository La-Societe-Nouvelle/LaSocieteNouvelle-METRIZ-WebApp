// La Société Nouvelle

// React
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

// Utils
import { isValidInput, isValidNumber, roundValue } from '../../../../../utils/Utils';

const DirectorRow = ({
  individualData,
  onUpdate
}) => {
  
  const [name, setName] = useState(individualData.name || "");
  const [sex, setSex] = useState(individualData.sex || "");
  const [wage, setWage] = useState(individualData.wage || "");
  const [workingHours, setWorkingHours] = useState(individualData.workingHours || "");
  const [hourlyRate, setHourlyRate] = useState(individualData.hourlyRate || "");
  const [apprenticeshipHours, setApprenticeshipHours] = useState(individualData.apprenticeshipHours || "");

  // ----------------------------------------------------------------------------------------------------
   
  // from outside
  useEffect(() => {
    if (individualData.wage!=wage) setWage(individualData.wage || "");
  }, [individualData.wage]);

  // from inside
  useEffect(() => 
  {
    individualData.name = name;
    individualData.sex = sex;
    individualData.workingHours = workingHours;
    individualData.hourlyRate = hourlyRate;
    individualData.apprenticeshipHours = apprenticeshipHours;

    //onUpdate(individualData);
  }, [name, sex, workingHours, hourlyRate, apprenticeshipHours]);

  useEffect(() => 
  {
    if (isValidNumber(wage,0)
     && isValidNumber(workingHours,0) && workingHours>0) {
      setHourlyRate(roundValue(wage / workingHours, 2));
    }

    //individualData.wage = wage;
    //onUpdate(individualData);
  }, [wage]);

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
      <td>
        <Form.Control
          className="form-control-sm"
          type="text"
          value={apprenticeshipHours}
          onChange={handleApprenticeshipHoursChange}
          isInvalid={!isValidInput(apprenticeshipHours,0,workingHours)}
        />
      </td>
    </>
  );
};

export default DirectorRow;