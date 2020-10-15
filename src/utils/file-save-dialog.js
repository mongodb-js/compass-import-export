export default function fileSaveDialog(fileType, prefillFileName) {
  const { dialog, getCurrentWindow } = require('electron').remote;

  const filters = [
    {
      name: `${fileType} file`,
      extensions: [fileType.toLowerCase()],
      defaultPath: prefillFileName
    }
  ];
  const title = `Select ${fileType} target file`;
  const buttonLabel = 'Select';
  return dialog.showSaveDialog(getCurrentWindow(), {
    title,
    filters,
    buttonLabel
  });
}
