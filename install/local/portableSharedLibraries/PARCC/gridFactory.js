define(['OAT/lodash'], function( _ ){

    'use strict';

    function gridFactory(paper,options){

        if (typeof options.x !== 'object' && typeof options.y !== 'object'){
            throw 'I need x and y axis';
        }

        if ( (options.x.start >= options.x.end) || (options.y.start >= options.y.end) ) {
            throw 'end must be greater than start';
        }


        /**
         * Add a css class to the node of a Raphaël object
         * IE currently doesn't support the usage of element.classList in SVG
         * @param raphaelObj
         * @param {string} newClass
         */
        function addCssClass(raphaelObj, newClass) {
            var pattern = new RegExp('\\b' + newClass + '\\b');
            var oldClass = raphaelObj.node.getAttribute('class') || '';
            raphaelObj.node.setAttribute('class', pattern.test(oldClass) ? oldClass : oldClass + ' ' + newClass);
        }


        function drawLine(start, end, style){
            var padding = options.padding;
            var path = paper.path('M'+(padding+start[0])+' '+(padding+start[1])+'L'+(padding+end[0])+' '+(padding+end[1])).attr(style);
            addCssClass(path, 'scene scene-grid');
            return path;
        }

        var lineColor = '#222';

        options = _.merge({},{
            color : lineColor,
            weight : 1,
            padding : 20,
            x : {
                start : -10,
                end :  10,
                label : null,
                step : 1,
                unit : 10,
                color : lineColor,
                weight : 3
            },
            y : {
                start : -10,
                end :  10,
                label : null,
                step : 1,
                unit : 10,
                color : lineColor,
                weight : 3
            }
        },options);

        // @todo decide what to do with float units

        var _x = options.x,
            _y = options.y,

            _width = (Math.abs(_x.end - _x.start) * _x.unit),
            _height = (Math.abs(_y.end - _y.start) * _y.unit),

            _xSubStepSize = (_width / ((Math.abs(_x.start - _x.end) / _x.step)) / _x.subStep),
            _ySubStepSize = (_height / ((Math.abs(_y.start - _y.end) / _y.step)) / _y.subStep),

            /** @type {String} Color of the grid's lines */
            _color = options.color,
            /** @type {Number} line weight of grid */
            _weight = options.weight,
            set = paper.set(),
            clickableArea,
            _borderBox = {},

            _xSnapToValues = [],
            _ySnapToValues = [],
            i;

        for (i = 0; i <= _width; i += _xSubStepSize) {
            _xSnapToValues.push(i + options.padding);
        }
        for (i = 0; i <= _height; i += _ySubStepSize) {
            _ySnapToValues.push(i + options.padding);
        }


        /**
         * Draw Axis on the paper according the configuration of the grid
         */
        function _drawAxis(){

            var xStyle = {
                'stroke' :  _x.color,
                'stroke-width': _x.weight
            };

            var yStyle = {
                'stroke' :  _y.color,
                'stroke-width': _y.weight
            };

            function drawXaxis(top, config){

                config = config || {};

                var line =  drawLine([0, top], [_width, top], config.style);

                var padding = options.padding,
                    position = 0,
                    fontSize = 10,
                    textTop,
                    text;

                if(config.labelOnTop){
                    textTop = top + padding - fontSize/2;
                }else{
                    textTop = top + padding + fontSize;
                }

                for(var i = _x.start; i <= _x.end ; i = i + _x.step){
                    text = paper.text(padding + position, textTop, i).attr({
                        'font-size' : fontSize
                    });
                    addCssClass(text, 'scene scene-text');
                    position += _x.unit * _x.step;
                }

                return line;
            }

            function drawYaxis(left, config){

                config = config || {};

                var line =  drawLine([left, _height], [left, 0], config.style);

                var padding = options.padding,
                    position = 0,
                    fontSize = 10,
                    textLeft,
                    text;

                if(config.labelOnRight){
                    textLeft = left + padding + fontSize/2;
                }else{
                    textLeft = left + padding - fontSize;
                }

                for(var i = _y.start; i <= _y.end ; i = i + _y.step){
                    text = paper.text(textLeft, padding + position, -i).attr({
                        'font-size' : fontSize
                    });
                    addCssClass(text, 'scene scene-text');
                    position += _y.unit * _y.step;
                }

                return line;
            }

            if((_y.start < 0) && (_y.end <= 0)){
                drawXaxis(_height, {style : xStyle});
            }else if((_y.start >= 0) && (_y.end > 0)){
                drawXaxis(0, {style : xStyle, labelOnTop : true});
            }else{
                drawXaxis(Math.abs(_y.start) * _y.unit, {style : xStyle});
            }

            if((_x.start < 0 ) && (_x.end <= 0)){
                drawYaxis(_width, {style : yStyle, labelOnRight:true});
            }else if((_x.start >= 0 ) && (_x.end > 0)){
                drawYaxis(0, {style : yStyle});
            }else{
                drawYaxis(Math.abs(_x.start) * _x.unit, {style : yStyle});
            }

        }

        function _drawGrid(){

            var style = {
                    'stroke': _color,
                    'stroke-width' : _weight
                };

            for(var y = 0; y <= _height; y += _y.step * _y.unit){
                drawLine([0, y], [_width, y], style);
            }
            // close the graph if uneven step/y axis
            if (Math.abs(_y.end - _y.start) % _y.step) {
                drawLine([0, _height], [_width, _height], style);
            }
            for(var x = 0; x <= _width; x += _x.step * _x.unit) {
                drawLine([x, 0], [x, _height], style);
            }
            // close the graph if uneven step/x axis
            if (Math.abs(_x.end - _x.start) % _x.step) {
                drawLine([_width, 0], [_width, _height], style);
            }
        }

        function _calculateBBox(){

            var x = options.padding,
                y = options.padding;

            _borderBox = {
                x : x,
                y : y,
                width : _width,
                height : _height,
                x2 : x+_width,
                y2 : y+_height
            };
        }
        var obj = {
            children : set,
            snapping : options.snapping || false,
            /**
             * Set _color value
             * @param {String} color
             */
            setColor : function(color){
                _color = String(color);
                set.remove().clear();
                this.render();
            },
            /**
             * Set _weight of the grid elements
             * @param {Number} value weight in px
             */
            setWeight : function(value){
                _weight = parseInt(value);
                set.remove().clear();
                this.render();
            },
            getX : function(){
                return _borderBox.x;
            },
            getY : function(){
                return _borderBox.y;
            },
            getBBox : function(){
                return _.clone(_borderBox);
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
             * Get the units size for x,y axis
             * @return {Object}
             */
            getUnitSizes : function(){
                return {x: _borderBox.width/_x.unit , y: _borderBox.height/_y.unit};
            },
            /**
             * Get the Raphaeljs paper object used for this grid
             *
             * @returns {Object} Raphaeljs paper object
             */
            getCanvas : function(){
                return paper;
            },
            /**
             * Get the position (top/left) of the origin of the cartesian axis relative to the paper
             *
             * @returns {Object}
             */
            getOriginPosition : function(){
                return {
                    left : options.padding - _x.start * _x.unit,
                    top : options.padding - _y.start * _y.unit
                };
            },
            getPostionFromCartesian : function(x,y){
                var origin = this.getOriginPosition();
                var unitSizes = this.getUnits();
                return {
                    left : origin.left + unitSizes.x * x,
                    top : origin.top - unitSizes.y * y
                };
            },
            /**
             * The the upper and lower bounds fof the grid on both axis
             *
             * @returns {Object}
             */
            getGridBounds : function(){
                return {
                    x : {
                        start : _x.start,
                        end : _x.end
                    },
                    y : {
                        start : _y.start,
                        end : _y.end
                    }
                };
            },
            /**
             * Rendering function
             */
            render : function(){
                _drawGrid();
                _drawAxis();
            },
            /**
             * @param {Number} x coordinate x to convert to snapped value
             * @param {Number} y  coordinate y to convert to snapped value
             * @return {Array} snapped values x,y
             */
            snap : function(x,y){
                x = paper.raphael.snapTo(_xSnapToValues, x, _xSubStepSize / 2);
                y = paper.raphael.snapTo(_ySnapToValues, y, _ySubStepSize / 2);
                return [x,y];
            },
            /**
             * Create a transparent rectangle object in front of every element
             * inside the set to gain clickability :add the interactive layer
             */
            clickable : function(){
                /** @type {Object} Rectangle Object to cover the all grid area */
                if(clickableArea){
                    clickableArea.remove();
                }
                clickableArea = paper.rect(_borderBox.x,_borderBox.y, _borderBox.width, _borderBox.height);
                clickableArea.attr({
                    fill : 'rgba(0,0,0,0)',
                    stroke : 0
                });
                set.push(clickableArea);
            },
            /**
             * Take the shape back to the interactive layer
             *
             * @param {Object} shape - a RaphaelJs Element
             */
            toBack : function(shape){
                if(clickableArea){
                    shape.insertBefore(clickableArea);
                }
            },
            /**
             * Bring the shape in front of the interactive layer
             *
             * @param {Object} shape - a RaphaelJs Element
             */
            toFront : function(shape){
                shape.toFront();
            }
        };

        _calculateBBox();
        obj.render();

        return obj;
    }

    return gridFactory;
});
