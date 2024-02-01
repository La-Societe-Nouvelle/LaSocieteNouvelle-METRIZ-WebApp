// La Société Nouvelle

import { updater_to_1_0_1 } from "./updater_1_0_1";
import { updater_to_1_0_2 } from "./updater_1_0_2";
import { updater_to_1_0_6 } from "./updater_1_0_6";
import { updater_2_0_0 } from "./updater_2_0_0";
import { updater_to_3_0_0 } from "./updater_3_0_0";
import { updater_to_3_0_4 } from "./updater_3_0_4";


/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

/** Functions to update session JSON to current version
 *  ex. function updater_2_2_1 -> convert session JSON to version 2.2.1
 * 
 *  Versions :
 *    1.0.0
 * 
 */

export const updateVersion = async (sessionData) => 
{
  // to version 1.0.1
  if (/^1\.0\.0/.test(sessionData.version)) {
    await updater_to_1_0_1(sessionData);
  }

  // to version 1.0.2
  if (/^1\.0\.1/.test(sessionData.version)) {
    await updater_to_1_0_2(sessionData);
  }

  // to version 1.0.6
  if (/^1\.0\.(2|3|4|5)/.test(sessionData.version)) {
    await updater_to_1_0_6(sessionData);
  }

  // to version 2.0.0
  if (/^1/.test(sessionData.version)) {
    await updater_2_0_0(sessionData);
  }

  // to version 3.0.0
  if (/^2/.test(sessionData.version)) {
    await updater_to_3_0_0(sessionData);
  }

  // to version 3.0.4
  if (/^3.0.[0-3]/.test(sessionData.version)) {
    await updater_to_3_0_4(sessionData);
  }
};