# Garage Pi

An updated version of my closed source project, Garage Pi is a web front end for my Raspberry Pi garage automation system.  Powered by AngularJS, NodeJS, ExpressJS, Mongo and SocketIO.

## Features
1. JWT for API authorization.
1. SocketIO integration for 3-way binding.
1. User management, new users are currently only added via an existing admin user.
2. Streaming 'video' via a webcam and SocketIO, motion activated.
3. Backend is setup to manipulate the GPIO pins

## TODO
1. Build front end for GPIO interaction
2. Build the weather widget for the dashboard
3. Build a page for the system logs
4. Implement a email warning system based on camera movement/doors being left open 

## Development
1. Run `npm install -g bower gulp yo generator-ng-poly`.
1. Run `bower install && npm install` to install this project's dependencies.
1. Rename the `env.sample.js` to `env.js` and edit the settings, mainly the `SESSION_SECRET`.

### Gulp tasks
- Run `gulp` to compile for dev and launch server
- Run `gulp build:client` to compile for client code
- Run `gulp build:server` to compile server
- Run `gulp build` for both
- Run `gulp deploy` to build and deploy via rsync, add prod env to enable production
- Flags `--env=prod` to compile for production
-       `--env=prod --pretty` to compile for production without minification
-       `--nobrowser` to launch BrowserSync without opening a browser
