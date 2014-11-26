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

    var _defaults = {};

    function createCanvas($container, config){

        config = _.defaults(config || {}, _defaults);

        var canvas = scaleRaphael($('.shape-container', $container)[0], 400, 400);

        //@todo make it responsive

        return canvas;
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
                canvas,
                grid,
                points = [],
                plotFactory,
                path,
                mathFunction;

            this.config.grid = {
                x : {
                    start : -10,
                    end : 10,
                    unit : 20
                },
                y : {
                    start : -10,
                    end : 10,
                    unit : 20
                }
            };

            function initGrid($container, gridConfig){

                //clear existing drawn elements (if any)
                clearPlot();
                clearPoint()

                //create canvas
                canvas = createCanvas($container, {});
                grid = gridFactory(canvas, gridConfig);
                grid.clickable();

                //bind click event:
                grid.children.click(function(event){

                    // Get the coordinate for a click
                    var bnds = event.target.getBoundingClientRect(),
                        wfactor = canvas.w / canvas.width,
                        fx = Math.round((event.clientX - bnds.left) / bnds.width * grid.getWidth() * wfactor),
                        fy = Math.round((event.clientY - bnds.top) / bnds.height * grid.getHeight() * wfactor);

                    // Create the first point or the second or replace the second according the rules defined by the client                  
                    if(points.length < 2){
                        var newPoint = pointFactory(canvas, grid, {
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
                points = [];
                //@todo remove the points from the graph
            }

            function plot(){

                var point1 = points[0],
                    point2 = points[1];

                if(point1 && point2){

                    clearPlot();
                    path = plotFactory[mathFunction](point1, point2);
                }

            }

            initGrid($container, this.config.grid);

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
                initGrid($container, _this.config.grid);
            });

            _.delay(function(){
                return;
                _this.trigger('functionschange', [['exponential', 'quadratic']]);
                console.log('2000');
            }, 2000);

            _.delay(function(){
                return;
                _this.trigger('gridchange', [{}]);
                console.log('6000');
            }, 6000);

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