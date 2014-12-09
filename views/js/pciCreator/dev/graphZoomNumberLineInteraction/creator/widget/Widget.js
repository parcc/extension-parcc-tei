define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphZoomNumberLineInteraction/creator/widget/states/states'
], function(Widget, states){

    var GraphZoomNumberLineInteracitonWidget = Widget.clone();

    GraphZoomNumberLineInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return GraphZoomNumberLineInteracitonWidget;
});