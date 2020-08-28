import * as crypto from 'crypto';

export function shallowClone(obj: any): any {
  let returns;
  if (Array.isArray(obj)) {
    returns = [ ...obj ];
  }
  if (obj.constructor === Object) {
    returns = { ...obj };
  } else {
    returns = obj;
  }
  return returns;
}


export function transferOutputLog(str: string) {
  const codeMap = {
    97: '<span style="color: #fff">',
    96: '<span style="color: rgb(0, 255,255)">',
    95: '<span style="color: rgb(255, 0,255)">',
    94: '<span style="color: rgb(0, 0, 255)">',
    93: '<span style="color: rgb(255, 255, 0)">',
    92: '<span style="color: rgb(0, 255, 0)">',
    91: '<span style="color: rgb(255, 0, 0)">',
    39: '</span>',
    31: '<span style="color: red">',
    32: '<span style="color: green">',
    33: '<span style="color: yellow">',
    34: '<span style="color: blue">',
    35: '<span style="color: magenta">',
    36: '<span style="color: cyan">',
  };
  // eslint-disable-next-line no-control-regex
  return str.replace(/\[(\d+)?m/g, (_, $1) => {
    return codeMap[$1] || $1;
  });
}

export function reverseArr(arr: any[]): any[] {
  const res: any[] = [];
  let i = arr.length;
  while (i--) {
    res.push(arr[i]);
  }
  return res;
}


export function getJsonHash(json: object): string {
  try {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(json));
    return hash.digest('hex');
  } catch (e) {
    return e.message;
  }
}

export const md5 = ctx => {
  const hash = crypto.createHash('md5');
  hash.update(ctx);
  return hash.digest('hex');
};

export function createAppKey(name: string): string {
  const timestamp = new Date().toISOString();
  const hash = crypto.createHmac('sha1', name);
  hash.update(timestamp.toString());
  return hash.digest('hex');
}
