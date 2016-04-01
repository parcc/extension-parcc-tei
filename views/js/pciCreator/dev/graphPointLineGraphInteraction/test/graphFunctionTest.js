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

    var localRequire = PortableElement.getLocalRequire('graphPointLineGraphInteraction', 'parccTei/pciCreator/dev/graphPointLineGraphInteraction/', {}, {
        runtimeLocation : 'parccTei/pciCreator/dev/graphPointLineGraphInteraction/',
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

    localRequire(['PARCC/graphFunction'], function(graphFunction){

        test('quadratic', function(){

            //a quadratic equation e.g. 2x² + 3x + 1
            var equation = [2, 3, 1];
            var path = graphFunction.quadratic.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#8C6700'});
            equal(path[0].raphael, true, 'path constructed');

            var vertex = {
                x : -.75,
                y : -.125
            },
            point2 = {
                x : 1,
                y : 6
            };
            var calculatedEquation = graphFunction.quadratic.get(vertex, point2);
            equal(calculatedEquation.length, 3, 'equation length ok');
            deepEqual(calculatedEquation, equation, 'equation ok');
        });

        test('exponential', function(){

            var p1 = {
                x : 0,
                y : 1
            }, p2 = {
                x : 2,
                y : 2
            };
            var equation = graphFunction.exponential.get(p1, p2);

            equal(equation.length, 2, 'equation length ok');
            equal(equation[0], 1, 'equation ok');
            equal(_round3(equation[1]), 0.347, 'equation ok');

            var path = graphFunction.exponential.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#D14982'});
            equal(path[0].raphael, true, 'path constructed');
        });

        test('logarithmic', function(){

            var p1 = {
                x : 0.683,
                y : 3.982
            }, p2 = {
                x : 5,
                y : 0
            };
            var equation = graphFunction.logarithmic.get(p1, p2);

            equal(equation.length, 2, 'equation length ok');
            equal(_round3(equation[0]), -2, 'equation ok');
            equal(equation[1], .2, 'equation ok');

            var curveConf = _.clone(curveConfig);
            curveConf.precision = .01;
            var path = graphFunction.logarithmic.plot(canvas, equation, curveConf).attr({'stroke-width' : 3, stroke : '#E8DA3A'});
            equal(path[0].raphael, true, 'path constructed');
        });

        test('cosine', function(){

            var pMax = {
                x : -.5,
                y : 8
            }, pZero = {
                x : -3.5,
                y : 3
            };

            var equation = graphFunction.cosine.get(pMax, pZero);
            equal(equation.length, 4, 'equation length ok');
            equal(equation[0], 5, 'equation ok');
            equal(_round3(equation[1]), -.524, 'equation ok');
            equal(_round3(equation[2]), -.262, 'equation ok');
            equal(equation[3], 3, 'equation ok');

            var path = graphFunction.cosine.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#28C74D'});
            equal(path[0].raphael, true, 'path constructed');
        });

        test('tangent', function(){

            var pZero = {
                x : 4,
                y : 0
            }, pFlex = {
                x : 5.5708,
                y : 2
            };

            var equation = graphFunction.tangent.get(pZero, pFlex);
            equal(equation.length, 4, 'equation length ok');
            equal(_round3(equation[0]), 2, 'equation ok');
            equal(_round3(equation[1]), 0.5, 'equation ok');
            equal(_round3(equation[2]), -2, 'equation ok');
            equal(_round3(equation[3]), 0, 'equation ok');

            var curveConf = _.clone(curveConfig);
            curveConf.precision = .01;

            var path = graphFunction.tangent.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#1C1FD9'});
            equal(path[0].raphael, true, 'path constructed');

            path = graphFunction.tangent.plot(canvas, graphFunction.tangent.get({x : 0, y : 0}, {x : .8, y : -1}), curveConfig).attr({'stroke-width' : 3, stroke : '#FC8B0A'});
            equal(path[0].raphael, true, 'path constructed');

        });

        test('linear', function(){

            var equation = graphFunction.linear.get({x : 4, y : 0}, {x : 0, y : 4});
            equal(equation.length, 2, 'equation length ok');
            deepEqual(equation, [-1, 4], 'equation ok');

            var path = graphFunction.linear.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#36EB45'});
            equal(path[0].raphael, true, 'path constructed');
        });

        test('absolute', function(){

            var equation = graphFunction.absolute.get({x : -2, y : 6}, {x : 1, y : 0});
            equal(equation.length, 3, 'equation length ok');
            deepEqual(equation, [-2, 2, 6], 'equation ok');

            var path = graphFunction.absolute.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#FC2D8B'});
            equal(path[0].raphael, true, 'path constructed');
        });
    });

});
