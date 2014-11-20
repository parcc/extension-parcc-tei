define(['OAT/lodash'], function( _){
    'use strict';

    /**
     * Grid Factory
     * @param  {Object}    paper               Raphael paper / canvas object
     * @param  {Object}    options             Grid options
     * @return {Object}                        Grid object
     */
    function gridFactory(paper,options){
        if (typeof options.x !== 'object' && typeof options.y !== 'object'){ throw 'I need x and y axis';}
        /** @type {String} Color of the grid's lines */
        var _color = options.color || '#000',
        /** @type {Number} line weight of grid */
        _weight = options.weight || 1,

        _x = _.defaults(options.x,{
            /** @type {Number} Starting scale for axys */
            start : -10,
            /** @type {Number} Ending scale for axys */
            end :  10,
            /** @type {String|null} Label aside of the axys */
            label : null,
            /** @type {Number} Graduation step. Purely visual */
            step : 1,
            /** @type {Number} How many px is taken by one unit for the grid */
            unit : 10,
            /** @type {String} Color of the axys */
            color : '#00ff00',
            /** @type {Number} Tichness in px */
            weight : 2
        }),
        _y = _.defaults(options.y,{
            /** @type {Number} Starting scale for axys */
            start : -10,
            /** @type {Number} Ending scale for axys */
            end :  10,
            /** @type {String|null} Label aside of the axys */
            label : null,
            /** @type {Number} Graduation step. Purely visual */
            step : 1,
            /** @type {Number} How many px is taken by one unit for the grid */
            unit : 10,
            /** @type {String} Color of the axys */
            color : '#00ff00',
            /** @type {Number} Tichness in px */
            weight : 2
        }),
        /** @type {Object} [description] */
        _borderBox = {};

        var obj = {
            children : paper.set(),
            snapping : options.snapping || false,
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
                this.children.remove().clear();
                this.render();
            },
            /**
             * Set _weight of the grid elements
             * @param {Number} value weight in px
             */
            setWeight : function(value){
                _weight = parseInt(value);
                this.children.remove().clear();
                this.render();
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
             * Get the units for x,y axis
             * @return {Object}
             */
            getUnit : function(){
                return {x: _x.unit , y: _y.unit}
            },
            /**
             * Rendering function
             */
            render : function(){
                var height = window.screen.height,
                width  = window.screen.width;
                for(var y = 0; y <= height; y += _y.step * _y.unit){
                    this.children.push(paper.path('M0 ' + y + 'H' + width).attr('stroke', _color).attr('stroke-width', _weight));
                }
                for(var x = 0; x <= width; x += _x.step * _x.unit) {
                    this.children.push(paper.path('M' + x + ' 0V' + height).attr('stroke', _color).attr('stoke-width', _weight));
                }
                _borderBox = this.children.getBBox();
            },
            /**
             * Return a callback function to determine for a value the corrected value according grid snapping
             * @param {Number} x coordinate x to convert to snapped value
             * @parem {Number} y  coordinate y to convert to snapped value
             * @return {Array} snapped values x,y
             */
            snap : function(x,y){
                x = paper.raphael.snapTo(_x.unit, x, _x.unit / 2);
                y = paper.raphael.snapTo(_y.unit, y, _y.unit / 2);
                return [x,y];
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
            }
        };
        obj.render();
        return obj;
    }
    console.log('grid factory loaded');
    return gridFactory;
});
