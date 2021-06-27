#!/usr/bin/env node
const fs = require('fs');

const yamlFront = require('yaml-front-matter');

const tagMatch = /(\s*)(```) *(\w+) *\n?([\s\S]+?)\s*(\2)(\n+|$)/gm;

/**
 *
 * @param{Array} arr
 * @param handler external plugin
 */
function processChapter(arr, handler) {
    for (let item of arr) {
        chapter = item['Chapter']
        var subItems = chapter['sub_items'];
        if (subItems instanceof Array && subItems.length > 0) {
            processChapter(subItems, handler);
        } else {
            LOGD("Processing " + chapter['path'])
            chapter['content'] = transformRawMd(chapter['content'], handler)
        }
    }
}

/**
 * decorate the raw markdown file
 * @param{String} mdContent
 * @param handler external plugin
 */
function transformRawMd(mdContent, handler) {
    // front matters
    if (mdContent.startsWith("---")) {
        var loadFront = yamlFront.loadFront(mdContent);
        if (loadFront) {
            mdContent = loadFront['__content']
            if (handler && handler.frontMatters) {
                mdContent = handler.frontMatters.call(null, mdContent, loadFront)
            }
        }
    }
    // console.error("processing " + mdContent)
    return mdContent.replace(tagMatch, function (match, v1, v2, v3, v4) {
        if (handler[v3] && handler[v3].call) {
            return "<p>" + handler[v3].call(null, v4) + "</p>";
        } else {
            return match;
        }
    });
}

function processContent(book, handler) {
    if (book['sections']) {
        processChapter(book['sections'], handler)
    } else {
        LOGD("Sections seems empty.")
    }
}

function LOGD(msg) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.error(localISOTime + " [INFO] (mdbook::mdbook-node-wrapper): " + msg)
}

function main() {
    LOGD("Start")
    var stdinBuffer;
    try {
        stdinBuffer = fs.readFileSync(process.stdin.fd, "utf8");
    } catch (e) {
        LOGD("Stdin read failed")
        process.exit(1)
    }
    var json;
    var text = stdinBuffer.trim();
    try {
        json = JSON.parse(text)
    } catch (e) {
        if (text.length < 5){
            // it may be called twice when not ready
        } else {
            LOGD("Parse json failed " + text)
        }
        process.exit(0)
    }
    console.assert(json && json.length === 2)
    let config = json[0]
    let book = json[1]
    var handler;
    try {
        var customDir = config.root + '/' + 'plugin/node-wrapper';
        handler = require(customDir)
    } catch (e) {
        LOGD("No js fond in " + customDir + ", using build-in node-wrapper")
        handler = require(__dirname + "/buildin/node-wrapper")
    }
    processContent(book, handler)
    console.log(JSON.stringify(book))
    LOGD("End")
}

main()