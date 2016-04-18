define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/scale.raphael',
    'PARCC/gridFactory',
    'PARCC/pointFactory',
    'PARCC/plotFactory'
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

    function buildGridConfig(rawConfig){

        function getBoolean(value, defaultValue) {
            if (typeof(value) === "undefined") {
                return defaultValue;
            } else {
                return (value === true || value === "true");
            }
        }

        var gridConfig = {
            // Interaction config
            draggable: getBoolean(rawConfig.draggable, true),
            graphType: rawConfig.graphType, // scatterPlot (nuage de points) or line
            maxPoints: parseInt(rawConfig.maxPoints),
            segment: getBoolean(rawConfig.segment, true), // draw only segments between points

            // Gridfactory config
            x : {
                start : parseInt(rawConfig.xStart),
                end : parseInt(rawConfig.xEnd),
                label : rawConfig.xLabel,
                step: parseInt(rawConfig.xStep),
                subStep : parseInt(rawConfig.xSubStep),
                weight : parseInt(rawConfig.xWeight),
                allowOuter : getBoolean(rawConfig.xAllowOuter, true)
            },
            y : {
                start : -1 * parseInt(rawConfig.yEnd), // y-axis is reversed
                end : -1 * parseInt(rawConfig.yStart), // y-axis is reversed
                label : rawConfig.yLabel,
                step: parseInt(rawConfig.yStep),
                subStep : parseInt(rawConfig.ySubStep),
                weight : parseInt(rawConfig.yWeight),
                allowOuter : getBoolean(rawConfig.yAllowOuter, true)
            },
            graphTitle: rawConfig.graphTitle,
            graphTitleSize: 20,
            graphTitlePadding: 40,
            graphTitleRequired : getBoolean(rawConfig.graphTitleRequired, false),
            weight: parseInt(rawConfig.weight), // grid weight
            width: parseInt(rawConfig.width),
            height: parseInt(rawConfig.height),
            padding: 30,
            labelPadding: 28,
            labelSize: 14,

            // PlotFactory config
            plot : {
                color: rawConfig.plotColor,
                thickness: parseInt(rawConfig.plotThickness)
            },

            // PointFactory config
            point : {
                color: rawConfig.pointColor,
                glow : getBoolean(rawConfig.pointGlow, true),
                radius: parseInt(rawConfig.pointRadius)
            }
        };

        // check for invalid values
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
        return gridConfig;
    }

    function createCanvas($container, config){

        var xPadding = config.padding * 2,
            yPadding = config.padding * 2,
            paper;

        // we assume a oneQuadrant positioning for labels...
        if (config.x.label) {
            yPadding += config.labelPadding;
        }
        if (config.y.label) {
            xPadding += config.labelPadding;
        }

        if (config.graphTitle) {
            yPadding += config.graphTitlePadding;
        }
        paper = scaleRaphael(
            $('.shape-container', $container)[0],
            config.width + xPadding,
            config.height + yPadding
        );

        return paper;
    }

    var graphPointLineGraphInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphPointLineGraphInteraction';
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

            var _this = this,
                paper,
                grid,
                points = [],
                plotFactory,
                paths = [];

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
                        var bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        if (areCoordsValid(fx, fy)) {
                            if (points.length < _this.gridConfig.maxPoints) {
                                addPoint(fx, fy);
                                plot();
                            } else {
                                // Get the last point placed
                                var oldPoint = points.pop();
                                // Change their coordinates for new ones
                                oldPoint.setCoord(fx, fy);
                                // Re-draw the point
                                oldPoint.render();
                                // re-enable the drag'n'drop
                                if (_this.gridConfig.draggable) {
                                    oldPoint.drag();
                                }
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
                            plot();
                        }
                    });
                }

                return grid;
            }

            function clearPlot(){
                paths.forEach(function (path) {
                    // add safety check ???
                    path.remove();
                });
                paths = [];
            }

            function clearPoint(){
                _.each(points, function(point){
                    point.remove();
                });
                points = [];
            }

            function plot(){

                var sortedPoints = points.sort(function(pointA, pointB) {
                        var ax = pointA.getX(),
                            ay = pointA.getY(),
                            bx = pointB.getX(),
                            by = pointB.getY();

                        if (ax !== bx) {
                            return ax - bx;
                        } else {
                            return ay - by;
                        }
                    }),
                    plotConfig = {
                        segment : _this.gridConfig.segment
                    };

                clearPlot();

                if (_this.gridConfig.graphType === 'line' && sortedPoints.length >= 2) {
                    sortedPoints.reduce(function (pointA, pointB) {
                        if (pointA.getX() === pointB.getX()) {
                            paths.push(plotFactory.plotVertical(pointA, pointB, plotConfig));
                        } else {
                            paths.push(plotFactory.plotLinear(pointA, pointB, plotConfig));
                        }
                        return pointB;
                    });
                }
                _this.trigger('responsechange', [_this.getResponse()]);
            }

            function areCoordsValid(x, y, cartesian) {
                var gridBBox, snappedPoint, xOnOuter, yOnOuter;

                if (cartesian) {
                    xOnOuter = (x === _this.gridConfig.x.start || x === _this.gridConfig.x.end);
                    yOnOuter = (y === _this.gridConfig.y.start || y === _this.gridConfig.y.end);
                } else {
                    gridBBox = grid.getBBox();
                    snappedPoint = grid.snap(x, y);
                    xOnOuter = (snappedPoint[0] === gridBBox.x || snappedPoint[0] === gridBBox.x2);
                    yOnOuter = (snappedPoint[1] === gridBBox.y || snappedPoint[1] === gridBBox.y2);
                }
                return !
                    ((_this.gridConfig.x.allowOuter === false && xOnOuter) ||
                    (_this.gridConfig.y.allowOuter === false && yOnOuter));
            }

            function addPoint(fx, fy, cartesian){

                var gridBBox, newPoint, pointConfig, draggableArea, subStepSizes;

                if(grid && areCoordsValid(fx, fy, cartesian)){

                    gridBBox = grid.getBBox();
                    subStepSizes = grid.getSubStepSizes();

                    draggableArea = {
                        xMin: (_this.gridConfig.x.allowOuter) ? gridBBox.x  : gridBBox.x  + subStepSizes.x,
                        xMax: (_this.gridConfig.x.allowOuter) ? gridBBox.x2 : gridBBox.x2 - subStepSizes.x,
                        yMin: (_this.gridConfig.y.allowOuter) ? gridBBox.y  : gridBBox.y  + subStepSizes.y,
                        yMax: (_this.gridConfig.y.allowOuter) ? gridBBox.y2 : gridBBox.y2 - subStepSizes.y
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
                    }, _this.gridConfig.point);

                    newPoint = pointFactory(paper, grid, pointConfig);
                    if(cartesian){
                        newPoint.setCartesianCoord(fx, fy, pointConfig);
                    }
                    newPoint.render();
                    if (_this.gridConfig.draggable) {
                        newPoint.drag();
                    }
                    newPoint.removeOnClic();
                    points.push(newPoint);
                }

                return newPoint;
            }

            /**
             * Get the raw response of the interaction.
             * If no graph is drawn, returns null
             *
             * @returns {array}
             */
            this.getRawResponse = function getRawResponse(){
                if (points.length === 0) {
                    return null;
                }
                var serializedPoints = points.map(function getPointsData(point) {
                    var pointData = point.getCartesianCoord(1);
                    return pointData.x + ' ' + pointData.y;
                });
                return serializedPoints;
            };

            /**
             * Set the raw response to the interaction
             * @param {array} serializedPoints
             */
            this.setRawResponse = function setRawResponse(serializedPoints){
                clearPoint();
                clearPlot();

                if (serializedPoints) {
                    serializedPoints.forEach(function addPoints(pointData) {
                        var pointCoord = pointData.split(' ');
                        addPoint(pointCoord[0], pointCoord[1], true);
                    });
                }

                plot();
            };

            /**
             * init rendering:
             */
            this.gridConfig = buildGridConfig(this.config);

            initGrid($container, this.gridConfig);

            /**
             * Add event listening for dynamic configuration change
             */

            // this event maintains state...
            _this.on('configChange', function(config){
                var state = _this.getRawResponse();
                _this.config = config;
                _this.gridConfig = buildGridConfig(config);
                initGrid($container, _this.gridConfig);

                _this.setRawResponse(state);
            });

            // ...this one doesn't!
            _this.on('gridChange', function(config){
                _this.config = config;
                _this.gridConfig = buildGridConfig(config);
                initGrid($container, _this.gridConfig);
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

            if(response && response.list){
                if(response.list.string && _.isArray(response.list.string)){
                    this.setRawResponse(response.list.string);
                }else if(response.list.point && _.isArray(response.list.point)){
                    this.setRawResponse(response.list.point);
                }else{
                    throw 'invalid response baseType';
                }
            }else if(response && response.base === null){
                this.setRawResponse([]);//empty response
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
            var raw = this.getRawResponse();
            if(raw){
                return {
                    list : {
                        string : raw
                    }
                };
            }
            return { base : null };
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            //not implemented
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

            //@todo reset response ?!!
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

    qtiCustomInteractionContext.register(graphPointLineGraphInteraction);
});
