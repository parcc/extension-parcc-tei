define([
    'lodash',
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationFormElement',
    'tpl!graphPointLineGraphInteraction/creator/tpl/equationWizard',
    'ui/dialog'
], function(_, $, __, stateFactory, Answer, formElement, equationFormElementTpl, equationWizardTpl, dialog){

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
                equationWizard(function(equation){
                    //turn into custom rp
                    console.log('equation', equation);
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
                    accept.call(this, dlg.$html.find('input[name=equation]').val());
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
