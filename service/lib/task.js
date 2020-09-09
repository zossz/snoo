const debug = require('debug')('poc:server:task')

const duration = process.env.TASK_DEFAULT_INTERVAL || 3600000 // hourly
const manifest = {}

function execute (name, trigger) {
	function counter () {
		manifest[name].counter++
		manifest[name].updated = new Date().toISOString()
		debug(name, manifest[name].counter, manifest[name].updated)
	}
	return trigger(counter, debug)
}

function init (workflow) {
	debug({ init: Date.now(), queue: workflow.length })
	workflow.forEach(task => {
		debug({ task })
		manifest[task.name] = {
			counter: 0,
			interval: setInterval(execute(task.name, task.trigger), task.interval || duration),
			updated: null
		}
	})
}

module.exports = {
	init,
	manifest
}
