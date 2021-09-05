import { ChangeDetectorRef, Component } from '@angular/core';
import { Product } from '../models/Product';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'chrome';
  Products: Product[] = [];
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    let self = this;
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(sender.tab)
        {
          if(sender.tab.url?.startsWith("https://www.safeway.com/shop/search-results.html"))
          {
            if (request.message === "initial_loading")
            {
                self.updatePage(request.g_itemLabels);
            }
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
  public updatePage(g_itemLabels:any)
  {
    for (const key of Object.keys(g_itemLabels.table)) {
      const obj = g_itemLabels.table[key];
      var p = new Product(obj.value.itemLabel, obj.value.itemPrice, obj.value.itemPricePer, obj.value.itemPerUnit )
      this.Products.push(p);
    }
    this.cd.detectChanges();
  }
}
