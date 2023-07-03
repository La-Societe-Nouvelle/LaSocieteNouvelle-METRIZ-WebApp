export const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "2px solid #dbdef1",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#dbdef1",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#dbdef1",
      "&:hover": {
        color: "#dbdef1",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.85rem",
      backgroundColor: state.isSelected ? "#191558" : "transparent",
      background: state.isFocused ? "#f0f0f8" : "",
      "&:hover": {
        color: "#191558",
      },
    }),
  };
  
  