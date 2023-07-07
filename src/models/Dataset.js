export class Dataset {
    constructor(props) {
      props = props || {};
      this.label = props.label || "";
      this.data = props.data || {};
    }
  }
  