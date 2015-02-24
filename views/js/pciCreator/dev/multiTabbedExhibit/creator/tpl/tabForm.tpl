<div class="panel">
    <label for="" class="has-icon">{{__ "Name"}}</label>
    <input type="text" 
           name="name" 
           value="{{name}}" 
           placeholder="e.g. Passage 1" 
           data-validate="$notEmpty;">
</div>

{{#if hasSize}}
<div class="panel">
    <label for="size" class="spinner">{{__ "Size"}}</label>
    <select name="size" class="select2" data-has-search="false">
    	{{#each sizes}}
    		<option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
    	{{/each}}
    </select>
</div>
{{/if}}