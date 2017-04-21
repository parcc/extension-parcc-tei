/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *  
 * Copyright (c) 2016-2017 Parcc, Inc.
 */


define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'parccTei/pciCreator/helper/responseCondition',
    'json!parccTei/test/samples/space-shuttle',
    'json!parccTei/test/samples/choiceDouble'
], function ($, _, Loader, qtiClasses, XmlRenderer, responseCondition, standardTemplateData, templateDrivenData){

    
    function normalizeXmlString(xml){
        return xml.replace(/(\r\n|\n|\r)/gm,'').replace(/\s+/g,' ').replace(/>\s</g,'><');
    }
    
    QUnit.asyncTest('replace templateDriven', function (assert){

        var loader = new Loader();

        loader.setClassesLocation(qtiClasses).loadItemData(templateDrivenData, function (item){

            new XmlRenderer().load(function (){
                
                QUnit.start();
                
                assert.ok(item.is('assessmentItem'));
                
                var rp = item.responseProcessing;
                
                assert.equal(rp.processingType, 'templateDriven');
                assert.equal(rp.xml, '');
                
                var interactions = item.getInteractions();
                var replacement = '<responseCondition><responseIf><equal toleranceMode="exact"><customOperator class="qti.customOperators.XXX"><variable identifier="RESPONSE"/><default identifier="VARX"/></customOperator><baseValue baseType="integer">2</baseValue></equal><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue></responseIf><responseElse><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue></responseElse></responseCondition>';
                responseCondition.replace(interactions[0], replacement);
                
                assert.equal(rp.processingType, 'custom');
                assert.equal(normalizeXmlString(rp.xml), '<responseProcessing><responseCondition><responseIf><match><variable identifier="RESPONSE_1"/><correct identifier="RESPONSE_1"/></match><setOutcomeValue identifier="SCORE"><sum><variable identifier="SCORE"/><baseValue baseType="integer">1</baseValue></sum></setOutcomeValue></responseIf></responseCondition><responseCondition><responseIf><equal toleranceMode="exact"><customOperator class="qti.customOperators.XXX"><variable identifier="RESPONSE"/><default identifier="VARX"/></customOperator><baseValue baseType="integer">2</baseValue></equal><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue></responseIf><responseElse><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue></responseElse></responseCondition></responseProcessing>');
            });

        });

    });

    QUnit.asyncTest('replace standardTemplateData', function (assert){

        var loader = new Loader();

        loader.setClassesLocation(qtiClasses).loadItemData(standardTemplateData, function (item){

            new XmlRenderer().load(function (){
                
                QUnit.start();
                
                assert.ok(item.is('assessmentItem'));
                
                var rp = item.responseProcessing;
                
                assert.equal(rp.processingType, 'templateDriven');
                assert.equal(rp.xml, '');
                
                var interactions = item.getInteractions();
                var replacement = '<responseCondition><responseIf><equal toleranceMode="exact"><customOperator class="qti.customOperators.XXX"><variable identifier="RESPONSE"/><default identifier="VARX"/></customOperator><baseValue baseType="integer">2</baseValue></equal><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue></responseIf><responseElse><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue></responseElse></responseCondition>';
                responseCondition.replace(interactions[0], replacement);
                
                assert.equal(rp.processingType, 'custom');
                assert.equal(normalizeXmlString(rp.xml), '<responseProcessing><responseCondition><responseIf><equal toleranceMode="exact"><customOperator class="qti.customOperators.XXX"><variable identifier="RESPONSE"/><default identifier="VARX"/></customOperator><baseValue baseType="integer">2</baseValue></equal><setOutcomeValue identifier="SCORE"><baseValue baseType="float">1</baseValue></setOutcomeValue></responseIf><responseElse><setOutcomeValue identifier="SCORE"><baseValue baseType="float">0</baseValue></setOutcomeValue></responseElse></responseCondition></responseProcessing>');
            });

        });

    });

});
