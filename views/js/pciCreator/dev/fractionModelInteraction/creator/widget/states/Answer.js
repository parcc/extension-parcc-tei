define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'tpl!fractionModelInteraction/creator/tpl/responseCondition',
    'parccTei/pciCreator/helper/responseCondition',
    'ui/dialog'
], function(_, $, __, stateFactory, Answer, formElement, answerStateHelper, rcTpl, responseCondition, dialog){

    var StateAnswer = stateFactory.extend(Answer, function(){

        initResponseDeclarationWidget(this.widget);
        
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });
    
    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();

        //set correct response as defined in the model
        interaction.setResponse({
            base : {
                string : responseDeclaration.correctResponse.length ? responseDeclaration.correctResponse[0] : '0/'+interaction.prop('partitionInit')
            }
        });

        //init editing widget event listener
        interaction.onPci('responseChange', function(response){

            if(response && response.base && response.base.string){

                var correctResponse = response.base.string
                responseDeclaration.setCorrect(correctResponse);

                //turn into custom rp and substitute the resp cond
                responseCondition.replace(interaction, rcTpl({
                    responseIdentifier : interaction.attr('responseIdentifier'),
                    score : 1
                }), {
                    responseIdentifierCount : 2
                });

            }
        });

    }
    
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.resetResponse();
    }

    return StateAnswer;
});
