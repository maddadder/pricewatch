import * as Collections from 'typescript-collections';
import { debounce } from 'ts-debounce';
import { Product } from './models/Product';
import { SafewayScraper } from './scrapers/SafewayScraper';
import { FredMeyerScraper } from './scrapers/FredMeyerScraper';

var g_itemLabels = new Collections.Dictionary<string, Product>();

let observer = new MutationObserver(mutations => {
    for(let mutation of mutations) {
		if(mutation.addedNodes.length > 0){
			scrape(document);
			break;
		}
     }
});
observer.observe(document, { childList: true, subtree: true });

// Later, you can stop observing
//observer.disconnect();

let scrape = debounce((currentNode:Node) => 
{
	if(location.href.startsWith("https://www.safeway.com"))
	{
		console.log('scraping safeway.com')
		let scraper = new SafewayScraper();
		scraper.scrape(g_itemLabels, currentNode);
	}
	else if(location.href.startsWith("https://www.fredmeyer.com"))
	{
		console.log('scraping fredmeyer.com')
		let scraper = new FredMeyerScraper();
		scraper.scrape(g_itemLabels, currentNode);
	}
	else{
		console.log(location.href);
	}
	console.log("done scraping");
	var obj = { message:"initial_loading", g_itemLabels }
	chrome.runtime.sendMessage(obj, function(response) {
		console.log(response.farewell);
	});
}
,1000);


// Avoid recursive frame insertion...
var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
if (!location.ancestorOrigins.contains(extensionOrigin)) {
    var iframe = document.createElement('iframe');
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = chrome.runtime.getURL('index.html');

    // Some styles for a fancy sidebar
    iframe.style.cssText = 'background-color:white;position:fixed;top:0;right:0;display:block;' +
                           'width:400px;height:100%;z-index:1000;';
    document.body.appendChild(iframe);
}