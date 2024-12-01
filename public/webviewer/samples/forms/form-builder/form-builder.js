// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    path: '../../../lib',
    initialDoc: '../../full-apis/TestFiles/contract.pdf',
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);

  instance.UI.setToolbarGroup('toolbarGroup-Forms');
});
