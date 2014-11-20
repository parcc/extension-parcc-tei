define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/scale.raphael',
    'graphFunctionInteraction/runtime/libs/gridFactory',
    'graphFunctionInteraction/runtime/libs/pointFactory',
    'graphFunctionInteraction/runtime/libs/graphFunction',
    'OAT/lodash'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    scaleRaphael,
    gridFactory,
    pointFactory,
    graphFunction,
    _
    ){

    'use strict';
    
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

            graphFunction.quadratic.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#8C6700'});

            var vertex = {
                x : -.75,
                y : -.125
            },
            point2 = {
                x : 1,
                y : 6
            };
            equation = graphFunction.quadratic.get(vertex, point2);


            var p1 = {
                x : 0,
                y : 1
            }, p2 = {
                x : 2,
                y : 2
            };
            equation = graphFunction.exponential.get(p1, p2);
            graphFunction.exponential.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#D14982'});


            var pMax = {
                x : -.5,
                y : 8
            }, pZero = {
                x : -3.5,
                y : 3
            };
            equation = graphFunction.cosine.get(pMax, pZero);
            graphFunction.cosine.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#28C74D'});


            var p1 = {
                x : 0.683,
                y : 3.982
            }, p2 = {
                x : 5,
                y : 0
            };
            equation = graphFunction.logarithmic.get(p1, p2);
            curveConfig.precision = .01;
            graphFunction.logarithmic.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#E8DA3A'});


            var pZero = {
                x : 4,
                y : 0
            }, pFlex = {
                x : 5.5708,
                y : 2
            };
            equation = graphFunction.tangent.get(pZero, pFlex);
            curveConfig.precision = .01;
            graphFunction.tangent.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#1C1FD9'});
            graphFunction.tangent.plot(canvas, graphFunction.tangent.get({x : 0, y : 0}, {x : .8, y : -1}), curveConfig).attr({'stroke-width' : 3, stroke : '#FC8B0A'});


            equation = graphFunction.linear.get({x : 4, y : 0}, {x : 0, y : 4});
            graphFunction.linear.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#36EB45'});


            equation = graphFunction.absolute.get({x : -2, y : 6}, {x : 1, y : 0});
            graphFunction.absolute.plot(canvas, equation, curveConfig).attr({'stroke-width' : 3, stroke : '#FC2D8B'});
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