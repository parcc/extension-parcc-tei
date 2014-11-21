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
        _x = 0,
        /** @type {Number} y coordinate (in px) */
        _y = 1,
        /** @type {Number} radius for the glowing effect */
        _rGlow = parseInt(options.glowRadius) || _r * 3,
        /** @type {Object} events callback */
        _events =   options.on || {};
      
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
             * Get _x value
             * @return {Number} x position
             */
            getX : function(){
                return _x;
            },
            /**
             * Get _y value
             * @return {Number} y position
             */
            getY : function(){
                return _y;
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
                var circle = paper.circle(_x,_y,_r).attr({
                    fill : _color,
                    stroke : '#000'
                });
                /** @type {Object} Raphael color object */
                var rgb = paper.raphael.color(_color);
                /** @type {Object} Paper.circle of elements that represents glow */
                var glow = paper.circle(_x,_y, _rGlow).attr({
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
                var self = this,
                bb;
                this.children.drag(function (dx, dy) {
                    /** @type {Object} The current bounding box */
                    bb = self.children.getBBox();
                    var newX = (self.oBB.x - bb.x + dx),
                    newY = (self.oBB.y - bb.y + dy);
                    self.children.translate(newX,newY);
                },function () {
                    
                    //trigger event
                    if(typeof _events.dragStart === 'function'){
                        _events.dragStart.call(self);
                    }
                    
                    /** @type {Object} Store the original bounding box
                                       Since it's not just circle, it's impossible to use cx & cy
                                       instead, we'll use a bounding box representation and use their values*/
                    self.oBB = self.children.getBBox();
                },function(){
                    var newX = (bb.x + (bb.width/2)),
                    newY = (bb.y + (bb.width/2));
                    /** Set Coordinate with center of the bounding box */
                    self.setCoord(newX,newY);
                    /** Call for a render again */
                    self.children.translate(self.getX() - newX,self.getY() - newY);
                    
                    //trigger event
                    if(typeof _events.dragStop === 'function'){
                        _events.dragStop.call(self);
                    }
                });
            },
            /**
             * De-Activate the drag'n'drop capavility provided by RapahelJS
             */
            unDrag : function(){
                this.children.undrag();
            },
            /**
             * Add glowing on point
             */
            showGlow : function(){
                /** @type {Object} Raphael color object */
                var rgb = paper.raphael.color(_color);
                /** @type {Object} Paper.circle of elements that represents glow */
                var glow = paper.circle(_x,_y, _rGlow).attr({
                    fill : 'rgba(' + rgb.r + ',' + rgb.g +',' + rgb.b + ',0.3 )',
                    stroke : 'none',
                    cursor : 'move'
                });
                if (this.children.length > 1) { this.children.pop().remove();}
                this.children.push(glow);
            },
            /**
             * Remove Glowing on points
             */
            hideGlow : function(){
                if (this.children.length > 1) { this.children.pop().remove();}
            }
        };
        obj.setCoord(options.x, options.y);
        return obj;
    }
    return pointFactory;
});
