define([
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
    'lodash',
    'scale.raphael'
], function(PortableElement, _, scaleRaphael){

    'use strict';

    var paperHeight = 600,
        paperWidth = 800,
        paper = scaleRaphael($('#paper')[0], paperWidth, paperHeight);

    var localRequire = PortableElement.getLocalRequire('graphNumberLineInteraction', 'parccTei/pciCreator/dev/graphNumberLineInteraction/', {}, {
        runtimeLocation : 'parccTei/pciCreator/dev/graphNumberLineInteraction/',
        useExtensionAlias : true
    });

    /**
     * Round float number to third decimal
     * 
     * @param {Float} number
     * @returns {Number}
     */
    function _round3(number){
        var m = Math.pow(10, parseInt(3));
        return Math.round(number * m) / m;
    }

    localRequire(['graphNumberLineInteraction/runtime/libs/axisFactory'], function(axisFactory){

        test('draw simple', function(){

            var _top = 80,
                _left = 80;

            var axis = new axisFactory(paper, {
                top : _top,
                left : _left,
                unitSubDivision : 2,
                arrows : true
            });
            
            //positioning test:
            var origin = axis.getOriginPosition();
            equal(origin.top, _top, 'origin position correct');
            equal(origin.left, 330, 'origin position correct');
            
            //snap test
            //with the given config, the step is 25/2 = 12.5px : config.unitSize / config.unitSubDivision
            var snap = axis.snap(origin.left + 12, 123);
            equal(snap[1], _top, 'snap position correct');
            equal(snap[0], 330, 'snap position correct');
            
            snap = axis.snap(origin.left - 12, 1234);
            equal(snap[0], 330, 'snap position correct');
            
            snap = axis.snap(origin.left + 13, 12356);
            notEqual(snap[0], 330, 'snap position correct');
            
        });

    });

});