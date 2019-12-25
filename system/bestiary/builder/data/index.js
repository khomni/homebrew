const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const path = require('path');
const SIZE = require('./size');

const options = {
  columns: true,
  cast: (value, context) => {
    if (context.header) return value;
    if (!isNaN(value)) return Number(value);
    return value;
  }
}

const STATS_BY_CR = parse(fs.readFileSync(path.join(__dirname, 'stats-by-cr.csv')), options)
const STATS_BY_SIZE = parse(fs.readFileSync(path.join(__dirname, 'stats-by-size.csv')), options)
const HD_BY_TYPE = parse(fs.readFileSync(path.join(__dirname, 'hd-by-type.csv')), options)
const REWARD_BY_CR = parse(fs.readFileSync(path.join(__dirname, 'reward-by-cr.csv')), options)

function rekeyByColumn(csv, columnName) {
  let rekeyedCSV = {
    __columnName: columnName
  };

  csv.forEach(row => {
    const uniqueColumnName = row[columnName];
    rekeyedCSV[uniqueColumnName] = row;
  });
  return rekeyedCSV;
}

module.exports = {
  STATS_BY_CR: rekeyByColumn(STATS_BY_CR, 'cr'),
  STATS_BY_SIZE: rekeyByColumn(STATS_BY_SIZE, 'size'),
  HD_BY_TYPE: rekeyByColumn(HD_BY_TYPE, 'creature_type'),
  REWARD_BY_CR: rekeyByColumn(REWARD_BY_CR, 'cr'),
  SIZE
}
