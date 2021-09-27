import React from 'react';

import { InputNumber } from '../InputNumber';
import { getNewId, printValue } from '../../src/utils/Utils';
<<<<<<< HEAD
import { SocialDataTable } from '../tables/SocialDataTable';
=======

// Components
import { SocialDataTable } from '../tables/SocialDataTable';

// Other sources
import { SocialDataContentReader } from '../../src/readers/SocialDataContentReader';
import { XLSXHeaderFileWriter } from '../../src/writers/XLSXWriter';
>>>>>>> b21e646b0a6fa73f40a27f5dcdff4c4855699b8a

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
<<<<<<< HEAD
          <SocialDataTable employees={employees}/>
=======

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
            <button onClick={exportXLSXFile}>
              Télécharger modèle XLSX
            </button>
          </div>

          <SocialDataTable employees={employees}/>

>>>>>>> b21e646b0a6fa73f40a27f5dcdff4c4855699b8a
        </div>
      </div>
    )
  }

  onSubmit = async () => {}

<<<<<<< HEAD
=======
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

// Export XLSX File
const exportXLSXFile = async () =>
{
  let arrayHeader = [["Nom - Prénom","Sexe (F/H)","Heures travaillées","Rémunérations brutes","Taux horaire","Contrat de formation (O/N)","Heures de formation"]];
  let fileProps = {wsclos: [{wch:40},{wch:15},{wch:25},{wch:25},{wch:25},{wch:25},{wch:25}]};
  // write file (Array -> ArrayBuffer)
  let file = await XLSXHeaderFileWriter(fileProps,"Collaborateurs",arrayHeader);
  // trig download
  let blob = new Blob([file],{type:"application/octet-stream"});
  let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Collaborateurs.xlsx";
      link.click();
>>>>>>> b21e646b0a6fa73f40a27f5dcdff4c4855699b8a
}