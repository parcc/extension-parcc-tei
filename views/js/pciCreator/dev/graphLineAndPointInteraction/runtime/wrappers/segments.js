define(['graphLineAndPointInteraction/runtime/wrappers/lines'], function(lines){
    
    function initialize(grid, config){
        config.segment = true;
        var segment = lines.initialize(grid, config);
        segment.type = 'segment';
        return segment;
    }
    
    return {
        initialize : initialize
    };
});