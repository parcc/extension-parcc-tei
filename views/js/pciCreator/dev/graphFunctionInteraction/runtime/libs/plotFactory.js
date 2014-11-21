define(['OAT/lodash', 'graphFunctionInteraction/runtime/libs/graphFunction'], function(_, graphFunction){

    var _defaultStyle = {
        stroke : '#111',
        'stroke-width' : 3
    };

    function _applyStyle(path, config){
        path.attr({
            stroke : config.stroke ? config.stroke : _defaultStyle.stroke,
            'stroke-width' : config['stroke-width'] ? config['stroke-width'] : _defaultStyle['stroke-width']
        });
    }

    function plotLinear(grid, point1, point2, config){
        var equation = graphFunction.quadratic.get(point1, point2);
        var plot = graphFunction.quadratic.plot(grid.getCanvas(), equation, config);
        _applyStyle(plot, config)
        return plot;
    }

    function plotAbsolute(grid, start, point2, config){
        var equation = graphFunction.quadratic.get(start, point2);
        var plot = graphFunction.quadratic.plot(grid.getCanvas(), equation, config);
        _applyStyle(plot, config)
        return plot;
    }

    function plotQuadratic(grid, vertex, point2, config){
        var equation = graphFunction.quadratic.get(vertex, point2);
        var plot = graphFunction.quadratic.plot(grid.getCanvas(), equation, config);
        _applyStyle(plot, config)
        return plot;
    }

    function plotCosine(grid, start, inflection, config){
        var equation = graphFunction.quadratic.get(start, inflection);
        var plot = graphFunction.quadratic.plot(grid.getCanvas(), equation, config);
        _applyStyle(plot, config)
        return plot;
    }

    function plotExponential(grid, point1, point2, config){
        var equation = graphFunction.exponential.get(point1, point2);
        var conf = _.clone(config);
        if(conf.precision > 0.1){
            conf.precision = 0.01;
        }
        var plot = graphFunction.exponential.plot(grid.getCanvas(), equation, conf);
        _applyStyle(plot, config);
        return plot;
    }

    function plotLogarithmic(grid, point1, point2, config){
        var equation = graphFunction.logarithmic.get(point1, point2);
        var conf = _.clone(config);
        if(conf.precision > 0.1){
            conf.precision = 0.01;
        }
        var plot = graphFunction.logarithmic.plot(grid.getCanvas(), equation, conf);
        _applyStyle(plot, config)
        return plot;
    }

    function plotTangent(grid, start, inflection, config){
        var equation = graphFunction.tangent.get(start, inflection);
        var conf = _.clone(config);
        if(conf.precision > 0.1){
            conf.precision = 0.01;
        }
        var plot = graphFunction.tangent.plot(grid.getCanvas(), equation, conf);
        _applyStyle(plot, config)
        return plot;
    }

    return {
        plotLinear : plotLinear,
        plotAbsolute : plotAbsolute,
        plotQuadratic : plotQuadratic,
        plotExponential : plotExponential,
        plotLogarithmic : plotLogarithmic,
        plotCosine : plotCosine,
        plotTangent : plotTangent
    }
});