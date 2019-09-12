const request = require('request');

exports.helloGET = (req, res) => {
  res.send('Hello World!');
};

exports.jiraGp2 = (req, res) => {
  //Plesae replace the url bellow with the one from the incoming webhook
	var url = 'https://chat.googleapis.com/v1/spaces/HERE-IS-A-FALSE-ID';
	var postbody = req.body;
	var verb = ' updated ';
	var user;
	var issue;
	var who;
	var bodytext = '';
	console.log('1. a koyan is logging');
	//console.log(req.body);


	const data = req.body;
	console.log('2. data webhookevent is' + data.webhookEvent);
	if (data.issue) {
		user = data.user;
		who = user.displayName;
		issue = data.issue;
		baseJiraUrl = issue.self.replace(/\/rest\/.*$/, '');
		issue_url = baseJiraUrl + '/browse/' + issue.key;
		if ('jira:issue_created'===data.webhookEvent) {
			verb = '*Created* ';
			bodytext = '*Description*: ' +issue.fields.description;
		} else if ('jira:issue_deleted'===data.webhookEvent) {
			verb = '*Deleted* ';
		} else if ('jira:issue_updated'===data.webhookEvent) {
			if ('issue_commented'===data.issue_event_type_name) {
				verb = '*Commented* on ';
				bodytext = '*Comment*: ' +data.comment.body;
			} else {
				return;
			}
		} else {
			return;
		}

		postbody = "*" + who + "*" + "\n";
		postbody = postbody + verb + "<" + issue_url + "|" +  issue.key +">"  + ': ' + issue.fields.summary + "\n";
		postbody = postbody + bodytext;


		//now lets send it to chat.google.com
		request.post({url:url, body:JSON.stringify({"text":postbody})}, function optionalCallback(err, httpResponse, body) {
			if (err) {
				res.send('Error' + err);
				//return console.error('upload failed:', err);
			}

			console.log('Upload successful!  Server responded with:', body);
		});

	}
	res.send({"text":postbody});

    //console.log ("7. Outside the if.  the postbody is " + postbody);

};
