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

        var _color = rawConfig.graphColor || '#bb1a2a';

        return {
            // Interaction config
            draggable: (rawConfig.draggable === 'true'),
            graphTitle: rawConfig.graphTitle,
            graphTitleRequired: (rawConfig.graphTitleRequired === 'true'),
            graphType: rawConfig.graphType,
            maxPoints: parseInt(rawConfig.maxPoints),
            segment: (rawConfig.segment === 'true'),

            // Gridfactory config
            x : {
                start : parseInt(rawConfig.xStart),
                end : parseInt(rawConfig.xEnd),
                label : rawConfig.xLabel,
                step: parseInt(rawConfig.xStep),
                unit : parseInt(rawConfig.xUnit),
                weight : parseInt(rawConfig.xWeight),
                allowOuter : (rawConfig.xAllowOuter === 'true'),
                subStep : parseInt(rawConfig.xSubStep)
            },
            y : {
                // y-axis is reversed
                start : -1 * parseInt(rawConfig.yEnd),
                end : -1 * parseInt(rawConfig.yStart),
                label : rawConfig.yLabel,
                step: parseInt(rawConfig.yStep),
                unit : parseInt(rawConfig.yUnit),
                weight : parseInt(rawConfig.yWeight),
                allowOuter : (rawConfig.yAllowOuter === 'true'),
                subStep : parseInt(rawConfig.ySubStep)
            },
            padding : 20,
            weight: parseInt(rawConfig.weight),

            // PlotFactory config
            plot : {
                color: rawConfig.plotColor,
                thickness: parseInt(rawConfig.plotThickness)
            },

            // PointFactory config
            point : {
                color: rawConfig.pointColor,
                glow: (rawConfig.pointGlow === 'true'),
                radius: parseInt(rawConfig.pointRadius)
            }
        };
    }

    function createCanvas($container, config){

        var padding = 2 * config.padding;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            (config.x.end - config.x.start) * config.x.unit + padding,
            (config.y.end - config.y.start) * config.y.unit + padding
            );

        //@todo make it responsive

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

                    /// @todo CHECK NEW CONFIGS HERE
                    // graphTypes

                    ){

                    grid = gridFactory(paper, gridConfig);
                    grid.clickable();
                    grid.snap();

                    //bind click event:
                    grid.children.click(function(event){

                        // Get the coordinate for a click
                        var bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        if(points.length < _this.gridConfig.maxPoints){
                            addPoint(fx, fy);
                            if(points.length >= 2){
                                plot();
                            }
                        }else{
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

                if (_this.gridConfig.graphType === 'line') {
                    clearPlot();

                    sortedPoints.reduce(function (pointA, pointB) {
                        if (pointA.getX() === pointB.getX()) {
                            paths.push(plotFactory.plotVertical(pointA, pointB, plotConfig));
                        } else {
                            paths.push(plotFactory.plotLinear(pointA, pointB, plotConfig));
                        }
                        return pointB;
                    });
                    _this.trigger('responseChange', [_this.getResponse()]);
                }
            }

            function addPoint(fx, fy, cartesian){

                 var gridBBox, newPoint, pointConfig;

                if(grid){

                    gridBBox = grid.getBBox();

                    pointConfig = _.defaults({
                        x : fx,
                        y : fy,
                        xMin : gridBBox.x,
                        xMax : gridBBox.x2,
                        yMin : gridBBox.y,
                        yMax : gridBBox.y2,
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
                    points.push(newPoint);
                }

                return newPoint;
            }

            /**
             * Get the raw response of the interaction.
             * If no graph is drawn, returns null
             *
             * @returns {object}
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

                serializedPoints.forEach(function addPoints(pointData) {
                    var pointCoord = pointData.split(' ');
                    addPoint(pointCoord[0], pointCoord[1], true);
                });

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

            // @todo useful ??? for editor ???
            _this.on('gridchange', function(config){
                //the configuration of the gird, point or line have changed:
                _this.config = config;
                _this.gridConfig = buildGridConfig(config);
                initGrid($container, _this.gridConfig);
                //plotDefault();
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

            if(response &&
                response.list &&
                response.list.string &&
                _.isArray(response.list.string)){

                this.setRawResponse(response.list.string);
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

            //@todo reset respone ?!!
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
