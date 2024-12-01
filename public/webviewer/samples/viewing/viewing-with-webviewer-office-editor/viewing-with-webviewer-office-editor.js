WebViewer(
  {
    path: '../../../lib',
    enableOfficeEditing: true,
    enableFilePicker: true,
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/legal-contract.docx',
  },
  document.getElementById('viewer')
);
