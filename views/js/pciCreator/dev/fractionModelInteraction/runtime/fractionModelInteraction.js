define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'fractionModelInteraction/runtime/libs/pieChart'
    ], function($, qtiCustomInteractionContext,Raphael){

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
            this.numerator = this.config.selectedPartitionsInit;
            this.denominator = this.config.partitionInit;
            this.values = function(){
                var tmp = [];
                for (var i = this.denominator - 1; i >= 0; i--) {
                    tmp.push(1);
                }
                return tmp;
            };

            var $container = $(dom);

            // Create the canvas
            var canvas = new Raphael('holder',0,0,250,250);
            // Init the pieChart
            var chart = canvas.pieChart(150, 150, 100, this.values, this.config);
            // Catch click on more or less
            $container.on('click','button.more',function(){
                if (this.denominator < this.config.partitionMax){
                    this.denominator += 1;
                    chart =  canvas.pieChart(150, 150, 100, this.values, this.config);
                }
            }).on('click','button.few',function(){
                if(this.denominator > this.config.partitionMin){
                    this.denominator -= 1;
                    chart =  canvas.pieChart(150, 150, 100, this.values, this.config);
                }
            }).on('click','button.reset',function(){
                chart =  canvas.pieChart(150, 150, 100, this.values, this.config);
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
                $(this.dom).trigger('changeresponse.fraction');
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
        }
    };

    qtiCustomInteractionContext.register(fractionModelInteraction);
});
