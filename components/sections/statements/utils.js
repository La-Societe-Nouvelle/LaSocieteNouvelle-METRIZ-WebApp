export const checkIfDataExists =  (comparativeData, indicatorCode) => {
    const aggregates = Object.keys(comparativeData).filter(
      (key) => key !== "activityCode"
    );
  
    for (const aggregate of aggregates) {
      const datasets = comparativeData[aggregate];
      const areaDataTypes = Object.keys(datasets.area);
      const divisionDataTypes = Object.keys(datasets.division);
  
      let foundIndicator = false;
  
      for (const areaDataType of areaDataTypes) {
        const areas = Object.keys(datasets.area[areaDataType].data);
  
        // Vérifier la présence de l'indicateur dans les données de chaque zone géographique (area)
   
          if (datasets.area[areaDataType].data[indicatorCode]) {
            foundIndicator = true;
            break;
          }
        
      }
  
      for (const divisionDataType of divisionDataTypes) {
        const divisions = Object.keys(datasets.division[divisionDataType].data);
  
        if (datasets.division[divisionDataType].data[indicatorCode]) {
            foundIndicator = true;
            break;
          }
      }

      if(!foundIndicator) {
        return false;
      }
  
   
    }

    return true;
  };

    /* ---------- TABLE ACTIONS ---------- */

  // Import CSV File
  // importCSVFile = (event) => 
  // {
  //   let file = event.target.files[0];

  //   let reader = new FileReader();
  //   reader.onload = async () =>
  //     CSVFileReader(reader.result)
  //       .then((content) => SocialDataContentReader(content))
  //       .then((individualsData) => this.setState({individualsData}));
    
  //   reader.readAsText(file);
  // };

  // // Import XLSX File
  // importXLSXFile = (event) => 
  // {
  //   let file = event.target.files[0];

  //   let reader = new FileReader();
  //   reader.onload = async () =>
  //     XLSXFileReader(reader.result)
  //       .then((XLSXData) => XLSXSocialDataBuilder(XLSXData))
  //       .then((socialData) => SocialDataContentReader(socialData))
  //       .then((individualsData) => this.setState({individualsData}));

  //   reader.readAsArrayBuffer(file);
  // };