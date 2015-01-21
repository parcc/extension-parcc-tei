define(['OAT/lodash'], function(_){

    'use strict';

    /**
     * Round the given number to a specific decimal
     * 
     * @param {Float} number
     * @param {Integer} decimal
     * @returns {Number}
     */
    function _round(number, decimal){
        var m = Math.pow(10, parseInt(decimal));
        return Math.round(number * m) / m;
    }

    /**
     * Check if the argument is a correct point object
     * 
     * @param {Object} point
     * @returns {Boolean}
     */
    function _isPoint(point){
        return point.x !== undefined && point.y !== undefined;
    }

    /**
     * Check if the pair of object are correct pair of points for equation evaluation
     * 
     * @param {Object} point1
     * @param {Object} point2
     * @returns {Boolean}
     */
    function checkPairOfPoints(point1, point2){
        return _isPoint(point1) && _isPoint(point2) && point1.x !== point2.x
    }

    /**
     * Plot a curved function based on its equation and plotting algorithm
     * 
     * @param {Object} canvas - Raphaeljs object
     * @param {Array} equation
     * @param {Object} config
     * @param {Function} calc
     * @returns {Object} Raphaeljs path object
     */
    function plotCurvedEquation(canvas, equation, config, calc){

        var x = config.start;
        var y;
        var margin = 100;
        var topMin = -margin;
        var topMax = canvas.height + margin;
        var currentPosition;
        var newPosition;
        var path = '';
        var pathMove = true;
        var prefix = '';

        /**
         * Stop drawing and continue later
         * 
         * @returns {undefined}
         */
        function jump(){
            x += config.precision;
            pathMove = true;
        }

        /**
         * Get the postion top value according to canvas size limitation
         *
         * @param {Number} top
         * @returns {Number}
         */
        function getBoundedTop(top){
            if(top < topMin){
                return topMin;
            }else if(top > topMax){
                return topMax;
            }else{
                return top;
            }
        }

        /**
         * Add the new position to the path
         * e.g. {left:250, top:150}
         * The position is relative to the canvas origin
         * 
         * @param {Object} newPosition
         * @returns {undefined}
         */
        function appendPath(newPosition){
            prefix = 'L';
            if(pathMove){
                pathMove = false;//after move, we draw a line
                if(currentPosition){
                    //need to draw slightly beyond the canvas to prevent from the "cut" effect
                    path += 'M' + currentPosition.left + ' ' + getBoundedTop(currentPosition.top);
                }else{
                    //the very first point
                    prefix = 'M';
                }
            }
            path += prefix + newPosition.left + ' ' + getBoundedTop(newPosition.top);
        }

        while(x < config.end){

            y = calc(equation, x);
            if(y === false){
                //undefined function value for this value of x
                jump();
                continue;
            }

            //new position (pixels)
            newPosition = {
                left : _round(x * config.unitSize.x + config.origin.left, 3),
                top : _round(-y * config.unitSize.y + config.origin.top, 3)
            };

            if(newPosition.top > canvas.height + margin || newPosition.top < -margin){
                //need to draw slightly beyond the canvas to prevent from the "cut" effect
                appendPath(newPosition);
                currentPosition = false;

                //stop plotting ouside of the canvas
                jump();
                continue;
            }

            //translate new point into path segment
            appendPath(newPosition);
            currentPosition = newPosition;

            //update x for the next step:
            x += config.precision;
        }

        //return the raphael "path" object
        return canvas.path(path);
    }


    var quadratic = {
        /**
         * Get quadratic function from the vertex and another point
         * The returned equation is under the format [a, b, c]
         * which represents f(x) = ax² + bx + c;
         * 
         * @param {Object} vertex
         * @param {Object} point
         * @returns {Array}
         */
        get : function(vertex, point){

            if(checkPairOfPoints(vertex, point)){
                var a = (point.y - vertex.y) / Math.pow(point.x - vertex.x, 2);
                var b = -2 * a * vertex.x;
                var c = vertex.y + a * Math.pow(vertex.x, 2);
                return [a, b, c];
            }
        },
        /**
         * Plot a quadratic function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1],
                    c = equation[2];

                return a * Math.pow(x, 2) + b * x + c;
            });
        }
    };

    var exponential = {
        /**
         * Get exponential function from any two points with positive ordinates
         * The returned equation is under the format [a, b]
         * which represents f(x) = a * e^( bx );
         * 
         * @param {Object} point1
         * @param {Object} point2
         * @returns {Array}
         */
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2) &&
                point1.y * point2.y > 0){

                var b = Math.log(point2.y / point1.y) / (point2.x - point1.x);
                var a = point1.y / Math.exp(b * point1.x);

                return [a, b];
            }
        },
        /**
         * Plot an exponential function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1];

                return a * Math.exp(b * x);
            });
        }
    };

    var cosine = {
        /**
         * Get a cosine function from the starting point and the first inflection point
         * The returned equation is under the format [a, b, c, d]
         * which represents f(x) = a * cos( bx + c ) + d;
         * 
         * @param {Object} start
         * @param {Object} inflection
         * @returns {Array}
         */
        get : function(start, inflection){

            if(checkPairOfPoints(start, inflection)){

                var d = inflection.y;
                var a = start.y - inflection.y;
                var b = Math.PI / (2 * (inflection.x - start.x));
                var c = -b * start.x;

                return [a, b, c, d];
            }
        },
        /**
         * Plot a cosine function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1],
                    c = equation[2],
                    d = equation[3];

                return a * Math.cos(b * x + c) + d;

            });
        }
    }

    var logarithmic = {
        /**
         * Get logarithmic function from any two points
         * The returned equation is under the format [a, b]
         * which represents f(x) = a * ln( bx );
         * 
         * @param {Object} point1
         * @param {Object} point2
         * @returns {Array}
         */
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)
                && point1.y !== point2.y
                && point2.x * point1.x > 0){

                var a = (point2.y - point1.y) / Math.log(point2.x / point1.x);
                var b = Math.exp(point1.y / a) / point1.x;
                return [a, b];
            }

            return false;
        },
        /**
         * Plot a logarithmic function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1];

                if(b * x > 0){
                    return a * Math.log(b * x);
                }else{
                    return false;//undefined funciton value for this value of x
                }

            });
        }
    };

    var tangent = {
        /**
         * Get a tangent function from the starting point and the first inflection point
         * The returned equation is under the format [a, b, c, d]
         * which represents f(x) = a * tan( bx + c ) + d;
         * 
         * @param {Object} start
         * @param {Object} inflection
         * @returns {Array}
         */
        get : function(start, inflection){

            if(checkPairOfPoints(start, inflection)){

                var d = start.y;
                var b = Math.PI / (4 * (inflection.x - start.x));
                var c = -b * start.x;
                var a = (inflection.y - d) / Math.tan(b * inflection.x + c);

                return [a, b, c, d];
            }

        },
        /**
         * Plot a tangent function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1],
                    c = equation[2],
                    d = equation[3];

                return a * Math.tan(b * x + c) + d;

            });
        }
    };

    var linear = {
        /**
         * Get linear function from any two points
         * The returned equation is under the format [a, b]
         * which represents f(x) = ax+b;
         * 
         * @param {Object} point1
         * @param {Object} point2
         * @returns {Array}
         */
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var a = (point2.y - point1.y) / (point2.x - point1.x);
                var b = point1.y - a * point1.x;
                return [a, b];
            }

        },
        /**
         * Plot a linear function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){
            
            function calc(equation, x){

                var a = equation[0],
                    b = equation[1];

                return a * x + b;
            }

            var startPosition = {
                left : _round(config.start * config.unitSize.x + config.origin.left, 3),
                top : _round(-calc(equation, config.start) * config.unitSize.y + config.origin.top, 3)
            };
            var endPosition = {
                left : _round(config.end * config.unitSize.x + config.origin.left, 3),
                top : _round(-calc(equation, config.end) * config.unitSize.y + config.origin.top, 3)
            };

            var path = 'M' + startPosition.left + ' ' + startPosition.top + 'L' + endPosition.left + ' ' + endPosition.top;
            return canvas.path(path);
        }
    };

    var absolute = {
        /**
         * Get absolute function from the start point and another point
         * The returned equation is under the format [a, b, c]
         * which represents f(x) = a|x+b|+c;
         * 
         * @param {Object} start
         * @param {Object} point2
         * @returns {Array}
         */
        get : function(start, point2){

            if(checkPairOfPoints(start, point2)){

                var a = (point2.y - start.y) / Math.abs(point2.x - start.x);
                var b = -start.x;
                var c = start.y;
                return [a, b, c];
            }
        },
        /**
         * Plot an absolute function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            function calc(equation, x){

                var a = equation[0],
                    b = equation[1],
                    c = equation[2];

                return a * Math.abs(x + b) + c;
            }

            var startPosition = {
                left : _round(config.start * config.unitSize.x + config.origin.left, 3),
                top : _round(-calc(equation, config.start) * config.unitSize.y + config.origin.top, 3)
            };
            var middlePosition = {
                left : _round(-equation[1] * config.unitSize.x + config.origin.left, 3),
                top : _round(-calc(equation, -equation[1]) * config.unitSize.y + config.origin.top, 3)
            };
            var endPosition = {
                left : _round(config.end * config.unitSize.x + config.origin.left, 3),
                top : _round(-calc(equation, config.end) * config.unitSize.y + config.origin.top, 3)
            };

            var path = 'M' + startPosition.left + ' ' + startPosition.top
                + 'L' + middlePosition.left + ' ' + middlePosition.top
                + 'L' + endPosition.left + ' ' + endPosition.top;

            return canvas.path(path);
        }
    }

    var vertical = {
        /**
         * Get vertical line equation passing by a point
         * The returned equation is under the format [a]
         * which represents x = a;
         * 
         * @param {Object} point
         * @returns {Array}
         */
        get : function(point){
            if(point.x !== undefined){
                return [point.x];
            }
        },
        /**
         * Plot an absolute function from its equation
         * 
         * @param {Object} canvas - RaphaelJs paper
         * @param {Array} equation
         * @param {Object} config
         * @returns {Object} RaphaelJs path
         */
        plot : function(canvas, equation, config){

            var x = equation[0] * config.unitSize.x + config.origin.left;
            var yStart = -config.start_y * config.unitSize.y + config.origin.top;
            var yEnd = -config.end_y * config.unitSize.y + config.origin.top;
            var path = 'M' + x + ' ' + yStart + 'L' + x + ' ' + yEnd;
            
            return canvas.path(path);
        }
    };

    return {
        checkPairOfPoints : checkPairOfPoints,
        linear : linear,
        absolute : absolute,
        quadratic : quadratic,
        exponential : exponential,
        logarithmic : logarithmic,
        cosine : cosine,
        tangent : tangent,
        vertical : vertical
    };

});