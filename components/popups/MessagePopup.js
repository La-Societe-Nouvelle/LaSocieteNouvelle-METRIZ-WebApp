// La Société Nouvelle
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// React
import React from 'react';

/* ---------- MESSAGE POP-UP ---------- */

export const MessagePopup = ({ title, message }) =>

  <div className="modal-overlay">
    <div className="modal-wrapper">
      <div className="modal">
        <h3>{title}</h3>
        <div className="message">
          <p>{message}</p>
        </div>
        <div className="footer">

        </div>
      </div>
    </div>
  </div>

export const MessagePopupErrors = ({ title, message, errors, closePopup }) =>

  <div className="modal-overlay">
    <div className="modal-wrapper">
      <div className="modal">
        <h3>{title}</h3>
        <div className="message">
          <p>{message}</p>
          {errors.map((error, index) => <p key={index} >{error}</p>)}
        </div>
        <div className="footer">
          <button className="btn" onClick={closePopup}>Ok</button>
        </div>
      </div>
    </div>
  </div>



