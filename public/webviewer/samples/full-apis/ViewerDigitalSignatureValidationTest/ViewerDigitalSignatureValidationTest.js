(() => {
  const certSelect = document.getElementById('certificate-select');
  const certUrlForm = document.getElementById('certificate-url-form');
  const docSelect = document.getElementById('document-select');
  const docUrlForm = document.getElementById('document-url-form');
  const filePicker = document.getElementById('file-picker');
  const certUrl = document.getElementById('certificate-url');
  const docUrl = document.getElementById('document-url');

  const instance = WebViewer.getInstance();

  const { VerificationOptions, openElements, loadDocument } = instance.UI;
  const { documentViewer } = instance.Core;

  const initialCert = 'https://pdftron.s3.amazonaws.com/downloads/pl/waiver.cer';
  VerificationOptions.addTrustedCertificates([initialCert]);

  documentViewer.addEventListener(
    'documentLoaded',
    () => {
      openElements(['signaturePanel']);
    },
    { once: true }
  );

  certSelect.addEventListener('change', e => {
    VerificationOptions.addTrustedCertificates([e.target.value]);
  });

  certUrlForm.addEventListener('submit', e => {
    e.preventDefault();
    certSelect.value = '';
    VerificationOptions.addTrustedCertificates([certUrl.value]);
  });

  docSelect.addEventListener('change', e => {
    loadDocument(e.target.value);
  });

  docUrlForm.addEventListener('submit', e => {
    e.preventDefault();
    docSelect.value = '';
    loadDocument(docUrl.value);
  });

  filePicker.addEventListener('change', e => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const ext = file.name.slice(file.name.lastIndexOf('.') + 1);

    if (ext === 'cer') {
      certSelect.value = '';
      VerificationOptions.addTrustedCertificates([file]);
    } else if (ext === 'pdf') {
      docSelect.value = '';
      loadDocument(file);
    }
  });
})();
// eslint-disable-next-line spaced-comment
//# sourceURL=config.js
