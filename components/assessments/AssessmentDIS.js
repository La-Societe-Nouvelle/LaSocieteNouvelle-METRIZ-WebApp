import React from 'react';

import { InputNumber } from '../InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';
import { SocialDataTable } from '../tables/SocialDataTable';
import { SocialDataContentReader } from '../../src/readers/SocialDataContentReader';

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

          <div className="actions">
            <button onClick={() => document.getElementById('import-companies-csv').click()}>
              Importer un fichier CSV
            </button>
            <input id="import-companies-csv" visibility="collapse"
                    type="file" accept=".csv" 
                    onChange={this.importCSVFile}/>
            <button onClick={() => document.getElementById('import-companies-xlsx').click()}>
              Importer un fichier XLSX
            </button>
              <input id="import-companies-xlsx" visibility="collapse"
                      type="file" accept=".xlsx" 
                      onChange={this.importXLSXFile}/>
            <button onClick={() => location.href="/classeurTiers.xlsx"}>
              Télécharger modèle XLSX
            </button>
          </div>

          <SocialDataTable employees={employees}/>

        </div>
      </div>
    )
  }

  onSubmit = async () => {}

  /* ----- IMPORTS ----- */

  // Import CSV File
  importCSVFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      CSVFileReader(reader.result)
        .then((content) => SocialDataContentReader(content))
        .then((data) => this.props.session.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.session.impactsData.employees}));
    reader.readAsText(file);
  }

  // Import XLSX File
  importXLSXFile = (event) => 
  {
    let file = event.target.files[0];
    
    let reader = new FileReader();
    reader.onload = async () => 
      XLSXFileReader(reader.result)
        .then((XLSXData) => SocialDataContentReader(XLSXData))
        .then((data) => this.props.session.impactsData.employees = data.employees)
        .then(() => this.setState({employees: this.props.session.impactsData.employees}));
    reader.readAsArrayBuffer(file);
  }

}