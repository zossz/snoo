const debug = require('debug')('poc:logger:request')

function requestDetail(request) {
  let detail = {
    id: request.id,
    httpVersion: request.httpVersion,
    headers: request.headers,
    method: request.method,
    originalUrl: request.originalUrl,
    baseUrl: request.baseUrl,
    url: request.url,
    body: request.body,
    params: request.params,
    query: request.query
  }
  debug({ detail })
  return detail
}

module.exports = requestDetail
