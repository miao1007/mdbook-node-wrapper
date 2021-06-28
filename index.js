#!/usr/bin/env node
const fs = require('fs');

const yamlFront = require('yaml-front-matter');

const tagMatch = /(\s*)(```) *(\w+) *\n?([\s\S]+?)\s*(\2)(\n+|$)/gm;


/**
 * @typedef Chapter
 * @type {{number: [number], path: string, parent_names: [], sub_items: [], name: string, source_path: string, content: string}}
 */
const d = {
    "name": "Chapter 1",
    "content": "# Chapter 1\n",
    "number": [],
    "sub_items": [],
    "path": "chapter_1.md",
    "source_path": "chapter_1.md",
    "parent_names": []
}

/**
 *
 * @param{Array} arr
 * @param handler{function<string>} external plugin
 */
function processNestedItems(arr, handler) {
    for (let item of arr) {
        chapter = item['Chapter']
        if (!chapter) {
            continue;
        }
        var subItems = chapter['sub_items'];
        if (subItems instanceof Array && subItems.length > 0) {
            processNestedItems(subItems, handler);
        } else {
            LOGD("Processing " + chapter['path'])
            transformRawChapter(chapter, handler)
        }
    }
}


var tagClouds = {}

function tagGenerator() {
    var content = []

    for (var key in tagClouds) {
        var arr = tagClouds[key];
        content.push(`<h3 id="${key}"><a href="#${key}" class="header">#${key}</a></h3>`)

        for (var key2 in arr) {
            var obj = arr[key2];
            content.push(`<p><a href='${obj.path.replace(".md", ".html")}'>${obj.path.replace(".md", "")}-${obj.name}</a></p>`)
        }
    }
    return {
        "name": "Tags",
        "content": content.join("\n"),
        "number": null,
        "sub_items": [],
        "path": "tags.md",
        "source_path": "tags.md",
        "parent_names": []
    }
}


/**
 * decorate the raw markdown file
 * @param chapter{Chapter}
 * @param handler{function<string>} external plugin
 */
function transformRawChapter(chapter, handler) {
    var mdContent = chapter['content']
    // front matters
    if (mdContent.startsWith("---")) {
        var frontMatters = yamlFront.loadFront(mdContent);
        if (frontMatters) {
            if (frontMatters.tags) {
                frontMatters.tags.forEach(x => {
                    var tagObj = {
                        name: chapter.name,
                        path: chapter.path
                    }
                    if (tagClouds[x]) {
                        tagClouds[x].push(tagObj)
                    } else {
                        tagClouds[x] = [tagObj]
                    }
                })
            }
            mdContent = frontMatters['__content']
            if (handler && handler.frontMatters) {
                mdContent = handler.frontMatters.call(null, mdContent, frontMatters)
            }
        }
    }
    // console.error("processing " + mdContent)
    chapter['content'] = mdContent.replace(tagMatch, function (match, v1, v2, v3, v4) {
        if (handler[v3] && handler[v3].call) {
            return "<p>" + handler[v3].call(null, v4) + "</p>";
        } else {
            return match;
        }
    });
}

/**
 *
 * @param book
 * @param handler{function<string>} external plugin
 */
function processContent(book, handler) {
    if (book['sections']) {
        processNestedItems(book['sections'], handler)
    } else {
        LOGD("Sections seems empty.")
    }
}

/**
 * @param msg{string}
 */
function LOGD(msg) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '')
    var prefix = localISOTime + " [INFO] (mdbook::mdbook-node-wrapper): "
    if (!msg instanceof String) {
        console.error(prefix + JSON.stringify(json, null, 2))
    } else {
        console.error(prefix + msg)
    }
}

function main() {
    LOGD("Start")
    var stdinBuffer;
    try {
        // read data sent from mdbook
        // see https://rust-lang.github.io/mdBook/for_developers/preprocessors.html
        stdinBuffer = fs.readFileSync(process.stdin.fd, "utf8");
    } catch (e) {
        LOGD("Stdin read failed: " + e.message)
        process.exit(1)
    }
    var json;
    var text = stdinBuffer.trim();
    try {
        json = JSON.parse(text)
    } catch (e) {
        if (text.length < 5) {
            // it may be called twice when not ready
            process.exit(0)
        } else {
            LOGD("Parse json failed " + text)
            process.exit(1)
        }
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
    var tags = tagGenerator()
    book['sections'].push("Separator")
    book['sections'].push({
        Chapter: tags
    })
    console.log(JSON.stringify(book))
    LOGD("End")
}

main()