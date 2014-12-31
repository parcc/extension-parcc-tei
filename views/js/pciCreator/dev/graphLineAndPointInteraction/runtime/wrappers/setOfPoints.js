define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'PARCC/pointFactory'
], function(
    $,
    _,
    pointFactory
    ){

    'use strict';
    var _defaults = {
        label : null,
        color : '#bb1a2a',
        pointRadius : 7
    };

    function initialize(grid, config){

        var points = [],
            max = config.max || 1,
            uid = config.uid,
            color = color = config.color || _defaults.color,
            paper = grid.getCanvas();

        config = _.defaults(config, _defaults);

        function unbindEvents(){
            var paper = grid.getCanvas();
            $(paper.canvas).off('.' + uid);
        }

        function bindEvents(){

            $(paper.canvas).on('click_grid.' + uid, function(event, coord){

                if(points.length < max){
                    var newPoint = pointFactory(paper, grid, {
                        x : coord.x,
                        y : coord.y,
                        color : color
                    });
                    // Draw the point
                    newPoint.render();
                    // Enable drag'n'drop hability
                    newPoint.drag();
                    // Add it to the list of points
                    points.push(newPoint);
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
                }

            }).on('removed.point.' + uid, function(event, removedPoint){
                if(points){
                    // get the point to remove from the "registry"
                    var pointToDelete = _.findIndex(points, {uid : removedPoint.uid});
                    if(pointToDelete > -1){
                        points.splice(pointToDelete, 1);
                    }
                }
            });

        }

        var pointsWrapper = {
            activate : function(){
                _.forEach(points, function(point){
                    point.showGlow();
                    point.drag();
                });
                bindEvents();
            },
            disactivate : function(){
                _.forEach(points, function(point){
                    point.hideGlow();
                    point.unDrag();
                });
                unbindEvents();
            },
            destroy : function(){
                if(points !== undefined && points !== []){
                    _.forEach(points, function(point){
                        point.children.remove().clear();
                    });
                    points = [];
                }
            }
        };

        return pointsWrapper;
    }

    return {
        initialize : initialize
    };

});