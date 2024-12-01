(() => {
  const instance = WebViewer.getInstance();

  let snapMode;

  const getMouseLocation = e => {
    const scrollElement = instance.Core.documentViewer.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;

    return {
      x: e.pageX + scrollLeft,
      y: e.pageY + scrollTop,
    };
  };

  const mouseToPagePoint = e => {
    const displayMode = instance.Core.documentViewer.getDisplayModeManager().getDisplayMode();
    const windowPoint = getMouseLocation(e);

    const page = displayMode.getSelectedPages(windowPoint, windowPoint);
    const pageNumber = page.first !== null ? page.first : instance.Core.documentViewer.getCurrentPage();

    return {
      point: displayMode.windowToPage(windowPoint, pageNumber),
      pageNumber,
    };
  };

  const createSnapModesPanel = () => {
    const snapModesPanel = {
      dataElement: 'snapModesPanel',
      location: 'left',
      render: () => {
        const { DEFAULT, POINT_ON_LINE, LINE_MID_POINT, LINE_INTERSECTION, PATH_ENDPOINT } = instance.Core.documentViewer.SnapMode;

        const buttonContainer = document.createElement('div');
        const map = {
          Default: DEFAULT,
          'Point On Line': POINT_ON_LINE,
          'Line Midpoint': LINE_MID_POINT,
          'Line Intersection': LINE_INTERSECTION,
          'Path Endpoint': PATH_ENDPOINT,
        };
        Object.keys(map).forEach(key => {
          const div = document.createElement('div');
          div.style.margin = '0px 0px 12px 12px';

          const radioBtn = document.createElement('input');
          radioBtn.type = 'radio';
          radioBtn.style.marginRight = '10px';
          radioBtn.name = 'snapMode';
          radioBtn.value = map[key];
          radioBtn.id = key;
          radioBtn.addEventListener('change', e => {
            snapMode = parseInt(e.target.value, 10);
          });

          const label = document.createElement('label');
          label.innerHTML = key;
          label.for = key;

          div.appendChild(radioBtn);
          div.appendChild(label);
          buttonContainer.appendChild(div);
        });

        // make the default radio button checked
        buttonContainer.querySelector('input[id="Default"]').checked = true;

        return buttonContainer;
      },
    };

    instance.UI.addPanel(snapModesPanel);

    instance.UI.openElements([snapModesPanel.dataElement]);
  };

  createSnapModesPanel();

  instance.Core.documentViewer.addEventListener('pageComplete', () => {
    const lineAnnot = new Core.Annotations.LineAnnotation();
    lineAnnot.setStartPoint(0, 0);
    lineAnnot.setEndPoint(0, 0);
    lineAnnot.PageNumber = 1;

    const annotationManager = instance.Core.documentViewer.getAnnotationManager();
    annotationManager.addAnnotation(lineAnnot);

    let timeout;
    let shouldAddMouseMoveListener = true;
    document.onmousemove = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (shouldAddMouseMoveListener) {
          instance.Core.documentViewer.addEventListener('mouseMove', e => {
            const result = mouseToPagePoint(e);
            const pagePoint = result.point;
            const pageNumber = result.pageNumber;
            const oldPageNumber = lineAnnot.PageNumber;

            lineAnnot.PageNumber = pageNumber;
            lineAnnot.setStartPoint(pagePoint.x, pagePoint.y);
            // refresh old page since line annotation has been removed from it
            if (pageNumber !== oldPageNumber) {
              annotationManager.drawAnnotations(oldPageNumber);
            }

            instance.Core.documentViewer.snapToNearest(pageNumber, pagePoint.x, pagePoint.y, snapMode).then(snapPoint => {
              lineAnnot.setEndPoint(snapPoint.x, snapPoint.y);
              annotationManager.redrawAnnotation(lineAnnot);
            });
          });
        }

        shouldAddMouseMoveListener = false;
      }, 100);
    };
  });
})(window);
// eslint-disable-next-line spaced-comment
//# sourceURL=config.js
