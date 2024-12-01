import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocument } from "../../../services";
import LiveCollaboration from "../../../components/LiveCollaboration";

const Collaboration = () => {
  const { documentId } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    getDocument(documentId).then((res) => {
      setFile(res.doc);
    });
  }, [documentId]);

  return (
    <React.Fragment key={documentId}>
      {file && <LiveCollaboration file={file} />}
    </React.Fragment>
  );
};

export default Collaboration;
