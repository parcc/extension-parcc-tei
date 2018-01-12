<?php
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
 * Copyright (c) 2014 (original work) Open Assessment Technologies;
 *
 *
 */

return array(
    'name' => 'parccTei',
	'label' => 'PARCC Portable Custom Interaction',
	'description' => '',
    'license' => 'GPL-2.0',
    'version' => '0.5.1',
	'author' => 'Open Assessment Technologies',
	'requires' => array(
	    'taoQtiItem' => '>=11.5.0',
        'qtiItemPci' => '>=4.0.1',
        'xmlEditRp' => '>=0.1.0'
    ),
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#parccTeiManager', array('ext'=>'parccTei')),
    ),
    'install' => array(
        'rdf' => array(
		    dirname(__FILE__). '/install/ontology/role.rdf'
		),
        'php'	=> array(
			dirname(__FILE__).'/scripts/install/addHook.php',
            \oat\parccTei\scripts\install\RegisterGraphFunctionInteraction::class,
            \oat\parccTei\scripts\install\RegisterPciFractionModelInteraction::class,
            \oat\parccTei\scripts\install\RegisterPciLineAndPointInteraction::class,
            \oat\parccTei\scripts\install\RegisterPciGraphNumberLineInteraction::class,
            \oat\parccTei\scripts\install\RegisterPciGraphPointLineGraphInteraction::class,
            \oat\parccTei\scripts\install\RegisterPciGraphZoomNumberLineInteraction::class,
		)
    ),
    'update' => 'oat\\parccTei\\scripts\\update\\Updater',
    'uninstall' => array(
    ),
    'autoload' => array (
        'psr-4' => array(
            'oat\\parccTei\\' => dirname(__FILE__).DIRECTORY_SEPARATOR
        )
    ),
    'routes' => array(
        '/parccTei' => 'oat\\parccTei\\controller'
    ),
	'constants' => array(
	    # views directory
	    "DIR_VIEWS" => dirname(__FILE__).DIRECTORY_SEPARATOR."views".DIRECTORY_SEPARATOR,

		#BASE URL (usually the domain root)
		'BASE_URL' => ROOT_URL.'parccTei/',

	    #BASE WWW required by JS
	    'BASE_WWW' => ROOT_URL.'parccTei/views/'
	),
    'extra' => array(
        'structures' => dirname(__FILE__).DIRECTORY_SEPARATOR.'controller'.DIRECTORY_SEPARATOR.'structures.xml',
    )
);
