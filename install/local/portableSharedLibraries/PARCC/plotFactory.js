define(['OAT/lodash', 'PARCC/graphFunction'], function(_, graphFunction){

    'use strict';

    var _defaults = {
        start : -10, //the starting abcisse in cartesian coordinate system
        end : 10, //the end abcisse in cartesian coordinate system
        precision : .01, //the precision of the plot (in cartesian coordinate)
        opacity : .8, //the opacity of the plot
        color : '#bb1a2a', //the color of the plot
        thickness : 3     //the thickness of the plot
    };

    /**
     * Apply relevant stroke attribute from config on a Raphaeljs path
     * 
     * @param {Object} path - Raphaeljs Path
     * @param {Object} config
     * @returns {undefined}
     */
    function _applyStyle(path, config){
        path.attr({
            stroke : config.color ? config.color : _defaults.color,
            'stroke-width' : config.thickness ? config.thickness : _defaults.thickness,
            opacity : config.opacity ? config.opacity : _defaults.opacity
        });
    }

    /**
     * Create a new plot factory for a grid
     * 
     * Usage:
     * var myPlotFactory = new PlotFactory(myGrid, myCOnfig);
     * myPlotFactory.plotLinear({x : 4, y : 0}, {x : 0, y : 4});
     * 
     * @param {Object} grid - a grid build from the gridFactory
     * @param {type} config - the plot factory configuration
     * @param {Integer} [config.start = -10] - the starting abcisse in cartesian coordinate system
     * @param {Integer} [config.end = 10] - the end abcisse in cartesian coordinate system
     * @param {Float} [config.precision = .01] - the precision of the plot (in cartesian coordinate)
     * @param {String} [config.color = .01] - the color of the plot
     * @param {Integer} [config.thickness = 3] - the thickness of the plot
     * @returns {Object} A new instance of PlotFactory
     */
    function PlotFactory(grid, config0){

        var _this = this;
        var canvas = grid.getCanvas();
        var config = _.clone(config0 || {});
        config = _.defaults(config, _defaults);
        var bounds = grid.getGridBounds();

        config.unitSize = grid.getUnitSizes();
        config.origin = grid.getOriginPosition();

        config.start = bounds.x.start;
        config.end = bounds.x.end;

        function _translateCoordinate(point){

            return {
                x : (point.getX() - config.origin.left) / config.unitSize.x,
                y : -(point.getY() - config.origin.top) / config.unitSize.y
            };
        }

        function _plot(fnName, p1, p2, conf){

            var equation, plot;
            var point1 = _translateCoordinate(p1);
            var point2 = _translateCoordinate(p2);

            conf = _.defaults(conf || {}, config);
            try{
                equation = graphFunction[fnName].get(point1, point2);
                if(equation){
                    plot = graphFunction[fnName].plot(canvas, equation, conf);
                    _applyStyle(plot, conf);
                    return plot;
                }
            }catch(e){
                console.log(e);
            }

            return false;
        }

        var availableFunctions = [
            'linear',
            'absolute',
            'cosine',
            'tangent',
            'exponential',
            'logarithmic',
            'quadratic'
        ];

        //add functions
        _.each(availableFunctions, function(fnName){
            _this[PlotFactory.getPlotName(fnName)] = function(point1, point2, conf){
                return _plot(fnName, point1, point2, conf);
            };
        });

    }

    PlotFactory.getPlotName = function(mathFunctionName){
        return 'plot' + mathFunctionName.charAt(0).toUpperCase() + mathFunctionName.substr(1);
    };
    
    return PlotFactory;
});