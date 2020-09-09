snoo
====

It's the Regularly Redistributed Rollup for Reddit, sending email directly to you!
(Now available with developer dashboard!)


Who?
----

But, ... `snoo`?  The adorable androgynous [mascot](https://amp.knowyourmeme.com/memes/snoo)
for Reddit, of course.  While learning how to consume reddit feeds I envisioned
it as a helpful bot on the path toward enlightenment.  This service may act as
one facet in realization of that vision (e.g. easy content discovery).  The
primary dependency in use for reddit interaction just happens to be called
[snoowrap](https://github.com/not-an-aardvark/snoowrap), it is self-described
as "a fully-featured JavaScript wrapper for the reddit API".  'Snew to me.  ;)


What?
-----

More literally, here we have a back plane service providing measured doses of
real time data for an email distribution application.  The requirements setting
this project in motion were:

 * creating and updating users
 * creating and updating favourite subreddits by user
 * setting the newsletter send out time for each user (default: 8am)
 * turning on and off the newsletter send out for a specific user
 * triggering send out to each respective user email per user specified time
 * use node, typescript welcome but not necessary
 * we all trust each other, no auth needed
 * have fun


When?
-----

Some time ordered steps to help neophytes discover this service:

 * login to reddit and create an app (to generate API tokens against)
   * [an old interface](https://www.reddit.com/prefs/apps) enables API queries
 * export `REDDIT_*` environment variables with developer app details
   * see details in the How? section below
 * start the service and load the dashboard into a web browser
   * validate by confirming dashboard icon served from reddit for the token user

Optional quick start tips (to avoid tedious browser form submissions):

 * lean on the default action importing your reddit user name from token details
   * improved upon by adding email and subreddits via the dashboard on first load
 * update `./var/db.json` to include data for the use case intended
   * name and subreddits most important; the structure is fairly simple


Assuming you've got the service running with `./var/db.json` updated to include
data for the use case intended, hitting various endpoints exercises all our
available features:

 * `/` loads the dashboard into the browser (and may be extended via type
   negotiation to include API discovery details via JSON vs. default HTML)
 * `/cron` will spawn a batch job that collects users, their subscriptions
   (controlled by this service vs. reddit.com), and the top submissions from each
   user's subreddits organized by reddit user name
 * `/rollup` returns the individual response for a given user (which would be
   one instance within the collection returned via the batch job supporting
   `/cron` jobs) and allows for testing of individual configurations without
   spawning extra messages
 * `/user` will poll for data saved into JSON provided in `./var/` combined with
   details in response from reddit APIs (customizable via `users` query param)


Future work may easily extend from some patterns established here to enable
configurable transport mechanisms (e.g. dispatch of rollups, varying consumers
and/or media types), extended reddit API functionality (e.g. multireddits),
extended cron scheduling syntax (to unlock fully costomizable scheduling),
per-user per-subreddit thresholds for the number of posts returned, etc.


Where?
------

Check out this repo locally and explore:

	`$ git clone https://github.com/Audibene-GMBH/ta.backend-coding-challenge.git snoo`
	`$ cd snoo && git checkout reddit && cd service  # or unzip and cd ;)`

It should run anywhere minimum requirements for modern NodeJS runtimes are met.


How?
----

Prerequisite to running the service one must login to reddit and generate an
app to allow for API usage.  The most recent UX doesn't seem to make way for
it but [an old interface](https://www.reddit.com/prefs/apps) enables API token
generation via utility libraries or tooling.

The runtime shell consumes upstream variables based on the dev app:

	`$ export REDDIT_CLIENT_ID=<client-id>`
	`$ export REDDIT_CLIENT_SECRET=<client-secret>`
	`$ export REDDIT_REFRESH_TOKEN=<refresh-token>`
	`$ export REDDIT_USER_AGENT=<user-agent>`

The refresh token may be easily generated using [reddit-oauth-helper](https://github.com/not-an-aardvark/reddit-oauth-helper):

	`$ npx reddit-oauth-helper`


A minimal yet informative level of logging when starting the service runtime:

	`$ DEBUG=poc:server:* npm start`


Once running, load the dashboard:

	`$ open http://localhost:8080/`

It integrates various endpoint functionality:

	* `/cron  # collect top posts for all saved users`
	* `/rollup  # loads top posts for active token user`
	* `/rollup?subreddits=news,technology  # ad hoc usage`
	* `/user  # polls reddit for stored user records`
	* `/user?users=jack,jill,hill,crown  # ad hoc usage`


But, what about automation?

Included within the service runtime are interval timers regularly polling for
eligible task runners.  This service used in concert with email campaign tools
may deliver all necessary content once the mail gun of choice is configured for
outbound SMTP.

For the time being, and for demo brevity, setting an environment variable to a
short duration (e.g. 5 seconds shown below; it defaults to hourly) will execute
those repeated activities and log results out to the console as changes are made
to the database via the included dashboard:

	`$ DEBUG=poc:server:* TASK_DEFAULT_INTERVAL=5000 npm start`

The rationale behind this approach was influenced by varying concerns.  Given
that this is a side project used by devs to simplify information gathering (as
opposed to a production SaaS with paying subscribers), we have multiple ways to
consume the service enabling widely varying developer use cases and a lack of
pressure to ensure test coverage or alerting.  Portability in this stack allows
for a browser making quick demostrations of orchestrated behavior while commands
like `curl http://localhost:8080/rollup?subreddits=news` demand of users a
deeper understanding before acheiving maximum flexibility or precision.


Roadmap
-------

Providing support for Slack integrations presents a prudent time to reconsider
assumptions and refactor for new requirements.

Care was taken with this first iteration to separate concerns and provide for
loose coupling.  This work done up front tends to allow for faster cycles over
the long tail of developing and maintaining a service.  For example, including
continuation local storage may seem like overkill in a simple architecture, but
it also allows for effortless access to request-specific data without having to
include any plumbing or pass state objects via function arguments.  Similarly,
some information tucked away in debug logs may need to be exposed when striving
for more nines in the ol' uptime percentage, or vice versa depending on needs
of the operators responsible.  Including both solutions up front means very
little time or consideration need be spent on logging or debugging within the
code base because those patterns are already well established and abstracted
away behind interfaces which allow for substituting in different dependencies
(e.g. `./lib/logger/framework.js` simply promotes the console object to echo
log lines to the screen, but `morgan` may be a better choice as we consider
scale).  Implementing that change is a simple matter of importing the new
module, replacing calls made via `console` with the newly configured log
transport agent without having to edit any of the call sites directly.

Beyond that, job triggers may need to move out of this service to allow for
centralized management or driving the initialization of each job run from the
email campaign or other data pipeline tooling.  Adding documentation for
downstream consumers may become necessary as adoptoin of the service grows.
This may be OpenAPI specs, Cucumber, or even a Jest suite fleshed out with
unit, integration, and snapshot testing of client applications.

File based data management, while simple to implement easily loses out as we
begin to optimize for performance and resilience.  One often overlooked DB
when seeking a simple document store or ACID compliant solution to consider
before moving data management out of the service and into distributed clients
at cloud providers with managed Maria or Mongo would be to host an SQLite
instance locally.  This has the advantage of Postgres-like syntax and support
of ORMs such as Sequelize (making for a natural transition of storage as the
interface remains consistent).  And short of changing languages and investing
in TypeScript, model validation may be peppered throughout the service where
needed by using the Joi validation library from the Hapi ecosystem (we've used
Express here, but validation with Joi is effortless once the model schema are
well in hand, regardless of which service framework is running).

A well planned model opens up many of the possibilities hinted at earlier in
this document.  Infrastructure to support scaling this service would be
minimal given the very light data storage needs.  A high-bandwidth gateway
might even have task scheduling capabilities built in, but even spinning up
a compute instance to manage subscriptions and dispatches via `cron` daemon
in this current set of requirements could be satisfied with a one-liner set up
to kick off execution of a lambda function at the head of an event pipeline.
Fun stuff!


Gratitude
---------

Thank you for your time in preparing for and/or reviewing this work.  Any and
all feedback is welcome in the form of reviews, bugs, comments, pull requests,
etc.  Cheers!  :)
