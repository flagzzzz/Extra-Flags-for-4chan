// ==UserScript==
// name and namespace cannot be changed - it would break the update mechanism, that's why we will leave the name at Extra Flags for int
// for now we append BETA to allow a separate BETA install
// @name        Extra Flags for int BETA
// @namespace   com.whatisthisimnotgoodwithcomputers.extraflagsforint
// @description Extra Flags for int v2 "City flags were a mistake" edition
// @include     http*://boards.4chan.org/int/*
// @include     http*://boards.4chan.org/sp/*
// @include     http*://boards.4chan.org/pol/*
// @exclude     http*://boards.4chan.org/int/catalog
// @exclude     http*://boards.4chan.org/sp/catalog
// @exclude     http*://boards.4chan.org/pol/catalog
// @version     0.20
// @grant       GM_xmlhttpRequest
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @run-at      document-end
// @updateURL   https://raw.githubusercontent.com/flaghunters/Extra-Flags-for-4chan/master/beta/Extra%20Flags%20for%20int.user.js
// @downloadURL https://raw.githubusercontent.com/flaghunters/Extra-Flags-for-4chan/master/beta/Extra%20Flags%20for%20int.user.js
// ==/UserScript==

// DO NOT EDIT ANYTHING IN THIS SCRIPT DIRECTLY - YOUR REGION SHOULD BE CONFIGURED BY USING THE CONFIGURATION BOXES (see install webms for help)

/** JSLint excludes */
/*jslint browser: true*/
/*global document, console, GM_addStyle, GM_setValue, GM_getValue, GM_registerMenuCommand, GM_xmlhttpRequest, cloneInto, unsafeWindow*/

/* WebStorm JSLint ticked:
 - uncapitalized constructors
 - missing 'use strict' pragma
 - many var statements
 */

/* Right margin: 160 */

// DO NOT EDIT ANYTHING IN THIS SCRIPT DIRECTLY - YOUR REGION SHOULD BE CONFIGURED BY USING THE CONFIGURATION BOXES (see install webms for help)
var region = '';
var regions = [];
var lastRegion = '';
var regionVariable = 'regionVariableAPI2';
var allPostsOnPage = [];
var postNrs = [];
var postRemoveCounter = 60;
var requestRetryInterval = 5000;
var flegsBaseUrl = 'https://raw.githubusercontent.com/flaghunters/Extra-Flags-for-int-/master/beta/flags/';
var flagListFile = 'flag_list.txt';
var backendBaseUrl = 'https://whatisthisimnotgoodwithcomputers.com/';
var shortId = 'witingwc.ef.';
var regionCounter = 1;

/** Setup, preferences */
var setup = {
    namespace: 'com.whatisthisimnotgoodwithcomputers.extraflagsforint.',
    id: "ExtraFlags-setup",
    html: function () {
        return '<div>Extra Flags for /int/</div><ul id="' + shortId + 'ul">Country: <li><select id="' + shortId + 'countrySelect">' +
            '<option value=""></option></select></li></ul><div><button name="save">Save settings</button></div></div>';
    },
    fillHtml: function () {
        var path = flegsBaseUrl + "/";
        if (regions.length > 0) {
            for (var i = 0; i < regions.length; i++) {
                path += regions[i] + "/";
            }
        }
        path += flagListFile;
       
        /* resolve countries which we support */
        GM_xmlhttpRequest({
            method: "GET",
            url: path,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function (response) {
                //hide spam, debug purposes only
                //console.log(response.responseText);
                var countrySelect = document.getElementById(shortId + 'countrySelect'),
                    countriesAvailable = response.responseText.split('\n');

                for (var countriesCounter = 0; countriesCounter < countriesAvailable.length - 1; countriesCounter++) {
                    var opt = document.createElement('option');
                    opt.value = countriesAvailable[countriesCounter];
                    opt.innerHTML = countriesAvailable[countriesCounter];
                    countrySelect.appendChild(opt);
                }
            },
            onerror: function () {
                //save
                //setup.save(regionVariable, region);
            }
        });
    },
    q: function (n) {
        return document.querySelector('#' + this.id + ' *[name="' + n + '"]');
    },
    show: function () {
        /* remove setup window if existing */
        var setup_el = document.getElementById(setup.id);
        if (setup_el) {
            setup_el.parentNode.removeChild(setup_el);
        }
        /* create new setup window */
        GM_addStyle('\
            #' + setup.id + ' { position:fixed;z-index:10001;top:40px;right:40px;padding:20px 30px;background-color:white;width:auto;border:1px solid black }\
            #' + setup.id + ' * { color:black;text-align:left;line-height:normal;font-size:12px }\
            #' + setup.id + ' div { text-align:center;font-weight:bold;font-size:14px }\
            #' + setup.id + ' ul { margin:15px 0 15px 0;padding:0;list-style:none }\
            #' + setup.id + ' li { margin:0;padding:3px 0 3px 0;vertical-align:middle }'
        );
        setup_el = document.createElement('div');
        setup_el.id = setup.id;
        setup_el.innerHTML = setup.html();
        setup.fillHtml();
        document.body.appendChild(setup_el);
        /* save listener */
        setup.q('save').addEventListener('click', function () {
            this.disabled = true;
            this.innerHTML = 'Saving...';
            //region = setup.q('region').value.trim();
            //setup.save(regionVariable, region);
            var e = document.getElementById(shortId + "countrySelect");
            var temp = e.options[e.selectedIndex].value;
            //alert(temp);
            if (regions.length == 0) {
                regions.push(temp);
                alert(regions);
                setup_el.parentNode.removeChild(setup_el);
                setup.show();
            } else if (regions.length > 0 && regions[regions.length - 1] !== temp) {
                regions.push(temp);
                alert(regions);
                setup_el.parentNode.removeChild(setup_el);
                setup.show();
            }
        }, false);
    },
    save: function (k, v) {
        GM_setValue(setup.namespace + k, v);
    },
    load: function (k) {
        return GM_getValue(setup.namespace + k);
    },
    init: function () {
        GM_registerMenuCommand('Extra Flags setup', setup.show);
    }
};

/** Prompt to set region if regionVariable is empty  */
region = setup.load(regionVariable);
if (!region) {
    setTimeout(function () {
        if (window.confirm("Extra Flags: No region detected, set it up now?") === true) {
            setup.show();
        }
    }, 2000);
}

/** parse the posts already on the page before thread updater kicks in */
function parseOriginalPosts() {
    var tempAllPostsOnPage = document.getElementsByClassName('postContainer');
    allPostsOnPage = Array.prototype.slice.call(tempAllPostsOnPage); //convert from element list to javascript array
    postNrs = allPostsOnPage.map(function (p) {
        return p.id.replace("pc", "");
    });
}

/** the function to get the flags from the db uses postNrs
 *  member variable might not be very nice but it's the easiest approach here */
function onFlagsLoad(response) {
    //exit on error
    if (response.status !== 200) {
        console.log("Could not fetch flags, status: " + response.status);
        console.log(response.statusText);
        setTimeout(resolveRefFlags, requestRetryInterval);
        return;
    }

    var jsonData = JSON.parse(response.responseText);

    jsonData.forEach(function (post) {
        var postToAddFlagTo = document.getElementById("pc" + post.post_nr),
            postInfo = postToAddFlagTo.getElementsByClassName('postInfo')[0],
            nameBlock = postInfo.getElementsByClassName('nameBlock')[0],
            currentFlag = nameBlock.getElementsByClassName('flag')[0],
            newFlag = document.createElement('a');

        nameBlock.appendChild(newFlag);
        newFlag.title = post.region;
        var newFlagImgOpts = 'onerror="(function () {var extraFlagsImgEl = document.getElementById(\'pc' + post.post_nr +
            '\').getElementsByClassName(\'extraFlag\')[0].firstElementChild; if (!/\\/empty\\.png$/.test(extraFlagsImgEl.src)) {extraFlagsImgEl.src = \'' +
            flegsBaseUrl + 'empty.png\';}})();"';

        newFlag.innerHTML = "<img src='" + flegsBaseUrl + currentFlag.title + "/" + post.region + ".png'" + newFlagImgOpts + ">";
        newFlag.className = "extraFlag";
        newFlag.href = "https://www.google.com/search?q=" + post.region + ", " + currentFlag.title;
        newFlag.target = '_blank';
        //padding format: TOP x RIGHT_OF x BOTTOM x LEFT_OF
        newFlag.style = "padding: 0px 0px 0px 5px; vertical-align:;display: inline-block; width: 16px; height: 11px; position: relative; top: 1px;";

        console.log("resolved " + post.region);

        //postNrs are resolved and should be removed from this variable
        var index = postNrs.indexOf(post.post_nr);
        if (index > -1) {
            postNrs.splice(index, 1);
        }
    });

    //removing posts older than the time limit (they likely won't resolve)
    var timestampMinusPostRemoveCounter = Math.round(+new Date() / 1000) - postRemoveCounter;

    postNrs.forEach(function (post_nr) {
        var postToAddFlagTo = document.getElementById("pc" + post_nr),
            postInfo = postToAddFlagTo.getElementsByClassName('postInfo')[0],
            dateTime = postInfo.getElementsByClassName('dateTime')[0];

        if (dateTime.getAttribute("data-utc") < timestampMinusPostRemoveCounter) {
            var index = postNrs.indexOf(post_nr);
            if (index > -1) {
                postNrs.splice(index, 1);
            }
        }
    });
}

/** fetch flags from db */
function resolveRefFlags() {
    var boardID = window.location.pathname.split('/')[1];
    if (boardID === "int" || boardID === "sp" || boardID === "pol") {

        GM_xmlhttpRequest({
            method: "POST",
            url: backendBaseUrl + "get_flags.php",
            data: "post_nrs=" + encodeURIComponent(postNrs) + "&" + "board=" + encodeURIComponent(boardID),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: onFlagsLoad
        });
    }
}

/** send flag to system on 4chan x (v2, loadletter, v3 untested) post
 *  handy comment to save by ccd0
 *  console.log(e.detail.boardID);  // board name    (string)
 *  console.log(e.detail.threadID); // thread number (integer in ccd0, string in loadletter)
 *  console.log(e.detail.postID);   // post number   (integer in ccd0, string in loadletter) */
document.addEventListener('QRPostSuccessful', function (e) {
    //setTimeout to support greasemonkey 1.x
    setTimeout(function () {
        GM_xmlhttpRequest({
            method: "POST",
            url: backendBaseUrl + "post_flag.php",
            data: "post_nr=" + encodeURIComponent(e.detail.postID) + "&" + "board=" + encodeURIComponent(e.detail.boardID) + "&" + "region=" +
                encodeURIComponent(region),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function (response) {
                //hide spam, debug purposes only
                //console.log(response.responseText);
            }
        });
    }, 0);
}, false);

/** send flag to system on 4chan inline post */
document.addEventListener('4chanQRPostSuccess', function (e) {
    var boardID = window.location.pathname.split('/')[1];
    var evDetail = e.detail || e.wrappedJSObject.detail;
    //setTimeout to support greasemonkey 1.x
    setTimeout(function () {
        GM_xmlhttpRequest({
            method: "POST",
            url: backendBaseUrl + "post_flag.php",
            data: "post_nr=" + encodeURIComponent(evDetail.postId) + "&" + "board=" + encodeURIComponent(boardID) + "&" + "region=" +
                encodeURIComponent(region),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload: function (response) {
                //hide spam, debug only
                //console.log(response.responseText);
            }
        });
    }, 0);
}, false);

/** Listen to post updates from the thread updater for 4chan x v2 (loadletter) and v3 (ccd0 + ?) */
document.addEventListener('ThreadUpdate', function (e) {
    var evDetail = e.detail || e.wrappedJSObject.detail;
    var evDetailClone = typeof cloneInto === 'function' ? cloneInto(evDetail, unsafeWindow) : evDetail;

    //ignore if 404 event
    if (evDetail[404] === true) {
        return;
    }

    setTimeout(function () {
        //add to temp posts and the DOM element to allPostsOnPage
        evDetailClone.newPosts.forEach(function (post_board_nr) {
            var post_nr = post_board_nr.split('.')[1];
            postNrs.push(post_nr);
            var newPostDomElement = document.getElementById("pc" + post_nr);
            allPostsOnPage.push(newPostDomElement);
        });

    }, 0);
    //setTimeout to support greasemonkey 1.x
    setTimeout(resolveRefFlags, 0);
}, false);

/** Listen to post updates from the thread updater for inline extension */
document.addEventListener('4chanThreadUpdated', function (e) {
    var evDetail = e.detail || e.wrappedJSObject.detail;

    var threadID = window.location.pathname.split('/')[3];
    var postsContainer = Array.prototype.slice.call(document.getElementById('t' + threadID).childNodes);
    var lastPosts = postsContainer.slice(Math.max(postsContainer.length - evDetail.count, 1)); //get the last n elements (where n is evDetail.count)

    //add to temp posts and the DOM element to allPostsOnPage
    lastPosts.forEach(function (post_container) {
        var post_nr = post_container.id.replace("pc", "");
        postNrs.push(post_nr);
        allPostsOnPage.push(post_container);
    });
    //setTimeout to support greasemonkey 1.x
    setTimeout(resolveRefFlags, 0);
}, false);

/** START fix flag alignment on chrome */
function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
        return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

if (navigator.userAgent.toLowerCase().indexOf('webkit') > -1) {
    addGlobalStyle('.flag{top: 0px !important;left: -1px !important}');
}
/** END fix flag alignment on chrome */

/** setup init and start first calls */
setup.init();
parseOriginalPosts();
resolveRefFlags();
