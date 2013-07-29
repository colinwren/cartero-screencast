var express = require( 'express' );
var app = express();
var carteroMiddleware = require( 'cartero-express-hook' );

app.set( 'views' ,'views' );
app.engine( 'jade', require( 'jade' ).__express );
app.use( express.static( 'static' ) );
app.use( carteroMiddleware( __dirname ) );

app.get( '/', function( req, res ) {
	res.render( 'home/home.jade' );
});

app.listen( '7000' );
