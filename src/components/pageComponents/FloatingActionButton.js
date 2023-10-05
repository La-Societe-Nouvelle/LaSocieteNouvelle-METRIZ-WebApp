import React from 'react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      <i className="bi bi-question-circle"></i> Première Visite
    </button>
  );
};

export default FloatingActionButton;
