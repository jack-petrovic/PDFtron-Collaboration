// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link WebViewerInstance.openElements: https://docs.apryse.com/api/web/UI.html#.openElements__anchor
// @link WebViewerInstance.setToolMode: https://docs.apryse.com/api/web/UI.html#.setToolMode__anchor

// @link AnnotationManager: https://docs.apryse.com/api/web/Core.AnnotationManager.html
// @link AnnotationManager.setCurrentUser: https://docs.apryse.com/api/web/Core.AnnotationManager.html#setCurrentUser__anchor
// @link AnnotationManager.getCurrentUser: https://docs.apryse.com/api/web/Core.AnnotationManager.html#getCurrentUser__anchor
// @link AnnotationManager.promoteUserToAdmin: https://docs.apryse.com/api/web/Core.AnnotationManager.html#promoteUserToAdmin__anchor
// @link AnnotationManager.demoteUserFromAdmin: https://docs.apryse.com/api/web/Core.AnnotationManager.html#demoteUserFromAdmin__anchor
// @link AnnotationManager.enableReadOnlyMode: https://docs.apryse.com/api/web/Core.AnnotationManager.html#enableReadOnlyMode__anchor
// @link AnnotationManager.getAnnotationsList: https://docs.apryse.com/api/web/Core.AnnotationManager.html#getAnnotationsList__anchor
// @link AnnotationManager.showAnnotations: https://docs.apryse.com/api/web/Core.AnnotationManager.html#showAnnotations__anchor
// @link AnnotationManager.hideAnnotations: https://docs.apryse.com/api/web/Core.AnnotationManager.html#hideAnnotations__anchor
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

WebViewerConstructor(
  {
    path: '../../../lib',
    initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
    ui: uiOption,
  },
  document.getElementById('viewer')
).then(instance => {
  samplesSetup(instance);
  const { annotationManager } = instance.Core;
  const { openElements } = instance.UI;
  let shouldShowAnnotFromOtherUsers = true;

  const toggleVisibility = () => {
    const currentUser = annotationManager.getCurrentUser();
    const allAnnotations = annotationManager.getAnnotationsList().filter(annot => annot.Listable);
    let annotationsToShow = allAnnotations;
    annotationManager.hideAnnotations(allAnnotations);

    if (!shouldShowAnnotFromOtherUsers) {
      annotationsToShow = allAnnotations.filter(annot => annot.Author === currentUser);
    }
    annotationManager.showAnnotations(annotationsToShow);
  };

  annotationManager.setCurrentUser('Justin');
  annotationManager.promoteUserToAdmin();
  openElements(['notesPanel']);

  document.getElementById('justin').onchange = () => {
    annotationManager.setCurrentUser('Justin');
    annotationManager.promoteUserToAdmin();
    annotationManager.disableReadOnlyMode();
    toggleVisibility();
  };

  document.getElementById('sally').onchange = () => {
    annotationManager.setCurrentUser('Sally');
    annotationManager.demoteUserFromAdmin();
    annotationManager.disableReadOnlyMode();
    toggleVisibility();
  };

  document.getElementById('brian').onchange = () => {
    annotationManager.setCurrentUser('Brian');
    annotationManager.demoteUserFromAdmin();
    annotationManager.enableReadOnlyMode();
    toggleVisibility();
  };

  document.getElementById('display').onchange = e => {
    shouldShowAnnotFromOtherUsers = e.target.checked;
    toggleVisibility();
  };
});
