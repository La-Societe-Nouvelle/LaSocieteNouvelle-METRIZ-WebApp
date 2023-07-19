export const checkIfDataExists =  (comparativeData, indicatorCode) => {
    const aggregates = Object.keys(comparativeData).filter(
      (key) => key !== "activityCode"
    );
  
    const missingIndicators = [];
  
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
  