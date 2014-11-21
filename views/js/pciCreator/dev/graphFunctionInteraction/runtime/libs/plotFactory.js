define(['OAT/lodash', 'graphFunctionInteraction/runtime/libs/graphFunction'], function(_, graphFunction){
    
    'use strict';
    
    var _defaults = {
        start : -10,        //the starting abcisse in cartesian coordinate system
        end : 10,           //the end abcisse in cartesian coordinate system
        precision : 0.1,    //the precision of the plot (in cartesian coordinate)
        color : '#111',     //the color of the plot
        thickness : 3       //the thickness of the plot
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
            'stroke-width' : config.thickness ? config.thickness : _defaults.thickness
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

        var canvas = grid.getCanvas();
        var config = _.clone(config0);
        var _this;

        config.unitSize = grid.getUnitSize();
        config.origin = grid.getOriginPosition();

        function _plot(fnName, point1, point2, conf){
            var equation, plot;
            conf = _.defaults(conf || {}, config);

            equation = graphFunction[fnName].get(point1, point2);
            plot = graphFunction[fnName].plot(canvas, equation, conf);
            _applyStyle(plot, conf);

            return plot;
        }

        var availableFunctions = [
            'linear',
            'absolute',
            'cosine',
            'tangent',
            'exponential',
            'logarithmic',
            'quadartic'
        ];

        //add functions
        _.each(availableFunctions, function(fnName){
            _this['plot' + fnName.charAt(0) + fnName.substr(1)] = function(point1, point2, conf){
                return _plot(fnName, point1, point2, conf);
            };
        });

    }

    return PlotFactory;
});