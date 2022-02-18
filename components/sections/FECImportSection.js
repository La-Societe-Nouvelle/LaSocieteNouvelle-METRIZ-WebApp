// La Société Nouvelle

// React
import React from 'react';

/* ---------- FEC IMPORT  ---------- */

export class FECImportSection extends React.Component {

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
      <> 
      <div className={"table-container container-fluid"}>
        <h3 className={"subtitle underline"}>Contrôle de vos a-nouveaux</h3>
          <h4>Identifiez vos journaux A-Nouveaux : </h4>
          <table>
            <thead>
              <tr>
                <td className="short">Code</td>
                <td className="long">Libellé</td>
                <td className="short">Fin</td>
                <td className="short">Nombre de Lignes</td>
                <td className="medium">Identification A-Nouveaux</td>
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
                    <td className="short center">{dateEnd.substring(6,8)+"/"+dateEnd.substring(4,6)+"/"+dateEnd.substring(0,4)}</td>
                    <td className="short center">{nLines}</td>
                    <td>
                      <input type="checkbox" name="ANOUVEAUX" value={code} checked={type=="ANOUVEAUX"} onChange={this.changeJournalANouveaux}/>
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
          {/* <div className="input">
            <input type="checkbox" 
                   checked={noBook}
                   onChange={this.onCheckboxChange}/>
              <label htmlFor="certification">&nbsp;Pas de journal A-Nouveaux</label>
          </div> */}

          </div>
                
          <aside className="action">
            <button className={"btn btn-outline"} >
                Recommencer
            </button>
            <button className={"btn btn-secondary"} onClick={() => this.validate()}
                    disabled={disabledValidation}>J'ai identifié l'éventuel journal des A-nouveaux</button>
          </aside>
      </>
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