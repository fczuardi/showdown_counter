({
    baseUrl: "./build/www/js/lib",
    paths: {
        "main": '../main',
        'domReady': 'requirejs/domReady',
        'counter': 'mnmo/counter',
        'counterSet': 'mnmo/counterSet',
        'behavior': 'mnmo/behavior'
    },
    name: "main",
    out: "./build/www/js/main-built.js"
})