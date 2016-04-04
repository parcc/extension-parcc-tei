define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function(stateFactory, Map, answerState){

    var InteractionStateMap = stateFactory.extend(Map, function(){
        
        this.widget.$responseForm.find('select[name=template]').parent('.panel').after('sss');
        
    }, function(){
        
    });

    return InteractionStateMap;
});
