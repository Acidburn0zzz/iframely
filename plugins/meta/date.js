module.exports = {

    getMeta: function(meta) {
        return {
            date: meta.date || meta.pubdate || meta.lastmod || (meta.article && meta.article.published_time)
        };
    }
};