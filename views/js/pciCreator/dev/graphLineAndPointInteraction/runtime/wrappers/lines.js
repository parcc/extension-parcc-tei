define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'PARCC/pointFactory',
    'PARCC/plotFactory'
], function(
    $,
    _,
    pointFactory,
    PlotFactory
    ){

    'use strict';
    var _defaults = {
        pointColor : '#bb1a2a',
        lineColor : '#bb1a2a',
        lineStyle : '',
        lineWeight : 3,
        pointRadius : 10
    };

    function initialize(grid, config){

        var points = [],
            active = false,
            uid = config.uid,
            segment = config.segment || false,
            paper = grid.getCanvas(),
            plotFactory = new PlotFactory(grid),
            line;

        function setConfig(cfg){
            config = _.defaults(cfg, _defaults);
        }

        function unbindEvents(){
            var paper = grid.getCanvas();
            $(paper.canvas).off('.' + uid);
        }

        function clearPlot(){
            if(line){
                line.remove();
            }
        }

        function plot(){

            var point1 = points[0],
                point2 = points[1],
                plotConf = {color : config.lineColor, segment : segment, thickness : config.lineWeight, opacity : .8};

            if(point1 && point2){

                clearPlot();
                line = plotFactory.plotLinear(point1, point2, plotConf);
                if(point1.getX() === point2.getX()){
                    //vertical line : 
                    //@todo implement this case
                    line = plotFactory.plotVertical(point1, point2, plotConf);
                }

                if(config.lineStyle){
                    line.attr({'stroke-dasharray' : config.lineStyle});
                }
            }
        }
        
        // Remove line
        function clearPlot(){
            if(line){
                line.remove();
                line = null;
            }
        }

        function addPoint(x, y, cartesian){

            var newPoint = pointFactory(paper, grid, {
                x : x,
                y : y,
                cartesian : !!cartesian,
                radius : config.pointRadius,
                color : config.pointColor,
                on : {
                    dragStart : clearPlot
                }
            });
            // Draw the point
            newPoint.render();
            // Enable drag'n'drop hability
            newPoint.drag();
            // Add it to the list of points
            points.push(newPoint);
            // Raise event ready for line plot
            if(points.length === 2){
                plot();
                $(paper.canvas).on('moved.point', plot);
            }

            return newPoint;
        }


        // Remove line
        function clearPlot(){
            if(line){
                line.remove();
                line = null;
            }
        }

        function addPoint(x, y, cartesian){

            var gridBBox = grid.getBBox();

            var newPoint = pointFactory(paper, grid, {
                x : x,
                y : y,
                xMin : gridBBox.x,
                xMax : gridBBox.x2,
                yMin : gridBBox.y,
                yMax : gridBBox.y2,
                cartesian : !!cartesian,
                radius : config.pointRadius,
                color : config.pointColor,
                on : {
                    dragStart : clearPlot
                }
            });
            // Draw the point
            newPoint.render();
            // Enable drag'n'drop hability
            newPoint.drag();
            // Add it to the list of points
            points.push(newPoint);
            // Raise event ready for line plot
            if(points.length === 2){
                plot();
                $(paper.canvas).on('moved.point', plot);
            }

            return newPoint;
        }


        function bindEvents(){

            $(paper.canvas).on('click_grid.' + uid, function(event, coord){

                if(points.length < 2){

                    addPoint(coord.x, coord.y);

                }else{
                    // Get the last point placed
                    var oldPoint = points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    points.push(oldPoint);
                    // Raise event ready for a line plot
                    plot();
                }

            }).on('removed.point.' + uid, function(event, removedPoint){
                if(points){
                    // get the point to remove from the "registry"
                    var pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                    if(pointToDelete > -1){
                        points.splice(pointToDelete, 1);
                        clearPlot();
                    }
                }
            });

        }

        setConfig(config);

        var linesWrapper = {
            getId : function(){
                return uid;
            },
            isActive : function(){
                return active;
            },
            activate : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                    point.drag();
                });
                bindEvents();
                active = true;
            },
            disactivate : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                    point.unDrag();
                });
                unbindEvents();
                active = false;
            },
            destroy : function(){
                if(line !== undefined && line !== null){
                    line.remove();
                    line = null;
                }
                if(points !== undefined && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            },
            setLineStyle : function(style){
                config.lineStyle = style || '';
                plot();
            },
            highlightOn : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                });
            },
            highlightOff : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                });
            },
            getState : function(){

                var pts = [];
                _.each(points, function(pt){
                    pts.push(pt.getCartesianCoord());
                });

                return {
                    points : pts,
                    config : _.cloneDeep(config)
                };
            },
            setState : function(state){

                if(state.config){
                    setConfig(state.config);
                }

                //clear points and plot
                clearPlot();
                _.each(points, function(point){
                    point.remove();
                });
                points = [];
                if(state.points){
                    _.each(state.points, function(point){
                        addPoint(point.x, point.y, true);
                    });
                }
                linesWrapper.disactivate();
            }
        };

        return linesWrapper;
    }

    return {
        initialize : initialize
    };

});