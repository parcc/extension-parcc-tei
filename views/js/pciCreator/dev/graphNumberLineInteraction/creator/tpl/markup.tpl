<html5:div class="graphNumberLineInteraction">
    <html5:div class="prompt">
        {{{prompt}}}
    </html5:div>
    <html5:div class="shape-panel">
        <html5:div class="shape-container"></html5:div>
        <html5:div class="shape-controls clearfix">
            <html5:div class="intervals-available">
                <html5:div class="intervals-row">
                    <html5:button name="closed-closed" value="closed-closed" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/close-close.svg"/>
                    </html5:button>
                    <html5:button name="closed-open" value="closed-open" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/close-open.svg"/>
                    </html5:button>
                    <html5:button name="open-closed" value="open-closed" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/open-close.svg"/>
                    </html5:button>
                    <html5:button name="open-open" value="open-open" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/open-open.svg"/>
                    </html5:button>
                </html5:div>
                <html5:div class="intervals-row">
                    <html5:button name="arrow-open" value="arrow-open" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/arrow-open.svg"/>
                    </html5:button>
                    <html5:button name="arrow-closed" value="arrow-closed" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/arrow-close.svg"/>
                    </html5:button>
                    <html5:button name="open-arrow" value="open-arrow" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/open-arrow.svg"/>
                    </html5:button>
                    <html5:button name="closed-arrow" value="closed-arrow" class="btn btn-info" type="button">
                        <html5:img src="graphNumberLineInteraction/runtime/img/close-arrow.svg"/>
                    </html5:button>
                </html5:div>
                <html5:div class="intervals-overlay"></html5:div>
            </html5:div>
            <html5:div class="intervals-selected clearfix"></html5:div>
            <html5:div class="intervals-template">
                <html5:div class="interval" data-uid="">
                    <!--<html5:div class="interval-delete icon icon-bin"></html5:div>-->
                    <html5:button class="btn btn-info" type="button"></html5:button>
                    <html5:a class="deleter" title="delete the interval" href="#">delete</html5:a>
                </html5:div>
            </html5:div>
        </html5:div>
    </html5:div>
</html5:div>