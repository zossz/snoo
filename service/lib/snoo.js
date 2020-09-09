const debug = require('debug')('poc:server:snoo')

const mask = require('json-mask')
const snoowrap = require('snoowrap')

const db = require('../var/db')

const reddit = new snoowrap({
	clientId: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	refreshToken: process.env.REDDIT_REFRESH_TOKEN,
	userAgent: process.env.REDDIT_USER_AGENT
})

const submissionAttributes = [
	'approved_at_utc',
	'author',
	'author_fullname',
	'created',
	'created_utc',
	'downs',
	'id',
	'likes',
	'name',
	'num_comments',
	'num_crossposts',
	'permalink',
	'selftext',
	'selftext_html',
	'subreddit',
	'subreddit_id',
	'subreddit_name_prefixed',
	'subreddit_subscribers',
	'title',
	'ups',
	'upvote_ratio',
	'url'
]
const submissionMask = submissionAttributes.join(',')

const subredditAttributes = [
	'display_name',
	'display_name_prefixed',
	'header_img',
	'icon_img',
	'id',
	'name',
	'public_description',
	'public_description_html'
]
const subredditMask = subredditAttributes.join(',')

const userAttributes = [
	'active',
	'banner_img',
	'created',
	'created_utc',
	'cron',
	'email',
	'icon_img',
	'id',
	'name',
	'num_friends',
	'subreddits',
	'total_karma',
	'verified'
]
const userMask = userAttributes.join(',')

function filterRejected (promises) {
	return Promise.allSettled(promises).then(list =>
		list.reduce((o, x) => { if (x.value) o.push(x.value); return o }, []).flat())
}

function getSubscriptions (list) {
	let subreddits = typeof list === 'string' ? list.split(',') : Array.from(list)
	debug({ getSubscriptions: subreddits.length })
	return filterRejected(subreddits.map(subreddit => reddit.getSubreddit(subreddit).fetch()))
}

function getUsers (list) {
	let users = typeof list === 'string' ? list.split(',') : Array.from(list)
	debug({ getUsers: users.length })
	return filterRejected(users.map(user => reddit.getUser(user).fetch()))
}

function topSubmissions (subscriptions, limit=3, time='day') {
	let result
	if (subscriptions) {
		let subs = subscriptions.map(x => x.display_name)
		debug({ topSubmissions: subs, limit, time })
		result = filterRejected(subscriptions.map(sub => sub.getTop({ limit, time })))
	} else {
		limit = limit * 3
		debug({ topSubmissions: null, limit, time })
		result = reddit.getTop({ limit, time })
	}
	return result
}

function users () {
	return db.users.filter(x => x.name)
}

function userByName (x) {
	return db.users.find(o => o.name === x)
}

function userNames () {
	return users().map(x => x.name)
}

/**
 * Run a query against any active users who have a cron value matching the
 * current time (currently 1 hour intervals), providing a rollup of news
 * specific to the preferences saved for each user.
 *
 * @param  {Object}  params - query string request parameters
 * @return {Promise} bulk news feed data in JSON format
 */
function batch (params={}) {
	debug({ batch: params })
	return filterRejected(users().map(x => {
		return query({ user: x.name, subreddits: x.subreddits }).then(i => {
			i.user = Object.assign({}, x, i.user)
			return i
		})
	}))
}

/**
 * Run a query for stored user data, providing the API token authenticated
 * user by default (e.g. in dry run scenarios).  Optional query string filters
 * allow for refining the returned dataset.
 *
 * @param  {Object}  params       - query string request parameters
 * @param  {String}  params.users - comma separated user names
 * @return {Promise} news feed user data in JSON format
 */
async function poll (params={}) {
	debug({ poll: params })
	let hits = []
	try {
		if (params.users) {
			hits = await getUsers(params.users)
		} else {
			hits = users().length
				? await getUsers(userNames())
				: [ await reddit.getMe().fetch() ]
		}
	} catch (error) {
		debug({ error })
	}
	return {
		users: hits.map(x => {
			let user = Object.assign({}, userByName(x.name), x)
			return mask(user, userMask)
		})
	}
}

/**
 * Request a JSON formatted rollup of top voted user submissions.  Included
 * is a user object, a list of subreddit details (relating to user preferences
 * or saved subscriptions in the case of token authenticated users), and a
 * list of selected content metadata useful in redistributing newsletters.
 * Optional query string filters allow for refining the returned dataset.
 *
 * @param  {Object}  params            - query string request parameters
 * @param  {String}  params.user       - targeted user name
 * @param  {String}  params.subreddits - comma separated topic names
 * @return {Promise} user specific news feed data in JSON format
 */
async function query (params={}) {
	debug({ query: params })
	let subscriptions, submissions, user
	try {
		if (params.user) {
			user = await reddit.getUser(params.user).fetch()
		} else {
			user = await reddit.getMe().fetch()
			if (!params.subreddits) {
				subscriptions = await reddit.getSubscriptions({ limit: 3 })
			}
		}
		if (params.subreddits) {
			subscriptions = await getSubscriptions(params.subreddits)
		}
		submissions = await topSubmissions(subscriptions)
		debug({ user: user.name, submissions: submissions.length })
	} catch (error) {
		debug({ error })
	}
	return {
		submissions: mask(submissions, submissionMask),
		subscriptions: mask(subscriptions, subredditMask),
		user: mask(user, userMask)
	}
}

module.exports = {
	batch,
	poll,
	query
}
