define(['graphLineAndPointInteraction/runtime/wrappers/setOfPoints'], function(setOfPoints){
    
    function initialize(grid, config){
        config.max = 1;
        return setOfPoints.initialize(grid, config);
    }
    
    return {
        initialize : initialize
    };
});