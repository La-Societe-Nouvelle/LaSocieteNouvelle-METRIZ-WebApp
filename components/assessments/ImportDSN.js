// La Société Nouvelle

// React
import React from "react";
import { Table } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { getNewId } from "../../src/utils/Utils";

// readers
import { DSNDataReader, DSNFileReader } from "/src/readers/DSNReader";

import metaRubriques from "/lib/rubriquesDSN";

/* -------------------- IMPORT DSN FILE -------------------- */

export class ImportDSN extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      socialStatements: []
    };
  }

  render() 
  {
    const {socialStatements} = this.state
    console.log(socialStatements);
    return (
      <div className="assessment">
        <div className="step">
          <h4>Importez les déclarations mensuelles</h4>
          <Dropzone
            onDrop={this.onDrop}
            accept={[".edi"]}>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone-section">
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>
                    <i className="bi bi-file-arrow-up-fill"></i>
                    Glisser votre fichier ici
                  </p>
                  <p className="small-text">OU</p>
                  <p className="btn btn-primary">
                    Selectionner votre fichier
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div className="step">
          <h4>Fichiers importés</h4>
          <div className="table-main">
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <td>Etat</td>
                  <td>Nom du fichier</td>
                  <td>Date</td>
                  <td>Fraction</td>
                </tr>
              </thead>
              <tbody>
                {socialStatements.map(socialStatement => 
                  <tr key={socialStatement.id}>
                    <td>OK</td>
                    <td>{metaRubriques.declaration.nature[socialStatement.declaration.nature]}</td>
                    <td>{socialStatement.declaration.mois}</td>
                    <td>{socialStatement.declaration.fraction}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  onDrop = (files) => 
  {
    if (files.length) 
    {
      files.forEach(file => this.importFile(file));
      // this.openPopup();
      // this.setState({ isDisabled: false });
      // this.setState({ errorFile: false });
    } 
    // else {
    //   this.setState({ errorFile: true });
    // }
  };

  importFile = (file) => 
  {
    let extension = file.name.split(".").pop();
    if (extension=="edi") 
    {
      let reader = new FileReader();
      reader.onload = async () => 
      {
        let dataDSN = await DSNFileReader(reader.result);
        console.log(dataDSN);
        let socialStatement = await DSNDataReader(dataDSN);
        console.log(socialStatement);
        socialStatement.id = getNewId(this.state.socialStatements);
        this.setState({ socialStatements: this.state.socialStatements.concat([socialStatement]) });
      };

      reader.readAsText(file);
    }
  }
}