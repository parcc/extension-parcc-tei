define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/scale.raphael',
    'fractionModelInteraction/runtime/libs/pieChart'
    ], function($, qtiCustomInteractionContext,scaleRaphael){

    'use strict';

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

            this.id = id;
            this.dom = dom;
            this.config = config || {};
            // Make sure everything has the correct type
            this.numerator = parseInt(this.config.selectedPartitionsInit);
            this.denominator = parseInt(this.config.partitionInit);
            this.partitionMax = parseInt(this.partitionMax);
            this.partitionMin = parseInt(this.partitionMin);
            config.radius = parseInt(config.radius);
            /**
             * Return an array well formated to initialise the pieChart with equal
             * sections / slices
             * @return {array} the array to use as values for pieChart()
             */
            this.values = function(){
                var tmp = [];
                for (var i = this.denominator - 1; i >= 0; i--) {
                    tmp.push(1);
                }
                return tmp;
            };

            var $container = $(dom);

            // Create the canvas
            var canvas = scaleRaphael($('.shape-container',$container)[0],250,250);
            canvas.scaleAll();
            // Init the pieChart
            var chart = canvas.pieChart(150, 150, this.values(), this.config);
            // Catch click on more or less
            $container.on('click','button.more',this,function(event){
                if (event.data.denominator < event.data.config.partitionMax){
                    event.data.denominator += 1;
                    $(event.data.dom).trigger('changeResponse.fraction');
                }
            }).on('click','button.fewer',this,function(event){
                if(event.data.denominator > event.data.config.partitionMin){
                    event.data.denominator -= 1;
                    $(event.data.dom).trigger('changeResponse.fraction');
                }
            }).on('click','button.reset',this,function(event){
                event.data.numerator = event.data.config.selectedPartitionsInit;
                event.data.denominator = event.data.config.partitionInit;
                $(event.data.dom).trigger('reset.fraction');
            }).on('changeResponse.fraction reset.fraction',this,function(event){
                // Redraw the pieChart
                chart =  canvas.pieChart(150, 150, event.data.values(), event.data.config);
                if(typeof this._onResponseChange === 'function'){
                    this._onResponseChange(this.getResponse());
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
            if(response && response.directedPair){
                this.numerator = response.pair[0];
                this.denominator = response.pair[1];
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
            return {base : {directedPair : [this.numerator, this.denominator]}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            this.numerator = this.config.selectedPartitionsInit;
            this.demoninator = this.config.partitionInit;
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
        },
        _onResponseChange : function(callback) {
            this._callback = callback;
        },
        
        _forgetResponseChange : function() {
            this._callback = null;
        }
    };

    qtiCustomInteractionContext.register(fractionModelInteraction);
});
