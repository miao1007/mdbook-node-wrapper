function tagGenerator(config, tagClouds) {
    var content = []
    for (var key in tagClouds) {
        var arr = tagClouds[key];
        content.push(`<h3 id="${key}"><a href="#${key}" class="header">#${key}</a></h3>`)
        console.error(JSON.stringify(config.tag, null, 2))

        if (config.tag){
            content.push(`<p>${config.tag[key] || ""}</p>`);
        }
        for (var key2 in arr) {
            var obj = arr[key2];
            content.push(`<p><a href='${obj.path.replace(".md", ".html")}'>${obj.name}</a></p>`)
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

module.exports = {

    frontMatters: function(content, matters){
        var font = ''
        if (matters.tags) {
            var hrefs = matters.tags.map(x => "<a class='tag-link' href='/tags.html#" + x + "'>" + x + "</a>")
                .join("\n")
            font += "<div class='tags'>" + hrefs + "</div>"
            content = content + '\n' + font
        }
        return content
    },

    tagHandler: function(config, book, tagClouds){
        var tags = tagGenerator(config, tagClouds)
        book['sections'].push("Separator")
        book['sections'].push({
            Chapter: tags
        })
    }
}
