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
	  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
		if (tab && tab.length) 
		{
			if(tab[0].id)
			{
				localStorage.setItem("tab_id", tab[0].id.toString() );
		  		chrome.pageAction.show(tab[0].id);
			}
		}
	  });
	}, { url: [{ urlMatches: 'www.safeway.com' }, { urlMatches: 'www.fredmeyer.com' }] });
});

chrome.runtime.onConnect.addListener(function(port){
	port.postMessage({greeting:"hello from background"});
});