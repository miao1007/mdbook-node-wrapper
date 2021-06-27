fs = require('fs');

const tagMatch = /(\s*)(```) *(\w+) *\n?([\s\S]+?)\s*(\2)(\n+|$)/gm;


/**
 *
 * @param{Array} arr
 * @param handler external plugin
 */
function processChapter(arr, handler) {
    for (let item of arr) {
        chapter = item['Chapter']
        var subItems = chapter.sub_items;
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

    }
    if (!handler) {
        LOGD("no js plugin found.")
        return mdContent
    }
    // console.error("processing " + mdContent)
    return mdContent.replace(tagMatch, function (match, v1, v2, v3, v4) {
        if (handler[v3] && handler[v3].call) {
            LOGD(v4)
            return "<p>" + handler[v3].call(null, v4) + "</p>";
        } else {
            return match;
        }
    });
}

function processContent(book, handler) {
    if (book['sections']) {
        processChapter(book['sections'], handler)
    }
}

function LOGD(msg) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().replace(/T/, ' ').replace(/\..+/, '')
    console.error(localISOTime + " [INFO] (mdbook::mdbook-node-wrapper): " + msg)
}

function main() {
    var stdinBuffer = fs.readFileSync(process.stdin.fd, "utf8");
    var json;
    try {
        json = JSON.parse(stdinBuffer.trim())
    } catch (e) {
        // it may be called twice when not ready
        process.exit(0)
    }
    console.assert(json && json.length === 2)
    let config = json[0]
    let book = json[1]
    const handler = require(config.root + '/' + (config.config.preprocessor['node-wrapper'].require) || "plugin/node-wrapper")
    processContent(book, handler)
    console.log(JSON.stringify(book))
    LOGD("End")
}

main()