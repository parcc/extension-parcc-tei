define([], function(){
    'use strict';

    /**
     * Grid Factory
     * @param  {Object}    paper               Raphael paper / canvas object
     * @param  {Object}    options             Grid options
     * @param  {Object}    options.color       color used for the grid's lines
     * @param  {Number}    options.unit        in px, it's the base unit used for your grid
     * @param  {Number}    options.spacingX    On how each units in the x axis you want to repeat your grid
     * @param  {Number}    options.spacingY    On how each units in the y axis you want to repeat your grid
     * @param  {Boolean}   options.snapping    Is elements should be snapped on this grid
     * @throws {unit must be > 0}              If you specified and options.unit <= 0
     * @return {Object}                        Grid object
     */
    function gridFactory(paper,options){
        if (options.unit === 0){ throw 'unit must be > 0';}

        /** @type {String} Color of the grid's lines */
        var _color = options.color || '#000',
        /** @type {Number} Every how many unit you put a new line in X axis */
        _spacingX = options.spacingX || 1,
        /** @type {Number} Every how many unit you put a new line in Y axis */
        _spacingY = options.spacingY || 1,
        /** @type {Number} Unit in px */
        _unit = options.unit || 20,
        /** @type {Object} [description] */
        _borderBox = {};

        var obj = {
            children : paper.set(),
            snapping : options.snapping || false,
            /**
             * Set _spacingX value
             * @param  {Number} val
             */
            setSpacingX : function(val){
                _spacingX = parseInt(val);
            },
            /**
             * Set _spacingY value
             * @param  {Number} val
             */
            setSpacingY : function(val){
                _spacingY = parseInt(val);
            },
            /**
             * Set _unit value
             * @param  {Number} val
             */
            setUnit : function(val){
                _unit = parseInt(val);
            },
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
            },
            /**
             * Get width of the _borderBox
             * @return {Number} width of the set of all elements
             */
            getWidth : function(){
                return _borderBox.width;
            },
            /**
             * Get height of the _borderBox
             * @return {Number} height of the set of all elements
             */
            getHeight : function(){
                return _borderBox.height;
            },
            /**
             * Rendering function
             */
            render : function(){
                var height = window.screen.height,
                width  = window.screen.width;
                for(var y = 1; y <= height; y += _spacingY * _unit){
                    this.children.push(paper.path('M0 ' + y + 'H' + width).attr('stroke', _color).attr('stroke-width', 1));
                }
                for(var x = 1; x <= width; x += _spacingX * _unit) {
                    this.children.push(paper.path('M' + x + ' 0V' + height).attr('stroke', _color));
                }
                _borderBox = this.children.getBBox();
            },
            /**
             * Return a callback function to determine for a value the corrected value according grid snapping
             * @return {Number} snapped to grid value
             */
            snap : function(val){
                var self = this;
                if (self.snapping) {return paper.raphael.snapTo(_unit,val,_unit / 2);}
                else {return val;}
            },
            /**
             * Create a transparent rectangle object in front of every element
             * inside the set to gain clickability
             */
            clickable : function(){
                /** @type {Object} Rectangle Object to cover the all grid area */
                var clickableArea = paper.rect(_borderBox.x,_borderBox.y, _borderBox.width, _borderBox.height);
                clickableArea.attr('fill','rgba(0,0,0,0)');
                this.children.push(clickableArea);
                console.log('grid now clickable');
            }
        };
        obj.render();
        return obj;
    }
    
    return gridFactory;
});
