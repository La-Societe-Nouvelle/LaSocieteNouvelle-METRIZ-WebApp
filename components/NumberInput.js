import React from 'react';


export class NumberInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input: props.value!=null ? props.value : "",
    }
  }

  render() {
    return (
      <input  value={this.state.input}
              onChange={this.onChange}
              onBlur={this.props.onBlur}
              onKeyPress={this.onEnterPress}/>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  onChange = (event) => {this.setState({input: event.target.value})}
  //onBlur = (event) => {this.props.onBlur(event.target.value)}

  updateInput(value) {
    this.setState({ 
      input: value!=null ? value : "",
    })
  }

}