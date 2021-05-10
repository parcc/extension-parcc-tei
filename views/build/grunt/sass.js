module.exports = function (grunt) {
    'use strict';

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/parccTei/views/';

    sass.parcctei = {
        options : {},
        files : {}
    };
    sass.parcctei.files[root + 'js/pciCreator/ims/graphNumberLineInteraction/runtime/css/graphNumberLineInteraction.css'] = root + 'js/pciCreator/ims/graphNumberLineInteraction/runtime/scss/graphNumberLineInteraction.scss';

    watch.parccteisass = {
        files : [
            root + 'scss/**/*.scss',
            root + 'js/pciCreator/ims/**/*.scss'
        ],
        tasks : ['sass:parcctei', 'notify:parccteisass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.parccteisass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    grunt.registerTask('parccteisass', ['sass:parcctei']);
};
