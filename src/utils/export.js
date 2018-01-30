import DocumentTransform from './document-transform';

export default function exportCollection(ds, name) {
  const cursor = ds.fetch(name, {});
  const docTransform = new DocumentTransform();
  cursor.rewind();

  cursor.pipe(docTransform);
  return { cursor, docTransform };
}
