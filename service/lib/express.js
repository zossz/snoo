const { join } = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const parser = require('body-parser')

const constant = require('./constant')
const logger = require('./logger')()

function configuration(request, response, next) {
	request.constant = constant
	next()
}

function factory(middleware = configuration) {
	const router = express()
	router.disable('etag')
	router.disable('x-powered-by')
	router.set('view engine', 'pug')
	router.set('views', join(__dirname, 'view'))
	router.use(favicon(join(__dirname, 'asset/favicon.ico')))
	router.use('/health', (x, z) => z.send({ status: 'ॐ' }))
	router.use(middleware)
	router.use('/lib', express.static(join(__dirname, 'asset'), {index: false}))
	router.use(logger.middleware)
	//router.use(parser.urlencoded({ extended: true }))
	router.use(parser.json())
	return router
}

module.exports = factory
