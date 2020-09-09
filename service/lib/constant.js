const freeze = require('./freeze')

module.exports = freeze({
	charset: {
		UTF8: 'charset=utf-8'
	},
	header: {
		ACCEPT: 'Accept',
		AUTH: 'Authorization',
		CONTENT_RANGE: 'Content-Range',
		CONTENT_TYPE: 'Content-Type',
		RANGE_UNIT: 'Range-Unit'
	},
	label: {
		FAIL: 'FAIL',
		PASS: 'PASS',
		WARN: 'WARN'
	},
	type: {
		API: 'application/openapi+json',
		CSS: 'text/css',
		CSV: 'text/csv',
		HTML: 'text/html',
		JS: 'application/javascript',
		JSON: 'application/json',
		STREAM: 'application/octet-stream',
		TEXT: 'text/plain',
		ZIP: 'application/zip'
	},
	status: {
		OK: 200,
		CREATED: 201,
		ACCEPTED: 202,
		NO_CONTENT: 204,
		RESET_CONTENT: 205,
		PARTIAL_CONTENT: 206,
		SEE_OTHER: 303,
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		METHOD_NOT_ALLOWED: 405,
		CONFLICT: 409,
		UNSUPPORTED_MEDIA_TYPE: 415,
		TOO_MANY_REQUESTS: 429,
		NO_RESPONSE: 444,
		INTERNAL_SERVER_ERROR: 500,
		NOT_IMPLEMENTED: 501,
		BAD_GATEWAY: 502,
		SERVICE_UNAVAILABLE: 503,
		GATEWAY_TIMEOUT: 504
	},
	reddit: {
		t1_: 'Comment',
		t2_: 'Account',
		t3_: 'Link',
		t4_: 'Message',
		t5_: 'Subreddit',
		t6_: 'Award'
	}
})


/*
Type application

application/EDI-X12   
application/EDIFACT   
application/javascript   
application/octet-stream   
application/ogg   
application/pdf  
application/xhtml+xml   
application/x-shockwave-flash    
application/json  
application/ld+json  
application/xml   
application/zip  

Type audio

audio/mpeg   
audio/x-ms-wma   
audio/vnd.rn-realaudio   
audio/x-wav   

Type image

image/gif   
image/jpeg   
image/png   
image/tiff    
image/vnd.microsoft.icon    
image/x-icon   
image/vnd.djvu   
image/svg+xml    

Type multipart

multipart/mixed    
multipart/alternative   
multipart/related (using by MHTML (HTML mail).)  

Type text

text/css    
text/csv    
text/html    
text/javascript (obsolete)    
text/plain    
text/xml    

Type video

video/mpeg    
video/mp4    
video/quicktime    
video/x-ms-wmv    
video/x-msvideo    
video/x-flv   
video/webm   

Type vnd

application/vnd.oasis.opendocument.text    
application/vnd.oasis.opendocument.spreadsheet  
application/vnd.oasis.opendocument.presentation   
application/vnd.oasis.opendocument.graphics   
application/vnd.ms-excel    
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet   
application/vnd.ms-powerpoint    
application/vnd.openxmlformats-officedocument.presentationml.presentation    
application/msword   
application/vnd.openxmlformats-officedocument.wordprocessingml.document   
application/vnd.mozilla.xul+xml 
*/
