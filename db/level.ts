import leveldown from 'leveldown';
import levelup, { LevelUp } from 'levelup';

type TableType = 'string' | 'number' | 'json'
type TableItem = { name: string; type: TableType}

const SYSTEM_TABLES = 'system.tables';
const SYSTEM_UID = 'system.uid';

class Controller {
  public db: LevelUp
  public table: TableItem
  constructor(db: LevelUp, table: TableItem) {
    this.db = db;
    this.table = table;
  }

  public put(key: string, value: any) {
    return this.db.put(`${this.table.name}.${key}`, typeof value === 'string' ? value : JSON.stringify(value)).then(() => {
      console.log('put success: ', `${this.table.name}.${key}`);
    }).catch(e => {
      //
      console.log(e);
    });
  }

  public update(key: string, cb: (data: any) => any) {
    return new Promise((resolve, reject) => {
      this.db.get(`${this.table.name}.${key}`).then(res => {
        const data = cb(this.parseResData(res));
        this.put(key, data).then(() => {
          resolve();
        }).catch(e => {
          reject(e);
        });
      }).catch(e => {
        reject(e);
      });
    });
  }

  public asyncHas(key: string) {
    return new Promise<boolean>(resolve => {
      this.db.get(`${this.table.name}.${key}`).then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    });
  }

  private parseResData(res) {
    return this.table.type === 'json' ? JSON.parse(res.toString()) : res.toString();
  }

  public async get(key: string) {
    try {
      const res = await this.db.get(`${this.table.name}.${key}`);
      const data = this.parseResData(res);
      return { data };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  public delete(key: string) {
    return this.db.del(`${this.table.name}.${key}`);
  }

}

type TableMap = {
  [x: string]: TableItem;
}

class LevelDB {
  public db: LevelUp
  public tableMap: TableMap
  constructor() {
    this.db = levelup(leveldown('./mydb'));
    this.tableMap = {};
    this.db.get(SYSTEM_TABLES).then(res => {
      this.tableMap = JSON.parse(res.toString());
    }).catch(() => {
      //
    });
  }

  public createTable(name: string, type: 'string' | 'json' = 'string') {
    if (this.tableMap[name]) return;
    this.tableMap = { ...this.tableMap, [name]: { name, type } };
    return this.db.put(SYSTEM_TABLES, JSON.stringify(this.tableMap));
  }

  public table(name: string) {
    const table = this.tableMap[name] || { name, type: 'json' };
    return new Controller(this.db, table);
  }

  public readStream(options) {
    return this.db.createReadStream(options);
  }

  public batch(options: any[] = []) {
    this.db.batch(options);
  }

  public async createUniqueID() {
    try {
      const getterUid = (await this.db.get(SYSTEM_UID)).toString();
      const uid = JSON.parse(getterUid) + 1;
      await this.db.put(SYSTEM_UID, JSON.stringify(uid));
      return uid;
    } catch (e) {
      const uid = 100;
      await this.db.put(SYSTEM_UID, JSON.stringify(uid));
      return uid;
    }
  }
}

let levelDB: LevelDB = null as unknown as LevelDB;

if (!levelDB) {
  levelDB = new LevelDB();
}
export default levelDB;
