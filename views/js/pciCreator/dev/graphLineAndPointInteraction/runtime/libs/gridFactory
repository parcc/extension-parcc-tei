define([], function(){
    'use strict';

    /**
     * Grid Factory
     * @param  {Object}    paper               Raphael paper / canvas object
     * @param  {Object}    options             Grid options
     * @param  {Number}    options.unit        in px, it's the base unit used for your grid
     * @param  {Number}    options.spacingX    On how each units in the x axis you want to repeat your grid
     * @param  {Number}    options.spacingY    On how each units in the y axis you want to repeat your grid
     * @param  {Boolean}   options.snapping    Is elements should be snapped on this grid
     * @throws {unit must be > 0}           If you specified and options.unit <= 0
     * @return {Object}                     Grid object
     */
    function gridFactory(paper,options){
        if (options.unit === 0){ throw 'unit must be > 0';}
        var obj = {
            color : options.color || '#000',
            spacingX : options.spacingX || 1,
            spacingY : options.spacingY || 1,
            unit : options.unit || 20,
            children : paper.set(),
            snapping : options.snapping || false,
            /**
             * Rendering function
             */
            render : function(){
                var height = window.screen.height,
                width  = window.screen.width,
                /** @type {int} spacing in px for x axis*/
                spacingX = this.spacingX * this.unit,
                /** @type {int} spacing in px for y axis */
                spacingY = this.spacingY * this.unit;
                for(var y = 0; y <= height; y += (spacingY)) {
                    for(var x = 0; x <= width; x += (spacingX)) {
                        this.children.push(paper.rect(x,y,spacingX,spacingY).attr('stroke', this.color));
                    }
                }
            },
            /**
             * Return a callback function to determine for a value the corrected value according grid snapping
             * @return {Function} callback function
             */
            snap : function(){
                var self = this;
                return function(val){
                    if (self.snapping) {return paper.snapTo(this.unit,val,this.unit);}
                    else {return val;}
                };
            }
        };
        obj.render();
        return obj;

    }
});
