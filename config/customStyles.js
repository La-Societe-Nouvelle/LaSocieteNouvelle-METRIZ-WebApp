export const customSelectStyles = (selectSize, status, hasWarning) => ({
  control: (provided, state) => {
   
    let styles = {
      ...provided,
       fontSize: "0.8rem",
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
  
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, 
  }),
  indicatorSeparator: (provided) => (
   {
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
  control: (provided) => ({
    ...provided,
    border: "1px solid #dbdef1",
    fontSize: "0.9rem",
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
  indicatorSeparator: (provided) => ({
    ...provided,
    width: 0,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.75rem",
    padding:"0.2rem 0.5rem",
    color: "#191558",
    backgroundColor: "transparent",
    background: state.isFocused ? "#dbdef1" : "",
    "&:hover": {
      color: "#191558",
    },
  }),
};

export const periodSelectStyles = () => ({
  control: (provided, state) => ({
    ...provided,
    border: "1px solid #dbdef1",
    backgroundColor: "#FFFFFF",
    fontSize: "0.8rem",
    borderRadius: "0.5rem",
    boxShadow: "none",
    width:"100px",
    minHeight: "auto",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      borderColor: "#dbdef1",
    },
  }),
  indicatorSeparator: (provided) => (
    {
      ...provided,
      width : 0,
    }),
  dropdownIndicator: (provided,state) => (
   {
    ...provided,
    padding: 4,
    color: "#dbdef1",
    display :  state.isDisabled ? "none" : "",
    "&:hover": {
      color: "#dbdef1",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, 
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.8rem",
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
})