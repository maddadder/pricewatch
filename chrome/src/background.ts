chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(sender.tab)
		{
			if(sender.tab.url?.startsWith("https://www.safeway.com/shop/search-results.html"))
			{
				console.log(sender.tab);
				if (request.message === "initial_loading")
				{
					console.log("background received initial_loading");
					chrome.storage.sync.set({g_itemLabels:request.g_itemLabels});
					sendResponse({farewell: "goodbye"});
				}
			}
		}
		else
		{
			console.log(sender);
		}
	}
);
chrome.runtime.onInstalled.addListener(() => {
	chrome.webNavigation.onCompleted.addListener(() => {
	  chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
		if (id) {
		  chrome.pageAction.show(id);
		}
	  });
	}, { url: [{ urlMatches: 'www.safeway.com' }, { urlMatches: 'www.fredmeyer.com' }] });
});
