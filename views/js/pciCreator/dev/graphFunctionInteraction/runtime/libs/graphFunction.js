define(['OAT/lodash'], function(_){

    'use strict';

    function _round(number, decimal){
        var m = Math.pow(10, parseInt(decimal));
        return Math.round(number * m) / m;
    }

    function isPoint(point){
        return point.x !== undefined && point.y !== undefined;
    }

    function checkPairOfPoints(point1, point2){
        return isPoint(point1) && isPoint(point2) && point1.x !== point2.x
    }

    function plotCurvedEquation(canvas, equation, config, calc){

        var x = config.start;
        var y;
        var margin = 100;
        var currentPosition;
        var newPosition;
        var path = '';
        var pathMove = true;
        var prefix = '';

        function jump(){
            x += config.precision;
            pathMove = true;
        }

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
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var d = point2.y;
                var a = point1.y - point2.y;
                var b = Math.PI / (2 * (point2.x - point1.x));
                var c = -b * point1.x;

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
        get : function(point1, point2){

            if(checkPairOfPoints(point1, point2)){

                var d = point1.y;
                var b = Math.PI / (4 * (point2.x - point1.x));
                var c = -b * point1.x;
                var a = (point2.y - d) / Math.tan(b * point2.x + c);

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
        linear : linear,
        absolute : absolute,
        quadratic : quadratic,
        exponential : exponential,
        logarithmic : logarithmic,
        cosine : cosine,
        tangent : tangent
    };

});