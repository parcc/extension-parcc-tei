define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphLineAndPointInteraction/creator/widget/states/states',
    'css!graphLineAndPointInteraction/creator/css/form'
], function(Widget, states){

    var GraphLineAndPointInteracitonWidget = Widget.clone();

    GraphLineAndPointInteracitonWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    return GraphLineAndPointInteracitonWidget;
});
