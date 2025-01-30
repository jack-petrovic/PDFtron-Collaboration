import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useDispatch } from "react-redux";
import ReactDOM from "react-dom/client";
import WebViewer from "@pdftron/webviewer";
import resemble from "resemblejs";
import { startLoading, finishLoading } from "../../redux/actions";
import { createComparison } from "../../services/comparison.service";
import ConfirmModal from "../Modal/ConfirmModal";
import ImageDiffDialog from "../ImageDiffDialog";
import {
  ImageCompareContainer,
  ImageCompareItem,
  ImageCompareWrapper,
} from "./style";
import { SpinnerContainer } from "../SpinnerContainer";

const ImageCompare = ({ file1, file2, isRandomMode }) => {
  const { t } = useTranslation();
  const { language } = i18next;
  const dispatch = useDispatch();
  const viewerCompare = useRef(null);
  const [imageData1, setImageData1] = useState();
  const [imageData2, setImageData2] = useState();
  const [totalPage1, setTotalPage1] = useState(null);
  const [totalPage2, setTotalPage2] = useState(null);
  const [instance, setInstance] = useState();
  const [documentViewer1, setDocumentViewer1] = useState();
  const [documentViewer2, setDocumentViewer2] = useState();
  const [resultImageData, setResultImageData] = useState();
  const [canCompare, setCanCompare] = useState(false);
  const [page1, setPage1] = useState(null);
  const [page2, setPage2] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const loadDocumentViewer = useCallback(
    async (pdfNet, documentViewer, callback, page) => {
      const doc = await documentViewer.getDocument().getPDFDoc();
      const pdfDraw = await pdfNet.PDFDraw.create(92);
      const itr = await doc.getPageIterator(Number(page));
      const currentPage = await itr.current();
      const pngBuffer = await pdfDraw.exportBuffer(currentPage, "PNG");
      callback({
        width: currentPage.getPageWidth(),
        height: currentPage.getPageHeight(),
        data: pngBuffer,
      });
    },
    [],
  );

  const loadTotalPage = useCallback(async (documentViewer, callback) => {
    const totalPage = documentViewer.getPageCount();
    callback(totalPage);
  }, []);

  const handleSetPage = (modalDataId) => {
    const iframe = document.querySelector('iframe[id*="webviewer-"]');
    const innerDoc = iframe?.contentDocument || iframe?.contentWindow.document;
    const inputPage1 = innerDoc?.getElementById("unique_id_1").value;
    const inputPage2 = innerDoc?.getElementById("unique_id_2").value;

    setPage1(inputPage1);
    setPage2(inputPage2);
    instance.UI.closeElements([modalDataId]);
  };

  useEffect(() => {
    if (!isRandomMode) {
      dispatch(startLoading());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRandomMode]);

  useEffect(() => {
    if (totalPage1 && totalPage2) {
      if (Math.abs(totalPage1 - totalPage2) < 10) {
        setCanCompare(true);
      } else {
        setOpenConfirmModal(true);
      }
    }
  }, [totalPage1, totalPage2]);

  useEffect(() => {
    const modalDataId = `myCustomModal - ${Date.now()}`;
    if (canCompare && language) {
      const iframe = document.querySelector('iframe[id*="webviewer-"]');
      const innerDoc =
        iframe?.contentDocument || iframe?.contentWindow.document;
      let selectBtn = innerDoc?.getElementById("select-page-btn");

      let divInput1 = document.createElement("input");
      divInput1.type = "text";
      divInput1.id = "unique_id_1";
      divInput1.type = "number";
      divInput1.placeholder = getLocaleString(
        "image_compare_modal_first_input_placeholder",
      );
      divInput1.setAttribute(
        "style",
        "width: 200px; height: 28px; margin-top: 10px; margin-right: 20px; padding-left: 8px;",
      );

      let divInput2 = document.createElement("input");
      divInput2.type = "text";
      divInput2.id = "unique_id_2";
      divInput2.type = "number";
      divInput2.placeholder = getLocaleString(
        "image_compare_modal_second_input_placeholder",
      );
      divInput2.setAttribute(
        "style",
        "width: 200px; height: 28px; margin-top: 10px; padding-left: 8px;",
      );

      const modalOptions = {
        dataElement: modalDataId,
        header: {
          title: getLocaleString("image_compare_modal_title"),
          className: "myCustomModal-header",
        },
        body: {
          className: "myCustomModal-body",
          style: {},
          children: [divInput1, divInput2],
        },
        footer: {
          className: "myCustomModal-footer footer",
          style: {},
          children: [
            {
              title: getLocaleString("image_compare_modal_cancel_button"),
              button: true,
              style: {},
              className: "modal-button cancel-form-field-button",
              onClick: () => {
                instance.UI.closeElements([modalDataId]);
              },
            },
            {
              title: getLocaleString("image_compare_modal_ok_button"),
              button: true,
              style: {},
              className: "modal-button confirm ok-btn",
              onClick: () => handleSetPage(modalDataId),
            },
          ],
        },
      };
      instance.UI.addCustomModal(modalOptions);

      const callback = () => {
        instance.UI.openElements([modalOptions.dataElement]);
      };

      if (selectBtn) {
        selectBtn.addEventListener("click", callback);
        selectBtn.innerHTML = getLocaleString("compare_select_page_button");
      } else {
        const renderCustomMenu = () => {
          selectBtn = document.createElement("button");
          selectBtn.id = "select-page-btn";
          selectBtn.innerHTML = getLocaleString("compare_select_page_button");
          selectBtn.style.color = "#FFF";
          selectBtn.style.border = "none";
          selectBtn.style.backgroundColor = "#1976d2";
          selectBtn.style[":hover"] = "#1a4971";
          selectBtn.style.borderRadius = "6px";
          selectBtn.style.paddingTop = "8px";
          selectBtn.style.paddingBottom = "8px";
          selectBtn.style.paddingRight = "12px";
          selectBtn.style.paddingLeft = "12px";
          selectBtn.style.cursor = "pointer";
          selectBtn.style.boxShadow = "inset 0 0 10px 1px #477da9";
          selectBtn.addEventListener("click", callback);
          return selectBtn;
        };

        const newCustomElement = {
          type: "customElement",
          render: renderCustomMenu,
        };

        instance.UI.setHeaderItems((header) => {
          header.push(newCustomElement);
        });
      }
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
  }, [canCompare, language]);

  useEffect(() => {
    if (page1 && page2 && documentViewer1 && documentViewer2) {
      loadDocumentViewer(
        instance.Core.PDFNet,
        documentViewer1,
        setImageData1,
        page1,
      );
      loadDocumentViewer(
        instance.Core.PDFNet,
        documentViewer2,
        setImageData2,
        page2,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page1, page2, documentViewer1, documentViewer2]);

  useEffect(() => {
    if (imageData1 && imageData2 && instance) {
      const pixelData1 = imageData1.data;
      const pixelData2 = imageData2.data;

      const img1 = new Image();
      const img2 = new Image();
      const diff = document.createElement("canvas");
      img1.src = URL.createObjectURL(
        new Blob([pixelData1], { type: "image/png" }),
      );
      img2.src = URL.createObjectURL(
        new Blob([pixelData2], { type: "image/png" }),
      );

      img2.onload = () => {
        diff.width = img1.width;
        diff.height = img1.height;
        resemble(new Blob([pixelData1], { type: "image/png" }))
          .compareTo(new Blob([pixelData2], { type: "image/png" }))
          .onComplete((data) => {
            setResultImageData(data.getImageDataUrl());
          });
      };
    }
  }, [imageData1, imageData2, instance]);

  useEffect(() => {
    const modalDataId = `myCustomModal - ${Date.now()}`;
    if (instance && resultImageData && language) {
      const iframe = document.querySelector('iframe[id*="webviewer-"]');
      const innerDoc =
        iframe?.contentDocument || iframe?.contentWindow.document;
      let imageCompareBtn = innerDoc?.getElementById("image-compare-btn");

      let resultElement = document.createElement("div");
      resultElement.setAttribute("id", "detail-modal-content");

      const modalOptions = {
        dataElement: modalDataId,
        header: {
          title: getLocaleString("comparison_modal_title"),
          className: "compareModal-header",
        },
        body: {
          className: "compareModal-body",
          style: {
            backgroundColor: "#eee",
          },
          children: [resultElement],
        },
      };

      instance.UI.addCustomModal(modalOptions);

      const modalContent = ReactDOM.createRoot(resultElement);
      modalContent.render(<ImageDiffDialog src={resultImageData} />);

      const callback = () => {
        instance.UI.openElements([modalOptions.dataElement]);
      };

      if (imageCompareBtn) {
        imageCompareBtn.addEventListener("click", callback);
        imageCompareBtn.innerHTML = getLocaleString("compare_result_button");
      } else {
        const renderCustomMenu = () => {
          imageCompareBtn = document.createElement("button");
          imageCompareBtn.id = "image-compare-btn";
          imageCompareBtn.innerHTML = getLocaleString("compare_result_button");
          imageCompareBtn.style.color = "#FFF";
          imageCompareBtn.style.border = "none";
          imageCompareBtn.style.backgroundColor = "#1976d2";
          imageCompareBtn.style[":hover"] = "#1a4971";
          imageCompareBtn.style.borderRadius = "6px";
          imageCompareBtn.style.paddingTop = "8px";
          imageCompareBtn.style.paddingBottom = "8px";
          imageCompareBtn.style.paddingRight = "12px";
          imageCompareBtn.style.paddingLeft = "12px";
          imageCompareBtn.style.marginLeft = "8px";
          imageCompareBtn.style.marginRight = "8px";
          imageCompareBtn.style.cursor = "pointer";
          imageCompareBtn.style.boxShadow = "inset 0 0 10px 1px #477da9";
          imageCompareBtn.addEventListener("click", callback);
          return imageCompareBtn;
        };

        const newCustomElement = {
          type: "customElement",
          render: renderCustomMenu,
        };

        instance.UI.setHeaderItems((header) => {
          header.push(newCustomElement);
        });
      }

      return () => {
        imageCompareBtn.removeEventListener("click", callback);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultImageData, instance, language]);

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
    )
      .then((instance) => {
        setInstance(instance);
        const { UI, Core } = instance;
        UI.enterMultiViewerMode();
        const { PDFNet } = Core;

        UI.addEventListener(UI.Events.VIEWER_LOADED, async () => {
          await PDFNet.initialize();
          const [documentViewer1, documentViewer2] = Core.getDocumentViewers();
          setDocumentViewer1(documentViewer1);
          setDocumentViewer2(documentViewer2);

          if (!isRandomMode) {
            createComparison({
              planId: file2?.planId,
              stage: file2?.stage,
              metaData: JSON.stringify(resultImageData),
            }).then();
          }

          if (file1 && file2) {
            if (!isRandomMode) {
              const getDocument = async (url) => {
                return await Core.createDocument(url);
              };

              const [docviewer1, docviewer2] = await Promise.all([
                getDocument(file1.urlFile),
                getDocument(file2.urlFile),
              ]);

              documentViewer1.loadDocument(docviewer1);
              documentViewer2.loadDocument(docviewer2);
            } else {
              documentViewer1.loadDocument(file1);
              documentViewer2.loadDocument(file2);
            }

            documentViewer1.addEventListener("documentLoaded", async () => {
              dispatch(finishLoading());
              loadTotalPage(documentViewer1, setTotalPage1);
            });

            documentViewer2.addEventListener("documentLoaded", async () => {
              dispatch(finishLoading());
              loadTotalPage(documentViewer2, setTotalPage2);
            });
          }
        });
      })
      .catch((error) => {
        console.log("error=>", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDocumentViewer]);

  const getSuffix = (val) => {
    if (val === 3) {
      return "rd";
    } else if (val === 2) {
      return "nd";
    } else if (val === 1) {
      return "st";
    }
    return "th";
  };

  const handleClick = () => {
    setCanCompare(true);
    handleCloseCompareModal();
  };

  const handleCloseCompareModal = () => {
    setOpenConfirmModal(false);
  };

  const handleClickCancel = () => {
    setCanCompare(false);
    handleCloseCompareModal();
    dispatch(finishLoading());
  };

  return (
    <ImageCompareWrapper ref={viewerCompare}>
      {file1 && file2 && !isRandomMode && (
        <ImageCompareContainer>
          <ImageCompareItem>
            <span>
              {file1.stage} {getSuffix(file1.stage)}
            </span>
          </ImageCompareItem>
          <ImageCompareItem>
            <span>
              {file2.stage} {getSuffix(file2.stage)}
            </span>
          </ImageCompareItem>
        </ImageCompareContainer>
      )}
      <SpinnerContainer />
      <ConfirmModal
        content="compare_confirm_message"
        open={openConfirmModal}
        close={handleCloseCompareModal}
        handleClick={handleClick}
        handleClickCancel={handleClickCancel}
      />
    </ImageCompareWrapper>
  );
};

export default ImageCompare;
