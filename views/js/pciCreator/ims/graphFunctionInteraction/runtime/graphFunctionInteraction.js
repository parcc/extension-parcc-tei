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
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/OAT/scale.raphael',
    'parccTei/portableLib/gridFactory',
    'parccTei/portableLib/pointFactory',
    'parccTei/portableLib/plotFactory',
    'css!parccTei/pciCreator/ims/graphFunctionInteraction/runtime/css/graphFunctionInteraction'
], function(
    $,
    qtiCustomInteractionContext,
    _,
    event,
    scaleRaphael,
    gridFactory,
    pointFactory,
    PlotFactory
    ){

    'use strict';

    var graphFunctionInteraction;

    var _typeIdentifier = 'graphFunctionInteraction';

    var buildGridConfig = function buildGridConfig(rawConfig){

        var getBoolean = function getBoolean(value, defaultValue) {
                if (typeof(value) === "undefined") {
                    return defaultValue;
                } else {
                    return (value === true || value === "true");
                }
            },

            radix = 10,
            xWeight = parseInt(rawConfig.xWeight, radix),
            xBorderWeight = parseInt(rawConfig.xBorderWeight, radix),
            yWeight = parseInt(rawConfig.yWeight, radix),
            yBorderWeight = parseInt(rawConfig.yBorderWeight, radix),

            gridConfig = {
                // PCI config
                graphType: rawConfig.graphType, // scatterPlot or line

                // Gridfactory config
                graphTitle: rawConfig.graphTitle,
                graphTitleRequired : getBoolean(rawConfig.graphTitleRequired, false),
                weight: parseInt(rawConfig.weight, radix), // grid weight
                width: parseInt(rawConfig.width, radix),
                height: parseInt(rawConfig.height, radix),

                x : {
                    start : parseInt(rawConfig.xStart, radix),
                    end : parseInt(rawConfig.xEnd, radix),
                    label : rawConfig.xLabel,
                    title : rawConfig.xTitle,
                    step: parseInt(rawConfig.xStep, radix),
                    subStep : parseInt(rawConfig.xSubStep, radix),
                    weight : (xWeight > 0) ? xWeight : xBorderWeight,
                    allowOuter : getBoolean(rawConfig.xAllowOuter, true)
                },
                y : {
                    start : -1 * parseInt(rawConfig.yEnd, radix), // y-axis is reversed
                    end : -1 * parseInt(rawConfig.yStart, radix), // y-axis is reversed
                    label : rawConfig.yLabel,
                    title : rawConfig.yTitle,
                    step: parseInt(rawConfig.yStep, radix),
                    subStep : parseInt(rawConfig.ySubStep, radix),
                    weight : (yWeight > 0) ? yWeight : yBorderWeight,
                    allowOuter : getBoolean(rawConfig.yAllowOuter, true)
                },

                // PlotFactory config
                plot : {
                    color: rawConfig.plotColor,
                    thickness: parseInt(rawConfig.plotThickness, radix)
                },

                // PointFactory config
                point : {
                    color: rawConfig.pointColor,
                    glow : getBoolean(rawConfig.pointGlow, true),
                    radius: parseInt(rawConfig.pointRadius, radix)
                }
            };

        // overide invalid values with safe defaults
        if (gridConfig.x.step < 1) {
            gridConfig.x.step = 1;
        }
        if (gridConfig.y.step < 1) {
            gridConfig.y.step = 1;
        }
        if (gridConfig.x.subStep < 1) {
            gridConfig.x.subStep = 1;
        }
        if (gridConfig.y.subStep < 1) {
            gridConfig.y.subStep = 1;
        }

        if ((gridConfig.x.weight > 0) === false) {
            gridConfig.x.weight = 3;
        }
        if ((gridConfig.y.weight > 0) === false) {
            gridConfig.y.weight = 3;
        }
        return gridConfig;
    };

    var createCanvas = function createCanvas($container, config){

        var paperSize = gridFactory.getPaperSize(config),
            paper = scaleRaphael(
                $('.shape-container', $container)[0],
                paperSize.width,
                paperSize.height
            );

        return paper;
    };

    /**
     * Extract points from the string format e.g ["3 40", "4.5 55"]
     * Into proper internal format [{x:3, y:40}, {x:4.5, y:55}]
     *
     * @param stringPoints
     * @returns {Array}
     */
    function extractPointsFromString(stringPoints){
        var points = [];
        _.each(stringPoints.split(/,/), function(strPoint){
            var pt = strPoint.trim().split(/\s+/);
            if(pt.length === 2){
                points.push({
                    x : pt[0],
                    y : pt[1]
                });
            }else{
                return false;//stop on first wrong point format
            }
        });
        return points;
    }

    graphFunctionInteraction = {


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
            var raw = this.getRawResponse();
            if(raw){
                return {
                    record : [
                        {
                            name: 'functionGraphType',
                            base : {string : raw.mathFunction}
                        },
                        {
                            name : 'points',
                            base : {string :  raw.point1.x+' '+raw.point1.y+','+raw.point2.x+' '+raw.point2.y}
                        }
                    ]
                };
            }
            return {base : null};
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
            var mathFunctions = config.graphs.split(',');
            var $shapeControls = $container.find('.shape-controls');
            var self = this,
                paper,
                grid,
                points = [],
                plotFactory,
                path,
                mathFunction;

            function initGrid($container, gridConfig){

                //clear existing drawn elements (if any)
                clearPlot();
                clearPoint();

                //create paper
                paper = createCanvas($container, gridConfig);

                //intialize the grid only if the configuration is correct
                if(_.isObject(gridConfig.x) &&
                    _.isObject(gridConfig.y) &&
                    gridConfig.x.start < gridConfig.x.end &&
                    gridConfig.y.start < gridConfig.y.end
                    ){

                    grid = gridFactory(paper, gridConfig);
                    grid.clickable();

                    //bind click event:
                    grid.children.click(function(event){

                        // Get the coordinate for a click
                        var oldPoint,
                            bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        // Create the first point or the second or replace the second according the rules defined by the client
                        if(areCoordsValid(fx, fy)){
                            if(points.length < 2){
                                addPoint(fx, fy);
                                if(points.length === 2){
                                    // pair ready : plot the graph
                                    plot();
                                }
                            }else{
                                // Get the last point placed
                                oldPoint = points.pop();
                                // Change their coordinates for new ones
                                oldPoint.setCoord(fx, fy);
                                // Re-draw the point
                                oldPoint.render();
                                // re-enable the drag'n'drop
                                oldPoint.drag();
                                // Add it back to the list
                                points.push(oldPoint);
                                // pair ready : plot the graph
                                plot();
                            }
                        }

                    });

                    //init related plot factory
                    plotFactory = new PlotFactory(grid, gridConfig.plot);

                    //add listener to removed.point
                    $(paper.canvas).off('removed.point').on('removed.point', function(event, removedPoint){
                        // get the point to remove from the "registry"
                        var pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                        if(pointToDelete > -1){
                            //remove it from the model
                            points.splice(pointToDelete, 1);
                            clearPlot();
                        }
                    });
                }

                return grid;
            }

            function showControl(graphs){

                //change conrtol buttons' classes
                $shapeControls.children('button').removeClass('available');
                _.each(graphs, function(graph){
                    $shapeControls.find('[name=' + graph + ']').addClass('available');
                });

                //activate the first one
                activateButton($shapeControls.children('.available:first'));
            }

            function activateButton($button, preventDefaultPlot){

                if(typeof $button === 'string'){
                    $button = $shapeControls.find('[name=' + $button + ']');
                }

                if($button.length){
                    var fnName = $button.val();
                    mathFunction = PlotFactory.getPlotName(fnName);
                    $button.removeClass('btn-info').addClass('btn-success');
                    $button.siblings('button').removeClass('btn-success').addClass('btn-info');

                    if(!preventDefaultPlot){
                        plotDefault();
                    }
                }
            }

            function clearPlot(){
                if(path){
                    path.remove();
                }
            }

            function clearPoint(){
                _.each(points, function(point){
                    point.remove();
                });
                points = [];
            }

            function plot(){

                var point1 = points[0],
                    point2 = points[1];

                if(point1 && point2 && mathFunction && plotFactory[mathFunction]){
                    clearPlot();
                    path = plotFactory[mathFunction](point1, point2);
                    self.trigger('responseChange', [self.getResponse()]);
                }
            }

            function areCoordsValid(x, y, cartesian) {
                var gridBBox, snappedPoint, xOnOuter, yOnOuter;

                if (cartesian) {
                    xOnOuter = (x === self.gridConfig.x.start || x === self.gridConfig.x.end);
                    yOnOuter = (y === self.gridConfig.y.start || y === self.gridConfig.y.end);
                } else {
                    gridBBox = grid.getBBox();
                    snappedPoint = grid.snap(x, y);
                    xOnOuter = (snappedPoint[0] === gridBBox.x || snappedPoint[0] === gridBBox.x2);
                    yOnOuter = (snappedPoint[1] === gridBBox.y || snappedPoint[1] === gridBBox.y2);
                }
                return !
                    ((self.gridConfig.x.allowOuter === false && xOnOuter) ||
                    (self.gridConfig.y.allowOuter === false && yOnOuter));
            }

            function addPoint(fx, fy, cartesian){
                var gridBBox, newPoint, pointConfig, draggableArea, subStepSizes;

                if(grid && areCoordsValid(fx, fy, cartesian)){

                    gridBBox = grid.getBBox();
                    subStepSizes = grid.getSubStepSizes();

                    draggableArea = {
                        xMin: (self.gridConfig.x.allowOuter) ? gridBBox.x  : gridBBox.x  + subStepSizes.x,
                        xMax: (self.gridConfig.x.allowOuter) ? gridBBox.x2 : gridBBox.x2 - subStepSizes.x,
                        yMin: (self.gridConfig.y.allowOuter) ? gridBBox.y  : gridBBox.y  + subStepSizes.y,
                        yMax: (self.gridConfig.y.allowOuter) ? gridBBox.y2 : gridBBox.y2 - subStepSizes.y
                    };

                    pointConfig = _.defaults({
                        x : fx,
                        y : fy,
                        xMin : draggableArea.xMin,
                        xMax : draggableArea.xMax,
                        yMin : draggableArea.yMin,
                        yMax : draggableArea.yMax,
                        on : {
                            dragStart : clearPlot,
                            dragStop : plot
                        }
                    }, self.gridConfig.point);

                    newPoint = pointFactory(paper, grid, pointConfig);
                    if(cartesian){
                        newPoint.setCartesianCoord(fx, fy, pointConfig);
                    }
                    newPoint.render();
                    newPoint.drag();
                    points.push(newPoint);
                }

                return newPoint;
            }

            function getGraphOrigin(){

                var _y = self.gridConfig.y,
                    _x = self.gridConfig.x,
                    x0, y0;

                if((_y.start < 0) && (_y.end <= 0)){
                    y0 = _y.start;
                }else if((_y.start >= 0) && (_y.end > 0)){
                    y0 = _y.start;
                }else{
                    y0 = 0;
                }

                if((_x.start < 0) && (_x.end <= 0)){
                    x0 = _x.start;
                }else if((_x.start >= 0) && (_x.end > 0)){
                    x0 = _x.start;
                }else{
                    x0 = 0;
                }

                return {
                    x : x0,
                    y : y0
                };
            }


            function plotDefault(){

                //clear drawn elements:
                clearPoint();
                clearPlot();
                var origin = getGraphOrigin();
                if(mathFunction === 'plotExponential' || mathFunction === 'plotLogarithmic'){
                    //point at (0, 0) is undefined for exponential and logarithmic functions
                    addPoint(origin.x + 1, origin.y + 1, true);
                    addPoint(origin.x + 2, origin.y + 2, true);
                }else if(mathFunction){
                    addPoint(origin.x + 0, origin.y + 0, true);
                    addPoint(origin.x + 1, origin.y + 1, true);
                }

                if(mathFunction){
                    plot();
                }
            }

            /**
             * Get the raw response of the interaction.
             * If no graph is drawn, returns null
             *
             * @returns {object}
             */
            this.getRawResponse = function getRawResponse(){

                var point1 = points[0],
                    point2 = points[1];

                if(point1 && point2 && mathFunction){
                    return {
                        point1 : point1.getCartesianCoord(1),
                        point2 : point2.getCartesianCoord(1),
                        mathFunction : mathFunction.replace('plot', '').toLowerCase()
                    };
                }
            };

            /**
             * Set the raw response to the interaction
             *
             * @param {string} mathFn
             * @param {object} point1
             * @param {number} point1.x
             * @param {number} point1.y
             * @param {object} point2
             * @param {number} point2.x
             * @param {number} point2.y
             * @returns {undefined}
             */
            this.setRawResponse = function setRawResponse(mathFn, point1, point2){
                clearPoint();
                clearPlot();
                mathFunction = mathFn||mathFunctions[0];
                activateButton(mathFunction, true);
                if(point1 && point1.x && point1.y){
                    addPoint(point1.x, point1.y, true);
                }
                if(point2 && point2.x && point2.y){
                    addPoint(point2.x, point2.y, true);
                }
                plot();
            };

            /**
             * init rendering:
             */
            this.gridConfig = buildGridConfig(this.config);

            initGrid($container, this.gridConfig);

            showControl(mathFunctions);

            plotDefault();

            $shapeControls.on('click', 'button', function(){
                activateButton($(this));
            });

            /**
             * Add event listening for dynamic configuration change
             */

            // this event maintains state...
            self.on('configChange', function(newRawConfig){
                var state = self.getRawResponse();
                self.config = newRawConfig;
                self.gridConfig = buildGridConfig(newRawConfig);
                initGrid($container, self.gridConfig);
                self.setRawResponse(state);
            });

            // ...this one doesn't!
            self.on('gridChange', function(newRawConfig){
                self.config = newRawConfig;
                self.gridConfig = buildGridConfig(newRawConfig);
                initGrid($container, self.gridConfig);
                plotDefault();
            });

            self.on('functionsChange', function(graphs){

                //reset selected graph
                mathFunction = null;

                //update list of available graph types
                mathFunctions = graphs;
                showControl(mathFunctions);
                plotDefault();
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
            var points;
            if(response &&
                _.isArray(response.record) &&
                response.record[0] &&
                response.record[1] &&
                response.record[0].name === 'functionGraphType' &&
                response.record[0].base &&
                response.record[0].base.string &&
                response.record[1].name === 'points' &&
                response.record[1].base &&
                response.record[1].base.string
            ){
                points = extractPointsFromString(response.record[1].base.string);
                this.setRawResponse(response.record[0].base.string, points.shift(),points.shift());
            }
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            this.setRawResponse();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){
            //state == response
            this.setResponse(state);
        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            //state == response
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(graphFunctionInteraction);
});
