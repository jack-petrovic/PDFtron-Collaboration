// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link UI.setLanguage: https://docs.apryse.com/api/web/UI.html#.setLanguage__anchor
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    path: '../../../lib',
    additionalTranslations: {
      language: 'en',
      translations: { 'option.toolbarGroup.toolbarGroup-View': 'Edited View Label' },
    },
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);

  const currentLanguage = instance.UI.getCurrentLanguage();
  const radioButton = document.querySelector(`form > #${currentLanguage}`);
  if (radioButton) {
    radioButton.checked = true;
  }

  document.getElementById('form').onchange = e => {
    // Set language
    instance.UI.setLanguage(e.target.id);
  };
});
