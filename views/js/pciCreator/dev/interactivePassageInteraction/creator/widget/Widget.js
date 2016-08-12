define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'interactivePassageInteraction/creator/widget/states/states'
], function(Widget, states){

    var InteractivePassageInteracitonWidget = Widget.clone();

    InteractivePassageInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return InteractivePassageInteracitonWidget;
});