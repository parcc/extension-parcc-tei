define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/interactions/Correct'
], function(stateFactory, Correct){

    var InteractionStateCorrect = stateFactory.extend(Correct, function(){
        this.widget.$responseForm.find('select[name=template]').parent('.panel').after('sss');
    }, function(){
        //use default [data-edit="correct"].hide();
    });

    return InteractionStateCorrect;
});
