define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/scale.raphael',
    'graphFunctionInteraction/runtime/libs/gridFactory',
    'graphFunctionInteraction/runtime/libs/pointFactory'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    scaleRaphael,
    gridFactory,
    pointFactory
    ){

    'use strict';

    function _round(number, decimal){
        var m = Math.pow(10, parseInt(decimal));
        return Math.round(number * m) / m;
    }

    function isPoint(point){
        return point.x !== undefined && point.y !== undefined;
    }

    function hasDifferentAbscisse(point1, point2){
        return point1.x !== point2.x;
    }

    function getQuadraticEquationFromPoints(vertex, point){
        if(isPoint(vertex) && isPoint(point) && hasDifferentAbscisse(vertex, point)){
            var a = (point.y - vertex.y) / Math.pow(point.x - vertex.x, 2);
            var b = -2 * a * vertex.x;
            var c = vertex.y + a * Math.pow(vertex.x, 2);
            return [a, b, c];
        }
    }

    function plotQuadraticEquation(canvas, equation, config){

        plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1],
                c = equation[2];

            return a * Math.pow(x, 2) + b * x + c;
        });
    }

    function getExponentialEquation(point1, point2){

        if(isPoint(point1) &&
            isPoint(point2) &&
            hasDifferentAbscisse(point1, point2) &&
            point1.y > 0 &&
            point2.y > 0){

            var b = Math.log(point2.y / point1.y) / (point2.x - point1.x);
            var a = point1.y / Math.exp(b * point1.x);

            return [a, b];
        }

    }

    function plotExponentialEquation(canvas, equation, config){

        plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1];

            return a * Math.exp(b * x);
        });
    }

    function getLogarithmicEquation(point1, point2){

        if(isPoint(point1) &&
            isPoint(point2) &&
            hasDifferentAbscisse(point1, point2)){

            var b = Math.exp(point2.y / point1.y) / (point2.x - point1.x);

            if(b * point1.x > 0){
                var a = point1.y / Math.log(b * point1.x);
                return [a, b];
            }else{
                throw 'invalid pair of points';
            }
        }
    }

    function plotLogarithmicEquation(canvas, equation, config){

        plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1];

            if(b * x > 0){
                return a * Math.log(b * x);
            }else{
                return false;//undefined funciton value for this value of x
            }

        });
    }

    function plotCurvedEquation(canvas, equation, config, calc){

        var x = config.start;
        var y;
        var path = '';
        var coordinates = [];
        var prefix = '';

        while(x < config.end){

            y = calc(equation, x);
            if(y === false){
                //undefined funciton value for this value of x
                x += config.precision;
                continue;
            }
            
            //translate new point into path segment
            if(coordinates.length){
                prefix = 'L';
            }else{
                prefix = 'M';
            }
            path += prefix + _round(x * config.unitSize.x + config.origin.x, 3) + ' ' + _round(-y * config.unitSize.y + config.origin.y, 3);

            //save coords
            coordinates.push([_round(x, 3), _round(y, 3)]);

            //update x for the next step:
            x += config.precision;
        }

        canvas.path(path);
    }

    var graphFunctionInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphFunctionInteraction';
        },
        /**
         * Render the PCI : 
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            var $container = $(dom);

            this.config.grid = {
                unit : 20,
                spacingX : 2,
                spacingY : 2,
                snapping : true
            };
            ///////////////////
            // Create Canvas //
            ///////////////////
            var canvasHeight = 600,
                canvasWidth = 600;
            var canvas = scaleRaphael($('.shape-container', $container)[0], canvasHeight, canvasWidth);
            //////////////////////////////
            // Instanciate a basic grid //
            //////////////////////////////
            var grid = gridFactory(canvas, this.config.grid);

            //a quadratic equation e.g. 2x² + 3x + 1
            var equation = [2, 3, 1],
                curveConfig = {
                    //starting unit (in true cartesian coordinate system)
                    start : -5,
                    end : 5,
                    precision : 0.1,
                    //unit size in px (relative to canvas)
                    unitSize : {
                        x : 30,
                        y : 30
                    },
                    //origine of the axis in px (relative to canvas)
                    origin : {
                        x : canvasWidth / 2,
                        y : canvasHeight / 2
                    }
                };

            plotQuadraticEquation(canvas, equation, curveConfig);


            var vertex = {
                x : -.75,
                y : -.125
            },
            point2 = {
                x : 1,
                y : 6
            };

            equation = getQuadraticEquationFromPoints(vertex, point2);
            console.log(equation);

            var p1 = {
                x : 0,
                y : 1
            }, p2 = {
                x : 2,
                y : 2
            };
            equation = getExponentialEquation(p1, p2);
            console.log(equation);

            plotExponentialEquation(canvas, equation, curveConfig);
            
            var p1 = {
                x : 0.683,
                y : 3.982
            }, p2 = {
                x : 5,
                y : 0
            };
            equation = getLogarithmicEquation(p1, p2);
            console.log(equation);
            
            curveConfig.precision = .01;
            plotLogarithmicEquation(canvas, equation, curveConfig);
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var value = 0;

            return {base : {integer : value}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         * 
         * @param {Object} interaction
         */
        resetResponse : function(){

        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains 
         * Event listeners are removed and the state and the response are reset
         * 
         * @param {Object} interaction
         */
        destroy : function(){

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         * 
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){

        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         * 
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){

            return {};
        }
    };

    qtiCustomInteractionContext.register(graphFunctionInteraction);
});