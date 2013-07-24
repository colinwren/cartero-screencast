# Cartero Screen Cast Outline
## Intro

In this screencast, I am going to walk through the setup and workflow of using Cartero with an [Express.js](http://expressjs.com/) server. Cartero is a powerful client side asset managment tool that enables developers to create reusable asset bundles and store page specific assets alongside their corresponding views.

We'll create a simple Express server and a homepage for our app. Then we will setup Cartero and use it to add JS and CSS to our homepage.

## Express server
First off, let's install all of our project's dependencies with npm:

```
npm install express cartero cartero-express-hook jade grunt grunt-contrib-watch
```

Now we can create a simple Express server at `server.js` that uses the [Jade](http://jade-lang.com/) templating engine for view rendering:
#### `server.js`
```javascript
var express = require( 'express' );
var app = express();

app.set( 'views' , 'views' );
app.engine( 'jade', require( 'jade' ).__express );
app.use( express.static( 'static' ) );

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
and open up [http://localhost:7000/](http://localhost:7000/) to see that our homepage view has been rendered and served.
## Page specifc assets
Let's add some styles to our homepage. Usually we would store our homepage CSS in a `styles` folder, but wouldn't it be better to store all of our hompage assets alongside the `home.jade`? Cartero allow us to drop any JS, CSS, or client side templates into the `home` folder and they will be automatically included on the homepage. Let's create a `home.css` alongside our `home.jade` in the `views/home` folder:
#### `views/home/home.css`
```css
body {
	background: gainsboro;
}

.login-form {
	background: white;
}
```
## Cartero build setup
Now we'll create a Gruntfile so we can setup the Cartero build task:
#### `Gruntfile.js`
```javascript
module.exports = function( grunt ) {
	grunt.initConfig( {

		cartero : {

			options : {

				projectDir : __dirname,

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/"

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

Let's start the build task with the `--watch` option so that it will be rerun whenever we save a file:
```
grunt cartero --watch
```
The task will generate a `cartero.json` file and a `static` folder that looks like: 
```
static/
├── library-assets
└── view-assets
    └── home
        └── home.css
```
## Hooking Cartero up to Express
Let's use [Cartero Express hook](https://github.com/rotundasoftware/cartero-express-hook) to get our assets included in our views. Let's add the hook into our middleware stack in `server.js`.

#### `server.js`
```javascript
var express = require( 'express' );
var app = express();
var carteroMiddleware = require( 'cartero-express-hook' );

app.set( 'views' , 'views' );
app.engine( 'jade', require( 'jade' ).__express );
app.use( express.static( 'static' );
app.use( carteroMiddleware( __dirname ) );

app.get( '/', function( req, res ) {
	res.render( 'home/home.jade' );
});

app.listen( '7000' );
```

Lastly, we'll add variables to our `home.jade` template that get replaced by the `script` and `link` tags of our assets during rendering:
#### `views/home/home.jade`
```jade
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

Now we'll run:
```
node server.js
```
and open [http://localhost:7000/](http://localhost:7000/) to see that our homepage has the `home.css` asset included. We have succesfully included our stylesheet with Cartero! Let's check out how we can use Cartero to manage reuseable asset bundles.
## Creating asset bundles
First, we will create some asset bundles to be included in our `home.jade` template. We'll create two bundles inside an `assets` folder. Our first bundle will be __Form__, this will contain some generic styles that we want used on forms throughout our app.

Lets create a `assets/Form` folder with a `form.css` file for our base form styles:
#### `assets/Form/form.css`
```css
form {
	border: 1px solid grey;
	border-radius: 4px;
	padding: 15px;
}
```
We also have CSS and JS that is specific to the login form component used on our homepage, let's create a __LoginForm__ bundle for these assets. For the login form styling, let's create a `loginForm.css`:

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
And for the login form JS, let's create a `loginFrom.js`:
#### `assets/LoginForm/loginForm.js`
```javascript
alert('Please login!');
```
On any page we use the assets from our __LoginForm__ bundle, we also want the assets from the __Form__ bundle. With Cartero all we have to do is list the __Form__ bundle as a dependency of __LoginForm__ in a `bundle.json` file:
#### `assets/LoginForm/bundle.json`
```javascript
{
	"dependencies": [ "Form" ]
}
```
We then need to list the bunldes we want included in our `home.jade` template:
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
And lastly, we need to tell the Cartero build task to look for bundles in the `assets` folder:
```javascript
module.exports = function( grunt ) {
	grunt.initConfig( {

		cartero : {

			options : {

				projectDir : __dirname,
				
				library : {
					path: 'assets/'
				},

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/"

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
Now we can checkout our homepage with the new bundled assets included by running:
```
node server.js
```
and opening [http://localhost:7000/](http://localhost:7000/)

## Production mode
Now that we've seen how easy it is to include assets in our Jade views with Cartero, lets check out how Cartero helps us prepare out assets for production. Let's start by taking a look at the source of our homepage.

Lets see how it is different after when we run the cartero grunt task in production mode instead.

## Using Cartero with Bower 
_If you are unfarmiliar with Bower or don't have it installed, check out the [Bower docs](http://bower.io/)._
Bower makes it easy to manage third party libraries and their dependencies. Bower components can be used as Cartero bundles and their dependencies in `bower.json` are automatically resolved by Cartero.

Let's get started by installing [Ember.js](http://emberjs.com/):
```
bower install ember
```
Now that Ember and its dependencies (jQuery, and Handlebars) are installed, let's get them accessable as Cartero bundles. Unlike our asset bundles, the Bower compontents have files that we dont want included in our views such as tests and minified versions. Because of this we need a `bowerBundleProperties.json` file to tell Cartero which files we want. In this file, we can set any options that we would in a `bundle.json`, this comes in handy when you want to configure a bundle's properties but don't want to modify its contents. 
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
					}
				],

				views : {
					path : "views/",
					viewFileExt : ".jade"
				},

				publicDir : "static/"

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
Now let's require the Ember bundle in our `home.jade`:
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
and let's run:
```
node server.js
```
When we open [http://localhost:7000/](http://localhost:7000/), we can see that Ember and all of its dependencies were included onto the homepage.
