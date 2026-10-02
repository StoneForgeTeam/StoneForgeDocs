// GitBook's hint styles; anything else falls back to info, as GitBook does.
var STYLES = ['info', 'success', 'warning', 'danger'];

module.exports = {
    book: {
        assets: './assets',
        css: ['hints.css']
    },
    blocks: {
        hint: {
            process: function (block) {
                var style = STYLES.indexOf(block.kwargs.style) >= 0 ? block.kwargs.style : 'info';
                return this.renderBlock('markdown', block.body).then(function (html) {
                    return '<div class="sf-hint sf-hint-' + style + '">' + html + '</div>';
                });
            }
        }
    }
};
