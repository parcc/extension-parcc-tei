<?php

namespace oat\parccTei\model;

use oat\qtiItemPci\model\CreatorRegistry as ParentRegistry;
use \common_ext_ExtensionsManager;

/**
 * The hook used in the item creator
 *
 * @package parccTei
 */
class CreatorRegistry extends ParentRegistry
{
    
    protected function getBaseDevDir(){
        $extension = common_ext_ExtensionsManager::singleton()->getExtensionById('parccTei');
        return $extension->getConstant('DIR_VIEWS').'js/pciCreator/dev/'; 
    }
    
    protected function getBaseDevUrl(){
        $extension = common_ext_ExtensionsManager::singleton()->getExtensionById('parccTei');
        return $extension->getConstant('BASE_WWW').'js/pciCreator/dev/'; 
    }
    
}