import React from 'react';

export class InputText extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input: props.value || "",
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value!=prevProps.value) {
      this.setState({input: this.props.value || ""})
    }
  }

  render() {
    return (
      <input  value={this.state.input}
              onChange={this.onChange}
              onBlur={this.onBlur}
              onKeyPress={this.onEnterPress}/>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) event.target.blur()
  }

  onChange = (event) => {
    this.setState({input: event.target.value})
  }
  
  onBlur = () => {
    this.props.onUpdate(this.state.input)
  }

}