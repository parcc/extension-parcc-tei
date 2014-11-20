define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/scale.raphael',
    'graphLineAndPointInteraction/runtime/libs/gridFactory',
    'graphLineAndPointInteraction/runtime/libs/pointFactory'
    ], function(
        $,
        qtiCustomInteractionContext,
        event,
        scaleRaphael,
        gridFactory,
        pointFactory
    ){

    'use strict';

    var graphLineAndPointInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphLineAndPointInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            var $container = $(dom),
            pointA,
            pointB;

            this.config.grid  = {
                x: {
                    start : -10,
                    end : 10,
                    unit : 20
                },
                y: {
                    start : -10,
                    end : 10,
                    unit : 20
                },
            };
            ///////////////////
            // Create Canvas //
            ///////////////////
            var canvas = scaleRaphael($('.shape-container',$container)[0],500,400);

            //////////////////////////////
            // Instanciate a basic grid //
            //////////////////////////////
            var grid = gridFactory(canvas,this.config.grid);
            ///////////////////////
            // Make it clickable //
            ///////////////////////
            grid.clickable();
            ///////////////////////////
            // Catch the Click Event //
            ///////////////////////////
            grid.children.click(function(event){
                ////////////////////////////////////
                // Get the coordinate for a click //
                ////////////////////////////////////
                var bnds = event.target.getBoundingClientRect(),
                wfactor = canvas.w / canvas.width,
                fx = Math.round((event.clientX - bnds.left)/bnds.width * grid.getWidth() * wfactor),
                fy = Math.round((event.clientY - bnds.top)/bnds.height * grid.getHeight() * wfactor);
                ////////////////////////////////////////////////////////////////
                // Create the first point or the second or replace the second //
                // According the rules defined by the client                  //
                ////////////////////////////////////////////////////////////////
                if (typeof pointA === 'undefined') {
                    pointA = pointFactory(canvas,grid,{
                        x : fx,
                        y : fy
                    });
                    pointA.render();
                    pointA.drag();
                    pointA.click();
                }else if (typeof pointB === 'undefined'){
                    pointB = pointFactory(canvas, grid, {
                        x: fx,
                        y: fy
                    });
                    pointB.render();
                    pointA.unDrag();
                    pointB.drag();
                    pointB.click();
                }else{
                    pointB.setCoord(fx, fy);
                    pointB.render();
                    pointB.drag();
                    pointB.click();
                }

            });


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

    qtiCustomInteractionContext.register(graphLineAndPointInteraction);
});
