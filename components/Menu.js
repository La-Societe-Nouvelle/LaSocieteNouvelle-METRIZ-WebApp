// La Societe Nouvelle

import React from 'react';

export class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }
    
  render() {
    return (
      <div className="menu">
        <button></button>
      </div>
    )
  }
  
}

function Menu({selectedSection, parent}){
  return (
    <div className="menu">
      <div className="menu-items">
        <button key={indicator}
                onClick = {() => parent.setState({selectedSection: indicator})}
                className={"menu-button " + ((indicator == selected) ? "selected" : "")}>
          {indicator.toUpperCase()}
        </button>
      </div>
    </div>
  );
}