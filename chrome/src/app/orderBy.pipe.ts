import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'orderBy',
    pure: false
})
export class OrderByPipe implements PipeTransform {

    transform(value: any[], sortBy: string = 'itemLabel', order = false): any[] {

        if (!value || order === false || !order) {
            return value;
        } // no array

        if (!sortBy || sortBy === '') {
            return _.sortBy(value);
        } // sort 1d array

        if (value.length <= 1) {
            return value;
        } // array with only one item

        return _.orderBy(value, [sortBy], [order]);
    }
}
