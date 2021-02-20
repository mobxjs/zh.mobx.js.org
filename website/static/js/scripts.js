function openTarget() {
    var hash = location.hash.substring(1);
    if(hash) var details = document.getElementById(hash);
    if(details && details.tagName.toLowerCase() === 'details') {
        details.open = true;
        // seems to interfere with scroll spy otherwise (which triggers at 100 ms)
        setTimeout(function() {
            details.scrollIntoView();
        }, 150)
    }
}

function changeTheEditButtonName() {
    var els = document.getElementsByClassName('edit-page-link');
    els[0].innerHTML = '我来翻译or纠错 ↗️';
}

function addTooltipToRockets() {
    var classNames = ['navGroups', 'onPageNav', 'post', 'docs-prevnext'];
    var rocketRegex = /🚀/g;

    for (var className of classNames) {
        var els = document.getElementsByClassName(className);
        for (var el of els) {
            el.innerHTML = el.innerHTML.replace(rocketRegex, '<span title="Advanced feature">🚀</span>');
        }
    }
}
window.addEventListener('hashchange', openTarget);
window.addEventListener('DOMContentLoaded', function() {
    addTooltipToRockets();
    openTarget();
    changeTheEditButtonName();
});
