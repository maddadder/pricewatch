import * as Collections from 'typescript-collections';
import { Product } from "../models/Product";

export abstract class AbstractScraper {
    constructor() { }

    abstract scrape(g_itemLabels:Collections.Dictionary<string, Product>, currentNode:Node) : void;

    getListOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
		var result = document.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		return result;
	}
	getFirstOfElementsByXPath(contextNode:Node, xpath:string):XPathResult {
		var result = document.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		return result;
	}
	
}