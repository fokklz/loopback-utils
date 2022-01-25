import { DefaultCrudRepository, Entity, juggler } from '@loopback/repository';
import _ = require('lodash');
import { ModelBlueprint } from '.';

export class RepositoryBlueprint<
  T extends ModelBlueprint,
  I,
  R extends object
> extends DefaultCrudRepository<T, I, R> {
  // Objekt output filter Funktion
  // wird bennötigt um den filter der Klasse zu überschreiben
  // und so schnelle anpassung zu ermöglichen
  filterFunc: (object: T | Partial<T>) => Partial<T> = this.filter;

  CREATE: string[] = [];

  constructor(
    model: typeof Entity & {
      prototype: T;
    },
    source: juggler.DataSource,
    createExclude: string[] = []
  ) {
    super(model, source);
    this.CREATE = createExclude;
  }

  filter(object: T | Partial<T>): Partial<T> | Partial<T & R> {
    const obj = object as { [key: string]: any };
    let outObj: Partial<T> | Partial<T & R> = {};
    for (const key of Object.keys(object)) {
      if (obj[key] != null) {
        (outObj as { [key: string]: any })[key] = obj[key];
      }
    }
    return _.omit(outObj, [...this.CREATE]);
  }

  filterArray(
    array: Array<T> | Array<T & R> | Array<Partial<T>> | Array<Partial<T & R>>
  ): Array<Partial<T> | Partial<T & R>> {
    const outArray: Array<Partial<T> | Partial<T & R>> = [];
    for (const key in array) {
      outArray[key] = this.filterFunc.call(this, array[key]);
    }
    return outArray;
  }

  filterUpdate(
    object: T | (T & R) | Partial<T> | Partial<T & R>,
    ...omit: string[]
  ): Partial<T> | Partial<T & R> {
    const obj = object as { [key: string]: any };
    let outObj: Partial<T> | Partial<T & R> = {};
    for (const key of Object.keys(object)) {
      if (obj[key] != null) {
        (outObj as { [key: string]: any })[key] = obj[key];
      }
    }
    outObj.edited = new Date();
    return _.omit(outObj, ['id', 'created', ...omit]);
  }
}
