define([
    'parccTei/pciCreator/dev/multiTabbedExhibit/creator/widget/helper/passageEditor',
    'taoQtiItem/qtiCreator/model/interactions/PortableCustomInteraction',
    'jquery',
    'lodash'
], function (passageEditor, PortableCustomInteraction, $, _) {

    'use strict';

    QUnit.test('loadData', function () {
        
        var $markupContainer = $('.multiTabbedExhibit-markup');
        QUnit.assert.ok($markupContainer.length, 'the markup is present');
        
        var interaction = new PortableCustomInteraction();
        interaction.markup = $markupContainer.html();
        
        passageEditor.loadData(interaction);
        console.log(interaction);
        
        var passages = interaction.data('passages');
        QUnit.assert.equal(_.size(passages), 3, 'passages loaded');
    });
    

});