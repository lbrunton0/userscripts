// ==UserScript==
// @name         GCI Fixes
// @namespace    https://fullymanaged.service-now.com/
// @version      0.5
// @description  Fixing some issues with how GCI shows things, and try to take over the world!
// @author       Lucas Brunton
// @match        https://fullymanaged.service-now.com/*
// @match        https://gci.fullymanaged.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* globals GM_config waitForKeyElements*/
let name = ""
let emailPreview = "";
let showPanel = true;
let maxWidth = true;
let fullEmail = true;
let autoShowEmail = true;
let autoShowMore = true;

let initCount = 0;

let frame = document.createElement('div');
document.body.appendChild(frame);
let gmc = new GM_config(
    {
        'id': 'gciFixes', // The id used for this instance of GM_config
        'title': 'GCI Fixes', // Panel Title
        'frame': frame,
        'frameStyle': 'inset: 165px auto auto 320px; border-radius: 5px; border: 2px solid rgb(0, 0, 0); height: auto; margin: 0px; max-height: 95%; max-width: 95%; opacity: 1; overflow: auto; padding: 10px; position: fixed; width: auto; z-index: 9999; display: block; box-shadow: 0 0 0 99999px rgba(0, 0, 0, .5)',
        'fields': {
            'showPanel': {
                'label': 'Show Settings On load',
                'type': 'checkbox',
                'title': 'Show Settings on Load',
                'css': {
                },
                'default': true
            },
            'name': {
                'label': 'Full Name',
                'type': 'text',
                'title': 'Enter your Full name as its known by GCI',
                'default': /\/navpage\.do/.test(location.pathname) ? document.querySelector('#user_info_dropdown > div > .user-name').innerText : '',
                'section': ['', 'Global']
            },
            'maxWith': {
                'label': 'Max Width 100%',
                'type': 'checkbox',
                'title': 'this is mainly to prevent Images in emails from being to wide',
                'default': true
            },
            'autoShowMore': {
                'label': 'Auto Expand Show More',
                'type': 'checkbox',
                'title': 'Automatically expand the "Show more" links in FM Workspace',
                'default': 'true',
                'section': ['', 'FM Workspace Stuff']
            },
            'fullEmail': {
                'label': 'Old GCI view - Full Email',
                'type': 'checkbox',
                'title': 'this is to fixes the cliped emails in old GCI view.',
                'section': ['', 'Old GCI View Stuff'],
                'default': true
            },
            'autoShowEmail': {
                'label': 'Old GCI view - Auto Show Email Details',
                'type': 'checkbox',
                'title': 'Automatically clicks, "Show email details" for every email',
                'default': true
            },
            'emailPreview': {
                'label': 'Email Previews Fill space',
                'type': 'checkbox',
                'title': 'Makes the email preview popup fill the space.',
                'default': true
            },
        },
        'events': {
            'init': function () {
                initCount++;
                console.log("GCI Fixes initCount: " + initCount);
                if (initCount == 1) {
                    name = this.get('name');
                    emailPreview = this.get('emailPreview');
                    showPanel = this.get('showPanel');
                    maxWidth = this.get('maxWith');
                    fullEmail = this.get('fullEmail');
                    autoShowEmail = this.get('autoShowEmail');
                    autoShowMore = this.get('autoShowMore');

                    if (showPanel && window.top == window.self) {
                        this.open()
                    }
                    runUserScript();
                } else {
                    console.log('Name: ' + name);
                    runUserScript();
                }
            },
            'open': function () {
                let spcbDiv = document.getElementById('gciFixes_showPanel_var')
                console.log(spcbDiv);
                let spcbSpan = document.createElement('span')
                spcbSpan.appendChild(spcbDiv.children[0]);
                spcbSpan.appendChild(spcbDiv.children[0]);
                console.log(spcbSpan);
                spcbSpan.className = spcbDiv.className;
                spcbSpan.title = spcbDiv.title;
                spcbSpan.id = spcbDiv.id;
                document.getElementById('gciFixes_section_0').removeChild(spcbDiv);

                let btns = document.getElementById('gciFixes_buttons_holder')
                console.log(btns);
                btns.insertBefore(spcbSpan, btns.children[0]);
            }
        }
    }
);

if (window.top == window.self) {
    const menu_command_id = GM_registerMenuCommand("Settings", function () {
        gmc.open();
    });
}

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

/**
 * Finds all elements in the entire page matching `selector`, even if they are in shadowRoots.
 * Just like `querySelectorAll`, but automatically expand on all child `shadowRoot` elements.
 * @see https://stackoverflow.com/a/71692555/2228771
 */
function querySelectorAllShadows(selector, el = document.body) {
    // recurse on childShadows
    const childShadows = Array.from(el.querySelectorAll('*')).map(el => el.shadowRoot).filter(Boolean);

    // console.log('[querySelectorAllShadows]', selector, el, `(${childShadows.length} shadowRoots)`);

    const childResults = childShadows.map(child => querySelectorAllShadows(selector, child));

    // fuse all results into singular, flat array
    const result = Array.from(el.querySelectorAll(selector));
    return result.concat(childResults).flat();
}

var waitforElementcontrolObj = {};
function waitforElement(selector, actionfunction, children = false) {
    let controlObj = waitforElementcontrolObj;
    let timeout = (controlObj.timeout || 0) + + 300;
    let controlKey = selector.replace(/[^\w]/g, "_");
    let timeControl = controlObj[controlKey];

    let target = querySelectorAllShadows(selector);

    if (target && target.length > 0 && timeControl) {
        let childcount = 0;
        for (let i = 0; i < target.length; i++) {
            if (target[i].children) {
                childcount += target[i].children.length
            }
        }
        if (timeout > 300000 || !children || (children && childcount > 0)) {
            //--- The only condition where we need to clear the timer.
            clearInterval(timeControl);
            delete controlObj[controlKey]
            actionfunction();
        }
    }
    if (!timeControl) {
        timeControl = setInterval(function () {
            waitforElement(selector, actionfunction, children);
        }, 300);
        controlObj[controlKey] = timeControl;
    }
}


function runUserScript() {
    //Global Stuff
    if (maxWidth) {
        addGlobalStyle('* {max-width: 100%;}')
    }

    // FM Workspace stuff
    if (autoShowMore && /\/now\/cwf\/agent\/record\/x_carew_default_ca_fm_case\/.*/.test(location.pathname)) {
        waitforElement('dl.now-label-value.-stacked.will-truncate.will-wrap.-horizontal.-equal.-md', function () {
            // waitforElement('button.now-button-bare.-secondary.-sm', function () {
            let buttons = querySelectorAllShadows('button.now-button-bare.-secondary.-sm');
            for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].innerText === "Show more") {
                    buttons[i].click();
                }
            }
        });
    }

    // Old GCI View Stuff
    if (emailPreview) {
        addGlobalStyle('.modal-lg {margin: .5% !important; width: 99% !important;}')
        addGlobalStyle('#email_preview_iframe {margin: .5%  !important; width: 99%  !important;}')
    }

    if (autoShowEmail && /\/x_carew_default_ca_fm_case\.do/.test(location.pathname)) {
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

    if (fullEmail && /\/email_display\.do/.test(location.pathname) && window.top !== window.self) {
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
}
