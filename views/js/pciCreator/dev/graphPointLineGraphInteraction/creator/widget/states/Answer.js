define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationFormElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationWizard',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationResponseCondition',
    'parccTei/pciCreator/helper/responseCondition',
    'ui/dialog'
], function(_, $, __, stateFactory, Answer, formElement, answerStateHelper, equationFormElementTpl, equationWizardTpl, equationRcTpl, responseCondition, dialog){

    var StateAnswer = stateFactory.extend(Answer, function(){

        var widget = this.widget;

        initEquationBasedScoring(widget);
        widget.$responseForm.on('initResponseForm', function(){
            initEquationBasedScoring(widget);
        });
        
        initResponseDeclarationWidget(widget);
        
    }, function(){
        
        destroyResponseDeclarationWidget(this.widget);
    });
    
    function initResponseDeclarationWidget(widget){
        
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        
        //set correct response as defined in the model
        interaction.setResponse({
            list : {
                string : responseDeclaration.correctResponse || []
            }
        });
        
        //init editing widget event listener
        interaction.onPci('responseChange', function(response){
            var correctResponse = [];
            if (response.base !== null && response.list) {
                correctResponse = response.list.string;
            }
            responseDeclaration.setCorrect(correctResponse);
        });
    }
    
    function destroyResponseDeclarationWidget(widget){
        var interaction = widget.element;
        interaction.offPci('responseChange');
        interaction.setResponse({
            base : null
        });
    }
    
    function initEquationBasedScoring(widget){
        
        var interaction = widget.element;
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var $responseForm = widget.$responseForm;
        var $templateSelector = $responseForm.find('select[name="template"]').closest('.panel');
        var $equationFormPanel;
        
        if(!$responseForm.find('.panel.equation-scoring').length && rp.processingType !== 'custom'){
            
            $equationFormPanel = $(equationFormElementTpl());
            $templateSelector.after($equationFormPanel);
            $templateSelector.remove();//only authorize correct and custom response processing mode
            $equationFormPanel.on('change', '[name=equationScoring]', function(){
                
                var $checkbox = $(this);
                
                //init the prompt box 
                equationWizard(function(equation, mumPointsRequired){
                    
                    //turn into custom rp and substitute the resp cond
                    responseCondition.replace(interaction, equationRcTpl({
                        responseIdentifier : interaction.attr('responseIdentifier'),
                        equation : equation,
                        mumPointsRequired : mumPointsRequired,
                        score : 1
                    }));
                    
                    //reload
                    answerStateHelper.initResponseForm(widget);
                    
                }, function(){
                    $checkbox.prop('checked', false);
                });
            });
        }
    }
    
    function equationWizard(accept, refuse) {
        var accepted = false;
        var dlg = dialog({
            message: '',//__('Please enter the equation')
            content: equationWizardTpl(),
            buttons: 'cancel,ok',
            autoRender: true,
            autoDestroy: true,
            onOkBtn: function() {
                accepted = true;
                if (_.isFunction(accept)) {
                    accept.call(this, dlg.$html.find('input[name=equation]').val(), dlg.$html.find('input[name=mumPointsRequired]').val());
                }
            }
        });
        
        //@todo validate equation during input
        
        if (_.isFunction(refuse)) {
            dlg.on('closed.modal', function() {
                if (!accepted) {
                    refuse.call(this);
                }
            });
        }
        return dlg;
    };
    
    return StateAnswer;
});
