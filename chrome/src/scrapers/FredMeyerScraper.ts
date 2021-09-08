import { Product } from "../models/Product";
import { AbstractScraper } from "./AbstractScraper";
import * as Collections from 'typescript-collections';

export class FredMeyerScraper extends AbstractScraper {
    constructor() { super(); }

    scrape(g_itemLabels:Collections.Dictionary<string, Product>, currentNode:Node, attempt:number) : boolean {
        const results = this.getListOfElementsByXPath(currentNode,'.//*[@class="AutoGrid-cell min-w-0"]');
        var node = null;
        while (node = results.iterateNext()) {
            const itemLabelNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="cart-page-item-description"]');
            const itemLabel = itemLabelNode.singleNodeValue?.textContent?.trim() || "";
            if(!g_itemLabels.containsKey(itemLabel)){
                console.log('scraping')
                if(itemLabel.length)
                {
                    const itemPriceNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="cart-page-item-unit-price"]');
                    //console.log(itemPriceNode)
                    const itemPriceText = itemPriceNode.singleNodeValue?.textContent?.trim() || "";
                    const itemPrice = parseFloat(itemPriceText.replace(/[^0-9.]/g, ''));
                    const ozCount = itemLabel.match(/[-/ ][0-9/.]{1,5} [ogzgalflqt ]{1,5}/g)
                    var itemPerUnit = "";
                    var itemPricePer = 0;

                    //should only be one
                    ozCount?.forEach(element => {
                        itemPricePer = parseFloat(element.trim().replace(/[^0-9./]/g, '')) || 0;
                        if(itemPricePer > 0 && itemPricePer < 1000){
                            itemPricePer = itemPrice / itemPricePer;
                        }
                        itemPerUnit = element.trim().replace(/[0-9./]/g, '').trim()
                        if(itemPerUnit == "gal"){
                            itemPerUnit = "fl oz";
                            itemPricePer = itemPricePer / 128;
                        }
                        else if(itemPerUnit == "qt"){
                            itemPerUnit = "fl oz";
                            itemPricePer = itemPricePer / 32;
                        }
                    });
                    const itemImgNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="cart-page-item-image-loaded"]/@src');
                    const itemImgUrl = itemImgNode.singleNodeValue?.nodeValue?.trim();
                    //console.log(itemImgUrl);
                    const buttonLabelContainerNode = this.getFirstOfElementsByXPath(node,'.//*[@data-qa="cart-page-item-quantity-stepper"]');
                    var buttonLabelText:string | undefined = "";
                    buttonLabelContainerNode.singleNodeValue?.childNodes.forEach(element => {
                        var labelCheck  = this.getAriaLabel(element);
                        if(labelCheck)
                            buttonLabelText = labelCheck;
                    });
                    g_itemLabels.setValue(itemLabel,new Product(itemLabel,itemPrice, itemPricePer, itemPerUnit, buttonLabelText, itemImgUrl));
                }
            }
        };
        return true;
    }
    getAriaLabel(element:any):string | undefined{
        if(element.localName == "button"){
            return element.ariaLabel;
        }
        return undefined;
    }
    addToCart(label:string):void{
        var btnContainer:NodeListOf<HTMLButtonElement> = document.querySelectorAll('[aria-label="' + label + '"]');
        btnContainer.forEach(element => {
            element.click();
        });
    }
}