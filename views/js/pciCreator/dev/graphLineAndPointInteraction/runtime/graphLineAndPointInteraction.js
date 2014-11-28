define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'OAT/scale.raphael',
    'PARCC/gridFactory',
    'PARCC/pointFactory',
    'PARCC/plotFactory',
    './wrappers/points.js',
    './wrappers/lines.js'
    ], function(
        $,
        qtiCustomInteractionContext,
        event,
        _,
        scaleRaphael,
        gridFactory,
        pointFactory,
        PlotFactory,
        pointWrapper,
        lineWrapper
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

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            var $container = $(dom),
                self = this;



            function buildGridConfig(rawConfig){

                return {
                    x : {
                        start : rawConfig.xMin === undefined ? -10 : parseInt(rawConfig.xMin),
                        end : rawConfig.xMax === undefined ? 10 : parseInt(rawConfig.xMax),
                        unit : 20
                    },
                    y : {
                        //the y-axis is reversed
                        start : rawConfig.yMax === undefined ? 10 : -1 * parseInt(rawConfig.yMax),
                        end : rawConfig.yMin === undefined ? -10 : -1 * parseInt(rawConfig.yMin),
                        unit : 20
                    },
                    element : rawConfig.elements
                };
            }

            this.on('configchange',function(options){
                self.config = _.merge(self.config,buildGridConfig(options));
            });

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

            // var plotFactory = new PlotFactory(grid);
            //
            // //////////////////////////////////////
            // // How many lines set did we have ? //
            // //////////////////////////////////////
            // var sets = [];
            // $('[data-set-color]').each(function(){
            //     sets.push({
            //         color : $(this).data('set-color'),
            //         points : [],
            //         active : false
            //     });
            // }).click(function() {
            //     // Get the currently active set and inactivate it
            //     var previouslyActiveSet = _.find(sets,{active : true});
            //     previouslyActiveSet.active = false;
            //     // Iterate on every other items and remove the flow on points
            //     _.forEach(previouslyActiveSet.points,function(value){
            //         value.hideGlow();
            //     });
            //     // Activate the right set
            //     var newActiveSet = _.find(sets,{color : $(this).data('set-color')});
            //     newActiveSet.active = true;
            //     _.forEach(newActiveSet.points, function(value){
            //         value.showGlow();
            //     });
            // });
            // sets[0].active = true;
            // ///////////////////////////
            // // Catch the Click Event //
            // ///////////////////////////
            grid.children.click(function(event){

                ////////////////////////////////////
                // Get the coordinate for a click //
                ////////////////////////////////////
                var bnds = event.target.getBoundingClientRect(),
                wfactor = canvas.w / canvas.width,
                fx = Math.round((event.clientX - bnds.left)/bnds.width * grid.getWidth() * wfactor),
                fy = Math.round((event.clientY - bnds.top)/bnds.height * grid.getHeight() * wfactor);


                $(canvas.canvas).trigger('click_grid',{x: fx, y: fy});

                var element = lineWrapper;
                element.initialize(canvas,grid,{color: '#0f904a'});

                // /////////////////////////
                // // Get the current set //
                // /////////////////////////
                // var activeSet = _.find(sets,{active : true});

            });


            this.on('gridchange', function(config){
                //the configuration of the gird, point or line have changed:
                self.config = config;
                initGrid($container, buildGridConfig(config));
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
