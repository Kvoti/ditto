var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.BootstrapTheme = (function(self, Candy, $) {
    self.about = {
        name: 'Candy Plugin Layout with Bootstrap3',
        version: '0.1'
    };

    self.init = function(){
        loadTemplates();
    };

    function loadTemplates() {
        $('script[type="text/template"]').each(function () {
            var template_include = $(this);
            var template = template_include.text();
            var template_id = template_include.data('name');
            setTemplate(template_id, template);
        });
    }
    
    function setTemplate (name, template) {
        var parts = name.split('.');
        var key = parts.pop();
        var group = Candy.View.Template;
        $.each(parts, function (i, part) {
            group = group[part];
        });
        group[key] = template;
    }
    
    return self;
    
}(CandyShop.LeftTabs || {}, Candy, jQuery));
