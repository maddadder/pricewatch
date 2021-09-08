import * as Collections from 'typescript-collections';
import { debounce } from 'ts-debounce';
import { Product } from './models/Product';
import { SafewayScraper } from './scrapers/SafewayScraper';
import { FredMeyerScraper } from './scrapers/FredMeyerScraper';

var g_itemLabels = new Collections.Dictionary<string, Product>();
var iframe:HTMLIFrameElement;
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
	var obj:any = { message:"initial_loading" }
	if(location.href.startsWith("https://www.safeway.com"))
	{
		obj.store = "safeway";
		console.log('scraping safeway.com')
		let scraper = new SafewayScraper();
		let attempt = 0;
		if(!scraper.scrape(g_itemLabels, currentNode, attempt))
		{
			attempt += 1
			setTimeout(function(){
				//safeway takes awhile to load the images
				if(!scraper.scrape(g_itemLabels, currentNode, attempt))
				{
					attempt += 1
					setTimeout(function(){
						if(!scraper.scrape(g_itemLabels, currentNode, attempt))
						{
							attempt += 1
							setTimeout(function(){
								scraper.scrape(g_itemLabels, currentNode, attempt)
							},10000);
						}
					},10000);
				}
			},10000);
		}
		
	}
	else if(location.href.startsWith("https://www.fredmeyer.com"))
	{
		obj.store = "fredmeyer";
		console.log('scraping fredmeyer.com')
		let scraper = new FredMeyerScraper();
		scraper.scrape(g_itemLabels, currentNode, 0);
	}
	else{
		console.log(location.href);
	}
	console.log("done scraping");
	obj.g_itemLabels = g_itemLabels;
	var port = chrome.runtime.connect({name: "knockknock"});
	port.postMessage(obj);
	if(obj.store == "fredmeyer"){
		g_itemLabels.clear();
	}
	port.onMessage.addListener(function(msg, port) {
		if (msg.buttonLabel){
			if(location.href.startsWith("https://www.safeway.com"))
			{
				console.log('scraping safeway.com')
				let scraper = new SafewayScraper();
				scraper.addToCart(msg.buttonLabel);
			}
			else if(location.href.startsWith("https://www.fredmeyer.com"))
			{
				console.log('scraping fredmeyer.com')
				let scraper = new FredMeyerScraper();
				scraper.addToCart(msg.buttonLabel);
			}
		}
		if(msg.hideCommand){
			if(iframe){
				if(msg.hideCommand == "Hide"){
					iframe.style.height = "100%";
					iframe.style.width = "400px";
				}
				else if(msg.hideCommand == "Show"){
					iframe.style.height = "4%";
					iframe.style.width = "75px";
				}
				
			}
		}
	});
}
,1000);


// Avoid recursive frame insertion...
var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
if (!location.ancestorOrigins.contains(extensionOrigin)) {
    iframe = document.createElement('iframe');
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = chrome.runtime.getURL('index.html');

    // Some styles for a fancy sidebar
    iframe.style.cssText = 'background-color:white;position:fixed;top:0;right:0;display:block;' +
                           'width:400px;height:100%;z-index:1000;';
    document.body.appendChild(iframe);
}
