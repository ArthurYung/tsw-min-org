import { transferOutputLog } from '../../utils/util';

export const transfer = transferOutputLog;
export const parseJson = obj => {
  return JSON.stringify(obj);
};

export const getHttpMethod = (header = '') => {
  return header.match(/^[^\s]+/)?.[0];
};

export const getHttpTime = (times: any) => {
  const { requestStart, requestFinish } = times;
  if (!requestFinish) return '-';
  return (new Date(requestFinish).getTime() - new Date(requestStart).getTime()) + 'ms';
};

export const getHttpType = (responseType = '') => {
  return responseType.split(';')[0];
};

export const getHttpStatusName = (code: number | null) => {
  return (code && code <= 400) ? 'text-primary' : 'text-danger';
};


export const getBaseUrl = (baseInfo: any = {}) => {
  if (baseInfo.captureRequests && baseInfo.captureRequests.length) {
    return baseInfo.captureRequests.pop().path;
  }
  return '';
};
