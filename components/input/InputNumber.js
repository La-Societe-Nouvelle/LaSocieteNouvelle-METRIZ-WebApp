// La Societe Nouvelle

// React
import React from "react";

// Bootstrap
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

/** Component for input number
 *  
 *  Props :
 *    - value
 *    - isInvalid
 *    - placeholder
 *    - disabled
 *    - onUpdate()
 * 
 *  Returns float or null (if not a number), on blur or enter press
 */

export class InputNumber extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      input: props.value != undefined ? props.value : " ",
      isInvalid: props.isInvalid != undefined ? props.isInvalid : false,
      placeholder: props.placeholder || null,
    };
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props.value != prevProps.value || this.props.isInvalid != prevProps.isInvalid) {
      this.setState({
        input: this.props.value != undefined ? this.props.value : " ",
        isInvalid: this.props.isInvalid != undefined ? this.props.isInvalid : false,
      });
    }
  }

  render() 
  {
    return (
      <InputGroup>
        <Form.Control
          value={this.state.input}
          isInvalid={this.state.isInvalid}
          disabled={this.props.disabled}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyPress={this.onEnterPress}
        />
        {/* placeholder */}
        {this.state.placeholder && (
          <InputGroup.Text>
            {this.state.placeholder}
          </InputGroup.Text>
        )}
      </InputGroup>
    );
  }
  
  // on change
  onChange = (event) => {
    this.setState({ 
      input: event.target.value 
    });
  };

  // on enter press => blur
  onEnterPress = (event) => {
    if (event.which == 13) {
      event.target.blur();
    }
  };

  // on blur => trigger onUpdate props function
  onBlur = () => {
    let number = parseFloat(this.state.input);
    if (isNaN(number)) {
      this.props.onUpdate(null);
    } else {
      this.props.onUpdate(number);
    }
  };
}