import React from 'react';

import { InputNumber } from '../InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';
import { TableSocialData } from '../indicatorTabs/SocialDataTable';

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
    }
  }

  render() 
  {
    const {employees} = this.state;
    
    return(
      <TableSocialData employees={employees}/>
    )
  }

}