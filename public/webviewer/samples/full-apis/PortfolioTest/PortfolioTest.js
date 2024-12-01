WebViewer(
  {
    path: '../../../lib',
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/portfolio-sample.pdf',
    fullAPI: true,
  },
  document.getElementById('viewer')
).then(instance => {
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

  instance.Core.documentViewer.addEventListener('documentLoaded', () => {
    instance.UI.openElement('leftPanel');
  });

  instance.UI.enableFeatures([instance.UI.Feature.Portfolio]);
  instance.UI.setActiveLeftPanel('portfolioPanel');
});
