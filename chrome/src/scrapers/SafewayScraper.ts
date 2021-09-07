import { Product } from "../models/Product";
import { AbstractScraper } from "./AbstractScraper";
import * as Collections from 'typescript-collections';

export class SafewayScraper extends AbstractScraper {
    constructor() { super(); }

    scrape(g_itemLabels:Collections.Dictionary<string, Product>, currentNode:Node) : boolean {
        var results = this.getListOfElementsByXPath(currentNode,'.//product-item-v2');
        let node:Node | null;
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
                //console.log(itemPerUnit)
                var itemImgNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-img"]/@src');
                var itemImgUrl = itemImgNode.singleNodeValue?.nodeValue?.replace("//","https://").trim();
                if(!itemImgUrl)
                    return false;
                g_itemLabels.setValue(itemLabel,new Product(itemLabel,itemPrice, itemPricePer, itemPerUnit, itemImgUrl));
            }
        };
        return true;
    }
}