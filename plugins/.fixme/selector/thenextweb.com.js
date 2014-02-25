module.exports = {

    notPlugin:  !(CONFIG.providerOptions.readability && CONFIG.providerOptions.readability.enabled === true),

    re: /^https?:\/\/thenextweb\.com\/(\w+\/)?\d{4}\/\d{2}\/\d{2}\/.*/i,

    mixins: [
        "author",
        "canonical",
        "og-description",
        "keywords",
        "shortlink",
        "og-site",
        "og-title",
        "date",

        "og-image",
        "favicon"
    ],

    getLink: function(cheerio) {

        var $content = cheerio('.article-body');

        if ($content.length) {
            var html = $content.html();

            var $image = cheerio('.article-featured-image img');

            if ($image.length) {
                html = $image.parent().html() + html;
            }

            return {
                html: html,
                type: CONFIG.T.text_html,
                rel: [CONFIG.R.reader, CONFIG.R.inline]
            };
        }
    },

    tests: [{
        pageWithFeed: "http://thenextweb.com/"
    },
        "http://thenextweb.com/media/2013/04/15/creating-a-youtube-smash/?fromcat=all",
        "http://thenextweb.com/insider/2013/04/15/e-commerce-startup-buyreply-raises-1m-seed-round-from-peter-thiels-firm-and-others/?fromcat=all"
    ]
};