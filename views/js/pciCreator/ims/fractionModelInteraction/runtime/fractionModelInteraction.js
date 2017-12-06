/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014-2017 Parcc, Inc.
 */


define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/scale.raphael',
    'fractionModelInteraction/runtime/libs/pieChart',
    'css!fractionModelInteraction/runtime/css/fractionModelInteraction'
], function($, qtiCustomInteractionContext, event, _, scaleRaphael){

    'use strict';

    var _defaults = {
        radius : 100,
        padding : 10,
        outlineThickness : 1
    };

    var _typeIdentifier = 'graphLineAndPointInteraction';

    function createCanvas($container, config){

        config = _.defaults(config, _defaults);

        var canvasSize = 2 * (parseInt(config.radius) + parseInt(config.padding) + parseInt(config.outlineThickness));
        var canvas = scaleRaphael($('.shape-container', $container)[0], canvasSize, canvasSize);

        return canvas;
    }

    var fractionModelInteraction = {

        /*********************************
         *
         * IMS specific PCI API property and methods
         *
         *********************************/

        typeIdentifier : _typeIdentifier,

        /**
         * @param {DOMELement} dom - the dom element the PCI can use
         * @param {Object} config - the sandard configuration object
         * @param {Object} [state] - the json serialized state object, returned by previous call to getStatus(), use to initialize an
         */
        getInstance : function getInstance(dom, config, state){
            var response = config.boundTo;
            //simply mapped to existing TAO PCI API
            this.initialize(Object.getOwnPropertyNames(response).pop(), dom, config.properties);
            this.setSerializedState(state);

            //tell the rendering engine that I am ready
            if (typeof config.onready === 'function') {
                config.onready(this, this.getSelectedPartitions());
            }
        },

        /**
         * Get the current state fo the PCI
         * @returns {Object}
         */
        getState : function getState(){
            return this.getSerializedState();
        },

        /**
         * Called by delivery engine when PCI is fully completed
         */
        oncompleted : function oncompleted(){
            this.destroy();
        },

        /*********************************
         *
         * TAO and IMS shared PCI API methods
         *
         *********************************/

        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){
            var selection = _.values(this.getSelectedPartitions());
            var numerator = _.filter(selection).length;
            var denominator = selection.length;
            return {
                base : {
                    string : numerator + '/' + denominator
                }
            };
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


        /*********************************
         *
         * TAO specific PCI API methods
         *
         *********************************/


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
                var i;
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
                    if (stateData.length) {
                        selectedPartitions = stateData;
                        denominator = selectedPartitions.length;//@todo fix this redundant information
                    } else {
                        selectedPartitions = [];
                        for (i = 0; i < denominator; i++) {
                            selectedPartitions.push(false);
                        }
                    }
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
            this.getSelectedPartitions = function(){
                return _.clone(selectedPartitions);
            };

            // debugger;
            //set fraction model
            this.setFractionModel(this.config.selectedPartitionsInit, this.config.partitionInit);

            // Create the canvas
            var canvas = createCanvas($container, config);

            // Init the pieChart
            this.setState(config.selectedPartitions);
            canvas.pieChart(this.getSelectedPartitions(), this.config, $container);

            // Catch click on more or less
            $container.on('click.fraction', 'button.more', function(){

                if(denominator < _this.config.partitionMax){
                    denominator += 1;
                    var newState = _this.getSelectedPartitions();
                    newState.push(false);
                    _this.setState(newState);
                    $container.trigger('statechange.fraction');
                }

            }).on('click.fraction', 'button.fewer', function(){

                if(denominator > _this.config.partitionMin){
                    denominator -= 1;
                    var newState = _this.getSelectedPartitions();
                    newState.pop();
                    _this.setState(newState);
                    $container.trigger('statechange.fraction');
                }

            }).on('click.fraction', 'button.reset', function(){

                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                _this.setState(_this.config.selectedPartitions);
                $container.trigger('reset.fraction');

            }).on('statechange.fraction reset.fraction', function(event){

                // Redraw the pieChart
                canvas.clear();
                canvas.pieChart(_this.getSelectedPartitions(), _this.config, $container);

                //communicate the response change to the interaction
                _this.trigger('changepartition', [_this.getSelectedPartitions()]);
                _this.trigger('responseChange', [_this.getResponse()]);

            }).on('select_slice.pieChart unselect_slice.pieChart', function(e, selectedPartitions, totalSelected){

                //update numerator
                numerator = totalSelected;

                //set selected partitions
                _this.setState(selectedPartitions);

                //communicate the state change to the interaction
                _this.trigger('selectedpartition', [selectedPartitions]);
                _this.trigger('responseChange', [_this.getResponse()]);
            });

            //listening to dynamic configuration change
            this.on('configchange', function(config){
                _this.config = config;
                _this.setFractionModel(_this.config.selectedPartitionsInit, _this.config.partitionInit);
                _this.setState(_this.config.selectedPartitions);

                canvas.clear();
                canvas = createCanvas($container, _this.config);
                canvas.pieChart(_this.getSelectedPartitions(), _this.config, $container);
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
            var i, parts, state = [], numerator, denominator, value = '0';

            if(response && response.base && response.base.string){
                value = response.base.string;

                parts = value.split('/');
                numerator = parseInt(parts[0]);
                denominator = parseInt(parts[1] || 0);
                for(i = 0; i< denominator; i++){
                    state.push(i<numerator);
                }

                this.setState(state);
                $(this.dom).trigger('statechange.fraction');
            }
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
            $(this.dom).trigger('statechange.fraction');
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){
            if(state && _.isArray(state.selection)){
                this.setState(state.selection);
                $(this.dom).trigger('statechange.fraction');
            }
        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return {
                selection : _.values(this.getSelectedPartitions())
            };
        }
    };

    qtiCustomInteractionContext.register(fractionModelInteraction);
});
