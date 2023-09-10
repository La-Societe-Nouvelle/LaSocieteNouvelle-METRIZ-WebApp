// La Société Nouvelle

/* -------------------------- Options -------------------------- */

// Branches

import branches from "/lib/branches";

export const getBranchesOptions = () => {
  return Object.entries(branches)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([value, label]) => {
    return { value: value, label: value + " - " + label };
  });
};

// Divisions

import divisions from "/lib/divisions";

export const getDivisionsOptions = () => {
  return Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([value, label]) => {
      return { value: value, label: value + ' - ' + label };
    });
};

// Areas

import areas from "/lib/areas";

export const getAreasOptions = () => {
  return Object.entries(areas)
    .map(([value, label]) => {
      return { value: value, label:  label };
    });
};