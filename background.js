var blockedHosts = []; // This will be populated from your CSV file
var allowedHosts = []; // This will store temporarily allowed hosts

// Fetch and parse data
fetch('https://raw.githubusercontent.com/trickest/zip/main/zip-domains.csv')
  .then(response => response.text())
  .then(data => {
    blockedHosts = parseCsv(data).map(item => item['host']);
  });

function parseCsv(data) {
  const lines = data.split('\n');
  const result = [];
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  return result;
}

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);
    if (
      blockedHosts.includes(url.hostname) &&
      !allowedHosts.includes(url.hostname)
    ) {
      return { redirectUrl: browser.extension.getURL('index.html') };
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = new URL(details.url);
    if (
      blockedHosts.includes(url.hostname) &&
      !allowedHosts.includes(url.hostname)
    ) {
      // Store the blocked URL in browser.storage.local
      browser.storage.local.set({ blockedUrl: details.url }, function () {
        console.log('Blocked URL is set to ' + details.url);
      });
      return { redirectUrl: browser.extension.getURL('warning.html') };
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command == 'allow') {
    var url = new URL(request.url);
    allowedHosts.push(url.hostname);
    sendResponse({ status: 'OK' });
  }
});
