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
        line : null,
        initialize : function(paper,grid,config){
            config = _.defaults(config,_defaults);
            var self = this,
                plotFactory = new PlotFactory(grid);


            $(paper.canvas).off('grid_click').on('grid_click',function(event,coord){
                console.log('grid click');
                if (self.points.length < 2) {
                    var newPoint = pointFactory(paper, grid, {
                        x : coord.x,
                        y : coord.y,
                        color : self.color
                    });
                    // Draw the point
                    newPoint.render();
                    // Enable drag'n'drop hability
                    newPoint.drag();
                    // Add it to the list of points
                    self.points.push(newPoint);
                    // Raise event ready for line plot
                    if (self.points.length === 2) {
                        $(paper.canvas).trigger('line.pairPointReady');
                        $(paper.canvas).on('point.moved',function(){
                            $(paper.canvas).trigger('line.pairPointReady');
                        });
                    }
                }else{
                    // Get the last point placed
                    var oldPoint = self.points.pop();
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                    // Add it back to the list
                    self.points.push(oldPoint);
                    // Raise event ready for a line plot
                    $(paper.canvas).trigger('line.pairPointReady');
                }
            });

            $(paper.canvas).off('point.removed').on('point.removed',function(event,removedPoint){
                if (self.points) {
                    // get the point to remove from the "registry"
                    var pointToDelete = _.findIndex(self.points,{uid : removedPoint.uid});
                    if (pointToDelete > -1) {
                        console.log('point removed from canvas, let s delete it from array');
                        self.points.splice(pointToDelete,1);
                        // Remove line
                        if(self.line){
                            console.log('there s a line : removing it');
                            self.line.remove();
                            self.line = null;
                        }
                    }
                }
            });
            $(paper.canvas).on('line.pairPointReady',function(){
                // Get the Active Set
                // var activeSet = _.find(sets,{active : true});
                // If there's a line, remove it
                if(self.line){self.line.remove();}
                // Create and store the new line
                self.line = plotFactory.plotLinear(self.points[0],self.points[1],{color:self.color});
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
        },
    };
    return linesWrapper;

});
