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
    /**
     * Provide an abstraction wrapper to be used as an adapter for
     * manipulating different types of elements inside graphLineAndPoint
     * inraction
     * @type {Object}
     */
    var pointWrapper = {

        point : null,
        /**
         * Initialize function
         *
         * Usage :
         * myelement = myAdapter.initialize(dom,paper,grid,config);
         *
         * @param  {Object} dom             DOM Node
         * @param  {Object} paper           RaphaelJS Paper / canvas
         * @param  {Object} grid            Grid Object
         * @param  {Object} coord           Coordinates of where the user clicked on the canvas
         * @param  {Object} coord.x
         * @param  {Object} coord.y
         * @param  {Object} config          configuration
         * @param  {Object} [config.radius] radius for the point
         * @param  {Object} [config.color]  color for the point
         * @return {[type]}        [description]
         */
        initialize : function(paper,grid,config){
            config = _.defaults(config,{
                color : '#bb1a2a',
                radius : 7
            });
            var self = this;
            $(paper.canvas).on('click_grid',function(event,coord){
                if(self.point !== null){
                    var oldPoint = self.point;
                    // Change their coordinates for new ones
                    oldPoint.setCoord(coord.x, coord.y);
                    // Re-draw the point
                    oldPoint.render();
                    // re-enable the drag'n'drop
                    oldPoint.drag();
                }else{
                    var newPoint = pointFactory(paper, grid, {
                        x : coord.x,
                        y : coord.y,
                        color : config.color
                    });
                    // Draw the point
                    newPoint.render();
                    // Enable drag'n'drop hability
                    newPoint.drag();
                    // Store for convinience the point element
                    self.point = newPoint ;
                }
            });
        },

        getResponse : function(){
            return {'base' : {'point' : [this.point.getX(),this.point.getY()]}};
        },

        setResponse : function(response){
            // 1. Get the current coordinates
            var currentX = this.point.getX(),
                currentY = this.point.getY();
            // 2. Get the new coordinates from response
            var x = response.base.point[0],
                y = response.base.point[1];
            // 3. Assign it
            this.point.setCoord(x, y);
            // 4. Translate the point, preventing a redraw that'll break
            //    events attached on the childrens
            this.point.children.translate(currentX - x,currentY - y);
        }
    };
    return pointWrapper;

});
