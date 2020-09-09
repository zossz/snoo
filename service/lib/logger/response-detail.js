const debug = require('debug')('poc:logger:response')

function responseDetail(response) {
  let detail = {
    size: response._contentLength,
    statusCode: response.statusCode,
    statusMessage: response.statusMessage
  }
  debug({ detail })
  return detail
}

module.exports = responseDetail
