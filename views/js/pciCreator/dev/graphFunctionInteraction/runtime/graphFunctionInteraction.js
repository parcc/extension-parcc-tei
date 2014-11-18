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

    function plotQuadraticEquation(canvas, equation, config){

        function calc(equation, x){

            var a = equation[0],
                b = equation[1],
                c = equation[2];

            return a * Math.pow(x, 2) + b * x + c;
        }

        var path = 'M',
            startingPoint = {
                x : parseInt(config.startingPoint.x),
                y : parseInt(config.startingPoint.y)
            };

        path += startingPoint.x + ' ' + startingPoint.y;

        var step = config.precision * config.unitSize.x;

        var x = config.start;
        var y;
        var startingCoords = {
            x : parseInt(config.start * config.unitSize.x),
            y : parseInt(calc(equation, config.start) * config.unitSize.y)
        };
        var coordinates = [];
        while(x < config.end){

            y = calc(equation, x);
            coordinates.push([_round(x, 3), _round(y, 3)]);

            //translate into path:
            path += 'L' + _round(x * config.unitSize.x - startingCoords.x, 3) + ' ' + _round(y * config.unitSize.y + startingCoords.y, 3);

            //update x for the next step:
            x += config.precision;
        }

        console.log(coordinates);
        console.log(path);
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
            var canvas = scaleRaphael($('.shape-container', $container)[0], 500, 400);
            //////////////////////////////
            // Instanciate a basic grid //
            //////////////////////////////
            var grid = gridFactory(canvas, this.config.grid);

            //a quadratic equation e.g. 2x² + 3x + 1
            var equation = [2, 3, 1],
                curveConfig = {
                    //starting unit
                    start : -4,
                    end : 2,
                    precision : 0.1,
                    //unit size in px
                    unitSize : {
                        x : 10,
                        y : 10
                    },
                    //starting point
                    startingPoint : {
                        x : 0,
                        y : 200
                    }
                };


            plotQuadraticEquation(canvas, equation, curveConfig);
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