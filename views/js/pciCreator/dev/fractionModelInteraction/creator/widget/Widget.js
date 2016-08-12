define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'fractionModelInteraction/creator/widget/states/states'
], function(Widget, states){
    'use strict';

    var FractionModelInteracitonWidget = Widget.clone();

    FractionModelInteracitonWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    return FractionModelInteracitonWidget;
});
