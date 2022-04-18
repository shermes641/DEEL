/**
 * Used by endpoints to build HTTP errors, 400, 401, 404, etc...
 */
class HttpError extends Error {
  constructor(code = 777, message = 'Internal server error') {
    super(message);
    this.code = code;
  }
}

module.exports = HttpError;
