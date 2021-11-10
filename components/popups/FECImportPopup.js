// La Société Nouvelle

// React
import React from 'react';

/* ---------- FEC IMPORT POP-UP ---------- */

export class FECImportPopup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ...props.FECData,
      noBook: false
    }
  }

  render() 
  {
    const {meta,books,noBook} = this.state;
    const disabledValidation = !(noBook || Object.entries(meta.books).map(([_,{type}]) => type).includes("ANOUVEAUX"));
    
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
                {/*<td className="medium center">Type</td>*/}
                <td className="medium center">A-Nouveaux</td>
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
                    <td>
                      <input type="radio" name="ANOUVEAUX" value={code} checked={type=="ANOUVEAUX"} onChange={this.changeJournalANouveaux}/>
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
          <div>

          </div>
          <div className="input">
            <input type="checkbox" 
                   checked={noBook}
                   onChange={this.onCheckboxChange}/>
              <label htmlFor="certification">&nbsp;Pas de journal A-Nouveaux</label>
          </div>
          <div className="footer">
            <div></div>
            <button onClick={() => this.validate()}
                    disabled={disabledValidation}>Valider</button>
          </div>
        </div>
      </div>
    )
  }

  /* ----- EDIT ----- */

  changeJournalANouveaux = (event) => 
  {
    let selectedCode = event.target.value;
    let meta = this.state.meta;
    Object.entries(meta.books).forEach(([code,_]) => meta.books[code].type = (code == selectedCode ? "ANOUVEAUX" : ""));
    this.setState({meta: meta, noBook: false});
  }

  onCheckboxChange = (event) =>
  {
    let meta = this.state.meta;
    if (event.target.checked) Object.entries(meta.books).forEach(([code,_]) => meta.books[code].type = "");
    this.setState({meta: meta, noBook: event.target.checked});
  }

  /* ----- PROPS METHODS ----- */

  validate = () => this.props.onValidate({...this.state})

}