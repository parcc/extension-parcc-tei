define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationFormElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationWizard',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationResponseCondition',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'ui/dialog'
], function(_, $, __, stateFactory, Answer, formElement, equationFormElementTpl, equationWizardTpl, equationRcTpl, xmlRenderer, dialog){

    var StateAnswer = stateFactory.extend(Answer, function(){

        var widget = this.widget;

        initEquationBasedScoring(widget);
        widget.$responseForm.on('initResponseForm', function(){
            initEquationBasedScoring(widget);
        });

    }, function(){

    });

    function initEquationBasedScoring(widget){
        var $responseForm = widget.$responseForm;
        var $equationFormPanel;
        if(!$responseForm.find('.panel.equation-scoring').length){
            $equationFormPanel = $(equationFormElementTpl());
            $responseForm.find('select[name=template]').parent('.panel').after($equationFormPanel);
            $equationFormPanel.on('change', '[name=equationScoring]', function(){
                var $checkbox = $(this);
                //init the prompt box 
                equationWizard(function(equation, mumPointsRequired){
                    
                    var interaction = widget.element;
                    
                    //turn into custom rp and substitute the resp cond
                    replaceResponseCondition(interaction, equationRcTpl({
                        responseIdentifier : interaction.attr('responseIdentifier'),
                        equation : equation,
                        mumPointsRequired : mumPointsRequired,
                        score : 1
                    }));
                    
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
    
    function replaceResponseCondition(interaction, newResponseConditionXml){
        
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var $rpXml = $(rp.render(xmlRenderer.get()));
        var responseIdentifier = interaction.attr('responseIdentifier');
        if($rpXml.length){
            if($rpXml.attr('template')){
                //simply substitute the whole rp
                $rpXml.removeAttr('template').append(newResponseConditionXml);
            }else{
                //if it is not a standard template, replace its rc with the new one
                var $respVar = $rpXml.find('variable[identifier="'+responseIdentifier+'"]');
                if($respVar.length === 1){
                    var $respCond = $respVar.parents('responseCondition');
                    $respCond.replaceWith(newResponseConditionXml);
                }else{
                    throw 'unexpected number of rc found';
                }
            }

            rp.setProcessingType('custom');
            rp.xml = $('<root>').append($rpXml).html();
        }
    }
    
    return StateAnswer;
});
