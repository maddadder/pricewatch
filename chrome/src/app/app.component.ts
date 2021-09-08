import { ChangeDetectorRef, Component } from '@angular/core';
import { Product } from '../models/Product';
import * as Collections from 'typescript-collections';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'chrome';
  public show:boolean = true;
  public toggleButtonName:any = 'Hide';
  port?: chrome.runtime.Port;
  orderbyProp = 'itemLabel';
  sortOrderAsc = false;
  Products: Product[] = [];
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    let self = this;
    chrome.runtime.onConnect.addListener(function(port)
    {
      port.onMessage.addListener(
        function(request, port) {
          if(port.sender?.tab)
          {
            if(self.IsUrlRelevant(request, port.sender.tab.url)){
              self.port = port;
              self.updatePage(request.store, request.g_itemLabels);
            }
          }
          else
          {
            console.log(port.sender);
          }
        });
    });
  }
  public IsUrlRelevant(request:any, url?:string):boolean 
  {
    var safeUrls = [
      'https://www.fredmeyer.com/search',
      "https://www.safeway.com/shop/search-results.html"]
    var allowUrl = false;
    for(var i = 0;i<safeUrls.length;i++){
      var safeUrl = safeUrls[i];
      if(url?.startsWith(safeUrl))
      {
        if (request.message === "initial_loading")
        {
            allowUrl = true;
        }
      }
    }
    return allowUrl;
  }
  public updatePage(store:string, g_itemLabels:any)
  {
    if(!g_itemLabels)
      return;
    if(!g_itemLabels.table)
      return;
    if(store != "fredmeyer"){
      let localStorageProducts = localStorage.getItem(store + "_products");
      if(localStorageProducts){
        this.Products = <Product[]>JSON.parse(localStorageProducts);
      }
    }
    else{
      this.Products = [];
    }
    for (const key of Object.keys(g_itemLabels.table)) {
      const obj = g_itemLabels.table[key];
      if(!this.Products.some(e => e.itemLabel === obj.value.itemLabel))
      {
        this.Products.push(new Product(obj.value.itemLabel, obj.value.itemPrice, obj.value.itemPricePer, obj.value.itemPerUnit, obj.value.buttonLabel, obj.value.itemImgUrl));
      }
    }
    if(store != "fredmeyer"){
      localStorage.setItem(store + "_products", JSON.stringify(this.Products));
    }
    //console.log(this.Products);
    this.cd.detectChanges();
  }
  public addToCart(buttonLabel:string){
    if(this.port){
      this.port.postMessage({buttonLabel: buttonLabel});
    }
  }
  sort(column:string){
    if(this.orderbyProp != column){
      this.orderbyProp = column;
      this.sortOrderAsc = !this.sortOrderAsc;
    }
    else
    {
      this.sortOrderAsc = !this.sortOrderAsc;
    }
  }
  toggle() {
    this.show = !this.show;

    // CHANGE THE NAME OF THE BUTTON.
    if(this.show){
      this.toggleButtonName = "Hide";
      if(this.port){
        this.port.postMessage({hideCommand: "Hide"});
      }
    }
    else{
      this.toggleButtonName = "Show";
      if(this.port){
        this.port.postMessage({hideCommand: "Show"});
      }
    }
  }
}