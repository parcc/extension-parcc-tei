define(['OAT/lodash'], function( _ ){

    'use strict';

    function gridFactory(paper,rawOptions){

        if (typeof rawOptions.x !== 'object' && typeof rawOptions.y !== 'object'){
            throw 'I need x and y axis';
        }

        if ( (rawOptions.x.start >= rawOptions.x.end) || (rawOptions.y.start >= rawOptions.y.end) ) {
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
                'M'+(_padding.left+start[0])+' '+(_padding.top+start[1])+
                'L'+(_padding.left+end[0])+' '+(_padding.top+end[1])).attr(style);
            addCssClass(path, 'scene scene-grid');
            return path;
        }

        function drawTitle(text, style, x, y, angle) {
            var textElement = paper.text(x, y, text).attr(style);

            if (angle) {
                textElement.rotate(angle, x, y);
            }
        }

        function buildOptions(rawOptions) {
            var lineColor = '#222';

            var options = _.merge({},{
                graphTitle : null,
                graphTitleRequired : false, // unused for now
                graphTitleSize : 24, // pixels
                graphTitlePadding : 36, // pixels
                color : lineColor,
                weight : 1, // inner grid weight
                labelSize : 14, // pixels
                labelPadding : 28, // pixels
                padding : 20, // pixels
                height: null, // grid size in pixels
                width: null, // grid size in pixels
                x : {
                    start : -10, // cartesian start
                    end :  10, // cartesian end
                    label : null,
                    step : 1, // cartesian step
                    subStep : 1,  // snapping divisions inside step
                    unit : 10, // number of pixels for a cartesian unit
                    color : lineColor,
                    weight : 3 // axis weight
                },
                y : {
                    start : -10,
                    end :  10,
                    label : null,
                    step : 1,
                    subStep : 1,
                    unit : 10,
                    color : lineColor,
                    weight : 3
                }
            },rawOptions);

            // if defined, width and height takes precedence over units
            if (options.width) {
                options.x.unit = (options.width / Math.abs(options.x.end - options.x.start)).toPrecision(2);
            }
            if (options.height) {
                options.y.unit = (options.height / Math.abs(options.y.end - options.y.start)).toPrecision(2);
            }
            return options;
        }

        var options = buildOptions(rawOptions),

            _x = options.x,
            _y = options.y,

            _xRange = Math.abs(_x.end - _x.start),
            _yRange = Math.abs(_y.end - _y.start),

            _width = _xRange * _x.unit,
            _height = _yRange * _y.unit,

            _xSubStepSize = ((_width / (_xRange / _x.step)) / _x.subStep),
            _ySubStepSize = ((_height / (_yRange / _y.step)) / _y.subStep),

            _color = options.color,
            _weight = options.weight,

            _labelPositions = _getLabelsPosition(),
            _padding = _getPadding(),
            _labelCoords = _getLabelsCoords(),
            _snapToValues = _getSnapToValues(),

            clickableArea,
            set = paper.set(),
            _borderBox = {};

        function _getLabelsPosition() {
            var xQuadrants = (_x.start < 0 && _x.end > 0) ? 2 : 1,
                yQuadrants = (_y.start < 0 && _y.end > 0) ? 2 : 1,
                gridType = (xQuadrants === 1 && yQuadrants === 1) ? "oneQuadrant" : "coordinates",
                labelPositions = {};

            if (gridType === "oneQuadrant") {
                if (_x.label) {
                    if (_y.start < 0) {
                        labelPositions.abs = "bottom";
                    } else {
                        labelPositions.abs = "top";
                    }
                }
                if (_y.label) {
                    if (_x.start >= 0) {
                        labelPositions.ord = "left";
                    } else {
                        labelPositions.ord = "right";
                    }
                }
            // coordinates
            } else {
                if (_x.label) {
                    labelPositions.abs = "right";
                }
                if (_y.label) {
                    labelPositions.ord = "top";
                }
            }
            return labelPositions;
        }

        function _getPadding() {
            var padding = {
                top: options.padding,
                left: options.padding
            };

            if (options.graphTitle) {
                padding.top += options.graphTitlePadding;
            }

            if (_labelPositions.abs === "top" || _labelPositions.ord === "top") {
                padding.top += options.labelPadding;
            }
            if (_labelPositions.abs === "left" || _labelPositions.ord === "left") {
                padding.left += options.labelPadding;
            }
            return padding;
        }

        function _getLabelsCoords() {
            var labelsCoords = {
                    abs: {},
                    ord: {}
                };

            if (_labelPositions.abs === "right") {
                labelsCoords.abs.x = _width + options.labelPadding;
                labelsCoords.abs.angle = -90;

                // align abs label on its axis
                if (_y.start < 0 && _y.end > 0) {
                    labelsCoords.abs.y = -1 * _y.start * _y.unit; // two y quadrants
                } else {
                    labelsCoords.abs.y = (_y.start >= 0) ? 0 : _height;  // one y quadrant
                }
            } else {
                labelsCoords.abs.x = _width / 2;
                labelsCoords.abs.angle = 0;

                if (_labelPositions.abs === "bottom") {
                    labelsCoords.abs.y = _height + options.labelPadding;
                } else if (_labelPositions.abs === "top") {
                    labelsCoords.abs.y = -options.labelPadding;
                }
            }

            if (_labelPositions.ord === "top") {
                labelsCoords.ord.y = -options.labelPadding;
                labelsCoords.ord.angle = 0;

                // align ord label on its axis
                if (_x.start < 0 && _x.end > 0) {
                    labelsCoords.ord.x = -1 * _x.start * _x.unit; // two x quadrants
                } else {
                    labelsCoords.ord.x = (_x.start >= 0) ? 0 : _width; // one x quadrant
                }
            } else {
                labelsCoords.ord.y = _height / 2;
                labelsCoords.ord.angle = -90;

                if (_labelPositions.ord === "left") {
                    labelsCoords.ord.x = -options.labelPadding;
                } else if (_labelPositions.ord === "right") {
                    labelsCoords.ord.x = _width + options.labelPadding;
                }
            }
            return labelsCoords;
        }

        function _getSnapToValues() {
            var snapToValues = {
                    x: [],
                    y: []
                },
                xStepSize = (_width / (_xRange / _x.step)),
                yStepSize = (_height / (_yRange / _y.step)),
                snapValue,
                i, j;

            // use a nested loop to avoid accumulating rounding error
            for (i = 0; i <= _width; i += xStepSize) {
                for(j = 0; j < xStepSize; j += _xSubStepSize) {
                    snapValue = i + j;
                    if (snapValue <= _width) {
                        snapToValues.x.push(snapValue + _padding.left);
                    }
                }
            }
            for (i = 0; i <= _height; i += yStepSize) {
                for(j = 0; j < yStepSize; j += _ySubStepSize) {
                    snapValue = i + j;
                    if (snapValue <= _height) {
                        snapToValues.y.push(snapValue + _padding.top);
                    }
                }
            }
            return snapToValues;
        }

        function _drawGraphTitle() {
            var x = _padding.left + _width / 2,
                y = options.padding + options.graphTitlePadding / 2,
                style = {
                    'font-size' : options.graphTitleSize,
                    'font-weight' : 'bold'
                };

            if (options.graphTitle) {
                drawTitle(options.graphTitle, style, x, y);
            }
        }

        function _drawAxis(){

            var xStyle = {
                    'stroke' :  _x.color,
                    'stroke-width': _x.weight
                },
                yStyle = {
                    'stroke' :  _y.color,
                    'stroke-width': _y.weight
                },
                labelStyle = {
                    'font-size' : options.labelSize,
                    'font-weight' : 'bold'
                };

            function drawXaxis(top, config){

                config = config || {};

                var line =  drawLine([0, top], [_width, top], config.style);

                var position = 0,
                    fontSize = 10,
                    textTop,
                    text;

                if(config.unitsOnTop){
                    textTop = top + _padding.top - fontSize/2;
                }else{
                    textTop = top + _padding.top + fontSize;
                }

                for(var i = _x.start; i <= _x.end ; i = i + _x.step){
                    text = paper.text(_padding.left + position, textTop, i).attr({
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
                    textLeft = left + _padding.left + fontSize/2;
                }else{
                    textLeft = left + _padding.left - fontSize;
                }

                for(var i = _y.start; i <= _y.end ; i = i + _y.step){
                    text = paper.text(textLeft, _padding.top + position, -i).attr({
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
                drawTitle(
                    _x.label,
                    labelStyle,
                    _padding.left + _labelCoords.abs.x,
                    _padding.top + _labelCoords.abs.y,
                    _labelCoords.abs.angle);
            }
            if (_y.label) {
                drawTitle(
                    _y.label,
                    labelStyle,
                    _padding.left + _labelCoords.ord.x,
                    _padding.top + _labelCoords.ord.y,
                    _labelCoords.ord.angle);
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

            var x = _padding.left,
                y = _padding.top;

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
             * Get the subStep size for x,y axis
             * @return {Object}
             */
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
                    left : _padding.left - _x.start * _x.unit,
                    top : _padding.top - _y.start * _y.unit
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
                _drawGraphTitle();
            },
            /**
             * @param {Number} x coordinate x to convert to snapped value
             * @param {Number} y  coordinate y to convert to snapped value
             * @return {Array} snapped values x,y
             */
            snap : function(x,y){
                x = paper.raphael.snapTo(_snapToValues.x, x, _xSubStepSize / 2);
                y = paper.raphael.snapTo(_snapToValues.y, y, _ySubStepSize / 2);
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
            /**
             *
             */
        };

        _calculateBBox();
        obj.render();

        return obj;
    }

    return gridFactory;
});
