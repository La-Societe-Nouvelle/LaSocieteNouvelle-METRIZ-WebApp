// La Société Nouvelle

// React
import React from 'react';

/* ---------- MESSAGE POP-UP ---------- */

export const MessagePopup = ({ title, message, closePopup }) =>

  <div className="modal-overlay">
    <div className="modal-wrapper">
      <div className="modal">

        <h3>{title}</h3>
        <div className="message">
          <p>{message}</p>
        </div>
        <div className="footer">
          <button onClick={closePopup}>Ok</button>
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

