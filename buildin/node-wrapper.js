module.exports = {
    // puml: function(str){
    //     return str;
    // },

    frontMatters: function(content, matters){
        var font = ''
        if (matters.tags) {
            var hrefs = matters.tags.map(x => "<a class='tag-link' href='/tags.html#" + x + "'>" + x + "</a>")
                .join("\n")
            font += "<div class='tags'>" + hrefs + "</div>"
            content = content + '\n' + font
        }
        return content
    }
}
