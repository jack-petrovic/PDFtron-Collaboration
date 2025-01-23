import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useDispatch } from "react-redux";
import ReactDOM from "react-dom/client";
import WebViewer from "@pdftron/webviewer";
import { getAnnotationsByDocument } from "../../services";
import { startLoading, finishLoading } from "../../redux/actions";
import TextDiffDialog from "../TextDiffDialog";
import ConfirmModal from "../Modal/ConfirmModal";
import { createComparison } from "../../services/comparison.service";
import {
  TextCompareContainer,
  TextCompareItem,
  TextCompareWrapper,
} from "./style";
import { SpinnerContainer } from "../SpinnerContainer";

const TextCompare = ({ file1, file2 }) => {
  const { t } = useTranslation();
  const { language } = i18next;
  const dispatch = useDispatch();
  const viewerCompare = useRef(null);
  const [totalPage1, setTotalPage1] = useState(null);
  const [totalPage2, setTotalPage2] = useState(null);
  const [instance, setInstance] = useState();
  const [canCompare, setCanCompare] = useState(false);
  const [documentViewer1, setDocumentViewer1] = useState();
  const [documentViewer2, setDocumentViewer2] = useState();
  const [loadDocument1, setLoadDocument1] = useState(false);
  const [loadDocument2, setLoadDocument2] = useState(false);
  const [openCompareModal, setOpenCompareModal] = useState(false);

  const getLocaleString = (key) => t(key);
  const loadXfdfStrings = (documentId) => {
    return getAnnotationsByDocument(documentId);
  };

  useEffect(() => {
    dispatch(startLoading());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (totalPage1 && totalPage2) {
      if (Math.abs(totalPage1 - totalPage2) < 10) {
        setCanCompare(true);
      } else {
        setOpenCompareModal(true);
      }
    }
  }, [totalPage1, totalPage2]);

  useEffect(() => {
    const modalDataId = `myCustomModal-${Date.now()}`;
    if (
      canCompare &&
      documentViewer1 &&
      documentViewer2 &&
      loadDocument1 &&
      loadDocument2 &&
      language
    ) {
      const iframe = document.querySelector('iframe[id*="webviewer-"]');
      const innerDoc =
        iframe?.contentDocument || iframe?.contentWindow.document;
      let resultBtn = innerDoc?.getElementById("result-btn");

      let resultElement = document.createElement("div");
      resultElement.setAttribute("id", "detail-modal-content");

      const modalOptions = {
        dataElement: modalDataId,
        header: {
          title: getLocaleString("comparison_modal_title"),
          className: "myCustomModal-header",
        },
        body: {
          className: "myCustomModal-body",
          style: {},
          children: [resultElement],
        },
      };

      instance.UI.addCustomModal(modalOptions);

      const callback = () => {
        instance.UI.openElements([modalOptions.dataElement]);
      };

      if (resultBtn) {
        resultBtn.addEventListener("click", callback);
        resultBtn.innerHTML = getLocaleString("compare_result_button");
      } else {
        const renderCustomMenu = () => {
          const resultBtn = document.createElement("button");
          resultBtn.id = "result-btn";
          resultBtn.innerHTML = getLocaleString("compare_result_button");
          resultBtn.style.color = "#FFF";
          resultBtn.style.border = "none";
          resultBtn.style.backgroundColor = "#1976d2";
          resultBtn.style.borderRadius = "6px";
          resultBtn.style.padding = "8px 12px";
          resultBtn.style.cursor = "pointer";
          resultBtn.style.boxShadow = "inset 0 0 10px 1px #477da9";
          resultBtn.addEventListener("click", callback);
          return resultBtn;
        };

        const newCustomElement = {
          type: "customElement",
          render: renderCustomMenu,
        };

        instance.UI.setHeaderItems((header) => {
          header.push(newCustomElement);
        });
      }

      const startCompare = async () => {
        if (loadDocument1 && loadDocument2) {
          const beforeColor = new instance.Core.Annotations.Color(
            21,
            205,
            131,
            0.4,
          );
          const afterColor = new instance.Core.Annotations.Color(
            255,
            73,
            73,
            0.4,
          );
          const options = { beforeColor, afterColor };
          const { doc1Annotations, diffCount } =
            await documentViewer1.startSemanticDiff(documentViewer2, options);

          let insertedNumber = 0;
          let deletedNumber = 0;
          let editedNumber = 0;

          doc1Annotations.forEach((annotation) => {
            switch (annotation.aj.TextDiffType) {
              case "insert":
                insertedNumber++;
                break;
              case "edit":
                editedNumber++;
                break;
              case "delete":
                deletedNumber++;
                break;
              default:
                break;
            }
          });

          const metaData = {
            total: doc1Annotations.length,
            inserted: insertedNumber,
            edited: editedNumber,
            deleted: deletedNumber,
          };

          await createComparison({
            planId: file2?.planId,
            stage: file2?.stage,
            metaData: JSON.stringify(metaData),
          });

          const modalContent = ReactDOM.createRoot(resultElement);
          modalContent.render(
            <TextDiffDialog
              total={diffCount}
              inserted={insertedNumber}
              edited={editedNumber}
              deleted={deletedNumber}
              planId={file2?.planId}
              stage={file2?.stage}
            />,
          );
        } else {
          console.log("Documents not loaded yet.");
        }
      };
      startCompare();
    }
    return () => {
      const iframe = document.querySelector('iframe[id*="webviewer-"]');
      const innerDoc =
        iframe?.contentDocument || iframe?.contentWindow.document;
      const originalModal = innerDoc?.querySelector(
        `[data-element="${modalDataId}"]`,
      );
      if (originalModal) {
        originalModal.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canCompare,
    documentViewer1,
    documentViewer2,
    loadDocument1,
    loadDocument2,
    language,
  ]);

  useEffect(() => {
    if (instance) {
      instance.UI.setLanguage(language);
    }
  }, [instance, language]);

  useEffect(() => {
    WebViewer.Iframe(
      {
        path: "/webviewer/lib",
        fullAPI: true,
        ui: "legacy",
        licenseKey:
          "demo:1733762057552:7ed577b4030000000021c2547b221caaa8034b12df9500f1a11ef76a43",
      },
      viewerCompare.current,
    ).then((instance) => {
      setInstance(instance);
      const { UI, Core } = instance;
      UI.enterMultiViewerMode();
      const { PDFNet } = Core;

      UI.addEventListener(UI.Events.MULTI_VIEWER_READY, async () => {
        await PDFNet.initialize();
        const [documentViewer1, documentViewer2] = Core.getDocumentViewers();
        setDocumentViewer1(documentViewer1);
        setDocumentViewer2(documentViewer2);

        if (file1 && file2) {
          const getDocument = async (url) => {
            const document = await Core.createDocument(url);
            return await document.getPDFDoc();
          };

          const [doc1, doc2] = await Promise.all([
            getDocument(file1.urlFile),
            getDocument(file2.urlFile),
          ]);

          const [count1, count2] = await Promise.all([
            doc1.getPageCount(),
            doc2.getPageCount(),
          ]);
          setTotalPage1(count1);
          setTotalPage2(count2);

          const getPageArray = async (doc) => {
            const arr = [];
            const itr = await doc.getPageIterator(1);

            for (itr; await itr.hasNext(); itr.next()) {
              const page = await itr.current();
              arr.push(page);
            }

            return arr;
          };

          const [doc1Pages, doc2Pages] = await Promise.all([
            getPageArray(doc1),
            getPageArray(doc2),
          ]);

          const pdfDoc1 = await PDFNet.PDFDoc.create();
          const pdfDoc2 = await PDFNet.PDFDoc.create();
          await pdfDoc1.lock();
          await pdfDoc2.lock();

          await pdfDoc1.insertPages(0, doc1, 1, doc1Pages.length, 1);
          await pdfDoc2.insertPages(0, doc2, 1, doc2Pages.length, 1);

          await pdfDoc1.unlock();
          await pdfDoc2.unlock();

          const options = await PDFNet.PDFDoc.createTextDiffOptions();

          await PDFNet.PDFDoc.highlightTextDiff(pdfDoc1, pdfDoc2, options);

          documentViewer1.loadDocument(pdfDoc1);
          documentViewer1.setDocumentXFDFRetriever(async () => {
            const rows = await loadXfdfStrings(file1.documentId);
            return rows.map((row) => row.xfdfString);
          });

          documentViewer2.loadDocument(pdfDoc2);
          documentViewer2.setDocumentXFDFRetriever(async () => {
            const rows = await loadXfdfStrings(file2.documentId);
            return rows.map((row) => row.xfdfString);
          });
        }

        documentViewer1.addEventListener("documentLoaded", () => {
          dispatch(finishLoading());
          setLoadDocument1(true);
        });
        documentViewer2.addEventListener("documentLoaded", () => {
          dispatch(finishLoading());
          setLoadDocument2(true);
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSuffix = (val) => {
    if (val === 3) return "rd";
    else if (val === 2) return "nd";
    else if (val === 1) return "st";
    return "th";
  };

  const handleCloseCompareModal = () => {
    setOpenCompareModal(false);
  };

  const handleClick = () => {
    setCanCompare(true);
    handleCloseCompareModal();
  };

  const handleClickCancel = () => {
    setCanCompare(false);
    dispatch(finishLoading());
    handleCloseCompareModal();
  };

  return (
    <TextCompareWrapper ref={viewerCompare}>
      {file1 && file2 && (
        <TextCompareContainer>
          <TextCompareItem>
            <span>
              {file1.stage} {getSuffix(file1.stage)}
            </span>
          </TextCompareItem>
          <TextCompareItem>
            <span>
              {file2.stage} {getSuffix(file2.stage)}
            </span>
          </TextCompareItem>
        </TextCompareContainer>
      )}
      <ConfirmModal
        content="compare_confirm_message"
        open={openCompareModal}
        close={handleCloseCompareModal}
        handleClick={handleClick}
        handleClickCancel={handleClickCancel}
      />
      <SpinnerContainer />
    </TextCompareWrapper>
  );
};
export default TextCompare;
