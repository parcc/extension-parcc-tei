define([
    'PARCC/gridFactory',
    'OAT/scale.raphael',
    'jquery'
], function(gridFactory, scaleRaphael, $){

    console.log(gridFactory);

    /**
     * Create the minimum canvas and desplay it
     * @param  {Object} $container jQuery node
     * @param  {Object} config     configuration ( cleaned )
     * @return {Object}            Paper ( RaphaelJS )
     */
    function createCanvas($container, config){

        var padding = 2;
        var paper = scaleRaphael(
            $('.shape-container', $container)[0],
            (config.x.end - config.x.start) * config.x.unit + padding,
            (config.y.end - config.y.start) * config.y.unit + padding
            );

        return paper;
    }

    function initGrid($container, gridConfig){

        var paper = createCanvas($container, gridConfig);
        var grid = gridFactory(paper, gridConfig);

        return grid;
    }

    function formatJson(json){
        return JSON.stringify(json, undefined, 2);
    }

    function test(testName, gridConfig){

        var $container = $('<div class="test"><h3 class="title">' + testName + '</h2><pre class="grid-config"></pre><div class="shape-container"></div></div>');
        $container.find('.grid-config').append(formatJson(gridConfig));
        var grid = initGrid($container, gridConfig);
        
        $('#paper').append($container);
    }

    return {
        test : test
    };

});