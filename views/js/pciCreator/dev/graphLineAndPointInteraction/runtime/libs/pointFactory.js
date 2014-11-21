define([], function(){
    'use strict';
    /**
     * Point Factory
     * @param  {Object} paper                               Raphael paper / canvas object
     * @param  {Object} grid                                Grid
     * @param  {Object} options                             Point options
     * @param  {String} [options.color="#fff"]              color of the point
     * @param  {Number} [options.radius=20]                 radius in px for your point
     * @param  {Number} options.x                           position on the x axis
     * @param  {Number} options.y                           position on the y axis
     * @param  {Number} [options.glowRadius=30]             size of the radius around the point
     * @throws {Missing Parameters. Need to specify x,y}    If there's missing x / y
     *
     * @return {Object}                                     point Object
     */
    function pointFactory(paper,grid,options) {
        /**
         * Test if requirement are met or not
         */
        if(!options.x || !options.y){throw 'Missing Parameters. Need to specify x,y';}
        /** @type {String} color */
        var _color = options.color || '#f00',
        /** @type {Number} radius of the point representation */
        _r = parseInt(options.radius) || 10,
        /** @type {Number} x coordinate (in px) */
        _x = parseInt(options.x),
        /** @type {Number} y coordinate (in px) */
        _y = parseInt(options.y),
        /** @type {Number} radius for the glowing effect */
        _rGlow = parseInt(options.glowRadius) || _r * 3;

        var obj = {
            /** @type {Object} Paper.set of elements */
            children : paper.set(),
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
            },
            /**
             * Set _x value
             * @param {Number} val in px
             */
            setX : function(val){
                _x = parseInt(val);
            },
            /**
             * Set _y value
             * @param {Number} val in px
             */
            setY : function(val){
                _y = parseInt(val);
            },
            /**
             * Set new coordinates for the point
             * @param {Number} x
             * @param {Number} y
             */
            setCoord : function(x,y){
                var coord = grid.snap(parseInt(x),parseInt(y));
                _x = coord[0];
                _y = coord[1];
            },
            /**
             * Set _r value
             * @param {Number} val in px
             */
            setR : function(val){
                _r = parseInt(val);
            },
            /**
             * Set _rGlow value
             * @param {Number} val in px
             */
            setRGlow : function(val){
                _rGlow = parseInt(val);
            },
            /**
             * Draw the point with his glow around him
             */
            render : function(){
                /** @type {Object} Raphaël element object with type “circle” */
                var coord = grid.snap(_x,_y);
                var circle = paper.circle(coord[0],coord[1],_r).attr({
                    fill : _color,
                    stroke : '#000'
                });
                /** @type {Object} Raphael color object */
                var rgb = paper.raphael.color(_color);
                /** @type {Object} Paper.circle of elements that represents glow */
                var glow = paper.circle(coord[0],coord[1], _rGlow).attr({
                    fill : 'rgba(' + rgb.r + ',' + rgb.g +',' + rgb.b + ',0.3 )',
                    stroke : 'none'
                });
                if (this.children.length > 0) { this.children.remove().clear();}
                this.children.push(circle,glow).attr({
                    cursor : 'move'
                });
            },
            /**
             * Activate the dran'n'drop capability provide by RaphaelJS
             */
            drag : function(){
                var self = this;
                this.children.drag(function (dx, dy) {
                    /** @type {Object} The current bounding box */
                    var bb = self.children.getBBox(),
                    newX = (self.oBB.x - bb.x + dx),
                    newY = (self.oBB.y - bb.y + dy);
                    self.children.translate(newX,newY);
                },function () {
                    /** @type {Object} Store the original bounding box
                                       Since it's not just circle, it's impossible to use cx & cy
                                       instead, we'll use a bounding box representation and use their values*/
                    self.oBB = self.children.getBBox();
                },function(dx,dy){
                    var coord = grid.snap(dx,dy);
                    self._x = coord[0];
                    self._y = coord[1];
                });
            },
            /**
             * De-Activate the drag'n'drop capavility provided by RapahelJS
             */
            unDrag : function(){
                this.children.undrag();
            }
        };
        return obj;
    }
    return pointFactory;
});
