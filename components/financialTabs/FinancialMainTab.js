import React from 'react';

// Components
import { FinancialDataTable } from './FinancialDataTable';

// Libs
import booksProps from '../../src/readers/books.json'

// Readers
import { FECFileReader, processFECData } from '../../src/readers/FECReader';

/* ------------------------------------------------------------ */
/* -------------------- FINANCIAL MAIN TAB -------------------- */
/* ------------------------------------------------------------ */

/*  Financial main tab :
 *    - FEC import button
 *    - financial main table
 */

export class FinancialMainTab extends React.Component {

  refTableMain = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      importedData: null,
    }
  }

  render()
  {
    const {financialData,onUpdate} = this.props;
    const {amountExpensesFixed,amountDepreciationsFixed} = financialData;
    const {importedData} = this.state;
  
    return (
      <div className="financial_data_main_view">

        <div className="group"><h3>Soldes intermédiaires de gestion</h3>

          <div className="actions">
            <button onClick={() => {document.getElementById('import-fec').click()}}>Importer un fichier FEC</button>
            <input className="hidden" id="import-fec" type="file" accept=".csv,.txt" onChange={this.importFECFile} visibility="collapse"/>
          </div>

          <FinancialDataTable
            ref={this.refTableMain}
            onUpdate={onUpdate} 
            financialData={financialData}/>

          <div className="notes">
            {(amountExpensesFixed || amountDepreciationsFixed) &&
              <div>
                <p>&nbsp;<img className="img locker" src="/resources/icon_locked.jpg" alt="locked"/>
                   &nbsp;Saisie supérieure à la somme des écritures renseignées. Cliquez sur le cadenas pour recalculer la somme totale.
                </p>
              </div>}
          </div>
        </div>

        {importedData!=null &&
          <ImportPopup FECData={importedData}
                       onValidate={this.loadFECData.bind(this)}/>
        }
      </div>
    )
  }

  /* ----- FEC IMPORT ----- */

  importFECFile = (event) => 
  {
    let reader = new FileReader();
    reader.onload = async () => FECFileReader(reader.result).then((FECData) => this.setState({importedData: FECData}))
    reader.readAsText(event.target.files[0]);
  }

  loadFECData = (FECData) => 
  {
    this.setState({importedData: null});
    processFECData(FECData)
      .then(async (nextFinancialData) => 
      {
        await this.props.financialData.loadFECData(nextFinancialData)
        this.props.loadKNWData(nextFinancialData.KNWData)
      })
      .then(() => this.refTableMain.current.updateInputs())
      .then(() => this.props.onUpdate());
  }

}

/* ----------------------------------------------------------- */
/* -------------------- FEC IMPORT POP-UP -------------------- */
/* ----------------------------------------------------------- */

class ImportPopup extends React.Component {

  constructor(props) {
    super(props);
    this.state = props.FECData;
  }

  render() 
  {
    const {meta,books} = this.state;

    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>Journaux disponibles</h3>
          <table>
            <thead>
              <tr>
                <td className="short center">Code</td>
                <td className="long center">Libellé</td>
                <td className="short center">Début</td>
                <td className="short center">Fin</td>
                <td className="short center">Lignes</td>
                <td className="medium center">Type</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(meta.books).sort()
                                         .map(([code,{label,type}]) => {
                const nLines = books[code].length;
                const dateStart = books[code][0].EcritureDate;
                const dateEnd = books[code][nLines-1].EcritureDate;
                return(
                  <tr key={code}>
                    <td className="short center">{code}</td>
                    <td className="long left">{label}</td>
                    <td className="short center">{dateStart.substring(6,8)+"/"+dateStart.substring(4,6)+"/"+dateStart.substring(0,4)}</td>
                    <td className="short center">{dateEnd.substring(6,8)+"/"+dateEnd.substring(4,6)+"/"+dateEnd.substring(0,4)}</td>
                    <td className="short center">{nLines}</td>
                    <td className="medium center">
                      <select onChange={(event) => this.onBookTypeChange(code,event)} value={type}>
                        {Object.entries(booksProps).map(([type,{label}]) => <option key={type} value={type}>{label}</option>)}
                        <option key={"AUTRE"} value={"AUTRE"}>{"---"}</option>
                  </select></td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
          <div className="footer">
            <button onClick={() => this.validate()}>Valider</button>
          </div>
        </div>
      </div>
    )
  }

  /* ----- EDIT ----- */

  onBookTypeChange = (code,event) => 
  {
    let meta = this.state.meta;
    meta.books[code].type = event.target.value;
    this.setState({meta: meta});
  }

  /* ----- PROPS METHODS ----- */

  validate = () => this.props.onValidate({...this.state})

}