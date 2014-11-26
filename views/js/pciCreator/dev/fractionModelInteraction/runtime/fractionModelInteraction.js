define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    'OAT/lodash',
    'OAT/scale.raphael',
    'fractionModelInteraction/runtime/libs/pieChart'
], function($, qtiCustomInteractionContext, event, _, scaleRaphael){

    'use strict';

    var _defaults = {
        radius : 100,
        padding : 10,
        outlineThickness : 1
    };

    function createCanvas($container, config){

        config = _.defaults(config, _defaults);

        var canvasSize = 2 * (parseInt(config.radius) + parseInt(config.padding) + parseInt(config.outlineThickness));
        var canvas = scaleRaphael($('.shape-container', $container)[0], canvasSize, canvasSize);

        //make it resizeable:
//            var containerWidth  = $container.innerWidth();
//            var height = canvasSize;
//            var factor =  1;
//            
//            canvas.changeSize(containerWidth, height * factor, false, false);
//            canvas.scaleAll( factor );

        return canvas;
    }

    var fractionModelInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'fractionModelInteraction';
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
            
            var _this = this,
                $container = $(dom),
                numerator,
                denominator;

            /**
             * Return an array well formated to initialise the pieChart with equal
             * sections / slices
             * @return {array} the array to use as values for pieChart()
             */
            function getValues(){
                var tmp = [];
                for(var i = denominator - 1; i >= 0; i--){
                    tmp.push(1);
                }
                return tmp;
            }

            this.setFractionModel = function setFractionModel(num, den){
                numerator = parseInt(num);
                denominator = parseInt(den);
            };

            this.getFractionModel = function getFractionModel(){
                return {
                    numerator : numerator,
                    denominator : denominator
                };
            };

            //set fraction model
            this.setFractionModel(this.config.selectedPartitionsInit, this.config.partitionInit);

            // Create the canvas
            var canvas = createCanvas($container, config);

            // Init the pieChart
            canvas.pieChart(getValues(), this.config, $container);

            // Catch click on more or less
            $container.on('click', 'button.more', function(){
                
                if(denominator < config.partitionMax){
                    denominator += 1;
                    $container.trigger('changeResponse.fraction');
                }
                
            }).on('click', 'button.fewer', function(){
                
                if(denominator > config.partitionMin){
                    denominator -= 1;
                    $container.trigger('changeResponse.fraction');
                }
                
            }).on('click', 'button.reset', function(){
                
                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                $container.trigger('reset.fraction');
                
            }).on('changeResponse.fraction reset.fraction', function(event){
                
                console.log('change', arguments);
                
                // Redraw the pieChart
                canvas.clear();
                canvas.pieChart(getValues(), _this.config, $container);
                //communicate the response change to the interaction
                _this.trigger('responsechange', [_this.getResponse()]);
                
            }).on('select_slice.pieChart unselect_slice.pieChart', function(e, selectedPartitions){
                console.log('selected', selectedPartitions );
                //communicate the state change to the interaction
                _this.trigger('selectedparition', [selectedPartitions]);
            });

            //listening to dynamic configuration change
            this.on('configchange', function(config){
                _this.config = config;
                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                canvas.clear();
                canvas = createCanvas($container, _this.config);
                canvas.pieChart(getValues(), _this.config, $container);
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
            if(response && response.directedPair){
                this.setFractionModel(response.pair[0], response.pair[1]);
                $(this.dom).trigger('changeResponse.fraction');
            }
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){
            //@todo to be correct to the correct baseType once the response processing story has been clarified
            var fractionModel = this.getFractionModel();
            return {base : {directedPair : [fractionModel.numerator.toString(), fractionModel.denominator.toString()]}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            this.setFractionModel(this.config.selectedPartitionsInit, this.config.partitionInit);
            $(this.dom).trigger('changeResponse.fraction');
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

    qtiCustomInteractionContext.register(fractionModelInteraction);
});
