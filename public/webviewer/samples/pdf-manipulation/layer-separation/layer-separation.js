// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link UI.openElements: https://docs.apryse.com/api/web/UI.html#.openElements__anchor
// @link UI.closeElements: https://docs.apryse.com/api/web/UI.html#.closeElements__anchor

// @link DocumentViewer: https://docs.apryse.com/api/web/Core.DocumentViewer.html
// @link DocumentViewer.refreshAll: https://docs.apryse.com/api/web/Core.DocumentViewer.html#refreshAll__anchor
// @link DocumentViewer.updateView: https://docs.apryse.com/api/web/Core.DocumentViewer.html#updateView__anchor

// @link Document: https://docs.apryse.com/api/web/Core.Document.html
// @link Document.getLayersArray: https://docs.apryse.com/api/web/Core.Document.html#getLayersArray__anchor
// @link Document.setLayersArray: https://docs.apryse.com/api/web/Core.Document.html#setLayersArray__anchor
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    path: '../../../lib',
    initialDoc: '../../../samples/files/construction-drawing-final.pdf',
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);
  const { documentViewer } = instance.Core;
  instance.UI.openElements(['leftPanel']);
  instance.UI.setActiveLeftPanel('layersPanel');
  documentViewer.addEventListener('pageComplete', () => {
    instance.UI.closeElements(['loadingModal']);
  });
});
