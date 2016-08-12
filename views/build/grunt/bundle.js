module.exports = function(grunt) {

    var requirejs   = grunt.config('requirejs') || {};

    var root        = grunt.option('root');
    var out         = 'output';

    var teis = [
        'fractionModelInteraction/runtime/fractionModelInteraction',
        'graphFunctionInteraction/runtime/graphFunctionInteraction',
        'graphLineAndPointInteraction/runtime/graphLineAndPointInteraction',
        'graphNumberLineInteraction/runtime/graphNumberLineInteraction',
        'graphPointLineGraphInteraction/runtime/graphPointLineGraphInteraction',
        'graphZoomNumberLineInteraction/runtime/graphZoomNumberLineInteraction',
        'histogramInteraction/runtime/histogramInteraction',
        'interactivePassageInteraction/runtime/interactivePassageInteraction',
        'multiTabbedExhibit/runtime/multiTabbedExhibit',
    ];

    /**
     * Compile the new item runner as a standalone library
     */
    requirejs.tei = {
        options: {
            baseUrl : root + '/parccTei/views/js/pciCreator/dev/',
            findNestedDependencies : true,
            //optimize : 'none',
            uglify2: {
                mangle : false,
                output: {
                    'max_line_len': 400
                }
            },
            paths : {
                'IMSGlobal' : root + '/taoQtiItem/views/js/portableSharedLibraries/IMSGlobal',
                'OAT' : root + '/taoQtiItem/views/js/portableSharedLibraries/OAT',
                'PARCC' : root + '/taoQtiItem/views/js/portableSharedLibraries/PARCC',
                'qtiCustomInteractionContext' : root + '/taoQtiItem/views/js/runtime/qtiCustomInteractionContext'
            },
            wrapShim: true,
            inlineCss : true,
            include : teis,
            exclude : ['qtiCustomInteractionContext'],
            out: out + "/tei.min.js"
        }
    };



    grunt.config('requirejs', requirejs);


};
