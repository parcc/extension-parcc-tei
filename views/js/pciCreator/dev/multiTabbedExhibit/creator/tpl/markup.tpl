<div class="multiTabbedExhibit">
    <div class="passages">
        {{#each passages}}
        <div class="passage {{type}} {{#if size}}{{size}}{{/if}}" title="{{title}}">
            {{#if pages}}
            {{#each pages}}
            <div class="page">
                {{{content}}}
            </div>
            {{/each}}
            {{else}}
            {{{content}}}
            {{/if}}
        </div>
        {{/each}}
    </div>
    <div class="templates">
        <script class="tab-navigation" type="text/x-handlebars-template">
            <ul class="passages-tab-navigation">
            \{{#each passages}}
            <li>
            <a href="#" class="passages-tab-active">\{{title}}</a>
            </li>
            \{{/each}}
            </ul>
        </script>
        <script class="scrolling" type="text/x-handlebars-template">
            <div class="frame">
            <div class="slidee">
            \{{{content}}}
            </div>
            </div>
            <div class="scrollbar">
            <div class="handle">
            <div class="cursor"></div>
            </div>
            </div>
        </script>
        <script class="simple" type="text/x-handlebars-template">
            <div class="passage-content">\{{{content}}}</div>
        </script>
        <script class="pages" type="text/x-handlebars-template">
            <ul class="pages">
            \{{#each pages}}
            <li class="page shadowed">
            <div class="page-header">
            <span class="page-number"></span>
            </div>
            <div class="page-content">
            \{{{content}}}
            </div>
            <div class="page-footer"></div>
            </li>
            \{{/each}}
            </ul>
        </script>
        <script class="pager" type="text/x-handlebars-template">
            <div class="passage-pager">
            <div class="passage-pager-previous">
            <button name="previous" value="previous" class="btn btn-info small" type="button">Page Up</button>
            </div>
            <div class="passage-pager-counter">
            Page<span class="counter-current"></span>of<span class="counter-total"></span>
            </div>
            <div class="passage-pager-next">
            <button name="next" value="next" class="btn btn-info small" type="button">Page Down</button>
            </div>
            </div>
        </script>
    </div>
</div>