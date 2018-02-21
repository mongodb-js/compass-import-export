export default function importCollection(dataService, ns, source) {
  const collection = dataService.client._collection(ns);
  return source.map((docs) => {
    return collection.insertMany(docs, { ordered: false });
  });
}
