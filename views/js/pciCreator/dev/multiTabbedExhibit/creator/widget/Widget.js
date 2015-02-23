define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'multiTabbedExhibit/creator/widget/states/states',
    'css!multiTabbedExhibit/creator/css/form'
], function(Widget, states){

    var MultiTabbedExhibitWidget = Widget.clone();

    MultiTabbedExhibitWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    return MultiTabbedExhibitWidget;
});
