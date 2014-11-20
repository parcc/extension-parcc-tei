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
                    path += 'M' + currentPosition.left + ' ' + currentPosition.top;

                }else{
                    //the very first point
                    prefix = 'M';
                }
            }
            path += prefix + newPosition.left + ' ' + newPosition.top;
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
                left : _round(x * config.unitSize.x + config.origin.x, 3),
                top : _round(-y * config.unitSize.y + config.origin.y, 3)
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
        get : function(vertex, point){

            if(checkPairOfPoints(vertex, point)){
                var a = (point.y - vertex.y) / Math.pow(point.x - vertex.x, 2);
                var b = -2 * a * vertex.x;
                var c = vertex.y + a * Math.pow(vertex.x, 2);
                return [a, b, c];
            }
        },
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
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2) &&
                point1.y > 0 &&
                point2.y > 0){

                var b = Math.log(point2.y / point1.y) / (point2.x - point1.x);
                var a = point1.y / Math.exp(b * point1.x);

                return [a, b];
            }
        },
        plot : function(canvas, equation, config){

            return plotCurvedEquation(canvas, equation, config, function(equation, x){

                var a = equation[0],
                    b = equation[1];

                return a * Math.exp(b * x);
            });
        }
    };

    var cosine = {
        get : function(start, inflection){

            if(checkPairOfPoints(start, inflection)){

                var d = inflection.y;
                var a = start.y - inflection.y;
                var b = Math.PI / (2 * (inflection.x - start.x));
                var c = -b * start.x;

                return [a, b, c, d];
            }
        },
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
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var b = Math.exp(point2.y / point1.y) / (point2.x - point1.x);

                if(b * point1.x > 0){
                    var a = point1.y / Math.log(b * point1.x);
                    return [a, b];
                }else{
                    throw 'invalid pair of points';
                }
            }
        },
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
        get : function(start, inflection){

            if(checkPairOfPoints(start, inflection)){

                var d = start.y;
                var b = Math.PI / (4 * (inflection.x - start.x));
                var c = -b * start.x;
                var a = (inflection.y - d) / Math.tan(b * inflection.x + c);

                return [a, b, c, d];
            }

        },
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
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var a = (point2.y - point1.y) / (point2.x - point1.x);
                var b = point1.y - a * point1.x;
                return [a, b];
            }

        },
        plot : function(canvas, equation, config){

            function calc(equation, x){

                var a = equation[0],
                    b = equation[1];

                return a * x + b;
            }

            var startPosition = {
                left : _round(config.start * config.unitSize.x + config.origin.x, 3),
                top : _round(-calc(equation, config.start) * config.unitSize.y + config.origin.y, 3)
            };
            var endPosition = {
                left : _round(config.end * config.unitSize.x + config.origin.x, 3),
                top : _round(-calc(equation, config.end) * config.unitSize.y + config.origin.y, 3)
            };

            var path = 'M' + startPosition.left + ' ' + startPosition.top + 'L' + endPosition.left + ' ' + endPosition.top;
            return canvas.path(path);
        }
    };

    var absolute = {
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var a = (point2.y - point1.y) / Math.abs(point2.x - point1.x);
                var b = -point1.x;
                var c = point1.y;
                return [a, b, c];
            }
        }, plot : function(canvas, equation, config){

            function calc(equation, x){

                var a = equation[0],
                    b = equation[1],
                    c = equation[2];

                return a * Math.abs(x + b) + c;
            }

            var startPosition = {
                left : _round(config.start * config.unitSize.x + config.origin.x, 3),
                top : _round(-calc(equation, config.start) * config.unitSize.y + config.origin.y, 3)
            };
            var middlePosition = {
                left : _round(-equation[1] * config.unitSize.x + config.origin.x, 3),
                top : _round(-calc(equation, -equation[1]) * config.unitSize.y + config.origin.y, 3)
            };
            var endPosition = {
                left : _round(config.end * config.unitSize.x + config.origin.x, 3),
                top : _round(-calc(equation, config.end) * config.unitSize.y + config.origin.y, 3)
            };

            var path = 'M' + startPosition.left + ' ' + startPosition.top
                + 'L' + middlePosition.left + ' ' + middlePosition.top
                + 'L' + endPosition.left + ' ' + endPosition.top;

            return canvas.path(path);
        }
    }

    return {
        checkPairOfPoints : checkPairOfPoints,
        linear : linear,
        absolute : absolute,
        quadratic : quadratic,
        exponential : exponential,
        logarithmic : logarithmic,
        cosine : cosine,
        tangent : tangent
    };

});