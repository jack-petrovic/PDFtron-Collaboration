export const convertToXfdf = (changedAnnotation, action) => {
  let xfdfString = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><fields />`;
  if (action === "add") {
    xfdfString += `<add>${changedAnnotation}</add>`;
  } else if (action === "modify") {
    xfdfString += `<modify>${changedAnnotation}</modify>`;
  } else if (action === "delete") {
    xfdfString += `<delete>${changedAnnotation}</delete>`;
  }
  xfdfString += `</xfdf>`;
  return xfdfString;
};

const serializer = new XMLSerializer();
// helper function to send annotation changes to WebSocket server
export const sendAnnotationChange = (
  connection,
  annotation,
  action,
  documentId,
  userId,
) => {
  if (annotation.nodeType !== annotation.TEXT_NODE) {
    const annotationString = serializer.serializeToString(annotation);
    connection.send(
      JSON.stringify({
        event: "annotation",
        documentId,
        annotationId:
          action === "delete"
            ? annotation.textContent
            : annotation.getAttribute("name"),
        xfdfString: convertToXfdf(annotationString, action),
        userId,
      }),
    );
  }
};
export const sendNotification = (
  connection,
  userId,
  event,
  content,
  action,
) => {
  connection.send(
    JSON.stringify({
      userId,
      event,
      action,
      content,
      unread: true,
    }),
  );
};

export const clearWebViewerStorage = () => {
  const keys = [
    "toolData-AnnotationCreateTextUnderline",
    "toolData-AnnotationCreateTextHighlight",
    "toolData-AnnotationCreateSticky",
    "toolData-AnnotationCreateFreeText",
    "toolData-AnnotationCreateFreeHand",
    "toolData-AnnotationCreateFreeHandHighlight",
    "toolData-AnnotationCreateRectangle",
    "toolData-AnnotationCreateTextSquiggly",
    "toolData-AnnotationCreateTextStrikeout",
    "toolData-AnnotationCreateLine",
    "toolData-AnnotationCreatePolyline",
    "toolData-AnnotationCreateArrow",
    "toolData-AnnotationCreateArc",
    "toolData-AnnotationCreateEllipse",
    "toolData-AnnotationCreatePolygon",
    "toolData-AnnotationCreatePolygonCloud",
    "toolData-AnnotationCreateNote",
  ];
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};
