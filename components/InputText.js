import React from 'react';

export class InputText extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input: props.value || "",
      valid: props.valid,
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props.value!=prevProps.value || this.props.valid!=prevProps.valid) 
    {
      this.setState({
        input: this.props.value || "",
        valid: this.props.valid
      })
    }
  }

  render() 
  {
    const {input,valid} = this.state;
    
    return (
      <input  className={valid ? " valid" : ""}
              value={input}
              onChange={this.onChange}
              onBlur={this.onBlur}
              onKeyPress={this.onEnterPress}/>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) event.target.blur()
  }

  onChange = (event) => {
    this.setState({input: event.target.value, valid: false})
  }
  
  onBlur = () => {
    this.props.onUpdate(this.state.input)
  }

}