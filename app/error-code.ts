export const errorCode = Object.freeze({
  4001: 'appKey不能为空',
  4003: 'appKey不合法',
  4005: '未找到uid',
  4006: 'uid校验失败',
  4007: '未找到用户名',
  4008: '未找到appId',
  4101: '未找到appName',
  4040: '用户不存在',

  5001: '未知的服务器错误',

  9001: '参数未找到uid',
  9002: '参数中为找到appKey',

  9004: 'appKey不存在',
});

export type ErrorCode = keyof typeof errorCode

export const errorReturn = (code: ErrorCode): { code: ErrorCode; message: string } => {
  return {
    code,
    message: errorCode[code],
  };
};
