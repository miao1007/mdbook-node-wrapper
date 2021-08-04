
[![version](https://img.shields.io/npm/v/mdbook-node-wrapper.svg)](https://www.npmjs.com/package/mdbook-node-wrapper)
[![download](https://img.shields.io/npm/dm/mdbook-node-wrapper.svg)](https://www.npmjs.com/package/mdbook-node-wrapper)

> Current API is not stable.

##  mdbook-node-wrapper

A bridge between rust and NodeJS for mdbook.

```
mdbook-preprocessor(rust) --(stdin)--> mdbook-node-wrapper --(stdout)--> modified files
```

Features:
* custom fragment handler
* inject front matters into
* add tags page


## Usage


First install bin

```sh
npm install -g https://github.com/miao1007/mdbook-node-wrapper.git
```

Add following your book.toml

```sh
cat >> book.toml << EOF
[preprocessor.node-wrapper]
EOF
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
* bring node_modules back
* add tokenize(dict from tags)
