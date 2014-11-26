define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/scale.raphael',
    'PARCC/pointFactory',
    'PARCC/plotFactory'
    ], function(
        $,
        _,
        scaleRaphael,
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

    var linesWrapper = {
        points : [],
        active : true,
        color : _defaults.color,
        initialize : function(paper,grid,config){
            config = _.defaults(config,_defaults);

            $(paper.canvas).on('grid_click',function(coord){
                if (this.points.length < 2) {
                    var newPoint = pointFactory(paper, grid, {
                        x : coord.x,
                        y : coord.y,
                        color : this.color
                    });
                    // Draw the point
                    newPoint.render();
                    // Enable drag'n'drop hability
                    newPoint.drag();
                    // Add it to the list of points
                    this.points.push(newPoint);
                    // Raise event ready for line plot
                    if (this.points.length === 2) {$(paper.canvas).trigger('line.pairPointReady');}
                }else{
                    // Get the last point placed
                    var oldPoint = this.points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    this.points.push(oldPoint);
                    // Raise event ready for a line plot
                    $(paper.canvas).trigger('line.pairPointReady');
                }
            });



        },
        activate : function(){
            this.active = true;
            _.forEach(this.points, function(point){
                point.showGlow();
            });
        },
        disactivate : function(){
            this.active = false;
            _.forEach(this.points, function(point){
                point.hideGlow();
            });
        }
    };
    return linesWrapper;

});
