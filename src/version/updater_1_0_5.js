
// Updater version from 1.0.2 to 1.0.5
export const updater_to_1_0_5 = async (session) => 
{
  // ----------------------------------------------------------------------------------------------------
  // Changes in comparative data

  // add comparative data JSON
  session.comparativeData = {};
  session.comparativeData.activityCode = session.comparativeDivision;

  // ----------------------------------------------------------------------------------------------------

  session.version = "1.0.5";
}