//---------------------------------------------------------------------------------------
// Copyright (c) 2001-2023 by Apryse Software Inc. All Rights Reserved.
// Consult legal.txt regarding legal and license information.
//---------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------
// This sample explores the structure and content of a tagged PDF document and dumps
// the structure information to the console window.
//
// In tagged PDF documents StructTree acts as a central repository for information
// related to a PDF document's logical structure. The tree consists of StructElement-s
// and ContentItem-s which are leaf nodes of the structure tree.
//
// The sample can be extended to access and extract the marked-content elements such
// as text and images.
//---------------------------------------------------------------------------------------

(exports => {
  // @link PDFNet: https://docs.apryse.com/api/web/Core.PDFNet.html
  // @link PDFNet.PDFDoc: https://docs.apryse.com/api/web/Core.PDFNet.PDFDoc.html
  // @link PDFNet.Page: https://docs.apryse.com/api/web/Core.PDFNet.Page.html
  // @link PDFNet.ContentItem: https://docs.apryse.com/api/web/Core.PDFNet.ContentItem.html
  // @link PDFNet.Obj: https://docs.apryse.com/api/web/Core.PDFNet.Obj.html
  // @link PDFNet.Element: https://docs.apryse.com/api/web/Core.PDFNet.Element.html
  // @link PDFNet.ElementReader: https://docs.apryse.com/api/web/Core.PDFNet.ElementReader.html
  // @link PDFNet.STree: https://docs.apryse.com/api/web/Core.PDFNet.STree.html
  // @link PDFNet.SElement: https://docs.apryse.com/api/web/Core.PDFNet.SElement.html

  exports.runLogicalStructureTest = () => {
    const PDFNet = exports.Core.PDFNet;

    const PrintAndIndent = (printState, indent) => {
      if (printState.str) {
        const indentStr = ' '.repeat(printState.indent * 2);
        console.log(indentStr + printState.str);
      }
      printState.str = '';
      printState.indent = indent;
    };

    // Read the structure recursively
    const ReadDocumentStructure = async (element, parent) => {
      if (!(await element.isValid())) {
        return;
      }

      const [type, numKids] = await Promise.all([element.getType(), element.getNumKids()]);

      const elementData = {
        type,
        numKids,
        isLeaf: false,
        children: [],
      };

      if (await element.hasTitle()) {
        elementData.title = await element.getTitle();
      }

      parent.children.push(elementData);

      for (let i = 0; i < elementData.numKids; ++i) {
        // Check is the kid is a leaf node (i.e. it is a ContentItem).
        const contentItem = {
          isLeaf: await element.isContentItem(i),
        };
        if (contentItem.isLeaf) {
          const cont = await element.getAsContentItem(i);
          const [type, page] = await Promise.all([cont.getType(), cont.getPage()]);
          const pageNum = await page.getIndex();

          contentItem.type = type;
          contentItem.pageNum = pageNum;

          switch (type) {
            case PDFNet.ContentItem.Type.e_MCID:
            case PDFNet.ContentItem.Type.e_MCR:
              contentItem.mcid = await cont.getMCID();
              break;
            case PDFNet.ContentItem.Type.e_OBJR:
              {
                const refObj = await cont.getRefObj();
                if (refObj) {
                  contentItem.objNum = refObj.getObjNum();
                }
              }
              break;
            default:
              break;
          }
          elementData.children.push(contentItem);
        } else {
          // the kid is another StructElement node.
          await ReadDocumentStructure(await element.getAsStructElem(i), elementData);
        }
      }
    };

    // Read the elements sequentially with a reader
    const ReadElements = async doc => {
      const elements = [];
      const reader = await PDFNet.ElementReader.create();
      for (let itr = await doc.getPageIterator(); await itr.hasNext(); itr.next()) {
        const page = await itr.current();
        reader.beginOnPage(page);
        const pageNum = await page.getIndex();
        let element;
        while ((element = await reader.next())) {
          // Read page contents
          const readElement = {
            type: await element.getType(),
            pageNum,
          };
          if (readElement.type === PDFNet.Element.Type.e_path || readElement.type === PDFNet.Element.Type.e_text || readElement.type === PDFNet.Element.Type.e_path) {
            readElement.text = await element.getTextString();
            // Check if the element is associated with any structural element.
            // Content items are leaf nodes of the structure tree.
            const structParent = await element.getParentStructElement();
            readElement.isValid = await structParent.isValid();
            if (readElement.isValid) {
              readElement.structType = await structParent.getType();
              readElement.mcid = await element.getStructMCID();
              if (await structParent.hasTitle()) {
                readElement.title = await structParent.getTitle();
              }
              readElement.objNum = await (await structParent.getSDFObj()).getObjNum();
            }
            elements.push(readElement);
          }
        }
        reader.end();
      }
      return elements;
    };

    // Used in code snippet 1.
    const ProcessStructElement = (element, indent, printState) => {
      // Print out the type and title info, if any.
      PrintAndIndent(printState, indent++);
      printState.str += `Type: ${element.type}${element.title ? `. Title: ${element.title}` : ''}`;

      for (let i = 0; i < element.numKids; ++i) {
        const child = element.children[i];
        // Check is the kid is a leaf node (i.e. it is a ContentItem).
        if (child.isLeaf) {
          PrintAndIndent(printState, indent);
          printState.str += `Content Item. Part of page #${child.pageNum}`;

          PrintAndIndent(printState, indent);
          switch (child.type) {
            case PDFNet.ContentItem.Type.e_MCID:
            case PDFNet.ContentItem.Type.e_MCR:
              printState.str += `MCID: ${child.mcid}`;
              break;
            case PDFNet.ContentItem.Type.e_OBJR:
              printState.str += 'OBJR ';
              if (child.objNum) {
                printState.str += `- Referenced Object#: ${child.objNum}`;
              }
              break;
            default:
              break;
          }
        } else {
          // the kid is another StructElement node.
          ProcessStructElement(child, indent, printState);
        }
      }
    };

    // Used in code snippet 2.
    const ProcessElementsArray = (elementsArray, printState) => {
      for (let i = 0; i < elementsArray.length; i++) {
        // Read page contents
        const element = elementsArray[i];
        // In this sample we process only paths & text, but the code can be
        // extended to handle any element type.
        if (element.type === PDFNet.Element.Type.e_path || element.type === PDFNet.Element.Type.e_text || element.type === PDFNet.Element.Type.e_path) {
          switch (element.type) {
            case PDFNet.Element.Type.e_path: // Process path ...
              printState.str += '\nPATH: ';
              break;
            case PDFNet.Element.Type.e_text: // Process text ...
              printState.str += `\nTEXT: ${element.text}\n`;
              break;
            case PDFNet.Element.Type.e_form: // Process form XObjects
              printState.str += '\nFORM XObject: ';
              // reader.formBegin();
              // await ProcessElements(reader);
              // reader.end();
              break;
          }

          if (element.isValid) {
            // Print out the parent structural element's type, title, and object number.
            printState.str += ` Type: ${element.structType}, MCID: ${element.mcid}`;
            if (element.title) {
              printState.str += `. Title: ${element.title}`;
            }
            printState.str += `, Obj#: ${element.objNum}`;
          }
        }
      }
    };

    // Used in code snippet 3.
    const CreateMCIDDocMap = elementsArray => {
      const mcidDocMap = {};
      for (let i = 0; i < elementsArray.length; i++) {
        const element = elementsArray[i];
        if (!mcidDocMap[element.pageNum]) {
          mcidDocMap[element.pageNum] = {};
        }
        const pageMcidMap = mcidDocMap[element.pageNum];
        if (element.mcid >= 0 && element.type === PDFNet.Element.Type.e_text) {
          if (element.mcid in pageMcidMap) {
            pageMcidMap[element.mcid] += element.text;
          } else {
            pageMcidMap[element.mcid] = element.text;
          }
        }
      }
      return mcidDocMap;
    };

    // Used in code snippet 3.
    const ProcessStructElement2 = (element, mcidDocMap, indent, printState) => {
      // Print out the type and title info, if any.
      PrintAndIndent(printState, indent);
      printState.str += `<${element.type}${element.title ? ` title="${element.title}"` : ''}>`;

      for (let i = 0; i < element.numKids; ++i) {
        const child = element.children[i];
        if (child.isLeaf) {
          if (child.type === PDFNet.ContentItem.Type.e_MCID) {
            const pageNum = child.pageNum;
            const mcidPageMap = mcidDocMap[pageNum];
            if (mcidPageMap) {
              const mcid = child.mcid;
              if (mcid in mcidPageMap) {
                printState.str += mcidPageMap[mcid];
              }
            }
          }
        } else {
          // the kid is another StructElement node.
          ProcessStructElement2(child, mcidDocMap, indent + 1, printState);
        }
      }

      PrintAndIndent(printState, indent);
      printState.str += `</${element.type}>`;
    };

    const main = async () => {
      // Relative path to the folder containing test files.
      const inputPath = '../TestFiles/';
      const printState = { str: '' };
      try {
        // Extract logical structure from a PDF document
        const doc = await PDFNet.PDFDoc.createFromURL(`${inputPath}tagged.pdf`);
        doc.initSecurityHandler();

        const tree = await doc.getStructTree();
        const hasValidTree = await tree.isValid();
        const numKidsFromRoot = await tree.getNumKids();
        const structRoot = {
          children: [],
        };
        let elementsArray = [];

        if (hasValidTree) {
          console.log('Document has a StructTree root.');
          const [, elementsArr] = await Promise.all([
            new Promise(async res => {
              for (let i = 0, numKids = numKidsFromRoot; i < numKids; ++i) {
                // Recursively get structure info for all child elements.
                await ReadDocumentStructure(await tree.getKid(i), structRoot);
              }
              res();
            }),
            ReadElements(doc),
          ]);
          elementsArray = elementsArr;
        } else {
          console.log('This document does not contain any logical structure.');
        }

        console.log('____________________________________________________________');
        console.log('Sample 1 - Traverse logical structure tree...');
        for (let i = 0; i < structRoot.children.length; ++i) {
          // Recursively get structure info for all child elements.
          ProcessStructElement(structRoot.children[i], 0, printState);
        }
        PrintAndIndent(printState, 0);
        console.log('Done 1.');

        console.log('____________________________________________________________');
        console.log('Sample 2 - Get parent logical structure elements from');
        console.log('layout elements.');
        ProcessElementsArray(elementsArray, printState);
        PrintAndIndent(printState, 0);
        console.log('Done 2.');

        console.log('____________________________________________________________');
        console.log("Sample 3 - 'XML style' extraction of PDF logical structure and page content.");
        {
          const mcidDocMap = CreateMCIDDocMap(elementsArray);
          if (hasValidTree) {
            for (let i = 0, numKids = numKidsFromRoot; i < numKids; ++i) {
              ProcessStructElement2(structRoot.children[i], mcidDocMap, 0, printState);
            }
          }
        }
        PrintAndIndent(printState, 0);
        console.log('Done 3.');
        const docBuffer = await doc.saveMemoryBuffer(0);
        saveBufferAsPDFDoc(docBuffer, 'bookmark.pdf');
      } catch (err) {
        console.log(err);
      }
    };

    // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
    PDFNet.runWithCleanup(main);
  };
})(window);
// eslint-disable-next-line spaced-comment
//# sourceURL=LogicalStructureTest.js
