import * as Collections from 'typescript-collections';
import { debounce } from 'ts-debounce';
import { Product } from './models/Product';

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
	var results = getListOfElementsByXPath(currentNode,'.//product-item-v2');
	var node = null;
	while (node = results.iterateNext()) {
		var itemLabelNode = getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-pttl"]');
		var itemLabel = itemLabelNode.singleNodeValue?.textContent || "";
		itemLabel = itemLabel.trim();
		if(!g_itemLabels.containsKey(itemLabel)){
			console.log('scraping')
			var itemPriceNode = getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-prc"]');
			//console.log(itemPriceNode)
			var itemPriceText = itemPriceNode.singleNodeValue?.textContent?.trim() || "";
			var itemPrice = parseFloat(itemPriceText.replace(/[^0-9.]/g, ''));
			var itemPriceQuantityNode = getFirstOfElementsByXPath(node,'.//*[@class="product-price-qty"]');
			//console.log(itemPriceQuantityNode)
			var pricePerUnitNode = itemPriceQuantityNode.singleNodeValue?.textContent?.trim() || "";
			var pricePerUnitArray = pricePerUnitNode.split("/")
			var itemPricePer = parseFloat(pricePerUnitArray[0].replace(/[^0-9.]/g, '')) || 0;
			var itemPerUnit = pricePerUnitArray[1].replace(")","");
			g_itemLabels.setValue(itemLabel,new Product(itemLabel,itemPrice, itemPricePer, itemPerUnit));
		}
	};
	console.log("done scraping");
	var obj = { message:"initial_loading", g_itemLabels }
	chrome.runtime.sendMessage(obj, function(response) {
		console.log(response.farewell);
	});
}
,1000);

function getListOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
	var result = document.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	return result;
}
function getFirstOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
	var result = document.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	return result;
}

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