import streamToObservable from 'stream-to-observable';

import DocumentTransform from './document-transform';

export default function exportCollection(db, name) {
  const col = db.collection(name);
  const cursor = col.find({});
  const docTransform = new DocumentTransform();
  cursor.rewind();

  cursor.pipe(docTransform);
  return streamToObservable(docTransform);
}
