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
            x : {
                start : rawConfig.xMin === undefined ? -10 : parseInt(rawConfig.xMin),
                end : rawConfig.xMax === undefined ? 10 : parseInt(rawConfig.xMax),
                unit : 20
            },
            y : {
                //the y-axis is reversed 
                start : rawConfig.yMax === undefined ? 10 : -1 * parseInt(rawConfig.yMax),
                end : rawConfig.yMin === undefined ? -10 : -1 * parseInt(rawConfig.yMin),
                unit : 20
            },
            plot : {
                color : _color,
                thickness : rawConfig.graphWidth || 3
            },
            point : {
                color : _color,
                radius : 10
            },
            padding : 20
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

    var graphFunctionInteraction = {
        id : -1,
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
            var _this = this,
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
                        var bnds = event.target.getBoundingClientRect(),
                            wfactor = paper.w / paper.width,
                            fx = grid.getX() + Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                            fy = grid.getY() + Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                        // Create the first point or the second or replace the second according the rules defined by the client                  
                        if(points.length < 2){
                            addPoint(fx, fy);
                            if(points.length === 2){
                                // pair ready : plot the graph
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

                if(point1 && point2){
                    clearPlot();
                    if(mathFunction && plotFactory[mathFunction]){
                        path = plotFactory[mathFunction](point1, point2);
                        console.log('responseChange', getRawResponse());
                    }
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
                    newPoint.drag();
                    points.push(newPoint);
                }
                

                return newPoint;
            }

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
            
            function getRawResponse(){
                
                var point1 = points[0],
                    point2 = points[1];
                
                if(point1 && point2 && mathFunction){
                    return {
                        point1 : point1.getCartesianCoord(1),
                        point2 : point2.getCartesianCoord(1),
                        mathFunction : mathFunction
                    };
                }
            }
            
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
             * Add event listening fo rdynamic configuration change
             */


            _this.on('functionschange', function(graphs){

                //reset selected graph
                mathFunction = null;

                //update list of available graph types
                mathFunctions = graphs;
                showControl(mathFunctions);
                plotDefault();
            });

            _this.on('gridchange', function(config){
                //the configuration of the gird, point or line have changed:
                _this.config = config;
                _this.gridConfig = buildGridConfig(config);
                initGrid($container, _this.gridConfig);
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

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var value = 0;

            return {base : {integer : value}};
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

    qtiCustomInteractionContext.register(graphFunctionInteraction);
});