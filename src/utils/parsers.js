import csv from 'fast-csv';

export const createCSVParser = function() {
  return csv.parse({headers: true, ignoreEmpty: true});
};
