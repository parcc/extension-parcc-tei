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
        /** @type {Number} width in px of the grid */
        _width = _spacingX * _unit,
        /** @type {Number} height in px of the grid */
        _height = _spacingY * _unit;

        var obj = {
            children : paper.set(),
            snapping : options.snapping || false,
            /**
             * Set _spacingX value
             * @param  {Number} val
             */
            setSpacingX : function(val){
                _spacingX = parseInt(val);
                _width =  _spacingX * _unit;
            },
            /**
             * Set _spacingY value
             * @param  {Number} val
             */
            setSpacingY : function(val){
                _spacingY = parseInt(val);
                _height = _spacingY * _unit;
            },
            /**
             * Set _unit value
             * @param  {Number} val
             */
            setUnit : function(val){
                _unit = parseInt(val);
                _width =  _spacingX * _unit;
                _height = _spacingY * _unit;
            },
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
            },
            /**
             * Rendering function
             */
            render : function(){
                var height = window.screen.height,
                width  = window.screen.width;
                for(var y = 0; y <= height; y += _height){
                    for(var x = 0; x <= width; x += _width) {
                        this.children.push(paper.rect(x,y,_width,_height).attr('stroke', _color));
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
                    if (self.snapping) {return paper.snapTo(_unit,val,_unit);}
                    else {return val;}
                };
            },
            /**
             * Create a transparent rectangle object in front of every element
             * inside the set to gain clickability
             */
            clickable : function(){
                /** @type {Object} Rectangle Object to cover the all grid area */
                var clickableArea = paper.rect(0,0, _width, _height);
                clickableArea.attr('fill','rgba(0,0,0,0)');
                this.children.push(clickableArea);
            }
        };
        obj.render();
        return obj;
    }
    console.log('grid factory loaded');
    return gridFactory;
});
