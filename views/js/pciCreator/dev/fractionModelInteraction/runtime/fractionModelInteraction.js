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
//        var containerWidth = $container.innerWidth();
//        var height = canvasSize;
//        var factor = 1;
//        canvas.changeSize(containerWidth, height * factor, false, false);
//        canvas.scaleAll(factor);

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
                denominator,
                selectedPartitions;

            /**
             * Set the new fraction model
             * 
             * @param {Integer} num
             * @param {Integer} den
             * @returns {undefined}
             */
            this.setFractionModel = function setFractionModel(num, den){
                numerator = parseInt(num);
                denominator = parseInt(den);
            };

            /**
             * Get the current fraction model
             * 
             * @returns {Object}
             */
            this.getFractionModel = function getFractionModel(){
                return {
                    numerator : numerator,
                    denominator : denominator
                };
            };

            /**
             * Set state for the interaction.
             * The fraction model state is the interaction state
             * If the stateData is considered empty : empty string or array,
             * it generates a valid one from the value of the denominator
             *  
             * @param {String|Array} stateData
             * @returns {undefined}
             */
            this.setState = function setState(stateData){
                if(_.isString(stateData)){
                    if(stateData.trim() === '' || stateData.trim() === '[]'){
                        //generate array
                        selectedPartitions = _.range(denominator).map(function(i){
                            return (i < numerator);
                        });
                    }else{
                        selectedPartitions = JSON.parse(stateData);
                        denominator = selectedPartitions.length;//@todo fix this redundant information
                    }
                }else if(_.isArray(stateData)){
                    selectedPartitions = stateData;
                    denominator = selectedPartitions.length;//@todo fix this redundant information
                }else{
                    throw 'invalid format for selectedPartitions';
                }
            };

            /**
             * 
             * Return the state of the interaction
             * The fraction model state is the interaction state
             * @returns {Array}
             */
            this.getState = function(){
                return _.clone(selectedPartitions);
            };

            //set fraction model
            this.setFractionModel(this.config.selectedPartitionsInit, this.config.partitionInit);

            // Create the canvas
            var canvas = createCanvas($container, config);

            // Init the pieChart
            this.setState(config.selectedPartitions);
            canvas.pieChart(this.getState(), this.config, $container);

            // Catch click on more or less
            $container.on('click', 'button.more', function(){

                if(denominator < config.partitionMax){
                    denominator += 1;
                    var newState = _this.getState();
                    newState.push(false);
                    _this.setState(newState);
                    $container.trigger('changeResponse.fraction');
                }

            }).on('click', 'button.fewer', function(){

                if(denominator > config.partitionMin){
                    denominator -= 1;
                    var newState = _this.getState();
                    newState.pop();
                    _this.setState(newState);
                    $container.trigger('changeResponse.fraction');
                }

            }).on('click', 'button.reset', function(){

                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                _this.setState(_this.config.selectedPartitions);
                $container.trigger('reset.fraction');

            }).on('changeResponse.fraction reset.fraction', function(event){

                // Redraw the pieChart
                canvas.clear();
                canvas.pieChart(_this.getState(), _this.config, $container);

                //communicate the response change to the interaction
                _this.trigger('responsechange', [_this.getResponse()]);

            }).on('select_slice.pieChart unselect_slice.pieChart', function(e, selectedPartitions, totalSelected){

                //update numerator
                numerator = totalSelected;

                //set selected partitions
                _this.setState(selectedPartitions);

                //communicate the state change to the interaction
                _this.trigger('selectedpartition', [selectedPartitions]);
            });

            //listening to dynamic configuration change
            this.on('configchange', function(config){

                _this.config = config;
                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                _this.setState(_this.config.selectedPartitions);

                canvas.clear();
                canvas = createCanvas($container, _this.config);
                canvas.pieChart(_this.getState(), _this.config, $container);
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
            this.setState(this.config.selectedPartitions);
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
            //@todo restore state using this.setState(state);
        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return this.getState();
        }
    };

    qtiCustomInteractionContext.register(fractionModelInteraction);
});
