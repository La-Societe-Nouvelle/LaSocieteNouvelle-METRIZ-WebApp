import { Dataset } from "./Dataset";

export class ComparativeData {
  constructor(props) {
    props = props || {};

    this.activityCode = props.activityCode || "";
    this.fixedCapitalConsumptions = {
      area: {
        macrodata: new Dataset(props.fixedCapitalConsumptions?.area?.macrodata),
        target: new Dataset(props.fixedCapitalConsumptions?.area?.target),
        trend: new Dataset(props.fixedCapitalConsumptions?.area?.trend),
      },
      division: {
        macrodata: new Dataset(
          props.fixedCapitalConsumptions?.division?.macrodata
        ),
        target: new Dataset(props.fixedCapitalConsumptions?.division?.target),
        trend: new Dataset(props.fixedCapitalConsumptions?.division?.trend),
      },
    };
    this.intermediateConsumptions = {
      area: {
        macrodata: new Dataset(props.intermediateConsumptions?.area?.macrodata),
        target: new Dataset(props.intermediateConsumptions?.area?.target),
        trend: new Dataset(props.intermediateConsumptions?.area?.trend),
      },
      division: {
        macrodata: new Dataset(
          props.intermediateConsumptions?.division?.macrodata
        ),
        target: new Dataset(props.intermediateConsumptions?.division?.target),
        trend: new Dataset(props.intermediateConsumptions?.division?.trend),
      },
    };
    this.netValueAdded = {
      area: {
        macrodata: new Dataset(props.netValueAdded?.area?.macrodata),
        target: new Dataset(props.netValueAdded?.area?.target),
        trend: new Dataset(props.netValueAdded?.area?.trend),
      },
      division: {
        macrodata: new Dataset(props.netValueAdded?.division?.macrodata),
        target: new Dataset(props.netValueAdded?.division?.target),
        trend: new Dataset(props.netValueAdded?.division?.trend),
      },
    };
    this.production = {
      area: {
        macrodata: new Dataset(props.production?.area?.macrodata),
        target: new Dataset(props.production?.area?.target),
        trend: new Dataset(props.production?.area?.trend),
      },
      division: {
        macrodata: new Dataset(props.production?.division?.macrodata),
        target: new Dataset(props.production?.division?.target),
        trend: new Dataset(props.production?.division?.trend),
      },
    };
  }
}
