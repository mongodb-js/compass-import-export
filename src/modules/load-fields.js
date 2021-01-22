import util from 'util';
import dotnotation from '../utils/dotnotation';

const DEFAULT_SAMPLE_SIZE = 50;

export default async function loadFields(
  dataService,
  ns,
  filter = {},
  driverOptions = {}
) {
  const find = util.promisify(dataService.find.bind(dataService));

  const docs = await find(ns, filter, {
    limit: DEFAULT_SAMPLE_SIZE,
    ...driverOptions
  });

  const fieldsSet = docs.reduce((set, doc) => {
    const docKeys = Object.keys(dotnotation.serialize((doc)));
    return new Set([ ...set, docKeys]);
  }, new Set());

  return Array
    .from(fieldsSet)
    .sort()
    .reduce((folded, field) => {
      return { ...folded, [field]: 1 };
    }, {});
}
