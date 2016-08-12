define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'graphPointLineGraphInteraction/creator/widget/states/states',
    'css!graphPointLineGraphInteraction/creator/css/form'
], function(Widget, states){

    var GraphPointLineGraphInteractionWidget = Widget.clone();

    GraphPointLineGraphInteractionWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    return GraphPointLineGraphInteractionWidget;
});
