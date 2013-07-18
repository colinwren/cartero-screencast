# Cartero Screen Cast Outline
## Intro

Cartero is a client side asset managment tool that enables users to have a modular front-end architecture. I am going to walk through the setup and workflow of using Cartero with an [Express.js](http://expressjs.com/) server.

## Install dependencies and create Express server
First, lets a create new folder for our project and install all our dependencies with npm:

```
npm install express cartero cartero-express-hook jade grunt grunt-contrib-watch grunt-contrib-sass
```

Now we can create a simple Express server at `server.js` that uses the [Jade](http://jade-lang.com/) for views:
#### `server.js`
```javascript
var express = require( 'express' );
var path = require( 'path' );
var app = express();

app.configure( function() {
	app.set( 'views' , path.join( __dirname, 'views' ) );
	app.engine( 'jade', require( 'jade' ).__express );
	app.use( express.static( path.join( __dirname, 'static' ) ) );
} );

app.get( '/', function( req, res ) {
	res.render( 'home/home.jade' );
});

app.listen( '7000' );
```
And a homepage view at `views/home/home.jade`:
#### `views/home/home.jade`
```jade
doctype
html
	head
	body
		form.login-form
			h3 Login
			input(type="text")
			button(type="submit") login
```
Then lets run: 
```
node server.js
```
and open up [http://localhost:7000/](http://localhost:7000/) to see that our Jade homepage view has been rendered and served.
## Setting up Cartero
Now that we have Express serving up views, lets get it working with Cartero. First, we will create some asset bundles that we want included in our `home.jade` template. Lets create an `assets` folder in the root of our project with two bundles, a `Form` bundle with all of our base form styles and a `LoginForm` bundle with styles and scripts specific to our login form.

Lets create a `assets/Form/` folder with a `form.css` file for our base form styles:
#### `assets/Form/form.css`
```css
form {
	border: 1px solid gainsboro;
	border-radius: 4px;
	padding: 15px;
}
```
We are going to create a login form module that is used on the home page aswell as other pages.  Our login form has some unique styles but it also uses the base from styles from the `Form` bundle. Lets create a `loginForm.css` file that has the login specific styles, a `loginForm.js` with login specific JavaScript, and a `bundle.json` file to list the `Form` bundle as a dependency.
#### `assets/LoginForm/loginForm.css`
```css
.login-form {
	font-size: 1.4em;
}

.login-form button {
	color: white;
	background: green;
}
```
#### `assets/LoginForm/loginForm.js`
```javascript
alert('Please login!');
```
#### `assets/LoginForm/bundle.json`
```javascript
{
	"dependencies": [ "Form" ]
}
```

Now that we have created some bundles, lets use them on the homepage. Open up the home view so we can add a Cartero bundle comment and some Cartero variables that get replaced by the assets' `script` and `link` tags:
#### `views/home/home.jade`
```jade
// ##cartero_requires "LoginForm"
doctype
html
	head
		| !{cartero_css} 
	body
		form.login-form
			h3 Login
			input(type="text")
			button(type="submit") login
		| !{cartero_js}
```
The bundle comment specifies which bundles should be included in this template. In this case, the LoginForm bundle has `loginForm.css` and `loginForm.js` asset files and is dependent on the Form bundle which has the `form.css` file. This will cause those files to be included via `link` and `script` tags wherever the `!{cartero_css}` and `!{cartero_js}` are in the Jade template.

Lets create a Gruntfile to run the Cartero build task:
#### `Gruntfile.js`
```javascript
module.exports = function( grunt ) {
	grunt.initConfig( {

		cartero : {

			options : {

				projectDir : __dirname,

				library : {
					path : "assets/"
				},

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/",

				tmplExt : ".tmpl",

			},

			dev : {
				options : {
					mode : "dev"
				}

			}

		}
	} );

	grunt.loadNpmTasks( "cartero" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
};
```
*Cartero uses [Grunt](http://gruntjs.com) to run the asset bundler, if you are unfarmilar with Grunt or don't have it installed check out the [getting started guide](http://gruntjs.com/getting-started).*

Lets try out the build task by running:
```
grunt cartero
```
This will generate a `cartero.json` file and a `static` folder that looks like: 
```
static/
├── library-assets
│   ├── Form
│   │   └── form.css
│   └── LoginForm
│       └── loginForm.css
└── view-assets
```
You should never edit the `cartero.json` file or any of the contents of the `static/library-assets` or `static/view-assets` folders because they are generated by the Catero Grunt task and any changes you make will be overwritten when the task is run.
## Hooking Cartero up to Express
Now that we have our bundles and build task setup, we can use [Cartero Express hook](https://github.com/rotundasoftware/cartero-express-hook) to have the bundled assets included in the Jade templates. Lets add the Cartero middleware to our middleware stack in `server.js`.

#### `server.js`
```javascript
var express = require( 'express' );
var path = require( 'path' );
var app = express();
var carteroMiddleware = require( 'cartero-express-hook' );

app.configure( function() {
	app.set( 'views' , path.join( __dirname, 'views' ) );
	app.engine( 'jade', require( 'jade' ).__express );
	app.use( express.static( path.join( __dirname, 'static' ) ) );
	app.use( carteroMiddleware( __dirname ) );
} );

app.get( '/', function( req, res ) {
	res.render( 'home/home.jade' );
});

app.listen( '7000' );
```
Now that the middleware is hooked up we can run:
```
node server.js
```
and open [http://localhost:7000/](http://localhost:7000/) to see that our homepage has the `loginForm.css`, `loginForm.js` and the `form.css` assets included. We have succesfully included our asset bundles with Cartero! Lets check out some of Cartero's other powerful features.

## Page specifc assets
So far our homepage is using the LoginForm bundle (which also pulls in the Form bundle) of assets for the styling of the login form component.  Having these assets in a bundle is useful because I can include them on any other page where they are needed.  Along with the component assets, the homepage also has unique assets that don't need to be in a bundle because they are only used on this page. Lets make some unique homepage styles in `home.css`:
#### `views/home/home.css`
```css
body {
	background: hsl(0, 0%, 97%);
}

.login-form {
	background: white;
}
```
Now lets run:
```
grunt cartero && node server.js
```
and open [http://localhost:7000/](http://localhost:7000/). You can see that the page specific assets were included alongside the bundled assets.
## Preprocessors
Asset preprocessors are indespensible tools for front-end web development, Cartero makes it trivial to use which ever preprocessors you like. Lets open the `Gruntfile.js` so we can configure the Cartero Grunt task to work with [Sass](http://sass-lang.com/) and add code to load the `grunt-contrib-sass` task:
#### `Gruntfile.js`
```javascript
module.exports = function( grunt ) {
	grunt.initConfig( {

		cartero : {

			options : {

				projectDir : __dirname,

				library : {
					path : "assets/"
				},

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/",

				tmplExt : ".tmpl",

				preprocessingTasks : [ {
					name : "sass",
					inExt : ".scss",
					outExt : ".css"
				} ]

			},

			dev : {
				options : {
					mode : "dev"
				}

			}

		}
	} );

	grunt.loadNpmTasks( "cartero" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-contrib-sass" );
};
```
*Make sure you have Sass installed, if you don't head over to the Sass [installation documentation](http://sass-lang.com/download.html).*

Now that the Cartero Grunt task knows how to deal with `.scss` files, lets change `assets/LoginForm/loginForm.css` into `assets/LoginForm/loginForm.scss` and use some Sass in it.
#### `assets/LoginForm/loginForm.css -> vassets/LoginForm/loginForm.scss`
```scss
.login-form {
    font-size: 1.4em;
	button {
		color: white;
		background: green;
	}
}
```
Now lets run:
```
grunt cartero && node server.js
```
and open [http://localhost:7000/](http://localhost:7000/). You can see that the Sass was compiled and included onto the page.  This same process can be used for CoffeeScript or other CSS preprocessors.

## Using Cartero with Bower 
_If you are unfarmiliar with Bower or don't have it installed, check out the [Bower docs](http://bower.io/)._
Bower makes it easy to manage third party libraries and their dependencies. Bower components can be used as Cartero bundles and their dependencies in `bower.json` are automatically resolved by Cartero.

Lets get started by installing [Ember.js](http://emberjs.com/):
```
bower install ember
```
Ember and its dependencies (jQuery, and Handlebars) are now installed, lets get them accessable as Cartero bundles. Unlike the Cartero bundles, the Bower compontents have files that we dont want included such as tests and minified versions. Because of this we need a `bowerBundleProperties.json` file to tell Cartero which files we want.
#### `bowerBundleProperties.json`
```javascript
{
	"ember" : {
		"whitelistedFiles" : [ "ember.js" ]
	},
	"jquery" : {
		"whitelistedFiles" : [ "jquery.js" ]
	},
	"handlebars" : {
		"whitelistedFiles" : [ "handlebars.js" ]
	}
}
```

Then we'll edit the Cartero Grunt task config to use the `bower_components` as a source for bundles and to use `bowerBundleProperties.json` as config for those bundles:
#### `Gruntfile.js`
```javascript
module.exports = function( grunt ) {
	grunt.initConfig( {

		cartero : {

			options : {

				projectDir : __dirname,

				library : [
					{
						path : "assets/"
					},
					{
						path : "bower_components/",
						bundleProperties : grunt.file.readJSON( "bowerBundleProperties.json" )
					}],

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/",

				tmplExt : ".tmpl",

				preprocessingTasks : [ {
					name : "sass",
					inExt : ".scss",
					outExt : ".css"
				} ],

			},

			dev : {
				options : {
					mode : "dev"
				}

			}

		}
	} );

	grunt.loadNpmTasks( "cartero" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-contrib-sass" );
};
```
Now lets require the Ember bundle in our `home.jade`:
#### `views/home/home.jade`
```jade
// ##cartero_requires "LoginForm", "ember"
doctype
html
	head
		| !{cartero_css} 
	body
		form.login-form
			h3 Login
			input(type="text")
			button(type="submit") login
		| !{cartero_js}
```
and lets run:
```
grunt cartero && node server.js
```
When we open [http://localhost:7000/](http://localhost:7000/), we can see that Ember and all of its dependencies were included onto the homepage.
