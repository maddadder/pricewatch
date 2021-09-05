import * as Collections from 'typescript-collections';
import { debounce } from 'ts-debounce';

var g_itemLabel = new Collections.Set<string>();
var g_itemPrice = new Collections.Set<number>();
var g_itemPricePer = new Collections.Set<number>();
var g_itemPerUnit = new Collections.Set<string>();

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
		if(!g_itemLabel.contains(itemLabel)){
			g_itemLabel.add(itemLabel.trim());
			var itemPrice = getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-prc"]');
			g_itemPrice.add(parseFloat(itemPrice.singleNodeValue?.textContent?.trim() || ""))
			var itemPriceQuantity = getFirstOfElementsByXPath(node,'.//*[@class="product-price-qty"]');
			var pricePerUnit = itemPriceQuantity.singleNodeValue?.textContent?.trim() || "";
			var pricePerUnitArray = pricePerUnit.split("/")
			g_itemPricePer.add(parseFloat(pricePerUnitArray[0]) || 0);
			g_itemPerUnit.add(pricePerUnitArray[1]);
		}
	};
	console.log(g_itemLabel);
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
