import { Product } from "../models/Product";
import { AbstractScraper } from "./AbstractScraper";
import * as Collections from 'typescript-collections';

export class SafewayScraper extends AbstractScraper {
    constructor() { super(); }

    scrape(g_itemLabels:Collections.Dictionary<string, Product>, currentNode:Node, attempt:number) : boolean {
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
                var pricePerUnitArray = pricePerUnitNode.trim().split("/")
                var itemPricePer = NaN;
                var itemPerUnit = "";
                if(pricePerUnitArray.length == 0){
                    console.log("could not find slash");
                }
                else if(pricePerUnitArray.length == 1){
                    if(pricePerUnitArray[0])
                    {
                        itemPricePer = parseFloat(pricePerUnitArray[0].replace(/[^0-9.]/g, '')) || 0;
                        console.log("no unit on right side of slash");
                    }
                    else{
                        console.log("could not find product-price-qty");
                        itemPerUnit = "OoS";
                    }
                }
                else if(pricePerUnitArray.length == 2){
                    itemPricePer = parseFloat(pricePerUnitArray[0].replace(/[^0-9.]/g, '')) || 0;
                    itemPerUnit = pricePerUnitArray[1].replace(")","").trim();
                }
                //console.log(itemPerUnit)
                var itemImgNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="prd-itm-img"]/@src');
                var itemImgUrl = itemImgNode.singleNodeValue?.nodeValue?.replace("//","https://").trim();
                if(!itemImgUrl && attempt < 3)
                    return false;
                const buttonLabelContainerNode = this.getFirstOfElementsByXPath(node,'.//*[@class="btn btn-default btn-add-card"]');
                var buttonLabelText:string | undefined = "";
                var labelCheck  = this.getAriaLabel(buttonLabelContainerNode.singleNodeValue);
                if(labelCheck)
                    buttonLabelText = labelCheck;
                if(!buttonLabelText && attempt < 3)
                    return false;
                g_itemLabels.setValue(itemLabel,new Product(itemLabel,itemPrice, itemPricePer, itemPerUnit, buttonLabelText, itemImgUrl));
            }
        };
        return true;
    }
    getAriaLabel(element:any):string | undefined{
        if(element)
            return element.ariaLabel;
        return undefined;
    }
    addToCart(label:string):void{
        var btnContainer:NodeListOf<HTMLButtonElement> = document.querySelectorAll('[aria-label="' + label + '"]');
        btnContainer.forEach(element => {
            element.click();
        });
    }
}