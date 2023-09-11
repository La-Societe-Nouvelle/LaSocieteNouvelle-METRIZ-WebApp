export const customSelectStyles = (selectSize, status, hasWarning) => ({
  control: (provided, state) => {
   
    let styles = {
      ...provided,
      borderWidth: "1px",
      borderRadius: "0.5rem",
      borderColor: "#e7eaf6",
      boxShadow: "none",
      width: selectSize ? selectSize : "100%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      "&:hover": {
        borderColor: "#dbdef1",
      },
    };
    if (hasWarning) {
      styles.borderColor = "#ffc107";
      styles.backgroundColor = "#f7f0da";
    }

    if (status === 200) {
      styles.borderColor = "#98e3b9";
      styles.backgroundColor = "#e8f9ef";
    }
  
    if ( state.selectProps.className === "success" ) {
      styles.borderColor = "#98e3b9"; 
      styles.backgroundColor = "#e8f9ef";
    }

    return styles;
  },
  dropdownIndicator: (provided,state) => (
{
    ...provided,
    padding: "4px",
    color: "#dbdef1",
    display :  state.isDisabled ? "none" : "",
    "&:hover": {
      color: "#dbdef1",
    },
  }),
  indicatorSeparator: (provided) => (
    console.log(provided)
    ,{
    ...provided,
    width : 0
  

  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.7rem",
    color: "#191558",
    backgroundColor: "transparent",
    background: state.isFocused ? "#dbdef1" : "",
    "&:hover": {
      color: "#191558",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#191558", 
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
    padding: "4px",
    color: "#dbdef1",
    "&:hover": {
      color: "#dbdef1",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.7rem",
    color: "#191558",
    backgroundColor: "transparent",
    background: state.isFocused ? "#dbdef1" : "",
    "&:hover": {
      color: "#191558",
    },
  }),
};
