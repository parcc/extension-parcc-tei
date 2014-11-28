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
            }
        };
    }

    function createCanvas($container, config){

        var padding = 2;
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
                grid = gridFactory(paper, gridConfig);
                grid.clickable();

                //bind click event:
                grid.children.click(function(event){

                    // Get the coordinate for a click
                    var bnds = event.target.getBoundingClientRect(),
                        wfactor = paper.w / paper.width,
                        fx = Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                        fy = Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                    // Create the first point or the second or replace the second according the rules defined by the client                  
                    if(points.length < 2){
                        var newPoint = pointFactory(paper, grid, {
                            x : fx,
                            y : fy,
                            on : {
                                dragStart : clearPlot,
                                dragStop : plot
                            }
                        });
                        // Draw the point
                        newPoint.render();
                        // Enable drag'n'drop hability
                        newPoint.drag();
                        // Add it to the list of points
                        points.push(newPoint);

                        // pair ready : plot the graph
                        if(points.length === 2){
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
                plotFactory = new PlotFactory(grid);

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

                var fnName = $button.val();
                mathFunction = PlotFactory.getPlotName(fnName);
                $button.removeClass('btn-info').addClass('btn-success');
                $button.siblings('button').removeClass('btn-success').addClass('btn-info');
                plot();
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
                    path = plotFactory[mathFunction](point1, point2);
                }

            }

            function addPoint(fx, fy){

                var newPoint = pointFactory(paper, grid, {
                    x : -100,
                    y : -100,
                    on : {
                        dragStart : clearPlot,
                        dragStop : plot
                    }
                });
                
                newPoint.setCartesianCoord(fx, fy);
                
                // Draw the point
                newPoint.render();
                // Enable drag'n'drop hability
                newPoint.drag();
                // Add it to the list of points
                points.push(newPoint);

                return newPoint;
            }

            function plotDefault(){
                
                clearPoint();
                clearPlot();
                
                addPoint(1, 1);
                addPoint(2, 2);
                plot();
            }

            initGrid($container, buildGridConfig(this.config));

            showControl(mathFunctions);

            $shapeControls.on('click', 'button', function(){
                activateButton($(this));
            });

            _this.on('functionschange', function(graphs){

                //clear drawn elements:
                clearPlot();
                clearPoint()

                //update list of available graph types
                mathFunctions = graphs;
                showControl(mathFunctions);
            });

            _this.on('gridchange', function(config){
                //the configuration of the gird, point or line have changed:
                _this.config = config;
                initGrid($container, buildGridConfig(config));
            });
            
            plotDefault();
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