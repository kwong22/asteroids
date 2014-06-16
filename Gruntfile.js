module.exports = function(grunt) {
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	    options: {
		separator: ';'
	    },
	    dist: {
		src: ['public/js/*.js'],
		dest: 'public/dist/<%= pkg.name %>.js'
	    }
	},
	uglify: {
	    options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("mm-dd-yyyy") %> */\n'
	    },
	    dist: {
		files: {
		    'public/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
		}
	    }
	}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
	'concat',
	'uglify'
    ]);
};
