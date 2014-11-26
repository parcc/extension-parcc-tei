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
        initialize : function(paper,grid,coord,config){
            config = _.defaults(config,{
                color : "#bb1a2a",
                radius : 7
            });


            var newPoint = pointFactory(paper, grid, {
                x : coord.x,
                y : coord.y,
                color : config.color
            });
            // Draw the point
            newPoint.render();
            // Enable drag'n'drop hability
            newPoint.drag();

            return newPoint;
        },

        getResponse : function(point){
            return {'base' : {'point' : [point.getX(),point.getY()]}};
        },

        setResponse : function(point,response){
            // 1. Get the current coordinates
            var currentX = point.getX(),
                currentY = point.getY();
            // 2. Get the new coordinates from response
            var x = response.base.point[0],
                y = response.base.point[1];
            // 3. Assign it
            point.setCoord(x, y);
            // 4. Translate the point, preventing a redraw that'll break
            //    events attached on the childrens
            point.children.translate(currentX - x,currentY - y);

            return point;
        }
    };
    return pointWrapper;

});
