// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link UI.loadDocument: https://docs.apryse.com/api/web/UI.html#loadDocument__anchor
// @link UI.disableTools: https://docs.apryse.com/api/web/UI.html#disableTools__anchor
// @link UI.enableTools: https://docs.apryse.com/api/web/UI.html#enableTools__anchor
// @link UI.setToolMode: https://docs.apryse.com/api/web/UI.html#setToolMode__anchor
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    path: '../../../lib',
    initialDoc: 'https://s3.amazonaws.com/pdftron/downloads/pl/legal-contract.pdf',
    fullAPI: true,
    enableRedaction: true,
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);
  const { documentViewer } = instance.Core;

  document.getElementById('select').onchange = e => {
    instance.UI.loadDocument(e.target.value);
  };

  document.getElementById('file-picker').onchange = e => {
    const file = e.target.files[0];
    if (file) {
      instance.UI.loadDocument(file);
    }
  };

  document.getElementById('url-form').onsubmit = e => {
    e.preventDefault();
    instance.UI.loadDocument(document.getElementById('url').value);
  };

  documentViewer.addEventListener('documentLoaded', () => {
    instance.UI.setToolbarGroup('toolbarGroup-Redact');
    instance.UI.setToolMode('AnnotationCreateRedaction');

    document.getElementById('apply-redactions').onclick = () => {
      instance.UI.showWarningMessage({
        title: 'Apply redaction?',
        message: 'This action will permanently remove all items selected for ' + 'redaction. It cannot be undone.',
        onConfirm: () => {
          documentViewer.getAnnotationManager().applyRedactions();
          return Promise.resolve();
        },
      });
    };
  });
});
