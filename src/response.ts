export const sendSuccess = (res, data = {}, meta = {}) => {
  res.status = 200;
  res.body = JSON.stringify({ data, meta: { ...meta, ok: true } });
};


export const sendFailure = (res, data = {}, meta = {}, status = 400) => {
  res.status = status;
  res.body = JSON.stringify({ data, meta: { ...meta, ok: false } });
};
