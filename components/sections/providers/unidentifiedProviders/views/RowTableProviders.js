// La Société Nouvelle

// React
import React from "react";
import Select from "react-select";

// Utils
import { printValue } from "/src/utils/Utils";

// Libs
import divisions from "/lib/divisions";
import areas from "/lib/areas";

// Select Style
import { customSelectStyles } from "../../../../../config/customStyles";

export class RowTableProviders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityCode: props.provider.defaultFootprintParams.code,
      areaCode: props.provider.defaultFootprintParams.area,
      toggleIcon: false,
    };
  }

  componentDidUpdate() {
    if (
      this.props.provider.defaultFootprintParams.code != this.state.activityCode
    ) {
      this.setState({
        activityCode: this.props.provider.defaultFootprintParams.code,
      });
    }
    if (
      this.props.provider.defaultFootprintParams.area != this.state.areaCode
    ) {
      this.setState({
        areaCode: this.props.provider.defaultFootprintParams.area,
      });
    }
  }



  render() {
    const { providerNum, providerLib, periodsData, footprintStatus } =
      this.props.provider;
    const period = this.props.period;
    const { areaCode, activityCode } = this.state;

    let isSignificative = this.props.isSignificative;
    let icon;

    if (footprintStatus == 200) {
      icon = (
        <i
          className="bi bi-check2 text-success"
          title="Données synchronisées"
        ></i>
      );
    } else {
      icon = <i className="bi bi-arrow-repeat text-success"></i>;
    }

    return (
      <tr>
        <td>
          {icon}
          {isSignificative && activityCode == "00" && (
            <i
              className="ms-1 bi bi-exclamation-triangle text-warning"
              title="Grand risque d'imprécision"
            ></i>
          )}
        </td>
        <td>{providerLib}</td>
        <td>{providerNum}</td>
        <td>
          <Select
            styles={customSelectStyles}
            value={{
              label: areaCode + " - " + areas[areaCode],
              value: areaCode,
            }}
            placeholder={"Choisissez un espace économique"}
            className={footprintStatus == 200 ? "success" : ""}
            options={areasOptions}
            onChange={this.onAreaCodeChange}
          />
        </td>
        <td>
          <Select
            styles={customSelectStyles}
            value={{
              label: activityCode + " - " + divisions[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez un secteur d'activité"}
            className={footprintStatus == 200 ? "success" : ""}
            options={divisionsOptions}
            onChange={this.onActivityCodeChange}
          />
        </td>
        <td className="text-end">
          {printValue(periodsData[period.periodKey].amount, 0)} &euro;
        </td>
      </tr>
    );
  }

  onAreaCodeChange = (event) => {
    this.props.provider.update({
      defaultFootprintParams: { area: event.value },
    });
    this.setState({ areaCode: event.value });
    // fetch data auto ? -> updating expenses / significative providers
    this.props.refreshTable();
  };

  onActivityCodeChange = (event) => {
    this.props.provider.update({
      defaultFootprintParams: { code: event.value },
    });
    this.setState({ activityCode: event.value });
    // fetch data auto ? -> updating expenses / significative providers
    this.props.refreshTable();
  };
}


const divisionsOptions = Object.entries(divisions)
.sort((a, b) => parseInt(a) - parseInt(b))
.map(([value, label]) => {
  return { value: value, label: value + " - " + label };
});

const areasOptions = Object.entries(areas)
.sort()
.map(([value, label]) => {
  return { value: value, label: value + " - " + label };
});
