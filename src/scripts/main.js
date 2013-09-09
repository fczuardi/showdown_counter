//Requirejs config
requirejs.config({
    baseUrl: '../js',
    paths:{
    }
});

require([], function(util) {
    console.log('ready to roll');
});
