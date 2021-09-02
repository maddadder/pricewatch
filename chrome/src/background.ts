chrome.storage.sync.set({ color: '#3aa757' });

chrome.runtime.onInstalled.addListener(() => {
	chrome.webNavigation.onCompleted.addListener(() => {
	  chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
		if (id) {
		  chrome.pageAction.show(id);
		}
	  });
	}, { url: [{ urlMatches: 'www.safeway.com' }] });
});
