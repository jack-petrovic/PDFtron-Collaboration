import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentUrl } from "../../../services";
import LiveCollaboration from "../../../components/LiveCollaboration"; // Ensure this returns a valid local URL

const Preview = () => {
  const { documentId } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchDocumentUrl = async () => {
      try {
        const res = await getDocumentUrl(documentId);
        setFile(res.doc);
      } catch (error) {
        console.error("Error fetching document URL:", error);
      }
    };

    fetchDocumentUrl();
  }, [documentId]);

  return (
    <React.Fragment key={documentId}>
      {file && <LiveCollaboration file={file} />}
    </React.Fragment>
  );
};

export default Preview;
