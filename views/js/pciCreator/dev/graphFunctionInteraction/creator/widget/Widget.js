define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphFunctionInteraction/creator/widget/states/states',
    'css!graphFunctionInteraction/creator/css/form'
], function(Widget, states){

    var GraphFunctionInteracitonWidget = Widget.clone();

    GraphFunctionInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return GraphFunctionInteracitonWidget;
});