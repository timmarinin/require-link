const requireRegex = /require\s?\(['"](.+)['"]\)/
const extraTokens = [
    'require',
    '(',
    ')',
    '"',
    '\'',
    'require('
]
    

const CORE_MODULES = [
    "assert", "buffer", "child_process", "cluster",
    "console", "crypto", "dns",
    "domain", "events", "fs",
    "http", "https", "module",
    "net", "os", "path", "process",
    "punycode", "querystring", "readline", "repl",
    "stream", "string_decoder", "timers", "tls",
    "tty", "dgram", "url", "util",
    "v8", "vm", "zlib"
]

function shouldReplace(portion, match) {
    if (extraTokens.includes(portion.text)) return false
    if (match[1][0] === '.') return false // local module like ./src
    return true
}


function getUrl(package) {
    return (CORE_MODULES.includes(package))
	? `https://nodejs.org/api/${package}.html`
        : `https://npmjs.com/package/${package}`
}

var finder = null
var mutating = false

function replace(node) {
    mutating = true

    if (finder) {
	finder.revert()
	finder = null
    }

    console.log('mutating!')
    finder = findAndReplaceDOMText(node || document.body, {
	find: requireRegex,
	replace(portion, match) {
	    if (!shouldReplace(portion, match)) return portion.text
	
	    const a = document.createElement('a')
	    a.href = getUrl(match[1])
	    a.innerText = portion.text

	    return a
	},
	preset: 'prose',
    })
    mutating = false
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver

var observerOptions = {
    subtree: true,
    characterData: true,
    childList: true,
}

var observer = new MutationObserver(function(mutations, observer) {
    observer.disconnect()
    if (!mutating) replace()
    observer.observe(document, observerOptions)
})

replace()
observer.observe(document, observerOptions)
