define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'multiTabbedExhibit/creator/widget/states/states',
    'multiTabbedExhibit/creator/widget/helper/passageEditor',
    'css!multiTabbedExhibit/creator/css/form'
], function(Widget, states, passageEditor){

    var MultiTabbedExhibitWidget = Widget.clone();

    MultiTabbedExhibitWidget.initCreator = function(){

        this.registerStates(states);
        
        //load passages content into authoring model
        passageEditor.loadData(this.element);
        
        Widget.initCreator.call(this);
    };

    return MultiTabbedExhibitWidget;
});
