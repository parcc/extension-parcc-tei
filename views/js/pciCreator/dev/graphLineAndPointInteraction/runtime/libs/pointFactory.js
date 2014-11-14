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

        var obj = {
            color : options.color || '#f00',
            r : options.radius || 20,
            x : options.x,
            y : options.y,
            rGlow : options.glowRadius || 30,
            /** @type {Object} Paper.set of elements */
            children : paper.set(),
            /**
             * Draw the point with his glow around him
             */
            render : function(){
                /** @type {Object} Raphaël element object with type “circle” */
                var circle = paper.circle(this.x,this.y,this.r);
                circle.attr('fill', this.color);
                circle.attr('stroke', this.color);
                /** @type {Object} Paper.set of elements that represents glow */
                var glow = circle.glow({
                    color : this.color,
                    width: this.rGlow
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
});
