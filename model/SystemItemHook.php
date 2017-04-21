<?php

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
        'REVIEW' => 'Review Responses',
        'SUBMIT' => 'Submit Test'
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
        if(!isset($endAttemptInteractionConfig['responseIdentifiers'])){
            $endAttemptInteractionConfig['responseIdentifiers'] = array();
        }
        $endAttemptInteractionConfig['responseIdentifiers'] = array_merge($endAttemptInteractionConfig['responseIdentifiers'], $this->endAttemptIdentifiers);
        $config->setProperty('endAttempt', $endAttemptInteractionConfig);
    }

}
