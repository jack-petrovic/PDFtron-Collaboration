import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { Box } from "@mui/material";
import WebViewer from "@pdftron/webviewer";
import { getAnnotationsByDocument, getProhibitedWords } from "../../services";
import {
  sendAnnotationChange,
  clearWebViewerStorage,
} from "../../utils/helper";
import { URL_WEB_SOCKET } from "../../constants";
import { useAuthState } from "../../hooks/redux";

function LiveCollaboration(props) {
  const { t } = useTranslation();
  let doc = props.file;
  const { account } = useAuthState();
  const { language } = i18next;
  const DOCUMENT_ID = doc?.documentId;
  const [prohibitedWords, setProhibitedWords] = useState([]);
  const [instance, setInstance] = useState();
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const viewer = useRef(null);
  const getLocaleString = (key) => t(key);

  const prohibitedWord = useMemo(() => {
    return (function* () {
      for (const word of prohibitedWords || []) {
        yield word;
      }
    })();
  }, [prohibitedWords]);

  const loadXfdfStrings = (documentId) => {
    return getAnnotationsByDocument(documentId);
  };

  useEffect(() => {
    let query = {};
    query.pageSize = 1000;
    query.page = 1;
    query.keyword = "";
    getProhibitedWords(query)
      .then((res) => {
        setProhibitedWords(res?.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  }, []);

  useEffect(() => {
    if (instance && searching) {
      const currentWord = prohibitedWord.next();

      if (currentWord?.value) {
        const searchOptions = {
          caseSensitive: false,
          wholeWord: false,
          wildcard: false,
          regex: false,
          searchUp: false,
          ambientString: true,
        };
        instance.UI.searchTextFull(currentWord?.value.name, searchOptions);
      } else {
        setSearching(false);
      }
    }
  }, [instance, results, searching, prohibitedWord]);

  useEffect(() => {
    const iframe = document.querySelector('iframe[id*="webviewer-"]');
    const innerDoc = iframe?.contentDocument || iframe?.contentWindow.document;
    let searchWordBtn = innerDoc?.getElementById("search-btn");

    const callback = () => {
      if (instance && prohibitedWords) {
        instance.Core.documentViewer.clearSearchResults();
        setSearching(true);
      }
    };

    if (instance && prohibitedWords) {
      const searchListener = (searchPattern, options, results) => {
        const newAnnotations = results.map((result) => {
          const annotation =
            new instance.Core.Annotations.RedactionAnnotation();
          annotation.PageNumber = result.pageNum;
          annotation.Quads = result.quads.map((quad) => quad.getPoints());
          annotation.StrokeColor = new instance.Core.Annotations.Color(
            255,
            0,
            255,
          );
          return annotation;
        });
        instance.Core.annotationManager.addAnnotations(newAnnotations);
        instance.Core.annotationManager.drawAnnotationsFromList(newAnnotations);
        instance.Core.documentViewer.setSearchHighlightColors({
          searchResult: "rgba(255, 0, 0, 0.5)",
          activeSearchResult: "rgba(255, 0, 0, 0.5)",
        });
        setResults((prev) => [...prev, ...results]);
      };

      instance.UI.addSearchListener(searchListener);

      if (searchWordBtn) {
        searchWordBtn.addEventListener("click", callback);
        searchWordBtn.innerHTML = getLocaleString(
          "search_prohibited_word_button",
        );
      } else {
        searchWordBtn = document.createElement("button");
        const renderCustomMenu = () => {
          searchWordBtn.innerHTML = getLocaleString(
            "search_prohibited_word_button",
          );
          searchWordBtn.id = "search-btn";
          searchWordBtn.style.color = "#FFF";
          searchWordBtn.style.border = "none";
          searchWordBtn.style.backgroundColor = "#589ad1";
          searchWordBtn.style[":hover"] = "#1a4971";
          searchWordBtn.style.borderRadius = "6px";
          searchWordBtn.style.paddingTop = "8px";
          searchWordBtn.style.paddingBottom = "8px";
          searchWordBtn.style.paddingRight = "12px";
          searchWordBtn.style.paddingLeft = "12px";
          searchWordBtn.style.cursor = "pointer";
          searchWordBtn.style.boxShadow = "inset 0 0 10px 1px #477da9";
          searchWordBtn.addEventListener("click", callback);
          return searchWordBtn;
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
      searchWordBtn?.removeEventListener("click", callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prohibitedWords, instance, language]);

  useEffect(() => {
    if (instance) {
      instance.UI.setLanguage(language);
    }
  }, [instance, language]);

  useEffect(() => {
    if (account.role) {
      WebViewer(
        {
          path: "/webviewer/lib", // path to the PDFTron 'lib' folder
          initialDoc: doc.urlFile,
          documentXFDFRetriever: async () => {
            console.log("-=================================================>");
            const rows = await loadXfdfStrings(DOCUMENT_ID);
            return rows.map((row) => row.xfdfString);
          },
        },
        viewer.current,
      ).then((instance) => {
        setInstance(instance);
        let connection = new WebSocket(URL_WEB_SOCKET);
        connection.onopen = () => {
          console.log("WebSocket Client Connected");
        };
        connection.onerror = (error) => {
          console.log(`WebSocket Client Error: ${error}`);
        };

        const Feature = instance.UI.Feature;
        instance.UI.openElements(["leftPanel"]);
        instance.UI.enableFeatures([Feature.InlineComment]);

        const { annotationManager, documentViewer, Annotations } =
          instance.Core;

        clearWebViewerStorage();

        documentViewer
          .getTool("AnnotationCreateTextUnderline")
          .setStyles(() => {
            return {
              StrokeColor: new Annotations.Color(account.role?.color || ""),
            };
          });

        documentViewer
          .getTool("AnnotationCreateTextHighlight")
          .setStyles(() => {
            return {
              StrokeColor: new Annotations.Color(account.role?.color || ""),
            };
          });

        documentViewer.getTool("AnnotationCreateSticky").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreateFreeText").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
            StrokeThickness: 0,
            TextColor: new Annotations.Color(account.role?.color || ""),
            FontSize: "15pt",
          };
        });

        documentViewer.getTool("AnnotationCreateFreeHand").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
            StrokeThickness: 20,
          };
        });

        documentViewer
          .getTool("AnnotationCreateFreeHandHighlight")
          .setStyles(() => {
            return {
              StrokeColor: new Annotations.Color(account.role?.color || ""),
              StrokeThickness: 20,
            };
          });

        documentViewer.getTool("AnnotationCreateRectangle").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
            StrokeThickness: 3,
          };
        });

        documentViewer.getTool("AnnotationCreateTextSquiggly").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
            StrokeThickness: 5,
          };
        });

        documentViewer
          .getTool("AnnotationCreateTextStrikeout")
          .setStyles(() => {
            return {
              StrokeColor: new Annotations.Color(account.role?.color || ""),
            };
          });

        documentViewer.getTool("AnnotationCreateLine").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreatePolyline").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreateArrow").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreateArc").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreateEllipse").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreatePolygon").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        documentViewer.getTool("AnnotationCreatePolygonCloud").setStyles(() => {
          return {
            StrokeColor: new Annotations.Color(account.role?.color || ""),
          };
        });

        annotationManager.setCurrentUser(account.role?.name);

        annotationManager.setAnnotationDisplayAuthorMap((role) => {
          return role;
        });

        const annotationChangedHandler = async () => {
          const xfdfString = await annotationManager.exportAnnotationCommand();
          // Parse xfdfString to separate multiple annotation changes to individual annotation change
          const parser = new DOMParser();
          const commandData = parser.parseFromString(xfdfString, "text/xml");
          const addedAnnots = commandData.getElementsByTagName("add")[0];
          const modifiedAnnots = commandData.getElementsByTagName("modify")[0];
          const deletedAnnots = commandData.getElementsByTagName("delete")[0];

          // List of added annotations
          addedAnnots.childNodes.forEach((child) => {
            sendAnnotationChange(
              connection,
              child,
              "add",
              DOCUMENT_ID,
              account.id,
            );
          });

          // List of modified annotations
          modifiedAnnots.childNodes.forEach((child) => {
            sendAnnotationChange(
              connection,
              child,
              "modify",
              DOCUMENT_ID,
              account.id,
            );
          });

          // List of deleted annotations
          deletedAnnots.childNodes.forEach((child) => {
            sendAnnotationChange(
              connection,
              child,
              "delete",
              DOCUMENT_ID,
              account.id,
            );
          });
        };

        annotationManager.addEventListener(
          "annotationChanged",
          annotationChangedHandler,
        );

        connection.onmessage = async (message) => {
          if (message.data !== "refresh") {
            const annotation = JSON.parse(message.data);
            const annotations = await annotationManager.importAnnotationCommand(
              annotation.xfdfString,
            );
            await annotationManager.drawAnnotationsFromList(annotations);
          }
        };

        instance.UI.setAnnotationContentOverlayHandler((annotation) => {
          const div = document.createElement("div");
          div.appendChild(
            document.createTextNode(`Created by: ${annotation.Author}`),
          );
          return div;
        });

        return () => {
          annotationManager.removeEventListener(
            "annotationChanged",
            annotationChangedHandler,
          );
          connection.close();
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return <Box ref={viewer} height="100%" />;
}

export default LiveCollaboration;
