// Octotree needs to start as soon as the HTML document is loaded in order to give smooth
// experience for users. So the event chrome.webNavigation.onCommitted is used for initializing
chrome.webNavigation.onCommitted.addListener(initOctotree, {
  url: [{hostEquals: 'github.com'}]
});

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
  const handler = {
    requestPermissions: () => {
      const urls = (req.urls || []).filter((url) => url.trim() !== '').map((url) => {
        if (url.slice(-2) === '/*') {
          return url;
        }
        if (url.slice(-1) === '/') {
          return url + '*';
        }
        return url + '/*';
      });

      if (urls.length === 0) {
        sendRes(true);
        removeUnnecessaryPermissions();
      } else {
        chrome.permissions.request({origins: urls}, (granted) => {
          sendRes(granted);
          removeUnnecessaryPermissions();
        });
      }
      return true;

      function removeUnnecessaryPermissions() {
        const whitelist = urls.concat(['https://github.com/*']);
        chrome.permissions.getAll((permissions) => {
          const toBeRemovedUrls = permissions.origins.filter((url) => {
            return !~whitelist.indexOf(url);
          });

          if (toBeRemovedUrls.length) {
            chrome.permissions.remove({origins: toBeRemovedUrls});
          }
        });
      }
    }
  };

  return handler[req.type]();
});

function initOctotree(data) {
  const cssFiles = ['jstree.css', 'file-icons.css', 'octotree.css'];

  const jsFiles = [
    'file-icons.js',
    'jquery.js',
    'jquery-ui.js',
    'jstree.js',
    'keymaster.js',
    'ondemand.js',
    'octotree.js'
  ];

  eachTask([
    (cb) => eachItem(cssFiles, inject('insertCSS'), cb),
    (cb) => eachItem(jsFiles, inject('executeScript'), cb)
  ]);

  function inject(fn) {
    return (file, cb) => {
      chrome.tabs[fn](data.tabId, {file: file, runAt: 'document_start'}, cb);
    };
  }
}

function eachTask(tasks, done) {
  (function next(index = 0) {
    if (index === tasks.length) {
      done && done();
    } else {
      tasks[index](() => next(++index));
    }
  })();
}

function eachItem(arr, iter, done) {
  const tasks = arr.map((item) => {
    return (cb) => iter(item, cb);
  });

  return eachTask(tasks, done);
}
