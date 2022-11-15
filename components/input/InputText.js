import React from 'react';

export class InputText extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input: props.value || "",
      valid: props.valid,
      unvalid: this.props.unvalid
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props.value!=prevProps.value || this.props.valid!=prevProps.valid || this.props.unvalid!=prevProps.unvalid) 
    {
      this.setState({
        input: this.props.value || "",
        valid: this.props.valid,
        unvalid: this.props.unvalid
      })
    }
  }

  render() 
  {
    const {input,valid,unvalid} = this.state;
    
    return (
      <input  className={(valid ? " success" : unvalid ? "error" : "") + " form-control mb-3"}
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