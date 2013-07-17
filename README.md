# Cartero Screen Cast Outline
## Intro

Cartero is a client side asset managment tool that enables users to have a modular front-end architecture. I am going to demo Cartero setup and workflow with a simple express server.

## Install dependencies and create Express server
First lets install all our dependencies with:

```
npm install express cartero cartero-express-hook jade grunt grunt-contrib-watch
```

And create a basic Express server at `server.js`:
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
} );

app.listen( '7000' );
```
And a view at `views/home/home.jade'
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
Then we can run 
```
node server.js
```
and open up [http://localhost:7000/](http://localhost:7000/) to see that our jade view has rendered
## Setting up cartero
Now that we have express serving up views lets get it working with cartero. First lets create some asset bundles that we want included in our `home.jade` template. First create an `assets` folder in the root of your project and then lets create two bundles, a `Forms` bundle with all of your form base styles and a `LoginForm` bundle with styles and scripts specifically for your Sign up form.

Lets create a `assets/Form/` folder with a `form.css` file for our base form styles:
#### `assets/Form/form.css`
```css
form {
  border: 1px solid gainsboro;
  border-radius: 4px;
  padding: 15px;
}
```
We are going to have a login form module that is used on the home page aswell as other pages.  Our login form has some unique styles but it also uses the base from styles from the `Form` bundle. Lets create a `login.css` file that has the login specific styles and a `bundle.json` file to list the `Form` bundle as a dependency.
#### `assets/LoginForm/login.css`
```css
.login-form {
  font-size: 1.4em;
}

.login-form button {
  color: white;
  background: green;
}
```
#### `assets/LoginForm/bundle.json`
```javascript
{
  "dependencies": [
    "Form"
  ]
}
```

Now that we have created some bundles, lets use them on the homepage. Open up the home view and add the cartero bundle comment:
#### `views/home/home.jade`
```jade
doctype
// ##cartero_requires "LoginForm"
html
  head
    | !{cartero_js}
    | !{cartero_css} 
  body
    form.login-form
      h3 Login
      input(type="text")
      button(type="submit") login

```

lets create a Gruntfile to run the Cartero build.
#### `Gruntfile.js`
```javascript
module.exports = function( grunt ) {
    grunt.initConfig( {
        cartero : {
            options : {
                projectDir : __dirname,      // the root directory of your project. All other paths 
                                             // in these options are relative to this directory.
                library : {
                    path : "assets/"   // the relative path to your Asset Library directory.
                },
                views : {
                    path : "views/",         // the directoy containing your server side templates.
                    viewFileExt : ".jade"    // the file extension of your server side templates.
                },
                publicDir : "static/",       // your app's "public" or "static" directory (into
                                             // which processed assets will ultimately be dumped).

                tmplExt : ".tmpl",           // the file extension(s) of your client side template.
                mode : "dev"                 // "dev" or "prod"
            },

            // `dev` target uses all the default options.
            dev : {}
            
        }
    } );

    grunt.loadNpmTasks( "cartero" );
    grunt.loadNpmTasks( "grunt-contrib-watch" ); // for `--watch` flag
};
```

Lets try out the build task by running:
```
grunt cartero
```

