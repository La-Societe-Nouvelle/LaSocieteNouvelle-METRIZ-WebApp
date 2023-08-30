export const customSelectStyles = (selectSize) =>  ({

    control: (provided, state) => ({
      ...provided,
      border: "2px solid #dbdef1",
      borderRadius: "0.5rem",
      boxShadow: "none",
      width: selectSize ? selectSize : "100%", // Ajustez la largeur selon vos besoins
      whiteSpace: "nowrap", // Empêche le texte de se retourner à la ligne
      overflow: "hidden", // Masque le texte qui dépasse
      textOverflow: "ellipsis", 
      "&:hover": {
        borderColor: "#dbdef1",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding : '4px',
      color: "#dbdef1",
      "&:hover": {
        color: "#dbdef1",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.7rem",
      color: "#191558",
      backgroundColor:"transparent",
      background: state.isFocused ? "#dbdef1" : "",
      
      "&:hover": {
        color: "#191558",
      },
    }),
  });
  
  export const unitSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "1px solid #dbdef1",
      fontSize: "0.8rem",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dbdef1",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding : '4px',
      color: "#dbdef1",
      "&:hover": {
        color: "#dbdef1",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.7rem",
      color: "#191558",
      backgroundColor:"transparent",
      background: state.isFocused ? "#dbdef1" : "",
      "&:hover": {
        color: "#191558",
      },
    }),
  };
  