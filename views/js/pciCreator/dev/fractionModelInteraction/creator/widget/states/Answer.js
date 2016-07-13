define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function(_, $, __, stateFactory, Answer){

    var StateAnswer = stateFactory.extend(Answer, function(){

        initResponseDeclarationWidget(this.widget);
        
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });

    /**
     * Set the correct response to the state of interaction and set the correct response listener
     *
     * @param widget
     */
    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        var correct = '0/'+interaction.prop('partitionInit');
        if(_.isArray(responseDeclaration.correctResponse) && responseDeclaration.correctResponse.length){
            correct = responseDeclaration.correctResponse[0];
        }

        //set correct response as defined in the model
        interaction.setResponse({
            base : {
                string : correct
            }
        });

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){

            if(response && response.base && response.base.string){
                var correctResponse = response.base.string
                responseDeclaration.setCorrect(correctResponse);
            }
        });

        //remove the response processing mode selector as this interaction only supports custom rp
        widget.$responseForm.find('select[name="template"]').closest('.panel').remove();
    }

    /**
     * Restore default interaction state and remove listeners
     *
     * @param widget
     */
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    return StateAnswer;
});
