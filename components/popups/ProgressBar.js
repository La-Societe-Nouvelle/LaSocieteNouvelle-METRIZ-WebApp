// La Société Nouvelle

// React
import React from 'react';

/* ---------- FEC IMPORT POP-UP ---------- */

export const ProgressBar = ({message,progression}) => 
{
  return (
  <div className="popup-container">
    <div className="popup-inner">
      <h3>{message}</h3>
      <div className="progressbar">
        <svg className="progressbar_shape">
          <rect width={progression+'%'}/>
        </svg> 
      </div>
    </div>
  </div>)
}