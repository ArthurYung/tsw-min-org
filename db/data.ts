import { EventEmitter } from 'events';
import { shallowClone } from '../utils/util';

export type EventType = 'before' | 'after' | 'delete' | 'change'

export type ChangePayload = {
  res?: boolean;
  value?: any;
  key: any;
  db: DataView<any, any>;
  type: 'change' | 'delete' | 'add';
}

interface EventBus extends EventEmitter {
  emit(event: 'before', payload: DataView<any, any>): boolean;
  emit(event: 'after', payload: DataView<any, any>): boolean;
  emit(event: 'delete', payload: ChangePayload): boolean;
  emit(event: 'change', payload: ChangePayload): boolean;
  emit(event: 'put-data', payload: ChangePayload): boolean;
  on(event: 'before', listener: (payload: DataView<any, any>) => void): this;
  on(event: 'after', listener: (payload: DataView<any, any>) => void): this;
  on(event: 'delete', listener: (payload: ChangePayload) => void): this;
  on(event: 'change', listener: (payload: ChangePayload) => void): this;
  on(event: 'put-data', listener: (payload: ChangePayload) => void): this;
}

type MethodKeys = '_setData' | '_getData' |'_delete'| '_update'

class DataView<K, T> {
  public data: Map<K, T>
  public bus: EventBus
  public links: DataView<any, any>[]

  private isLock: boolean

  constructor() {
    this.data = new Map();
    this.bus = new EventEmitter();
    this.links = [];
    this.isLock = false;
    this.listenerLink();
  }

  public _method(method: MethodKeys, ...args) {
    if (this[method]) {

      if (this.isLock) {
        return (this[method] as any).apply(this, args);
      }
      this.isLock = true;
      this.bus.emit('before', this);

      const res = (this[method] as any).apply(this, args);

      if (method === '_delete') {
        this.bus.emit('delete', { key: args[0], res, db: this, type: 'delete' });
      }
      if (method === '_setData' || method === '_update') {
        this.bus.emit('change', {
          key: args[0],
          value: args[1],
          db: this,
          type: method === '_setData' ? 'add' : 'change',
        });
      }
      this.bus.emit('after', this);
      this.isLock = false;
      return res;
    }
  }

  private listenerLink() {
    this.bus.on('change', payload => {
      this.links.forEach(db => {
        db.bus.emit('put-data', payload);
      });
    });

    this.bus.on('delete', payload => {
      this.links.forEach(db => {
        db.bus.emit('put-data', payload);
      });
    });
  }

  private _setData(key: K, value: T) {
    this.data.set(key, value);
  }

  public setData(key: K, value: T) {
    this._method('_setData', key, value);
  }

  private _getData(key: K) {
    const res = this.data.get(key);
    return res ? shallowClone(res) : res;
  }

  public getData(key: K) {
    return this._method('_getData', key);
  }

  private _update(key: K, value: T, reset: boolean) {
    reset && this.data.set(key, value);
  }

  // 修改数据
  public update(key: K, callback: (x: T) => T) {
    const oldVal = this.data.get(key);
    if (oldVal !== undefined) {
      const newVal = oldVal && callback(oldVal);
      const needSet = oldVal && (oldVal !== newVal);
      this._method('_update', key, newVal, needSet);
    }
  }

  _delete(key: K) {
    const res = this.data.delete(key);
    return res;
  }

  delete(key: K) {
    this._method('_delete', key);
  }

  // 关联数据库
  link(db: DataView<any, any>) {
    this.links.push(db);
  }

  // 关联数据库更新数据时触发
  onPutData(callback: (payload: ChangePayload) => void) {
    this.bus.on('put-data', payload => {
      callback({ ...payload, db: this });
    });
  }

}

export default DataView;
