# README #
### What is this repository for? ###

* This repository is node server to managements users on back-end side

* This repository has the following APIs

	1. sign-up:
		* Sending activation link to to (user email that sign up / or to admin if verifyUserBy set to true)
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
* Create database login user
* Database Tables - You can create it manually or use the 'dbcreate' script below :
- Table: ActionVerifications
```javascript
	ActionVerifications: {
		actionId: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: () => uuid.v4()
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		actionType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		deleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	}
```
```javascript
	Tokens: {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: () => uuid.v4()
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true
		},
		ip: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		token: {
			type: DataTypes.STRING,
			allowNull: true
		},
		userAgentIdentity: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}
```

- Table: Users
```javascript
	Users:
	{
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: () => uuid.v4()
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.TEXT
		},
		fullName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		token: {
			type: DataTypes.STRING,
			allowNull: true
		},
		fbToken: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		googleToken: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		profilePhoto: {
			type: DataTypes.STRING,
			allowNull: true
		},
		isValid: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		termsOfUse: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}
```

- Table: Audit
```javascript
	Audit: {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: () => uuid.v4()
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false
		},
		actionName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		requestParams: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}
```

* Edit the following config with the above settings
* Configuration:
	- Setup the following config file: [config.js]

```javascript
{
  "verifyUserBy": "ADMIN", // "ADMIN" | "AUTO" : "EMAIL"
  "verify3rdPartyUserBy": "AUTO", // "ADMIN" | "AUTO" : "EMAIL"
  "useSingleToken": false, // true - Multiple tokens for diffrent devices
  "appName":"<Your application name>", // The appName will be uses when sending emails to user/admin
  "port": 5000,
  "database": {
    "name": "user-managements-db",
    "username": "user-managements-username",
    "password": "user-managements-password",
    "settings": {
      // Database location
      "host": "localhost",
      // You can use one of the the foolowing databases
      "dialect": " mysql | mariadb | sqlite | postgres | mssql ",
      // In case you use sqlite storage file path is required
      "storage": "/tmp/user-managements.sqlite",
      "pool": {
        "max": 5,
        "min": 0,
        "idle": 10000
      },
      // To log database queries set the following to true
      "logging": false
    }
  },
  // The following email setting are require if you want the system to send emails to users
  "email": {
    "service": "<Email Service>",
    "user": "<Email Username>",
    "pass": "<Email Password>",
    "from": "<Email From>"
  },
  "verificationUrl": "http://your-web-site-domain/user/verify/",
  "changePasswordUrl": "http://your-web-site-domain/change-password/",
  "loginUrl": "http://your-web-site-domain/login",
  "tokenHash": "dev-token-key",
  "adminEmail": "<admin@your-domain>",
  "log4js": {
    "appenders": { "app": { "type": "file", "filename": "/var/log/your-app-name/app-name.log" } },
    "categories": { "default": { "appenders": ["app"], "level": "all" } }
  },
  "templates": {
    "activation":{
      "body" : "./email-templates/activation/body.html",
      "subject" : "./email-templates/activation/subject.html"
    },
    "approved":{
      "body" : "./email-templates/approved-activation/body.html",
      "subject" : "./email-templates/approved-activation/subject.html"
    },
    "notify":{
      "body" : "./email-templates/notify-admin-when-user-created/body.html",
      "subject" : "./email-templates/notify-admin-when-user-created/subject.html"
    },
    "activationResponse" : "./email-templates/activation/response.html"
  },
  "userRoutePrefix": "/user"
}
```
* Run: yarn dbcreate Or npm run dbcreate - This script will create the relevant tables
* Run the server:
* Please see example how to run this module: [run-user-managements-node-server-exp](https://github.com/haim-rubin/run-user-managements-node-server-exp "Example how to wotk with 'user-managements-node-server'")

* Templates - any of the following templates can be edited with your own HTML template
	I've choose to work with [dot](https://www.npmjs.com/package/dot) module.
	You need to build your custom template with dot syntax.
	For example the default activationBody look like

	```javascript
		export default
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
				</html>
			`
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