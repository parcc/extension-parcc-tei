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
            var path = paper.path(
                'M'+(_paddingLeft+start[0])+' '+(_paddingTop+start[1])+
                'L'+(_paddingLeft+end[0])+' '+(_paddingTop+end[1])).attr(style);
            addCssClass(path, 'scene scene-grid');
            return path;
        }

        var lineColor = '#222';

        // @todo describe options
        options = _.merge({},{
            color : lineColor,
            weight : 1,
            labelSize : 14,
            labelPadding : 28,
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

        var _x = options.x,
            _y = options.y,

            _xRange = Math.abs(_x.end - _x.start),
            _yRange = Math.abs(_y.end - _y.start),

            _width = _xRange * _x.unit,
            _height = _yRange * _y.unit,

            _xSubStepSize = (_width / ((_xRange / _x.step)) / _x.subStep),
            _ySubStepSize = (_height / ((_yRange / _y.step)) / _y.subStep),

            _xQuadrants = (_x.start < 0 && _x.end > 0) ? 2 : 1,
            _yQuadrants = (_y.start < 0 && _y.end > 0) ? 2 : 1,
            _graphType = (_xQuadrants === 1 && _yQuadrants === 1) ? "oneQuadrant" : "coordinates",

            _color = options.color,
            _weight = options.weight,

            _xSnapToValues = [],
            _ySnapToValues = [],

            _paddingTop = options.padding,
            _paddingRight = options.padding,
            _paddingBottom = options.padding,
            _paddingLeft = options.padding,

            _xLabelX,
            _xLabelY,
            _xLabelAngle,
            _yLabelX,
            _yLabelY,
            _yLabelAngle,

            clickableArea,
            set = paper.set(),
            _borderBox = {};

        // compute margins according to graph type and label
        if (_graphType === "oneQuadrant") {
            if (_x.label) {
                if (_y.start < 0) {
                    _paddingBottom += options.labelPadding; // x label on bottom
                } else {
                    _paddingTop += options.labelPadding;    // x label on top
                }
            }
            if (_y.label) {
                if (_x.start >= 0) {
                    _paddingLeft += options.labelPadding;   // y label on left
                } else {
                    _paddingRight += options.labelPadding;  // y label on right
                }
            }
        } else {
            if (_x.label) {
                _paddingTop += options.labelPadding;        // x label on top
            }
            if (_y.label) {
                _paddingRight += options.labelPadding;      // y label on right
            }
        }

        // we cannot compute the following before having all the paddings...
        if (_graphType === "oneQuadrant") {
            if (_y.start < 0) {
                _xLabelY = _paddingTop + _height + _paddingBottom / 2; // x label on bottom
            } else {
                _xLabelY = _paddingTop / 2; // x label on top
            }
            _xLabelX = _paddingLeft + _width / 2;
            _xLabelAngle = 0;

            if (_x.start >= 0) {
                _yLabelX = options.padding; // y label on left
            } else {
                _yLabelX = _paddingLeft + _width + _paddingRight / 2; // y label on right
            }
            _yLabelY = _paddingTop + _height / 2;
            _yLabelAngle = -90;

        } else {
            // coordinates: always on top and on the right
            var yOrigin;
            if (_yQuadrants == 2) {
                yOrigin = -1 * _y.start * _y.unit;
            } else {
                if (_y.start >= 0) {
                    yOrigin = 0;
                } else {
                    yOrigin = _height;
                }
            }
            _xLabelX = _paddingLeft + _width + _paddingRight / 2;
            _xLabelY = _paddingTop + yOrigin;
            _xLabelAngle = -90;

            var xOrigin;
            if (_xQuadrants == 2) {
                xOrigin = -1 * _x.start * _x.unit;
            } else {
                if (_x.start >= 0) {
                    xOrigin = 0;
                } else {
                    xOrigin = _width;
                }
            }
            _yLabelX = _paddingLeft + xOrigin;
            _yLabelY = options.padding + options.labelPadding / 2;
            _xLabelAngle = 0;

        }

        // compute useful values for rendering
        for (var i = 0; i <= _width; i += _xSubStepSize) {
            _xSnapToValues.push(i + _paddingLeft);
        }
        for (i = 0; i <= _height; i += _ySubStepSize) {
            _ySnapToValues.push(i + _paddingTop);
        }


        /**
         * Draw Axis on the paper according the configuration of the grid
         */
        function _drawAxis(){

            var xStyle = {
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight
                },
                yStyle = {
                    'stroke' :  _y.color,
                    'stroke-width': _y.weight
                };

            function drawAxisLabel(x, y, text, angle) {
                var style = {
                        'font-size' : options.labelSize,
                        'font-weight' : 'bold'
                    },
                    textElement = paper.text(x, y, text).attr(style);

                if (angle) {
                    textElement.rotate(angle, x, y);
                }
            }

            function drawXaxis(top, config){

                config = config || {};

                var line =  drawLine([0, top], [_width, top], config.style);

                var position = 0,
                    fontSize = 10,
                    textTop,
                    text;

                if(config.unitsOnTop){
                    textTop = top + _paddingTop - fontSize/2;
                }else{
                    textTop = top + _paddingTop + fontSize;
                }

                for(var i = _x.start; i <= _x.end ; i = i + _x.step){
                    text = paper.text(_paddingLeft + position, textTop, i).attr({
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

                var position = 0,
                    fontSize = 10,
                    textLeft,
                    text;

                if(config.unitsOnRight){
                    textLeft = left + _paddingLeft + fontSize/2;
                }else{
                    textLeft = left + _paddingLeft - fontSize;
                }

                for(var i = _y.start; i <= _y.end ; i = i + _y.step){
                    text = paper.text(textLeft, _paddingTop + position, -i).attr({
                        'font-size' : fontSize
                    });
                    addCssClass(text, 'scene scene-text');
                    position += _y.unit * _y.step;
                }

                return line;
            }

            // top quadrant only
            if((_y.start < 0) && (_y.end <= 0)){
                drawXaxis(_height, {style : xStyle});
            // bottom quadrant only
            }else if((_y.start >= 0) && (_y.end > 0)){
               drawXaxis(0, {style : xStyle, unitsOnTop : true});
            // both quadrants
            }else{
                drawXaxis(Math.abs(_y.start) * _y.unit, {style : xStyle});
            }

            // left quadrant only
            if((_x.start < 0 ) && (_x.end <= 0)){
                drawYaxis(_width, {style : yStyle, unitsOnRight:true});
            // right quadrant only
            }else if((_x.start >= 0 ) && (_x.end > 0)){
                drawYaxis(0, {style : yStyle});
            // both quadrants
            }else{
                drawYaxis(Math.abs(_x.start) * _x.unit, {style : yStyle});
            }

            if (_x.label) {
                drawAxisLabel(_xLabelX, _xLabelY, _x.label, _xLabelAngle);
            }
            if (_y.label) {
                drawAxisLabel(_yLabelX, _yLabelY, _y.label, _yLabelAngle);
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

            var x = _paddingLeft,
                y = _paddingTop;

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
            getSubStepSizes: function(){
                return {x: _xSubStepSize, y: _ySubStepSize};
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
                    left : _paddingLeft - _x.start * _x.unit,
                    top : _paddingTop - _y.start * _y.unit
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
