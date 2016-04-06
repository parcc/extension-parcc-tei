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
/*
 "draggable": true,
 "graphTitle": "Culture 2 Data",
 "graphTitleRequired": true,
 "graphType": "line",
 "maxPoints": 6,
 "plotColor": "#0000FF",
 "plotSegment": true,
 "plotThickness": 6,
 "pointColor": "#0000FF",
 "pointGlow": true,
 "pointRadius": 8,
 "weight": 1,

 "xAllowOuter": true,
 "xStep": 1,
 "xLabel": "Time (hr)",
 "xMax": 7,
 "xMin": 0,
 "xSubIncrement": 2,
 "xUnit": 42,
 "xWeight": 3,

 "yAllowOuter": true,
 "yStep": 10,
 "yLabel": "Number of Cells (x1,000,000)",
 "yMax": 100,
 "yMin": 0,
 "ySubIncrement": 2,
 "yUnit": 3.4,
 "yWeight": 3


GRID
 color : lineColor,
 weight : 1,
 padding : 20,
 x : {
     start : -10,
     end :  10,
     label : null,
     step : 1,
     unit : 10,
     color : lineColor,
     weight : 3
 },

 */
            // Gridfactory config
            x : {
                start : parseInt(rawConfig.xMin),
                end : parseInt(rawConfig.xMax),
                label : rawConfig.xLabel,
                step: parseInt(rawConfig.xStep),
                unit : parseInt(rawConfig.xUnit),
                weight : parseInt(rawConfig.xWeight)
            },
            y : {
                // y-axis is reversed
                start : -1 * parseInt(rawConfig.yMax),
                end : -1 * parseInt(rawConfig.yMin),
                label : rawConfig.yLabel,
                step: parseInt(rawConfig.yStep),
                unit : parseInt(rawConfig.yUnit),
                weight : parseInt(rawConfig.yWeight)
            },
            padding : 20,
            weight: parseInt(rawConfig.weight),

            // PlotFactory config
            plot : {
                color : _color,
                thickness : parseInt(rawConfig.plotThickness)
            },

            // PointtFactory config
            point : {
                color : _color,
                radius : 10
            },
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

            // var mathFunctions = config.graphs.split(',');
            // var $shapeControls = $container.find('.shape-controls');
            var _this = this,
                paper,
                grid,
                points = [],
                plotFactory,
                paths = [];

            var mathFunction; // @todo delete

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

                        var maxPoints = 6; //@todo move and get from parameter

                        if(points.length < maxPoints){
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
                            oldPoint.drag();
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

            /*
            function showControl(graphs){

                //change conrtol buttons' classes
                $shapeControls.children('button').removeClass('available');
                _.each(graphs, function(graph){
                    $shapeControls.find('[name=' + graph + ']').addClass('available');
                });

                //activate the first one
                activateButton($shapeControls.children('.available:first'));
            }

            function activateButton($button){

                if(typeof $button === 'string'){
                    $button = $shapeControls.find('[name=' + $button + ']');
                }

                if($button.length){
                    var fnName = $button.val();
                    mathFunction = PlotFactory.getPlotName(fnName);
                    $button.removeClass('btn-info').addClass('btn-success');
                    $button.siblings('button').removeClass('btn-success').addClass('btn-info');

                    //always replot the default
                    plotDefault();
                }
            }
            */

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
                });

                clearPlot();

                sortedPoints.reduce(function (pointA, pointB) {
                    if (pointA.getX() === pointB.getX()) {
                        paths.push(plotFactory.plotVertical(pointA, pointB, { segment: true }));
                    } else {
                        paths.push(plotFactory.plotLinear(pointA, pointB, { segment: true }));
                    }
                    return pointB;
                });
/*
                    _this.trigger('responseChange', [_this.getResponse()]);
                */
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
                    newPoint.drag();
                    points.push(newPoint);
                }


                return newPoint;
            }
/*
            function getGraphOrigin(){

                var _y = _this.gridConfig.y,
                    _x = _this.gridConfig.x,
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
*/
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
                        mathFunction : mathFunction
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
                mathFunction = mathFn;
                addPoint(point1.x, point1.y, true);
                addPoint(point2.x, point2.y, true);
                plot();
            };

            /**
             * init rendering:
             */
            this.gridConfig = buildGridConfig(this.config);

            initGrid($container, this.gridConfig);

            //showControl(mathFunctions);

            // plotDefault();

            // $shapeControls.on('click', 'button', function(){
            //     activateButton($(this));
            // });

            /**
             * Add event listening for dynamic configuration change
             */

            /*
            _this.on('functionschange', function(graphs){

                //reset selected graph
                mathFunction = null;

                //update list of available graph types
                mathFunctions = graphs;
                showControl(mathFunctions);
                plotDefault();
            });
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
                _.isArray(response.record) &&
                response.record[0] &&
                response.record[1] &&
                response.record[0].name === 'functionGraphType' &&
                response.record[0].base &&
                response.record[0].base.string &&
                response.record[1].name === 'points' &&
                response.record[1].list &&
                response.record[1].list &&
                _.isArray(response.record[1].list.point)){

                var point1 = response.record[1].list.point[0];
                var point2 = response.record[1].list.point[1];

                this.setRawResponse(response.record[0].base.string, {
                    x : point1[0],
                    y : point1[1]
                },{
                    x : point2[0],
                    y : point2[1]
                });
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
                    record : [
                        {
                            name: 'functionGraphType',
                            base : {'string' : raw.mathFunction}
                        },
                        {
                            name : 'points',
                            list : {
                                point : [
                                    [raw.point1.x, raw.point1.y],
                                    [raw.point2.x, raw.point2.y]
                                ]
                            }
                        }
                    ]
                };
            }
            return {base : null};
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
