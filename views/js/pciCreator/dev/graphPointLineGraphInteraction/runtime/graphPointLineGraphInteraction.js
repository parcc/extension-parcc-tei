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
                draggable: getBoolean(rawConfig.draggable, true),
                graphType: rawConfig.graphType, // scatterPlot (nuage de points) or line
                maxPoints: parseInt(rawConfig.maxPoints, radix),
                segment: getBoolean(rawConfig.segment, true), // draw only segments between points

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

    var graphPointLineGraphInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'graphPointLineGraphInteraction';
        },
        initialize : function(id, dom, config){
            var $container = $(dom),
                self,
                paper,
                grid,
                points = [],
                plotFactory,
                paths = [];

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            self = this;

            function initGrid($gridContainer, gridConfig){

                //clear existing drawn elements (if any)
                clearPlot();
                clearPoint();

                //create paper
                paper = createCanvas($gridContainer, gridConfig);

                //intialize the grid only if the configuration is correct
                if(_.isObject(gridConfig.x) &&
                        _.isObject(gridConfig.y) &&
                        gridConfig.x.start < gridConfig.x.end &&
                        gridConfig.y.start < gridConfig.y.end
                    ){

                    grid = gridFactory(paper, gridConfig);
                    grid.clickable();

                    //bind click event:
                    grid.children.click(function(clickEvent){

                        // Get the coordinate for a click
                        var bnds = clickEvent.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((clickEvent.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((clickEvent.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor),
                            oldPoint;

                        if (areCoordsValid(fx, fy)) {
                            if (points.length < self.gridConfig.maxPoints) {
                                addPoint(fx, fy);
                                plot();
                            } else {
                                // Move the last point placed
                                oldPoint = points.pop();
                                oldPoint.setCoord(fx, fy);
                                points.push(oldPoint);
                                plot();
                            }
                        }
                    });

                    //init related plot factory
                    plotFactory = new PlotFactory(grid, gridConfig.plot);

                    //add listener to removed.point
                    $(paper.canvas).off('removed.point').on('removed.point', function(_event, removedPoint){
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
                        segment : self.gridConfig.segment
                    };

                clearPlot();

                if (self.gridConfig.graphType === 'line' && sortedPoints.length >= 2) {
                    sortedPoints.reduce(function (pointA, pointB) {
                        if (pointA.getX() === pointB.getX()) {
                            paths.push(plotFactory.plotVertical(pointA, pointB, plotConfig));
                        } else {
                            paths.push(plotFactory.plotLinear(pointA, pointB, plotConfig));
                        }
                        return pointB;
                    });
                }
                points.forEach(function (point) {
                    point.render();
                    if (self.gridConfig.draggable) {
                        point.drag();
                    }
                    point.removeOnClic();
                });

                self.trigger('responseChange', [self.getResponse()]);
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
                    points.push(newPoint);
                }

                return newPoint;
            }

            /**
             * @return {array} ['x1 y1', 'x2 y2', 'x3 y3'...]
             */
            this.getRawResponse = function getRawResponse(){
                var serializedPoints;

                if (points.length === 0) {
                    return null;
                }
                serializedPoints = points.map(function getPointsData(point) {
                    var pointData = point.getCartesianCoord(1);
                    return pointData.x + ' ' + pointData.y;
                });
                return serializedPoints;
            };

            /**
             * Set the raw response to the interaction
             * @param {array} serializedPoints ['x1 y1', 'x2 y2', 'x3 y3'...]
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
            });
        },
        /**
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * @param {Object} response See JSON schema in link above
         */
        setResponse : function(response){

            if(response && response.list){
                if(response.list.string && _.isArray(response.list.string)){
                    this.setRawResponse(response.list.string);
                }else if(response.list.point && _.isArray(response.list.point)){
                    this.setRawResponse(response.list.point);
                }else{
                    throw new Error('invalid response baseType');
                }
            }else if(response && response.base === null){
                this.setRawResponse([]);//empty response
            }
        },

        /**
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * @returns {Object} See JSON schema in link above
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
         */
        resetResponse : function(){
            //not implemented
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         */
        destroy : function(){

            var $container = $(this.dom);
            $container.off().empty();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         * @param {Object} state - json format
         */
        setSerializedState : function(state){
            //state == response
            this.setResponse(state);
        },
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         * @returns {Object} json format
         */
        getSerializedState : function(){
            //state == response
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(graphPointLineGraphInteraction);
});
