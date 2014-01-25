(function() {
    $('document').ready(function() {
        requirejs(['/plugins/nodebb-plugin-buzzer/js/module.js'], function(module) {
            module.base.init();
        });
    });
}());