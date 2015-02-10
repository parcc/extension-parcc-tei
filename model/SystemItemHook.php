<?php
/*
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
 * Copyright (c) 2014 PARCC
 * 
 */

namespace oat\parccTei\model;

use oat\taoQtiItem\model\Hook;
use oat\taoQtiItem\model\Config;

/**
 * The hook used in the item creator
 *
 * @package parccTei
 */
class SystemItemHook implements Hook
{
    
    protected $endAttemptIdentifiers = array(
        'CONTINUE' => 'Continue',
        'REVIEW' => 'Review',
        'SUBMIT' => 'Submit'
    );
    /**
     * Affect the config
     * 
     * @param oat\taoQtiItem\model\Config $config
     */
    public function init(Config $config){
        
        $endAttemptInteractionConfig = $config->getProperty('endAttempt');
        if(!is_array($endAttemptInteractionConfig)){
            $endAttemptInteractionConfig = array();
        }
        if(!is_array($endAttemptInteractionConfig['responseIdentifiers'])){
            $endAttemptInteractionConfig['responseIdentifiers'] = array();
        }
        $endAttemptInteractionConfig['responseIdentifiers'] = array_merge($endAttemptInteractionConfig['responseIdentifiers'], $this->endAttemptIdentifiers);
        $config->setProperty('endAttempt', $endAttemptInteractionConfig);
    }

}
