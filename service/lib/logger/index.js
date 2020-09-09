const debug = require('debug')('poc:logger:main')

const framework = !!process.env.OPT_LOGGER_FRAMEWORK
	? require('../../opt/logger/framework')
	: require('./framework')
const middleware = require('./middleware')
const requestDetail = require('./request-detail')
const responseDetail = require('./response-detail')

function factory (namespace = 'default') {
  debug(`Initializing logger: ${namespace}`)
  framework.middleware = middleware(framework)
  framework.requestDetail = requestDetail
  framework.responseDetail = responseDetail
  return framework
}

module.exports = factory
