const nullClientID = '00000000-0000-0000-0000-000000000000'

const templateDefaults = {
	id: 0,
	active: true,
	cron: 8,
	name: '<>',
	email: '',
	subreddits: ''
}

let client, debug, root

function batchForm () {
	dispatch('cron').then(showDebug)
}

function buttonLabel (x) {
	return (x.id && x.id !== templateDefaults.id) ? 'save' : 'add new'
}

function footer () {
	return `
	<div class="center">
		<button type="button" id="batch" name="batch" onclick="batchForm()">test batch</button>
	</div>
	<div class="footer">
		<div class="reddit">
			<dl>
				<dt>name</dt>
				<dd>reddit user designation</dd>
				<dt>subreddits</dt>
				<dd>comma-separated list of topics</dd>
				<dt>status</dt>
				<dd><a href="https://reddit.statuspage.io/">upstream services</a></dd>
			</dl>
		</div>
		<div class="snoo">
			<dl>
				<dt>active</dt>
				<dd>accepting delivery</dd>
				<dt>time</dt>
				<dd>delivery hour (0-23 UTC)</dd>
				<dt>email</dt>
				<dd>address for distribution</dd>
			</dl>
		</div>
	<div>`
}

function getInput (form) {
	return {
		active: form[3].checked,
		email: form[5].value,
		id: form.id,
		name: form[1].value,
		subreddits: form[6].value,
		cron: form[4].value
	}
}

function imageTag (x) {
	return x ? `<img class="icon" src="${x}" />` : ''
}

function isChecked (el, ok) {
console.log(el, ok)
	if (ok) el.checked = true
}

function nameField (x) {
	return x.name && x.name !== templateDefaults.name
		? `<input id="user" name="user" type="hidden" value=${x.name} />`
		:`<label for="user">name</label>
		<input id="user" name="user" type="text" placeholder="snoo" />`
}

function saveForm () {
	let user = getInput(event.target.form)
	dispatch('user', user).then(showDebug)
}

function showDebug (data) {
	debug.innerHTML = `<h3>debug</h3><pre>${JSON.stringify(data, null, 2)}</pre>`
}

function testForm () {
	let user = getInput(event.target.form)
	if (user.active) {
		let uri = `rollup?user=${user.name || ''}&subreddits=${user.subreddits || ''}`
		dispatch(uri).then(showDebug)
	} else {
		alert('user must be "active" to test')
	}
}

function templateForm (input={}) {
	let user = Object.assign({}, templateDefaults, input)
	return `
	<form id="${user.id}" method="POST">
		<fieldset>
			<legend>${user.name}</legend>
			${imageTag(user.icon_img)}
			${nameField(user)}
			<label></label>
			<button type="button" id="test" name="test" onclick="testForm()">test</button>
			<label for="active">active</label>
			<input id="active" name="active" type="checkbox" ${user.active && 'checked'} />
			<label for="cron">time</label>
			<input id="cron" name="cron" type="text" value="${user.cron || ''}" />
			<br/><br/>
			<label for="email">email</label>
			<input id="email" name="email" type="text" placeholder="snoo@mailinator.com" value="${user.email || ''}" />
			<label for="subreddits">subreddits</label>
			<input id="subreddits" name="subreddits" type="text" placeholder="football,Jokes,technology" value="${user.subreddits || ''}" />
			<label></label>
			<button type="button" id="save" name="save" onclick="saveForm()">${buttonLabel(user)}</button>
		</fieldset>
	</form>`
}

async function dispatch (uri, body) {
	let request = {
		headers: {
			'x-audibene-request': sessionStorage.audibeneClientID || nullClientID
		},
		method: 'GET'
	}
	if (body) {
		request.headers['content-type'] = 'application/json; charset=utf-8'
		request.method = 'POST'
		request.body = JSON.stringify(body)
	}
	let response
	try {
		response = await (await fetch(`/${uri}`, request)).json()
	} catch (error) {
		console.warn(error)
	}
	return response
}

function init () {
	client = document.querySelector('.request')
	sessionStorage.audibeneClientID = client.innerHTML
	debug = document.querySelector('#debug')
	root = document.querySelector('#root')
	dispatch('user').then(data => {
		let memberForms = data.users.map(templateForm).join('')
		root.innerHTML = `${root.innerHTML}${memberForms}${templateForm()}${footer()}`
	})
}

window.onload = init
