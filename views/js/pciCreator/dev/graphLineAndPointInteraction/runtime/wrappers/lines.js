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
        label : null,
        color : '#bb1a2a',
        lineStyle : 'plain',
        lineWeight : 1,
        pointRadius : 7
    };

    function initialize(grid, config){

        var points = [],
            active = false,
            uid = config.uid,
            color = config.color || _defaults.color,
            dashed = false,
            segment = config.segment || false,
            paper = grid.getCanvas(),
            plotFactory = new PlotFactory(grid),
            line;

        config = _.defaults(config, _defaults);

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
                point2 = points[1];

            if(point1 && point2){

                clearPlot();
                line = plotFactory.plotLinear(point1, point2, {color : color, segment : segment});
                if(point1.x === point2.x){
                    //vertical line : 
                    //@todo implement this case
                }
                
                if(dashed){
                    line.attr({'stroke-dasharray':'--'});
                }
            }
        }

        function bindEvents(){

            $(paper.canvas).on('click_grid.' + uid, function(event, coord){

                if(points.length < 2){
                    var newPoint = pointFactory(paper, grid, {
                        x : coord.x,
                        y : coord.y,
                        color : color,
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
                        // Remove line
                        if(line){
                            line.remove();
                            line = null;
                        }
                    }
                }
            });

        }

        var linesWrapper = {
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
                if(style === 'dashed'){
                    dashed = true;
                }else{
                    dashed = false;
                }
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
            }
        };

        return linesWrapper;
    }

    return {
        initialize : initialize
    };

});