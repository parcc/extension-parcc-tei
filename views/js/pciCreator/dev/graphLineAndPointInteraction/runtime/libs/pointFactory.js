define([], function(){
    'use strict';
    /**
     * Point Factory
     * @param  {Object} paper                               Raphael paper / canvas object
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
    function pointFactory(paper,options) {
        /**
         * Test if requirement are met or not
         */
        if(!options.x || !options.y){throw 'Missing Parameters. Need to specify x,y';}
        /** @type {String} color */
        var _color = options.color || '#f00',
        /** @type {Number} radius of the point representation */
        _r = parseInt(options.radius) || 20,
        /** @type {Number} x coordinate (in px) */
        _x = parseInt(options.x),
        /** @type {Number} y coordinate (in px) */
        _y = parseInt(options.y),
        /** @type {Number} radius for the glowing effect */
        _rGlow = parseInt(options.glowRadius) || 30;

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
                var circle = paper.circle(_x,_y,_r);
                circle.attr('fill', _color);
                circle.attr('stroke', _color);
                /** @type {Object} Paper.set of elements that represents glow */
                var glow = circle.glow({
                    color : _color,
                    width: _rGlow
                });
                this.children.push(circle,glow);
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
                    // Apply the translation
                    if (options){
                        newX = options.snap(newX);
                        newY = options.snap(newY);
                    }
                    self.children.translate(newX,newY);
                },function () {
                    /** @type {Object} Store the original bounding box
                                       Since it's not just circle, it's impossible to use cx & cy
                                       instead, we'll use a bounding box representation and use their values*/
                    self.oBB = this.children.getBBox();
                });
            }
        };
        return obj;
    }
    return pointFactory;
});
