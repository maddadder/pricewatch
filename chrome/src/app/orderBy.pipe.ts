import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { Product } from '..//models/Product';

@Pipe({
    name: 'orderBy',
    pure: false
})
export class OrderByPipe implements PipeTransform{
  transform(items:Product[],sortBy:string,order:boolean)
  {
    return this.OrderByArray(items, sortBy, order)
  }
  OrderByArray(values: any[], sortBy: string, sortAsc:boolean) { 
      return values.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) {
              return sortAsc == true ? -1 : 1;
          }

          if (a[sortBy] > b[sortBy]) {
              return sortAsc == true ? 1 : -1;
          }

          return 0
      });
  }

}