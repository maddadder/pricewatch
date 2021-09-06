import { Product } from "../models/Product";
import { AbstractScraper } from "./AbstractScraper";
import * as Collections from 'typescript-collections';

export class FredMeyer extends AbstractScraper {
    constructor() { super(); }

    scrape(g_itemLabels:Collections.Dictionary<string, Product>, currentNode:Node) : void {
        var results = this.getListOfElementsByXPath(currentNode,'.//product-item-v2');
        var node = null;
        while (node = results.iterateNext()) {
            var itemLabelNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-pttl"]');
            var itemLabel = itemLabelNode.singleNodeValue?.textContent || "";
            itemLabel = itemLabel.trim();
            if(!g_itemLabels.containsKey(itemLabel)){
                console.log('scraping')
                var itemPriceNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-prc"]');
                //console.log(itemPriceNode)
                var itemPriceText = itemPriceNode.singleNodeValue?.textContent?.trim() || "";
                var itemPrice = parseFloat(itemPriceText.replace(/[^0-9.]/g, ''));
                var itemPriceQuantityNode = this.getFirstOfElementsByXPath(node,'.//*[@class="product-price-qty"]');
                //console.log(itemPriceQuantityNode)
                var pricePerUnitNode = itemPriceQuantityNode.singleNodeValue?.textContent?.trim() || "";
                var pricePerUnitArray = pricePerUnitNode.split("/")
                var itemPricePer = parseFloat(pricePerUnitArray[0].replace(/[^0-9.]/g, '')) || 0;
                var itemPerUnit = pricePerUnitArray[1].replace(")","");
                g_itemLabels.setValue(itemLabel,new Product(itemLabel,itemPrice, itemPricePer, itemPerUnit));
            }
        };
    }
}