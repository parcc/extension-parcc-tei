<div class="panel passage-form" data-passage-id="{{passageId}}">
    <div class="panel">
        <label for="" class="has-icon">{{__ "Name"}}</label>
        <input type="text" 
               name="name" 
               value="{{name}}" 
               placeholder="e.g. Passage 1" 
               data-validate="$notEmpty;">
    </div>

    <div class="panel">
        <label for="type" class="spinner">{{__ "Type"}}</label>
        <select name="type" class="select2" data-has-search="false">
            {{#each types}}
            <option value="{{cssClass}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
            {{/each}}
        </select>
    </div>

    {{#if hasSize}}
    <div class="panel">
        <label for="size" class="spinner">{{__ "Size"}}</label>
        <select name="size" class="select2" data-has-search="false">
            {{#each sizes}}
            <option value="{{cssClass}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
            {{/each}}
        </select>
    </div>
    {{/if}}

    <span class="passage-button-delete icon-bin" title="Delete passage"></span>
</div>