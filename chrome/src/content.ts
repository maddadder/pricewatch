
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
const scrape = function(currentNode:Node){

	var results = getListOfElementsByXPath(currentNode,'.//product-item-v2');
	var node = null;
	while (node = results.iterateNext()) {
		//console.log(node);
		var itemPrice = getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-prc"]');
		console.log(itemPrice.singleNodeValue?.textContent);
		var itemLabel = getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-pttl"]');
		console.log(itemLabel.singleNodeValue?.textContent);
		var itemPriceQuantity = getFirstOfElementsByXPath(node,'.//*[@class="product-price-qty"]');
		console.log(itemPriceQuantity.singleNodeValue?.textContent);
	};

	
	function getListOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
		var result = document.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		return result;
	}
	function getFirstOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
		var result = document.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		return result;
	}	
}
