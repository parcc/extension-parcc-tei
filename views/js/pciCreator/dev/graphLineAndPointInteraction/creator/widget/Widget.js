define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphLineAndPointInteraction/creator/widget/states/states'
], function(Widget, states){

    var GraphLineAndPointInteracitonWidget = Widget.clone();

    GraphLineAndPointInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return GraphLineAndPointInteracitonWidget;
});