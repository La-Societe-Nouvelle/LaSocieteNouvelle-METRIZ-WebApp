// La Société Nouvelle

// React
import React from "react";
import { Form } from "react-bootstrap";
import { printValue } from "../../../../src/utils/Utils";

/* ---------- DECLARATION - INDIC #SOC ---------- */

export class StatementSOC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: props.impactsData.comments.soc || "",
    };
  }

  render() {
    const { hasSocialPurpose, netValueAdded } = this.props.impactsData;
    const { info } = this.state;

    let isValid = hasSocialPurpose !== null && netValueAdded != null;

    return (
      <div className="statement">
        <div className="statement-form">
          <div className="form-group">
            <label>
              L'entreprise est-elle d'utilité sociale ou dotée d'une raison
              d'être ?
            </label>
            <Form>
              <Form.Check
                inline
                type="radio"
                id="hasSocialPurpose"
                label="Oui"
                value="true"
                checked={hasSocialPurpose === true}
                onChange={this.onSocialPurposeChange}
              />
              <Form.Check
                inline
                type="radio"
                id="hasSocialPurpose"
                label="Non"
                value="false"
                checked={hasSocialPurpose === false}
                onChange={this.onSocialPurposeChange}
              />
            </Form>
          </div>
        </div>
        <div className="statement-comments">
          <label>Informations complémentaires</label>
          <Form.Control
            as="textarea"
            rows={4}
            onChange={this.updateInfo}
            value={info}
            onBlur={this.saveInfo}
          />

        </div>
        <div className="statement-validation">
          <button
            disabled={!isValid}
            className="btn btn-secondary btn-sm"
            onClick={this.onValidate}
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  onSocialPurposeChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        this.props.impactsData.hasSocialPurpose = true;
        break;
      case "false":
        this.props.impactsData.hasSocialPurpose = false;
        break;
    }
    this.props.onUpdate("soc");
    this.forceUpdate();
  };

  updateInfo = (event) => this.setState({ info: event.target.value });
  saveInfo = () => (this.props.impactsData.comments.soc = this.state.info);

  onValidate = () => this.props.onValidate();
}


