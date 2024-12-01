// @link WebViewerInstance: https://docs.apryse.com/api/web/WebViewerInstance.html
// @link UI.loadDocument: https://docs.apryse.com/api/web/UI.html#loadDocument__anchor
//
// Requires starting WebViewer Server in order to run
// eslint-disable-next-line no-undef
const { WebViewerConstructor, uiOption } = getSampleOptions();

const startWebViewer = () => {
  WebViewerConstructor(
    {
      path: '../../../lib',
      webviewerServerURL: hostname,
      initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
      ui: uiOption,
    },
    document.getElementById('viewer')
  ).then(instance => {
    samplesSetup(instance);
    document.getElementById('select').onchange = e => {
      instance.UI.loadDocument(e.target.value);
    };

    document.getElementById('file-picker').onchange = e => {
      const file = e.target.files[0];
      if (file) {
        instance.UI.loadDocument(file);
      }
    };

    document.getElementById('url-form').onsubmit = e => {
      e.preventDefault();
      instance.UI.loadDocument(document.getElementById('url').value);
    };
  });
};

let hostname = 'http://localhost:8090/';
if (window.location.hostname.includes('apryse.com')) {
  hostname = 'https://demo.apryse.com/';
}

const healthFunc = () => {
  if (this.status >= 500) {
    alert(`WebViewer Server at ${hostname} failing health checks, cannot connect...`); // eslint-disable-line no-alert
  } else if (this.status === 404) {
    alert(`WebViewer Server cannot be found at ${hostname}, please run \`npm run webviewer-server\``); // eslint-disable-line no-alert
  } else if (this.status >= 400) {
    alert(`WebViewer Server cannot be reached at ${hostname}`); // eslint-disable-line no-alert
  } else {
    startWebViewer();
  }
};

// Health check to ensure server is running
const healthCheck = new XMLHttpRequest();
healthCheck.onreadystatechange = () => {
  if (healthCheck.readyState === 4 && healthCheck.status === 0) {
    alert(`WebViewer Server at ${hostname} cannot be found, please run \`npm run webviewer-server\` in the WebViewer repository...`); // eslint-disable-line no-alert
  }
};

healthCheck.addEventListener('load', healthFunc);
healthCheck.open('GET', `${hostname}blackbox/health`);
healthCheck.send();
