module.exports = function(grunt) {
    "use strict";
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['buildjs'],
                options: {
                    interrupt: true,
                },
            },
            css: {
                files: ['src/scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    interrupt: true,
                },
            },
        },
        browserify: {
            dist: {
              files: {
                'dist/quill-mentions.js': ['src/js/**/*.js'],
              },
            },
        },
        uglify: {
            build: {
                files: {
                    'dist/quill-mentions.min.js': ['dist/quill-mentions.js'],
                }
            }
        },
        sass: {
          dist: {
            options: {
              style: 'expanded'
            },
            files: {
              'dist/quill-mentions.css': 'src/scss/style.scss',
            }
          }
        },
        jsdoc: {
            dist: {
                src: ['src/js/**/*.js'],
                options: {
                    destination: 'docs'
                }
            },
        },
    });

    grunt.registerTask('default', ['browserify', 'uglify', 'sass', 'jsdoc']);
    grunt.registerTask('buildjs', ['browserify', 'uglify']); // don't build sass or docs bc they're sloowwwww
};