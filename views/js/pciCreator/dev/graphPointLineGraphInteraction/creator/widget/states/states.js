define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'graphPointLineGraphInteraction/creator/widget/states/Question',
    'graphPointLineGraphInteraction/creator/widget/states/Answer',
    'graphPointLineGraphInteraction/creator/widget/states/Question',
    'graphPointLineGraphInteraction/creator/widget/states/Map'
], function(factory, states){
    return factory.createBundle(states, arguments);
});
