define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'histogramInteraction/creator/widget/states/states'
], function(Widget, states){

    var HistogramInteracitonWidget = Widget.clone();

    HistogramInteracitonWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return HistogramInteracitonWidget;
});