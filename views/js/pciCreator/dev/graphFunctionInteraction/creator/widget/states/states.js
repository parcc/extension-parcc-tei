define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'graphFunctionInteraction/creator/widget/states/Question',
    'graphFunctionInteraction/creator/widget/states/Answer',
], function(factory, states){
    return factory.createBundle(states, arguments, ['correct', 'map']);
});