import React from 'react';

import { InputNumber } from '../InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';
import { SocialDataTable } from '../tables/SocialDataTable';

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
      <div className="indicator-section-view">
        <div className="view-header">
          <button className="retour"onClick = {() => this.props.onGoBack()}>Retour</button>
          <button className="retour"onClick = {() => this.onSubmit()}>Valider</button>
        </div>

        <div className="group assessment"><h3>Outil de mesure</h3>
          <SocialDataTable employees={employees}/>
        </div>
      </div>
    )
  }

  onSubmit = async () => {}

}