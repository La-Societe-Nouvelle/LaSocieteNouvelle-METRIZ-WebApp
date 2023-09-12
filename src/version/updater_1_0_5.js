// Updater version from 1.0.4 to 1.0.5

export const updater_1_0_5 = async (sessionData) => 
{
  // get previous session division code
  let code = sessionData.comparativeDivision;

  sessionData.comparativeData = {};
  sessionData.comparativeData.activityCode = code;

  // set previous analysis to True to disable new indicators assessment with missing data
  sessionData.indics = [
    "eco",
    "art",
    "soc",
    "knw",
    "dis",
    "geq",
    "ghg",
    "mat",
    "was",
    "nrg",
    "wat",
    "haz",
  ];
}