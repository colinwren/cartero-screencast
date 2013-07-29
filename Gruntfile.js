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

				publicDir : "static/"

			},

			dev : {
				options : {
					mode : "dev"
				}
			},

			prod: {
				options : {
					mode : "prod"
				}
			},

		}
	} );

	grunt.loadNpmTasks( "cartero" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
};
