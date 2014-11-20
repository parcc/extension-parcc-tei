define(['OAT/lodash'], function( _){
    'use strict';

    function gridFactory(paper,options){
        if (typeof options.x !== 'object' && typeof options.y !== 'object'){ throw 'I need x and y axis';}
        if (options.x.start >= options.x.end || options.y.start >= options.y.end) { throw 'Start must be minus than end';}

        options = _.merge({},{
            color : '#222',
            weigth : 1,
            x : {
                start : -10,
                end :  10,
                label : null,
                step : 1,
                unit : 10,
                color : '#000',
                weight : 2
            },
            y : {
                start : -10,
                end :  10,
                label : null,
                step : 1,
                unit : 10,
                color : '#000',
                weight : 2
            }
        },options);
        console.debug(options);
        /** @type {String} Color of the grid's lines */
        var _color = options.color,
        /** @type {Number} line weight of grid */
        _weight = options.weight,
        _x = options.x,
        _y = options.y,
        /** @type {Object} [description] */
        _borderBox = {},
        _drawAxis = function (){
            var height = (Math.abs(_y.end - _y.start) * _y.unit),
                width  = (Math.abs(_x.end - _x.start) * _x.unit);
            console.info('[Start] Drawing Axys ------------------');
            console.info('Drawing X axys');
            console.debug(_x);
            if (_x.start < 0 && _x.end <= 0) {
                console.info('x1 < x2 < 0');
                paper.path('M' + width + ' ' + height + 'V0').attr({
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight,
                    'arrow-end': 'block-midium-midium'
                });
            }else if (_x.start < 0 && _x.end > 0) {
                console.info('x1 < 0 < x2');
                paper.path('M' + (Math.abs(_x.start) * _x.unit) + ' ' + height +'V0').attr({
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight,
                    'arrow-end': 'block-midium-midium'
                });
            }else {
                console.info('0 < x1 < x2');
                paper.path('M0 ' + height + 'V0').attr('stroke', _x.color).attr({
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight,
                    'arrow-end': 'block-midium-midium'
                });

            }
            console.info('Drawing Y axys');
            console.debug(_y);
            if (_y.start < 0 && _y.end <= 0) {
                console.info('y1 < y2 < 0');
            }else if (_y.start < 0 && _y.end > 0) {
                console.info('y1 < 0 < y2');
                paper.path('M0 ' + (Math.abs(_y.start) * _y.unit) + 'H' + width).attr({
                    'stroke' :  _y.color,
                    'stroke-width': _y.weight,
                    'arrow-end': 'block-midium-midium'
                });
            }else {
                console.info('0 < y1 < y2');
                paper.path('M0 ' + height + 'V' + width).attr('stroke', _y.color).attr({
                    'stroke' :  _y.color,
                    'stroke-width': _y.weight,
                    'arrow-end': 'block-midium-midium'
                });

            }
            console.info('[End] Drawing Axys -------------------');

        };

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
            getUnits : function(){
                return {x: _x.unit , y: _y.unit};
            },
            /**
             * Rendering function
             */
            render : function(){
                var height = (Math.abs(_y.end - _y.start) * _y.unit),
                width  = (Math.abs(_x.end - _x.start) * _x.unit);
                for(var y = 0; y <= height; y += _y.step * _y.unit){
                    this.children.push(paper.path('M0 ' + y + 'H' + width).attr({
                        'path' : 'M0 ' + y + 'H' + width,
                        'stroke': _color,
                        'stroke-width' : _weight
                    }));
                }
                for(var x = 0; x <= width; x += _x.step * _x.unit) {
                    this.children.push(paper.path('M' + x + ' 0V' + height).attr({
                        'stroke' : _color,
                        'stoke-width': _weight
                    }));
                }
                _drawAxis();
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
