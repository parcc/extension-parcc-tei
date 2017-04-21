<?php

namespace oat\parccTei\model;

use oat\taoQtiItem\model\Hook;
use oat\taoQtiItem\model\Config;
use oat\parccTei\model\CreatorRegistry;

/**
 * The hook used in the item creator
 *
 * @package parccTei
 */
class CreatorHook implements Hook
{

    /**
     * Affect the config
     * 
     * @param oat\taoQtiItem\model\Config $config
     */
    public function init(Config $config){

        $registry = new CreatorRegistry();

        //get info controls directly located in views/js/picCreator/dev/myInfoControl
        $hooks = $registry->getDevImplementations();
        foreach($hooks as $hook){
            $config->addInteraction($hook);
        }
    }

}
