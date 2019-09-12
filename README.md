# Scripts that manipulate incoming webhooks from Jira and github and format them for Google Hangout chat

The purpose of the attached two scripts is to be deployed as google cloud functions.
Each google cloud function can be invoced by a URL (when you create the function, you get the url it responds to).

To use them,
- create a google cloud function,
- use the attached code,
- replace the dummy google chat url (in the first lines) with the url of the incoming webhook of the google chat channel you want to post to
- Get the google cloud function listening URL
- Use that url for the outgoing webhook of Jira or github to send their data to.
