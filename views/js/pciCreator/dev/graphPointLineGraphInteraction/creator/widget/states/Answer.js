define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationFormElement',
    'ui/dialog/confirm',
    'ui/contextualPopup'
], function(_, $, stateFactory, Answer, formElement, equationFormElementTpl, confirm, contextualPopup){

    var StateAnswer = stateFactory.extend(Answer, function(){

        var widget = this.widget;

        initEquationBasedScoring(widget);
        widget.$responseForm.on('initResponseForm', function(){
            initEquationBasedScoring(widget);
        });

        return;
        var $templateSelector = this.widget.$responseForm.find('select[name=template]');

        console.log($templateSelector);
        var temp = $templateSelector.select2('val');
        $templateSelector.select2('destroy').append($('<option>', {text : 'Equation', 'name' : 'equation'}));

        formElement.initWidget(this.widget.$responseForm);

        $templateSelector.select2('val', temp);
    }, function(){

    });

    function initEquationBasedScoring(widget){
        var $responseForm = widget.$responseForm;
        var $equationFormPanel;
        if(!$responseForm.find('.panel.equation-scoring').length){
            $equationFormPanel = $(equationFormElementTpl());
            $responseForm.find('select[name=template]').parent('.panel').after($equationFormPanel);
            $equationFormPanel.on('change', '[name=equationScoring]', function(){
                //init the prompt box 
                confirm('Scoring by equation', function(){
                    
                }, function(){
                    
                });
                return;
                contextualPopup(
                    $equationFormPanel,
                    $('#item-editor-wrapper'),
                    {
                        content : 'content 1',
                        controls : {
                            done : true,
                            cancel : true
                        },
                        callbacks : {
                            beforeDone : function(){
                                return true;
                            },
                            beforeCancel : function(){
                                return true;
                            }
                        }
                    }
                );
            });
        }
    }

    return StateAnswer;
});
