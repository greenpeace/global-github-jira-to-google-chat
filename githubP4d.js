/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.githubP4d = (req, res) => {
	var url = 'https://chat.googleapis.com/v1/spaces/AAAAPM1ti8U/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=-3VezclRm1dwTIK0FUm_X5Usnef6VUAht-NlvGu3Li0%3D';
	var postbody = 'test';
	var text = '';
    var request = require('request');

	const repositoryStartsWith = 'planet4';
	//console.log('1.gh. koyan is logging');

	//console.log(req);
	
	
	const header = req.headers['x-github-event'];
	//console.log('1b1. we will log the header');
	//console.log(header);

	//const header = 'pull_request';

	const data = JSON.parse(req.body.payload);
	//console.log('1b2. we will log the body payload (the data) only');
	//console.log(data);

	//console.log('1b3. Lets try without having parsed the data first');
	//console.log(req.body.payload);
	
	//var keyst = '';
	//for (name in data) {
	//	keyst += ','+ name;
	//}
	//console.log('1b4. the keys are '+ keyst);
	
						
	const repository = data.repository;	
	//console.log('1c2. we will log the repository only');
	//console.log(repository);
	
	
	

	if (('pull_request_review_comment'===header) || ('push'===header) || ('pull_request'===header) || ('issue_comment'===header) || ('issues'===header) || ('ping'===header)) {
		console.log('2. inside the if');
		
		if (!('ping'===header)) {
			if (repositoryStartsWith.length && !repository.name.startsWith(repositoryStartsWith)) {
				postbody = postbody + 'Repository not monitored: ' + data.repository.name + '/n';
			} else {
			
				const user = data.sender;
				text = '';
			
				switch (header) {
					case 'push':
						console.log('3. header says push');
						if (repository.full_name) {
							if (data.head_commit) {
								var commits = data.commits;
								var multi_commit = "";
								var changeset = 'Changeset';
								text = '*Pushed* to <' + data.head_commit.url + '|' +  repository.full_name + '>\n';
					
								if (commits.length > 1) {
									multi_commit = " [Multiple Commits]";
									changeset = changeset + 's';
								}
					
								text +=  "*Message*: " + data.head_commit.message + '...' + multi_commit + '\n';				
								text +=  "*" + changeset + '*\n';
				
								for (var i = 0; i < commits.length; i++) {
									var commit = commits[i];
									var shortID = commit.id.substring(0, 7);
									text += '<' + commit.url + '|' + shortID + '> ' + commit.message.substring(0, 55) + '...' + '\n';
								}
							}				
						}	
						break;
					case 'pull_request':
						switch (data.action) {
							case 'assigned':
								text = ' assigned to: ' + data.assignee.login;
								break;
							case 'unassigned':
								text = ' unassigned of ' + data.assignee.login;
								break;
							case 'opened':
								text = ' opened';
								break;
							case 'closed':
								if (data.pull_request.merged) {
									text = ' merged';
								} else {
									text = ' closed';
								}
								break;
							case 'reopened':
								text = ' reopened';
								break;
							case 'labeled':
								text = ' added label: "' + data.label.name + '" ';
								break;
							case 'unlabeled':
								text = ' removed label: "' + data.label.name + '" ';
								break;
							case 'synchronize':
								text = ' synchronized';
						}
						if (text) {
							request_data = '#' + data.pull_request.number + ' - ' + data.pull_request.title;
							request_link = data.pull_request.html_url;
						
							text = '*Pull request:* ' + text + '\n';
							text += '<'+ request_link + '|' + request_data + '>';
						}
						break;
					case 'issue_comment':
						text = '*' + data.action + ' comment on issue:*'+ data.issue.title + '\n';					
						text += '<'+ data.comment.html_url + '|Message:>' + data.comment.body + '...';						
						break;
					case 'pull_request_review_comment':
						text = '*' + data.action + ' comment on PR: *'+ data.pull_request.title + '\n';					
						text += '<'+ data.comment.html_url + '|Message:>' + data.comment.body + '...';
						
						
				}

				if (text) {
					var textmessage = {"text": '*'+ user.login + '*' + '\n' + text};
					
					var card =	{
								   "cards": [
									  {
										 "header": {
											"title": user.login,
											"imageUrl": user.avatar_url,
											"imageStyle": "AVATAR"
										 },
										 "sections": [
											{
											   "widgets": [
												  {
													 "textParagraph": {
														"text": text
													 }
												  }
											   ]
											}
										 ]
									  }
								   ]
								}



			
					//now lets send it to chat.google.com
					request.post({url:url, body:JSON.stringify(textmessage)}, function optionalCallback(err, httpResponse, body) {
						if (err) {
							res.send('Error' + err);
							//return console.error('upload failed:', err);
						}
		
						console.log('Upload successful!  Server responded with:', body);
					});			
				}
			}	
		}

	}

	res.send({"text":text});

};
