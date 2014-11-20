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

        return plotCurvedEquation(canvas, equation, config, function(equation, x){

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

        return plotCurvedEquation(canvas, equation, config, function(equation, x){

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

        return plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1];

            if(b * x > 0){
                return a * Math.log(b * x);
            }else{
                return false;//undefined funciton value for this value of x
            }

        });
    }

    function getCosineEquation(point1, point2){

        if(isPoint(point1) &&
            isPoint(point2) &&
            hasDifferentAbscisse(point1, point2)){

            var d = point2.y;
            var a = point1.y - point2.y;
            var b = Math.PI / (2 * (point2.x - point1.x));
            var c = -b * point1.x;

            return [a, b, c, d];
        }
    }

    function plotCosineEquation(canvas, equation, config){

        return plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1],
                c = equation[2],
                d = equation[3];

            return a * Math.cos(b * x + c) + d;

        });
    }

    function getTangentEquation(point1, point2){

        if(isPoint(point1) &&
            isPoint(point2) &&
            hasDifferentAbscisse(point1, point2)){

            var d = point1.y;
            var b = Math.PI / (4 * (point2.x - point1.x));
            var c = -b * point1.x;
            var a = (point2.y - d) / Math.tan(b * point2.x + c);

            return [a, b, c, d];
        }

    }

    function plotTangentEquation(canvas, equation, config){

        return plotCurvedEquation(canvas, equation, config, function(equation, x){

            var a = equation[0],
                b = equation[1],
                c = equation[2],
                d = equation[3];

            return a * Math.tan(b * x + c) + d;

        });
    }

    function getLinearEquation(point1, point2){

        if(isPoint(point1) &&
            isPoint(point2) &&
            hasDifferentAbscisse(point1, point2)){

            var a = (point2.y - point1.y) / (point2.x - point1.x);
            var b = point1.y - a * point1.x;
            return [a, b];
        }

    }

    function plotLinearEquation(canvas, equation, config){
        
        function calc(equation, x){
            
            var a = equation[0],
                b = equation[1];

            return a * x + b;
        }
        
        var startPosition = {
            left : _round(config.start * config.unitSize.x + config.origin.x, 3),
            top : _round(-calc(equation, config.start) * config.unitSize.y + config.origin.y, 3)
        };
        var endPosition = {
            left : _round(config.end * config.unitSize.x + config.origin.x, 3),
            top : _round(-calc(equation, config.end) * config.unitSize.y + config.origin.y, 3)
        };

        var path = 'M' + startPosition.left+' '+startPosition.top + 'L'+ endPosition.left+' '+endPosition.top;
        return canvas.path(path);
    }

    function plotCurvedEquation(canvas, equation, config, calc){

        var x = config.start;
        var y;
        var margin = 100;
        var currentPosition;
        var newPosition;
        var path = '';
        var pathMove = true;
        var prefix = '';

        function jump(){
            x += config.precision;
            pathMove = true;
        }

        function appendPath(newPosition){
            prefix = 'L';
            if(pathMove){
                pathMove = false;//after move, we draw a line
                if(currentPosition){
                    //need to draw slightly beyond the canvas to prevent from the "cut" effect
                    path += 'M' + currentPosition.left + ' ' + currentPosition.top;

                }else{
                    //the very first point
                    prefix = 'M';
                }
            }
            path += prefix + newPosition.left + ' ' + newPosition.top;
        }

        while(x < config.end){

            y = calc(equation, x);
            if(y === false){
                //undefined function value for this value of x
                jump();
                continue;
            }

            //new position (pixels)
            newPosition = {
                left : _round(x * config.unitSize.x + config.origin.x, 3),
                top : _round(-y * config.unitSize.y + config.origin.y, 3)
            };

            if(newPosition.top > canvas.height + margin || newPosition.top < -margin){
                //need to draw slightly beyond the canvas to prevent from the "cut" effect
                appendPath(newPosition);
                currentPosition = false;

                //stop plotting ouside of the canvas
                jump();
                continue;
            }

            //translate new point into path segment
            appendPath(newPosition);
            currentPosition = newPosition;

            //update x for the next step:
            x += config.precision;
        }

        //return the raphael "path" object
        return canvas.path(path);
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
                    start : -10,
                    end : 10,
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

            plotQuadraticEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#8C6700'});

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

            plotExponentialEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#D14982'});


            var pMax = {
                x : -.5,
                y : 8
            }, pZero = {
                x : -3.5,
                y : 3
            };
            equation = getCosineEquation(pMax, pZero);
            console.log(equation);

            plotCosineEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#28C74D'});


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
            plotLogarithmicEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#E8DA3A'});

            var pZero = {
                x : 4,
                y : 0
            }, pFlex = {
                x : 5.5708,
                y : 2
            };
            equation = getTangentEquation(pZero, pFlex);
            console.log(equation);

            curveConfig.precision = .01;
            plotTangentEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#1C1FD9'});


            plotTangentEquation(canvas, getTangentEquation({x : 0, y : 0}, {x : .8, y : -1}), curveConfig).attr({'stroke-width' : 3, stroke : '#FC8B0A'});
            
            
            equation = getLinearEquation({x : 4, y : 0}, {x : 0, y : 4});
            plotLinearEquation(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#36EB45'});
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