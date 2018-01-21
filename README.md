# README #
### What is this repository for? ###

* This repository is node server to managements users on back-end side

* This repository has the following APIs

	1. sign-up:
		* Sending activation link to to (user email that sign up / or to admin if verifyUserByAdmin set to true)
		- route: 		/user/sign-up
		- body:
			```javascript
				{
					username: 'user-email@domain.com',
					password: 'user-password'
				}
			```
		- method:		'POST'
		- response:		
		- json:
			```javascript
				{
					message: 'User create, email verification sent'
				}
			```
			http-status: 200	OK

	2. verify-user
		* Verify user by clicking on activation link
		- The linked that sent with an email
		- route: /user/verify/:actionId
		- method: 'GET'
		- response: HTML that says if activation succeeded or faild
	
	3. sign-in
		* Sign in by user credentials or by thired party like (Facebook / Google) if loginWithThirdParty set to true 
		  return token that needs to be send each other api call to identify the user
		- route: /user/sign-in
		- body: 
			- a.
				```javascript
				{
					username: 'user-email@domain.com',
					password: 'user-password'
				}
				```
				Or in case sign in via thired party (Facebook/Google)
			- b.
				```javascript
				{
					username: 'third-party-email@domain.com',
					password: 'thired-party-token-reponse',
					thireParty: 'FACEBOOK' | 'GOOGLE'
				}
				```
		- method:		'POST'
		- response: 
		- json: 
			```javascript
			{ token: 'generated-token' }
			```
			http-status: 200	OK
			
		** The above response should be send in an header of each other requests (via interceptor or other)
						   
	4. forgot-password
		* Forgot password will send to the email link (changePasswordUrl + actionId that set in config)
		- route: /forgot-password
		- body: 
			```javascript
			{ username: 'user-email@domain.com' }
			```
		- method:		'POST'
		- reaponse: 
		- json: 
			```javascript
			{ message: 'Password reset link sent to your Email' }
			```
			http-status: 200	OK
		- Email will be send to the user with a link to change password, this link will combine actionId as a part of thr URL
		
	
	5. change-password
		* Change password - post to /user/change-password/{actionId} with { password } as payload 
		- route: /user/change-password/:actionId
		- body:
			```javascript
			{ password: 'new-password' }
			```
		- method:		'POST'
		- response:
		- json: 
			```javascript
			{ message: 'Password successfully changed' }
			```
			http-status: 200	OK
			
		
	6. get user info		 /user/info (token needs to be send in header)
		* get user info
		- route: /user/info
		- method:		'GET'
		- header: 
			```javascript
			{ token: 'generated-token' }
			```
	
	7. contact-us
		* Sending email to that admin user (admin user in config file) (token needs to be send in header)
		- route: /user/contact-us
		- body: 
			```javascript
			{
				username: 'user-email@domain.com',
				subject: 'contact-us-subjet',
				description: 'contact-us-description'
			}
			```
		- method:		'POST'
		- response: email with the payload will be sen to the adminEmail
	
* version: 1.0.7

### How do I get set up? ###

* yarn add user-managements-node-server / npm --save user-managements-node-server]
* This module use [Sequelize](http://docs.sequelizejs.com) so, it supports the following databases
* Create one of the following database 'postgres'|'mysql'|'sqlite'|'mssql'
* Create database loginh user
* Edit the following config with the above settings
* Configuration:
	- Setup the following config file: [config.js]
	
```javascript	
		const userRoute = '/user' //base route
		const config = {
		  // if this flag is true the admin user will get verification email instead of the user
		  verifyUserByAdmin: true,  
		  appName:'Application Name',
		  userRoute,
		  port: 5300,
		  database: {
			name: 'user-managements-db-name',
			username: 'user-managements-db-username',
			password: 'user-managements-db-password',
			host: 'localhost',
			dialect: 'postgres'|'mysql'|'sqlite'|'mssql' // <- Database type option is what Sequelize supports
			pool: {
			  max: 5,
			  min: 0,
			  idle: 10000
			},
			logging: false //Avoid log sequelize queries
		  },
		  email: {
			service: 'gmail',
			user: 'admin-is-email@gmail.com',
			pass: 'admin-is-email-password',
			from: '"Application name" <admin-is-email@gmail.com>'
		  },
		  verificationUrl: `http://localhost:5300${userRoute}/verify/`, // Web client UI
		  changePasswordUrl: `http://localhost:3000/change-password/`, // Web client UI
		  loginUrl: 'http://localhost:3000', // Web client UI
		  tokenHash: 'token-key', // replace with realy token
		  adminEmail: 'admin-is-email@gmail.com',
		  log4js: {
			appenders: { app: { type: 'file', filename: '/tmp/logs/app-name.log' } },
			categories: { default: { appenders: ['app'], level: 'all' } }
		  },
		  facebook: {
			APP_ID: 123456789,
			APP_SECRET: 'app-secret',
			VERSION: 'v2.9'
		  }, 
		  google: {
			clientId: 'clientId',
			clientSecret: 'clientSecret',
			apiKey: 'apiKey'
		  },
		  loginWithThirdParty: true, // true is for supporting login via Facebook/Google
		  templates: {
				activationBody : '../email-templates/activation/body.html',
				activationSubject : '../email-templates/activation/subject.html',
				activationResponse : '../email-templates/activation/response.html',
				activationBodyApproved : '../email-templates/approved-activation/body.html',
				activationSubjectApproved : '../email-templates/approved-activation/subject.html',
				notifyBodyAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/body.html',
				notifySubjectAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/subject.html'
		  }
		}
```

* Run the server:

```javascript
		const { server: userManagements, isAuthenticated } = require('user-managements-node-server')
		const express = require('express')
		const bodyParser = require('body-parser')
		const proxy =  require('express-http-proxy')  
		const boolParser = require('express-query-boolean')
		const config = require('./config')
		const userApiAddress = 'http://localhost:5300'
		
		const redirectUrl = (req, res, next) => {
		  Object
			.assign(
			  req,
			  {
				url: req.originalUrl.replace('/api', '')
			  }
			)

		  next()
		}
		
		const server = (config) => {
		userManagements(config) //Setup user managements
  		const app = express()

  		app.use(bodyParser.urlencoded({ extended: true }));
  		app.use(bodyParser.json())
  		app.use(boolParser())

  		app.use(bodyParser.json({limit: '200mb'}));
  		app.use('/api/user', redirectUrl, proxy(userApiAddress))
 
 		app.use('/api/any-other-your-application-route', isAuthenticated(), entityRoute)

		app.listen(config.port, () => {
			console.log(`Server is running on port ${config.port}`)
		})
}

server(config)
```		
		
* Templates - any of the following templates can be edited with your own HTML template
	I've choose to work with [dot](https://www.npmjs.com/package/dot) module.
	You need to build your custom template with dot syntax.
	For example the default activationBody look like

	```javascript
		module.exports =
			`<!doctype html>
			<html>
					<head>
							<meta charset='utf-8'>
							<title>{{=it.appName}}</title>
							<style type='text/css'>
									body {
											-webkit-text-size-adjust: 100%;
											-ms-text-size-adjust: 100%;
											font-family: sans-serif;
									}
							</style>
					</head>
					<body>
							<div>
									<div>Hello, {{=it.username}}</div>
									Thank you for registration our app,
									to finish activation please click <a href='{{=it.verificationUrl}}{{=it.actionId}}'>here</a>
							</div>
					</body>
			</html>`
 ```
	1. activationBody
		Exposed fields:
		a. appName - appName from config
		b. username - current handled username
		c. verificationUrl - verificationUrl from config
		d. actionId - current handled actionId

	2. activationSubject
		Exposed fields:
		a. appName - appName from config

	3. activationResponse
		Exposed fields:
		a. appName - appName from config
		b. error - boolean indicator
		c. link - loginUrl from config

	4. activationBodyApproved
		a. appName - appName from config
		b. username - current handled username
		c. loginUrl - loginUrl from config

	5. activationSubjectApproved
		a. appName - appName from config

	6. notifyBodyAdminWhenUserCreated
		a. appName - appName from config
		b. admin - adminEmail from config
		c. username - current handled username
		d. fullName - current handled user's fullName

	7. notifySubjectAdminWhenUserCreated
		a. appName - appName from config
		b. username - current handled username

* Haim Rubin
* haim.rubin@gmail.com
- Please let me know on any issue