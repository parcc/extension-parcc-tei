define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'fractionModelInteraction/creator/widget/states/Question',
    'fractionModelInteraction/creator/widget/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments, ['correct', 'map']);
});