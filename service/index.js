const debug = require('debug')('poc:server:main')

const fetch = require('node-fetch')
const http = require('http')
const https = require('https')
const { createNamespace } = require('cls-hooked')
const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const { v4: uuid } = require('uuid')

const database = require('./var/db')
const express = require('./lib/express')
const { status: {
	BAD_REQUEST,
	CREATED,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	OK
}} = require('./lib/constant')
const {
	batch,
	poll,
	query
} = require('./lib/snoo')
const task = require('./lib/task')

const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })

const port = process.env.EXPRESS_PORT || 8080
const endpoint = process.env.SERVICE_ROOT_ENDPOINT || `http://localhost:${port}`

const service = express()
const storage = createNamespace('express')

const jobs = [
	{
		name: 'hourly',
		trigger: (tick, log) => () => {
			tick()  // log iteration count and datetime for debug
			log('any')  // expose debug lines scoped to task module
			fetch(`${endpoint}/cron`, { agent })  // kick cron job
		}
	}
]

function agent (uri) { 
	// allow for custom DNS or self-signed certs
	if (uri.protocol == 'http:') {
		return httpAgent
	} else {
		return httpsAgent
	}
}

function ingest (resource, params) {
	debug({ ingest: resource })
	let response = { error: null, [resource]: params }
	let file = join(__dirname, 'var/db.json')
	try {
		let db = JSON.parse(readFileSync(file))
		let user = db.users.find(x => x.name === params.name)
		if (user) {
			params.updated = Date.now()
			Object.assign(user, params)
		} else {
			params.created = Date.now()
			db.users.push(params)
			response.status = CREATED
		}
		db.meta.version = db.meta.version + 1
		Object.assign(database, db)
		writeFileSync(file, JSON.stringify(db, null, 2))
	} catch (error) {
		debug({ error })
		if (!error.status) error.status = BAD_REQUEST
		throw error
	}
	return response
}

function resolve (resource, params) {
	debug({ resolve: resource, params })
	let error, response
	switch (resource) {
		case 'cron':
			response = batch(params)
			break;
		case 'rollup':
			response = query(params)
			break;
		case 'user':
			response = poll(params)
			break;
		default:
			error = new Error('unknown route')
			error.status = NOT_FOUND
			throw error
	}
	return response
}

function context (request, response, next) {
	let agent = request.get('user-agent')
	let datetime = new Date().toISOString()
	let path = request.originalUrl.split('?')[0]
	let referer = request.get('referer')
	let timestamp = Date.now()
	let upstream = { ip: request.ip, ips: request.ips }
	request.id = request.get('x-audibene-request') || uuid()
	storage.run(() => {
		storage.set('agent', agent)
		storage.set('datetime', datetime)
		storage.set('method', request.method)
		storage.set('path', path)
		storage.set('referer', referer)
		storage.set('request', request.id)
		storage.set('timestamp', timestamp)
		storage.set('upstream', upstream)
		next()
	})
}

function dashboard (request, response) {
	let trace = storage.get('request')
	debug({ dashboard: trace })
	response.set('x-audibene-request', trace)
	response.render('dashboard', {
		cache: true,
		heading: 'Regularly Redistributed Rollup for Reddit',
		title: 'RRRR Dashboard',
		uuid: trace
	})
}

async function dispatch (request, response) {
	let trace = storage.get('request')
	debug({ dispatch: trace })
	response.set('x-audibene-request', trace)
	try {
		let result = (request.method === 'POST')
			? await ingest(request.params.resource, request.body)
			: await resolve(request.params.resource, request.query)
		response.status(result.status || OK).send(result)
	} catch (error) {
		debug({ error })
		response.status(error.status || INTERNAL_SERVER_ERROR)
			.send({ error: true, message: error.message })
	}
}

service.use('/:resource', context, dispatch)
service.use('/', context, dashboard)

service.listen(port, () => {
	debug({ active: true, port, timestamp: Date.now() })
	task.init(jobs)  // start a scheduled task runner
})

