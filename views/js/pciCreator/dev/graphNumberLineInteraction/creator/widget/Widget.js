define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphNumberLineInteraction/creator/widget/states/states'
], function(Widget, states){

    var GraphNumberLineInteracitonWidget = Widget.clone();

    GraphNumberLineInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return GraphNumberLineInteracitonWidget;
});