// ==UserScript==
// @name         GCI Fixes
// @namespace    https://fullymanaged.service-now.com/
// @version      0.4
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
/* globals GM_config */
let name = ""
let emailPreview = "";
let showPanel = true;
let maxWidth = true;
let fullEmail = true;
let autoShowEmail = true;

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
                'default':  /\/navpage\.do/.test(location.pathname) ? document.querySelector('#user_info_dropdown > div > .user-name').innerText : '',
                'section': ['', 'Global']
            },
            'maxWith': {
                'label': 'Max Width 100%',
                'type': 'checkbox',
                'title': 'this is mainly to prevent Images in emails from being to wide',
                'default': true
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
            // '': {
            //     'label': '',
            //     'type': '',
            //     'title': '',
            //     'default': ''
            // },
            // '': {
            //     'label': '',
            //     'type': '',
            //     'title': '',
            //     'default': ''
            // },
        },
        'events': {
            'init': function () {
                initCount ++;
                console.log("GCI Fixes initCount: " + initCount);
                if (initCount == 1) {
                    name = this.get('name');
                    emailPreview = this.get('emailPreview');
                    showPanel = this.get('showPanel');
                    maxWidth = this.get('maxWith');
                    fullEmail = this.get('fullEmail');
                    autoShowEmail = this.get('autoShowEmail');

                    if (showPanel && window.top == window.self) {
                        this.open()
                    }
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

if (window.top == window.self && /\/navpage\.do/.test(location.pathname)) {
    const menu_command_id = GM_registerMenuCommand("Settings", function() {
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

function runUserScript() {

    console.log(name + " " + emailPreview + " " + showPanel);

    if (maxWidth) {
        addGlobalStyle('* {max-width: 100%;}')
    }
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
