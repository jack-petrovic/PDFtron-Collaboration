// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link UI.setHeaderItems: https://docs.apryse.com/api/web/UI.html#setHeaderItems__anchor
// @link UI.openElements: https://docs.apryse.com/api/web/UI.html#openElements__anchor
// @link UI.loadDocument: https://docs.apryse.com/api/web/UI.html#loadDocument__anchor

// @link Header: https://docs.apryse.com/api/web/UI.Header.html
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    fullAPI: true, // Only required if using snapping feature
    path: '../../../lib',
    initialDoc: '../../../samples/files/houseplan-A.pdf',
    enableMeasurement: true,
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);
  instance.UI.setToolbarGroup('toolbarGroup-Measure');

  // If you would like to have snapping features enabled, you could do so with the following:
  // const { documentViewer, Tools } = instance.Core;
  // const distanceMeasurementTool = documentViewer.getTool(Tools.ToolNames.DISTANCE_MEASUREMENT);
  // distanceMeasurementTool.setSnapMode(Tools.SnapModes.DEFAULT);

  // open notes panel by default
  instance.UI.openElements(['notesPanel']);

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
});
