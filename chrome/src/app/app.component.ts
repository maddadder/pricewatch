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
  orderbyProp = 'itemLabel';
  sortOrderAsc = false;
  Products: Collections.Dictionary<string, Product> = new Collections.Dictionary<string, Product>();
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    let self = this;
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(sender.tab)
        {
          if(self.IsUrlRelevant(request, sender.tab.url)){
            self.updatePage(request.g_itemLabels);
          }
        }
        else
        {
          console.log(sender);
        }
      }
    );
    chrome.storage.sync.get('g_itemLabels', ({ g_itemLabels }) => {
      this.updatePage({g_itemLabels});
    });
  }
  public IsUrlRelevant(request:any, url?:string):boolean 
  {
    var safeUrls = [
      'https://www.fredmeyer.com/search?query=',
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
  public updatePage(g_itemLabels:any)
  {
    if(!g_itemLabels)
      return;
    if(!g_itemLabels.table)
      return;
    for (const key of Object.keys(g_itemLabels.table)) {
      const obj = g_itemLabels.table[key];
      if(!this.Products.containsKey(obj.value.itemLabel))
      {
        this.Products.setValue(obj.value.itemLabel,new Product(obj.value.itemLabel, obj.value.itemPrice, obj.value.itemPricePer, obj.value.itemPerUnit));
      }
    }
    this.cd.detectChanges();
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
}