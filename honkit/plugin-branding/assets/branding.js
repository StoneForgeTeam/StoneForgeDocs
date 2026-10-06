// The theme's favicon is GitBook's: swap in StoneForge's (beside this script).
require(['gitbook'], function (gitbook) {
    var base = document.querySelector('script[src$="branding.js"]').src.replace(/branding\.js.*$/, '');
    function icon(rel, file) {
        var link = document.querySelector('link[rel="' + rel + '"]') || document.head.appendChild(document.createElement('link'));
        link.rel = rel;
        link.type = 'image/png';
        link.href = base + file;
    }
    icon('shortcut icon', 'logo-64.png');
    icon('apple-touch-icon-precomposed', 'logo-256.png');
});
