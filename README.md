
[![version](https://img.shields.io/npm/v/hexo-filter-kroki.svg)](https://www.npmjs.com/package/mdbook-node-wrapper)
[![download](https://img.shields.io/npm/dm/hexo-filter-kroki.svg)](https://www.npmjs.com/package/mdbook-node-wrapper)


##  mdbook-node-wrapper

A bridge between rust and NodeJS for mdbook.

```
mdBook-preprocessor(rust) --(stdin json)--> mdbook-node-wrapper(nodejs, with plugins) --(stdout json)--> modified files
```

## Usage


First install bin

```sh
npm install -g mdbook-node-wrapper
```

Add following your book.toml

```toml
[preprocessor.node-wrapper]
require = "plugin/node-wrapper"
```

Create a js for markdown fragment handling

```js
// <book_root>/plugin/node-wrapper.js
module.exports = {
    js: function(str){
        // eg: make all js content uppercase
        return str.toUpperCase();
    }
}
```

## TODO & Problems
* no cache now.