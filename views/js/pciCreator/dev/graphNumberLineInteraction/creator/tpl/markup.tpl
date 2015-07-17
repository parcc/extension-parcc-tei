<div class="graphNumberLineInteraction">
    <div class="prompt">
        {{{prompt}}}
    </div>
    <div class="shape-panel">
        <div class="shape-container"></div>
        <div class="shape-controls clearfix">
            <div class="intervals-available">
                <div class="intervals-row">
                    <button name="closed-closed" value="closed-closed" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/close-close.svg"/>
                    </button>
                    <button name="closed-open" value="closed-open" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/close-open.svg"/>
                    </button>
                    <button name="open-closed" value="open-closed" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/open-close.svg"/>
                    </button>
                    <button name="open-open" value="open-open" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/open-open.svg"/>
                    </button>
                </div>
                <div class="intervals-row">
                    <button name="arrow-open" value="arrow-open" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/arrow-open.svg"/>
                    </button>
                    <button name="arrow-closed" value="arrow-closed" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/arrow-close.svg"/>
                    </button>
                    <button name="open-arrow" value="open-arrow" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/open-arrow.svg"/>
                    </button>
                    <button name="closed-arrow" value="closed-arrow" class="interval-available btn btn-info" type="button">
                        <img src="graphNumberLineInteraction/runtime/img/close-arrow.svg"/>
                    </button>
                </div>
                <div class="intervals-overlay"></div>
            </div>
            <div class="intervals-selected clearfix"></div>
            <div class="intervals-template">
                <div class="interval" data-uid="">
                    <!--<div class="interval-delete icon icon-bin"></div>-->
                    <button class="btn btn-info" type="button"></button>
                    <a class="deleter" title="delete the interval" href="#">delete</a>
                </div>
            </div>
        </div>
    </div>
</div>