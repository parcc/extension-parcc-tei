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
    'taoQtiItem/portableLib/raphael',
    'parccTei/portableLib/gridFactory',
    'parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/wrappers/setOfPoints',
    'parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/wrappers/points',
    'parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/wrappers/lines',
    'parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/wrappers/segments',
    'parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/wrappers/solutionSet',
    'css!parccTei/pciCreator/ims/graphLineAndPointInteraction/runtime/css/graphLineAndPointInteraction'
], function(
    $,
    qtiCustomInteractionContext,
    event,
    _,
    scaleRaphael,
    Raphael,
    gridFactory,
    setPointsWrapper,
    pointsWrapper,
    linesWrapper,
    segmentsWrapper,
    solutionSetWrapper
    ){

    'use strict';

    var _wrappers = {
        setPoints : setPointsWrapper,
        points : pointsWrapper,
        lines : linesWrapper,
        segments : segmentsWrapper,
        solutionSet : solutionSetWrapper
    };

    /**
     * List of events to listen to in order to detect a response change
     * @type Array
     */
    var responseChangeEvents = [
        'drawn.lines',
        'moved.point',
        'removed.point',
        'added.pointSet',
        'moved.pointSet',
        'unselected.solutionSet',
        'selected.solutionSet'
    ];

    var _typeIdentifier = 'graphLineAndPointInteraction';

    var graphLineAndPointInteraction;

    /**
     * Sanitize configuration
     * @param  {Object} rawConfig Raw Config from Authoring
     * @return {Object}           Cleaned config ready to use
     */
    function buildGridConfig(rawConfig){
        return {
            x : {
                start : _.isUndefined(rawConfig.xMin) ? -10 : parseInt(rawConfig.xMin),
                end : _.isUndefined(rawConfig.xMax) ? 10 : parseInt(rawConfig.xMax),
                unit : 20
            },
            y : {
                //the y-axis is reversed
                start : _.isUndefined(rawConfig.yMax) ? 10 : -1 * parseInt(rawConfig.yMax),
                end : _.isUndefined(rawConfig.yMin) ? -10 : -1 * parseInt(rawConfig.yMin),
                unit : 20
            },
            graphs : _.isUndefined(rawConfig.graphs) ? {} : rawConfig.graphs,
            padding : 20
        };
    }
    /**
     * Create the minimum canvas and desplay it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @return {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var padding = 2 * config.padding;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            (config.x.end - config.x.start) * config.x.unit + padding,
            (config.y.end - config.y.start) * config.y.unit + padding
            );
        return paper;
    }

    /**
     * Dirty functiion to return the right wrapper for a given config element
     * @param  {String} type     Name of the element you want
     * @return {Object}         Wrapper corresponding to this element
     */
    function getWrapper(type){
        return _wrappers[type];
    }

    function drawLineStyle(dom, config){
        var w = 57, h = 20;
        var lineStylePaper = new Raphael(dom, w, h);
        var line = lineStylePaper.path('M0 ' + h / 2 + 'L' + w + ' ' + h / 2);
        line.attr({
            stroke : config.lineColor || '#000',
            'stroke-width' : config.lineWeight || 3,
            'stroke-dasharray' : config.lineStyle || '',
            opacity : config.opacity || 1
        });
    }

    /**
     * Validate the record entry format (used in setResponse)
     *
     * @param {object} entry
     * @returns {boolean}
     */
    function isValidRecordEntry(entry){
        return (
            _.isPlainObject(entry) &&
            _.isString(entry.name) &&
            entry.base &&
            entry.base.list &&
            _.isArray(entry.base.list.point));
    }

    /**
     * Format the response element
     *
     * @param {string} name
     * @param {array} points
     * @returns {object}
     */
    function formatResponseElement(name, points){
        if(_.isString(name), _.isArray(points)){
            //map the array of point to the object format {x, y}
            points = _.map(points, function(point){
                return [point.x, point.y];
            });
            return {
                name : name,
                base : {list : {point : points}}
            };
        }else{
            throw new Error('invalid arguments');
        }
    }

    graphLineAndPointInteraction = {

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

            // Parse the "graphs" property, which is given as a serialized JSON
            try {
                config.properties.graphs = JSON.parse(config.properties.graphs);
            } catch(e) { /* parsing failed */ }

            //simply mapped to existing TAO PCI API
            this.initialize(Object.getOwnPropertyNames(response).pop(), dom, config.properties);
            this.setSerializedState(state);

            //tell the rendering engine that I am ready
            if (typeof config.onready === 'function') {
                config.onready(this, this.getState());
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

            var rawResponse = this.getRawResponse();
            var response = {record : []};

            _.each(rawResponse, function(element){
                if(element.type === 'solutionSet'){
                    _.each(element.selections, function(selection){
                        response.record.push(formatResponseElement(element.id, selection));
                    });
                }else{
                    response.record.push(formatResponseElement(element.id, element.points));
                }

            });

            return response;
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
            return _typeIdentifier;
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){
            var grid,
                graph,
                elements,
                $container = $(dom),
                self = this;

            this.id = id;
            this.dom = dom;
            this.config = buildGridConfig(config || {});

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            /**
             * Initialize a new graphic element called grid with all needed
             *
             * @param  {Object} $container jQuery node
             * @param  {Object} gridConfig Config (cleaned)
             */
            function initGrid($container, gridConfig){

                // @todo : Clear Everything
                var paper = createCanvas($container, gridConfig);
                var grid;
                var $canvas = $(paper.canvas);
                elements = {};

                //intialize the grid only if the configuration is correct
                if(_.isObject(gridConfig.x) &&
                    _.isObject(gridConfig.y) &&
                    gridConfig.x.start < gridConfig.x.end &&
                    gridConfig.y.start < gridConfig.y.end
                    ){

                    grid = gridFactory(paper, gridConfig);
                    grid.clickable();
                    grid.children.click(function(event){

                        // Get the coordinate for a click
                        var bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        //transfer the click event to the paper
                        $canvas.trigger('click_grid', {x : fx, y : fy});
                    });

                }

                return grid;
            }

            /**
             * Init the interaction
             *
             * @param {Object} grid - the grid object build from GridFactory
             * @param {Object} $cont - the container
             * @param {Object} options
             * @returns {undefined}
             */
            function initInteraction(grid, $cont, options){

                var $templates = $cont.find('.templates');

                // Remove all existing button
                var $controlArea = $cont.find('.shape-controls');
                $controlArea.empty();

                // Loop over all elements we have
                _.each(options.graphs, function(graphType, typeName){

                    var $template = $templates.find('.template-' + typeName);

                    _.each(graphType.elements, function(elementConfig){

                        var $buttonContainer = $template.children().first().clone();
                        var $button = $buttonContainer.children('.btn');
                        var $arrow = $buttonContainer.children('.triangle');
                        var color = elementConfig.lineColor || elementConfig.pointColor;

                        // Change attributes
                        $buttonContainer.attr('data-uid', elementConfig.uid);
                        $buttonContainer.data('config', elementConfig);
                        $button.text(elementConfig.label);
                        $button.css({backgroundColor : color});
                        $arrow.css({borderColor : 'transparent transparent transparent ' + color});

                        //configure change line style buttons (for lines and segments wrapper)
                        if(elementConfig.lineStyleToggle && elementConfig.lineStyleToggle !== 'false'){

                            $buttonContainer
                                .find('.line-styles')
                                .show()
                                .find('input[name=line-style]')
                                .attr('name', 'line-style-' + elementConfig.uid)
                                .change(function(){

                                    elementConfig.lineStyle = $(this).val();
                                    $buttonContainer.data('element').setLineStyle(elementConfig.lineStyle);
                                    $button.click();

                                }).each(function(){

                                var $input = $(this),
                                    $lineStyle = $input.siblings('.line-style'),
                                    style = $input.val();

                                drawLineStyle($lineStyle[0], {
                                    lineStyle : style,
                                    lineColor : elementConfig.lineColor,
                                    lineWeight : elementConfig.lineWeight
                                });

                                if(elementConfig.lineStyle === style){
                                    $input.prop('checked', true);
                                }
                            });

                        }

                        //insert into dom
                        $controlArea.append($buttonContainer);

                        //init element
                        var wrapper = getWrapper(typeName);

                        //initialize the element only if the grid has been properly initialized
                        if(grid){
                            var element = wrapper.initialize(grid, elementConfig);
                            $buttonContainer.data('element', element);
                            element.$buttonContainer = $buttonContainer;
                            elements[elementConfig.uid] = element;
                        }
                    });
                });


                $controlArea.on('click', '.button-container:not(.deactivated)', function(){

                    activate($(this).data('element'));

                }).on('mouseenter', '.button-container:not(.deactivated)', function(){

                    var element = $(this).data('element');
                    if(element){
                        element.highlightOn();
                    }

                }).on('mouseleave', '.button-container:not(.deactivated)', function(){

                    var element = $(this).data('element');
                    if(element && !element.isActive()){
                        element.highlightOff();
                    }
                });
                $container.on(responseChangeEvents.join(' '), _.debounce(function(){
                    //response change
                    self.trigger('responseChange', [self.getResponse()]);
                }, 100));

                if(grid){
                    //check if solution set should be active or not
                    var $solutionSet = $controlArea.find('.graph-solutionSet');
                    $(grid.getCanvas().canvas).on('drawn.lines removed.lines', function(){
                        var drawnLineExists = false;
                        _.each(_.where(elements, {type : 'line'}), function(line){
                            var drawnLine = line.getLine();
                            if(drawnLine){
                                drawnLineExists = true;
                                return false;
                            }
                        });
                        if(drawnLineExists){
                            $solutionSet.removeClass('deactivated');
                        }else{
                            $solutionSet.addClass('deactivated');
                        }
                    });
                }
            }

            /**
             * Activate a graph element
             *
             * @param {Object} element
             */
            function activate(element){

                if(graph){
                    graph.disactivate();
                }

                //toggle active class appearance
                element.$buttonContainer.addClass('activated');
                element.$buttonContainer.siblings('.button-container').removeClass('activated');

                //activate the element itself to allow interaction
                element.activate(elements);

                graph = element;
            }

            function getElement(uid){
                return elements[uid];
            }

            /**
             * Get the current state of initialized element
             *
             * @returns {Object}
             */
            function getState(){

                var state = {
                    activeGraph : graph ? graph.getId() : '',
                    elements : {}
                };

                _.each(elements, function(element){
                    state.elements[element.getId()] = element.getState();
                });

                return state;
            }

            /**
             * restore state of already initialized elements:
             *
             * @param {Object} state
             * @param {Boolean} ignoreConfig
             */
            function setState(state, ignoreConfig){

                //restore element states
                _.forIn(state.elements, function(state, uid){
                    var element = getElement(uid);
                    if(element){
                        if(ignoreConfig){
                            delete state.config;
                        }
                        element.setState(state);
                    }
                });

                //restore the currently selected element
                if(state.activeGraph){
                    var currentActive = getElement(state.activeGraph);
                    if(currentActive){
                        //restore the active element:
                        activate(currentActive);
                    }
                }
            }

            /**
             * Get the raw response of the interaction
             *
             * @returns {array}
             */
            this.getRawResponse = function getRawResponse(){

                var response = [];
                var states = [];
                _.each(elements, function(element, id){
                    var res = {
                        id : id,
                        type : element.type
                    };

                    if(element.type === 'solutionSet'){
                        res.selections = element.getState().selections;
                    }else{
                        res.points = element.getState().points;
                    }

                    response.push(res);
                    states.push(element.getState());
                });

                return response;
            };

            /**
             * Set the raw response
             *
             * @param {object} response
             */
            this.setRawResponse = function setRawResponse(response){
                _.each(response, function(res){
                    var state = {},
                        element = elements[res.id];
                    if(element){
                        if(res.type === 'solutionSet'){
                            element.createSolutionSet(elements);
                            state.selections = res.selections;
                        }else{
                            state.points = res.points;
                        }
                        element.setState(state);
                    }
                });
            };

            grid = initGrid($container, this.config);
            initInteraction(grid, $container, this.config);

            this.on('configchange', function(newConfig){

                var state = getState();
                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
                setState(state, true);
            });

            this.on('gridchange', function(newConfig){

                self.config = newConfig ? buildGridConfig(newConfig) : self.config;
                grid = initGrid($container, self.config);
                initInteraction(grid, $container, self.config);
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

            var rawResponse = [];
            var solutionSetSelections = [];
            var solutionSetId = '';

            if(response && _.isArray(response.record)){

                _.each(response.record, function(entry){
                    var points, id;

                    if(isValidRecordEntry(entry)){

                        id = entry.name;

                        points = _.map(entry.base.list.point, function(point){
                            return {
                                x : point[0],
                                y : point[1]
                            };
                        });

                        //special case for solutionSet
                        if(id.match(/^solutionSet/)){
                            solutionSetId = id;
                            solutionSetSelections.push(points);
                        }else{
                            rawResponse.push({
                                id : id,
                                points : points
                            });
                        }
                    }
                });

                if(solutionSetId && solutionSetSelections.length){
                    rawResponse.push({
                        id : solutionSetId,
                        type : 'solutionSet',
                        selections : solutionSetSelections
                    });
                }

                this.setRawResponse(rawResponse);
            }
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
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){
            this.setResponse(state);
        },
        /**
         * Get the current state of the interaction as a json.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(graphLineAndPointInteraction);
});
