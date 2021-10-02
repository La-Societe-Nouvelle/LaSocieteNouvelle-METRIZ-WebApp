import React from 'react';

export class InputNumber extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input: props.value!=undefined ? props.value.toString() || "" : "",
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props.value!=prevProps.value) {
      this.setState({input: this.props.value ? (this.props.value.toString() || "") : ""})
    }
  }

  render() 
  {
    return (
      <input  value={this.state.input}
              onFocus={this.onFocus}
              onChange={this.onChange}
              onBlur={this.onBlur}
              onKeyPress={this.onEnterPress}
              disabled={this.props.disabled}/>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onFocus = () => {
    if (/^0$/.test(this.state.input)) {
      this.setState({input: ""})
    }
  }

  onChange = (event) => {
    this.setState({input: event.target.value})
  }
  
  onBlur = () => {
    let number = parseFloat(this.state.input);
    if (isNaN(number)) {
      this.props.onUpdate(null)
    } else {
      this.props.onUpdate(number)
    }
  }

}