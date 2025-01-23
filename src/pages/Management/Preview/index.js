import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleDocument } from "../../../services";
import LiveCollaboration from "../../../components/LiveCollaboration";

const Preview = () => {
  const { documentId } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchDocumentUrl = () => {
      getSingleDocument(documentId).then((res) => {
        setFile(res.doc);
      });
    };

    fetchDocumentUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  return (
    <React.Fragment key={documentId}>
      {file && <LiveCollaboration file={file} />}
    </React.Fragment>
  );
};

export default Preview;
