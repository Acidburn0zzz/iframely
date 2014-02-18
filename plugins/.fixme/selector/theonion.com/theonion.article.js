module.exports = {

    re: /^http:\/\/www\.theonion\.com\/article\/*/i,

    mixins: [
        "canonical",
        "favicon",
        "og-image",
        "copyright",
        "og-description",
        "og-title"
    ],

    getData: function($selector) {

        var $html = $selector('article.full-article')

        if ($html.length) {

            var $image = $selector('figure.article-image img');

            var html = '';

            if ($image.length) {
                html = $image.parent().html();
            }

            html += $html.html();

            return {
                readability_data: {
                    html: html
                }
            };
        }
    },

    tests: [{
        page: "http://www.theonion.com/section/politics/",
        selector: "a.title"
    }]
};