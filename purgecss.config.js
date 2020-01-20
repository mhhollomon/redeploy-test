module.exports = {
    content: [ 'build/dist/**/*.html' ],
    css : ['./build/dist/css/styles.css'],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
}
