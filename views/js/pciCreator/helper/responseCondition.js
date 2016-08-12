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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define(['lodash', 'jquery', 'taoQtiItem/qtiCreator/helper/xmlRenderer'], function(_, $, xmlRenderer){
    'use strict';
    
    function replaceResponseCondition(interaction, newResponseConditionXml, criteria){
        
        var item = interaction.getRelatedItem();
        var rp = item.responseProcessing;
        var $rpXml = $($.parseXML(rp.render(xmlRenderer.get())));
        var newRc = $rpXml[0].importNode($.parseXML(newResponseConditionXml).documentElement, true);
        var responseIdentifier = interaction.attr('responseIdentifier');

        //prepare replacement criteria
        criteria = _.defaults(criteria || {}, {
            responseIdentifierCount : 1
        });

        if($rpXml.length){
            if($rpXml[0].documentElement.getAttribute('template')){
                
                //simply substitute the whole rp
                $rpXml[0].documentElement.removeAttribute('template');
                
                //append the new one
                $rpXml[0].documentElement.appendChild(newRc);
                
            }else{
                //if it is not a standard template, replace its rc with the new one
                var $respVar = $rpXml.find('variable[identifier="'+responseIdentifier+'"]');
                if($respVar.length === criteria.responseIdentifierCount){
                    
                    //remove old node
                    var $respCond = $respVar.parents('responseCondition');
                    $respCond[0].parentNode.removeChild($respCond[0]);
                    
                    //append the new one
                    $rpXml[0].documentElement.appendChild(newRc);
                    
                }else{
                    throw 'unexpected number of rc found';
                }
            }

            //programmatically modifying the response condition requires the whole item RP mode of item to turn into custom mode
            rp.setProcessingType('custom');
            
            //serialize
            rp.xml = (new XMLSerializer()).serializeToString($rpXml[0].documentElement);
        }
    }
    
    return {
        replace : replaceResponseCondition
    };
});