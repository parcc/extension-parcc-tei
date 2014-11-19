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

        var x = config.start;
        var y;
        var path = '';
        var coordinates = [];
        var prefix = '';

        while(x < config.end){

            y = calc(equation, x);

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
                    start : -4,
                    end : 3,
                    precision : 0.1,
                    //unit size in px (relative to canvas)
                    unitSize : {
                        x : 30,
                        y : 30
                    },
                    //origine of the axis in px (relative to canvas)
                    origin : {
                        x : canvasWidth/2,
                        y : canvasHeight/2
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