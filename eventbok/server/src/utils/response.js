export const sendList = (res, { data, meta }) => res.json({ success: true, data, meta });
export const sendOne = (res, data) => res.json({ success: true, data });
export const sendCreated = (res, data) => res.status(201).json({ success: true, data });
export const sendOk = (res, message = "ok") => res.json({ success: true, message });
export const sendError = (res, message, status = 400, code, details) =>
  res.status(status).json({ success: false, error: { message, code, details } });
