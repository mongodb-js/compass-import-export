export default function importCollection(db, name, source) {
  return source
    .map(
      docs => db.collection(name).insertMany(docs, { ordered: false })
    );
}
