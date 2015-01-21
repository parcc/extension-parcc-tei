define(['graphLineAndPointInteraction/runtime/wrappers/setOfPoints'], function(setOfPoints){
    
    function initialize(grid, config){
        config.max = 1;
        var point = setOfPoints.initialize(grid, config);
        point.type = 'point';
        return point;
    }
    
    return {
        initialize : initialize
    };
});