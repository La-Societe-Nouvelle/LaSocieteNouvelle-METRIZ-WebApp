// Updater version from 1.0.1 to 1.0.2

export const updater_1_0_2 = (sessionData) => 
{
  // ----------------------------------------------------------------------------------------------------
  // Changes in session

  // LIST OF UPDATES :
  // - Changes progression steps

  // update progression according to current number of steps
  if (sessionData.progression > 1) {
    sessionData.progression = sessionData.progression - 1;
  }
};