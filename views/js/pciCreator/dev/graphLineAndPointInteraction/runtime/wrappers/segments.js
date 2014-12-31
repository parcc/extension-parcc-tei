define(['graphLineAndPointInteraction/runtime/wrappers/lines'], function(lines){
    
    function initialize(grid, config){
        config.segment = true;
        return lines.initialize(grid, config);
    }
    
    return {
        initialize : initialize
    };
});