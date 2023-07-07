import { Dataset } from "./Dataset";

export class ComparativeData {
  constructor(props) {
    props = props || {};

    this.activityCode = props.activityCode || "";
    this.fixedCapitalConsumptions = {
      area: {
        macrodata: new Dataset(props.fixedCapitalConsumptions?.area?.macrodata),
        target: new Dataset(props.fixedCapitalConsumptions?.area?.target),
        trends: new Dataset(props.fixedCapitalConsumptions?.area?.trends),
      },
      division: {
        macrodata: new Dataset(
          props.fixedCapitalConsumptions?.division?.macrodata
        ),
        target: new Dataset(props.fixedCapitalConsumptions?.division?.target),
        trends: new Dataset(props.fixedCapitalConsumptions?.division?.trends),
      },
    };
    this.intermediateConsumptions = {
      area: {
        macrodata: new Dataset(props.intermediateConsumptions?.area?.macrodata),
        target: new Dataset(props.intermediateConsumptions?.area?.target),
        trends: new Dataset(props.intermediateConsumptions?.area?.trends),
      },
      division: {
        macrodata: new Dataset(
          props.intermediateConsumptions?.division?.macrodata
        ),
        target: new Dataset(props.intermediateConsumptions?.division?.target),
        trends: new Dataset(props.intermediateConsumptions?.division?.trends),
      },
    };
    this.netValueAdded = {
      area: {
        macrodata: new Dataset(props.netValueAdded?.area?.macrodata),
        target: new Dataset(props.netValueAdded?.area?.target),
        trends: new Dataset(props.netValueAdded?.area?.trends),
      },
      division: {
        macrodata: new Dataset(props.netValueAdded?.division?.macrodata),
        target: new Dataset(props.netValueAdded?.division?.target),
        trends: new Dataset(props.netValueAdded?.division?.trends),
      },
    };
    this.production = {
      area: {
        macrodata: new Dataset(props.production?.area?.macrodata),
        target: new Dataset(props.production?.area?.target),
        trends: new Dataset(props.production?.area?.trends),
      },
      division: {
        macrodata: new Dataset(props.production?.division?.macrodata),
        target: new Dataset(props.production?.division?.target),
        trends: new Dataset(props.production?.division?.trends),
      },
    };
  }
}
