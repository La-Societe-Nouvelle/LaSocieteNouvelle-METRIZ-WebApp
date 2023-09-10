// La Société Nouvelle

// Utils
import { distance } from "fastest-levenshtein";

/* ---------------------------------------------------------------------------- */
/* ------------------------- ACCOUNTS MAPPING SCRIPTS ------------------------- */

/** MappingAccounts : 
 *    "account": { 
 *      accountAux:"immobilisationAccount", 
 *      directMatching: (true|false) 
 *    }
 * 
 */

// check mapping
export const buildMappingAssetAccounts = async (accounts) => 
{
  // mappingAccounts : "account": { accountAux:"immobilisationAccount", directMatching: (true|false) }
  //let mappingAccounts = {}

  let accountsToMap = Object.keys(accounts).filter((accountNum) =>
    /^(2[8-9]|39)/.test(accountNum)
  ); // amortisation & depreciation accounts
  let assetAccounts = Object.keys(accounts).filter((accountNum) =>
    /^(2[0-1]|3[0-8])/.test(accountNum)
  ); // immobilisation & stock accounts

  // try simple mapping
  accountsToMap.forEach(async (accountToMapNum) => 
  {
    // get asset account matching default pattern
    let assetAccount = assetAccounts.filter((assetAccount) =>
      assetAccount.startsWith(accountToMapNum[0] + accountToMapNum.substring(2))
    );

    // build mappingAccounts
    if (assetAccount.length == 1) {
      // if single match
      let assetAccountNum = assetAccount[0];
      accounts[accountToMapNum].directMatching = true;
      accounts[accountToMapNum].assetAccountNum = assetAccountNum;
      accounts[accountToMapNum].assetAccountLib =
        accounts[assetAccountNum].accountLib;
      // asset
      if (accountToMapNum.charAt(1) == "8") {
        accounts[assetAccountNum].amortisationAccountNum = accountToMapNum;
        accounts[assetAccountNum].amortisationAccountLib =
          accounts[accountToMapNum].accountLib;
      } else if (accountToMapNum.charAt(1) == "9") {
        accounts[assetAccountNum].depreciationAccountNum = accountToMapNum;
        accounts[assetAccountNum].depreciationAccountLib =
          accounts[accountToMapNum].accountLib;
      }
    } else {
      accounts[accountToMapNum].directMatching = false;
      accounts[accountToMapNum].assetAccountNum = undefined;
      accounts[accountToMapNum].assetAccountLib = undefined;
    }
  });

  // if not all accounts mapped
  if (accountsToMap.some((accountToMap) => !accounts[accountToMap].directMatching)) 
  {
    // build distances between accounts for all possible associations
    let distances = [];
    accountsToMap.forEach((accountToMap) => {
      assetAccounts
        .filter((assetAccount) => assetAccount[0] == accountToMap[0]) // asset account from the same accouting class
        .forEach((assetAccountNum) => {
          let expectedAssetAccountNum =
            accountToMap[0] + accountToMap.substring(2) + "0"; // ref account num
          let distanceWithNum = distance(
            expectedAssetAccountNum,
            assetAccountNum
          );
          let distanceWithLib = distance(
            accounts[accountToMap].accountLib,
            accounts[assetAccountNum].accountLib
          );
          let prefixLength = getPrefixLength(
            expectedAssetAccountNum,
            assetAccountNum
          );

          distances.push({
            accountNum: accountToMap,
            assetAccountNum,
            distanceWithNum,
            distanceWithLib,
            prefixLength: prefixLength,
            expectedAssetAccountNum,
          });
        });
    });

    // Map with prefix length
    distances.forEach((distance) => (distance.stashed = false)); // init values stahed
    let assetAccountWithPrefixLength = await mapAccountsWithPrefixLength(
      distances
    ); // return JSON with mappings

    // Map with accountNum distance
    distances.forEach((distance) => (distance.stashed = false));
    let assetAccountWithNumDistances = await mapAccountsWithNumDistances(
      distances
    );

    // Map with accountLib distance
    distances.forEach((distance) => (distance.stashed = false));
    let assetAccountWithLibDistances = await mapAccountsWithLibDistances(
      distances
    );

    // Merge accountAux matching (duplicates possible)
    let mappings = [];
    for (let accountToMap of accountsToMap) {
      let assetAccounts = [
        accounts[accountToMap].assetAccountNum,
        assetAccountWithPrefixLength[accountToMap],
        assetAccountWithNumDistances[accountToMap],
        assetAccountWithLibDistances[accountToMap],
      ];
      assetAccounts
        .filter((assetAccountNum) => assetAccountNum) // remove empty string or undefined
        .forEach((assetAccountNum) =>
          mappings.push({
            accountNum: accountToMap,
            assetAccountNum: assetAccountNum,
          })
        );
    }

    // build res
    accountsToMap.forEach((accountToMapNum) => {
      let assetAccounts = mappings
        .filter((mapping) => mapping.accountNum == accountToMapNum) // get all solutions for depreciation account
        .map((mapping) => mapping.assetAccountNum)
        .filter(
          (value, index, self) =>
            index === self.findIndex((item) => item === value)
        ); // remove duplicates

      // if only one asset account match and if that asset account not match for another amortisation/depreciation account
      if (
        assetAccounts.length == 1 &&
        mappings.filter(
          (mapping) =>
            mapping.accountNum != accountToMapNum &&
            mapping.assetAccountNum == assetAccounts[0]
        ).length == 0
      ) {
        let assetAccountNum = assetAccounts[0];
        accounts[accountToMapNum].assetAccountNum = assetAccountNum;
        accounts[accountToMapNum].assetAccountLib =
          accounts[assetAccountNum].accountLib;
        // asset account data
        if (accountToMapNum.charAt(1) == "8") {
          accounts[assetAccountNum].amortisationAccountNum = accountToMapNum;
          accounts[assetAccountNum].amortisationAccountLib =
            accounts[accountToMapNum].accountLib;
        } else if (accountToMapNum.charAt(1) == "9") {
          accounts[assetAccountNum].depreciationAccountNum = accountToMapNum;
          accounts[assetAccountNum].depreciationAccountLib =
            accounts[accountToMapNum].accountLib;
        }
      } else {
        accounts[accountToMapNum].assetAccountNum = undefined;
        accounts[accountToMapNum].assetAccountLib = undefined;
      }
    });
  }

  return accounts;
}

const getPrefixLength = (stringA, stringB) => {
  let prefixLength = 0;
  while (
    stringA[prefixLength] == stringB[prefixLength] &&
    prefixLength < stringA.length &&
    prefixLength < stringB.length
  )
    prefixLength++;
  return prefixLength;
};

// Mapping with prefix
const mapAccountsWithPrefixLength = async (distances) => {
  let mapping = {};

  if (distances.length == 0) return mapping;

  // filter distances to map (accounts stashed included)
  let maxPrefixLength = Math.max(
    ...distances
      .filter((item) => !item.stashed)
      .map((item) => item.prefixLength)
  ); // max prefixLength of distances not stashed
  let distancesToMap = distances.filter(
    (distance) => distance.prefixLength == maxPrefixLength && !distance.stashed
  );

  // stashed distances
  let stashedDistances = distances.filter((distance) => distance.stashed);

  // mapping if distincts account & accountAux with min distance
  for (let distanceToMap of distancesToMap) {
    if (
      distancesToMap
        .concat(stashedDistances)
        .filter((distance) => distance.accountNum == distanceToMap.accountNum)
        .length == 1 && // only one amortisation/depreciation account
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1 && // only one asset account
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum &&
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1
    ) {
      // linked together
      mapping[distanceToMap.accountNum] = distanceToMap.assetAccountNum;
    } else
      distances
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum ||
            distance.assetAccountNum == distanceToMap.assetAccountNum
        )
        .forEach((distance) => (distance.stashed = true));
  }

  // filter remaining distances
  let remainingDistances = distances.filter(
    (distance) =>
      !Object.keys(mapping).includes(distance.accountNum) &&
      !Object.values(mapping).includes(distance.assetAccountNum)
  );

  // if remaining distance to map (accounts stashed excluded)
  if (remainingDistances.filter((distance) => !distance.stashed).length > 0) {
    let mappingRemainingDistances = await mapAccountsWithPrefixLength(
      remainingDistances
    );
    return Object.assign(mapping, mappingRemainingDistances);
  } else {
    return mapping;
  }
};

// Mapping with distances between numbers
const mapAccountsWithNumDistances = async (distances) => {
  let mapping = {};

  if (distances.length == 0) return mapping;

  // filter distances to map (accounts stashed included)
  let minDistanceNum = Math.min(
    ...distances
      .filter((item) => !item.stashed)
      .map((item) => item.distanceWithNum)
  ); // min distanceNum of distances not stashed
  let distancesWithMinDistance = distances.filter(
    (distance) =>
      distance.distanceWithNum == minDistanceNum && !distance.stashed
  );
  let maxPrefixLength = Math.max(
    ...distancesWithMinDistance.map((distance) => distance.prefixLength)
  ); // max prefixLength of distances with min distanceNum and not stashed
  let distancesToMap = distancesWithMinDistance.filter(
    (distance) => distance.prefixLength == maxPrefixLength
  );

  // stashed distances
  let stashedDistances = distances.filter((distance) => distance.stashed);

  // mapping if distincts account & accountAux with min distance
  for (let distanceToMap of distancesToMap) {
    if (
      distancesToMap
        .concat(stashedDistances)
        .filter((distance) => distance.accountNum == distanceToMap.accountNum)
        .length == 1 &&
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1 &&
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum &&
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1
    ) {
      mapping[distanceToMap.accountNum] = distanceToMap.assetAccountNum;
    } else
      distances
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum ||
            distance.assetAccountNum == distanceToMap.assetAccountNum
        )
        .forEach((distance) => (distance.stashed = true));
  }

  // filter remaining distances
  let remainingDistances = distances.filter(
    (distance) =>
      !Object.keys(mapping).includes(distance.accountNum) &&
      !Object.values(mapping).includes(distance.assetAccountNum)
  );

  // if remaining distance to map (accounts stashed excluded)
  if (remainingDistances.filter((distance) => !distance.stashed).length > 0) {
    let mappingRemainingDistances = await mapAccountsWithNumDistances(
      remainingDistances
    );
    return Object.assign(mapping, mappingRemainingDistances);
  } else {
    return mapping;
  }
};

// Mapping with distances between numbers
const mapAccountsWithLibDistances = async (distances) => {
  let mapping = {};

  if (distances.length == 0) return mapping;

  // filter distances to map (accounts stashed included)
  let minDistanceLib = Math.min(
    ...distances
      .filter((item) => !item.stashed)
      .map((item) => item.distanceWithLib)
  ); // min distanceLib of distances not stashed
  let distancesWithMinDistance = distances.filter(
    (distance) =>
      distance.distanceWithLib == minDistanceLib && !distance.stashed
  );
  let maxPrefixLength = Math.max(
    ...distancesWithMinDistance.map((distance) => distance.prefixLength)
  ); // max prefixLength of distances with min distanceLib and not stashed
  let distancesToMap = distancesWithMinDistance.filter(
    (distance) => distance.prefixLength == maxPrefixLength
  );

  // stashed distances
  let stashedDistances = distances.filter((distance) => distance.stashed);

  // mapping if distincts account & accountAux with min distance
  for (let distanceToMap of distancesToMap) {
    if (
      distancesToMap
        .concat(stashedDistances)
        .filter((distance) => distance.accountNum == distanceToMap.accountNum)
        .length == 1 &&
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1 &&
      distancesToMap
        .concat(stashedDistances)
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum &&
            distance.assetAccountNum == distanceToMap.assetAccountNum
        ).length == 1
    ) {
      mapping[distanceToMap.accountNum] = distanceToMap.assetAccountNum;
    } else
      distances
        .filter(
          (distance) =>
            distance.accountNum == distanceToMap.accountNum ||
            distance.assetAccountNum == distanceToMap.assetAccountNum
        )
        .forEach((distance) => (distance.stashed = true));
  }

  // filter remaining distances
  let remainingDistances = distances.filter(
    (distance) =>
      !Object.keys(mapping).includes(distance.accountNum) &&
      !Object.values(mapping).includes(distance.assetAccountNum)
  );

  // if remaining distance to map (accounts stashed excluded)
  if (remainingDistances.filter((distance) => !distance.stashed).length > 0) {
    let mappingRemainingDistances = await mapAccountsWithLibDistances(
      remainingDistances
    );
    return Object.assign(mapping, mappingRemainingDistances);
  } else {
    return mapping;
  }
};