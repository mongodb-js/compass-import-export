export default function fileOpenDialog() {
  const { dialog } = require('electron').remote;

  const filters = [
    { name: 'JSON', extensions: ['json', 'ndjson', 'jsonl'] },
    { name: 'CSV', extensions: ['csv', 'tsv'] },
    { name: 'All Files', extensions: ['*'] }
  ];
  const title = 'Select a file to import';

  return dialog.showOpenDialog({
    title,
    filters,
    properties: ['openFile', 'createDirectory', 'promptToCreate']
  });
}
