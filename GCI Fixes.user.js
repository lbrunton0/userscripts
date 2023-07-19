// ==UserScript==
// @name         GCI Fixes
// @namespace    https://fullymanaged.service-now.com/
// @version      0.3
// @description  Fixing some issues with how GCI shows things, and try to take over the world!
// @author       Lucas Brunton
// @match        https://fullymanaged.service-now.com/*
// @match        https://gci.fullymanaged.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @grant        none
// ==/UserScript==

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

addGlobalStyle('* {max-width: 100%;}')
addGlobalStyle('.modal-lg {margin: .5% !important; width: 99% !important;}')
addGlobalStyle('#email_preview_iframe {margin: .5%  !important; width: 99%  !important;}')

if (/\/x_carew_default_ca_fm_case\.do/.test(location.pathname)) {
    let streamActions = document.querySelectorAll('a.stream-action');
    for (let i = 0; i < streamActions.length; i++) {
        if (streamActions[i].innerText === "Show email details") {
            streamActions[i].click();
        }
        if (streamActions[i].innerText === "Hide email details") {
            streamActions[i].hide();
        }
    }
}

if (/\/email_display\.do/.test(location.pathname) && window.top !== window.self) {
    let iframe = window.parent.document.querySelector('iframe[src^="' + location.pathname + location.search + '"]');
    let children = document.body.children;
    let height = 0;
    for (let i = 0; i < children.length; i++) {
        height += children[i].scrollHeight;
    }
    height = Math.max(height, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    iframe.style.height = height + 'px';

    window.addEventListener('resize', function (event) {
        let children = document.body.children;
        let height = 0;
        for (let i = 0; i < children.length; i++) {
            height += children[i].scrollHeight;
        }
        iframe.style.height = height + 'px';
        height = Math.max(height, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        iframe.style.height = height + 'px';
    });
}
