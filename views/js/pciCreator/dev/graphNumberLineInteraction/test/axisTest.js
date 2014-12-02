define([
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement',
    'lodash',
    'scale.raphael'
], function(PortableElement, _, scaleRaphael){
    
    'use strict';
    
    var canvasHeight = 600,
        canvasWidth = 600,
        canvas = scaleRaphael($('#paper')[0], canvasHeight, canvasWidth);

    var curveConfig = {
        //starting unit (in true cartesian coordinate system)
        start : -10,
        end : 10,
        precision : 0.1,
        //unit size in px
        unitSize : {
            x : 30,
            y : 30
        },
        //origine of the axis in px (relative to canvas)
        origin : {
            left : canvasWidth / 2,
            top : canvasHeight / 2
        }
    };

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

    localRequire(['graphNumberLineInteraction/runtime/libs/axis'], function(axis){
        
        console.log(axis);
        
        axis.drawAxis(canvas, {
            unitSubDivision : 2,
            arrows : true
        });
    });

});