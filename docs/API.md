# Iframely Gateway API Reference

[Iframely Gateway](http://iframely.com/gateway) is powerful [self-hosted embeds endpoint](https://github.com/itteco/iframely), simple API for responsive widgets and meta. It returns JSON object with all parsed embed and semantic meta data for the requested URL. 

You host the API on your own servers and domain (however, feel free to use API hosts of iframely.com for your dev or open-source purposes). 

The main endpoint: [{YOURHOST.HERE}/iframely?uri={URL}](http://iframely.com/iframely?uri=http%3A%2F%2Fvimeo.com%2F67452063)

All endpoints are called using `GET` methods. All URLs need to be URL-encoded.


## NEW: `/oembed` endpoint, the adapter for oEmbed v1

v0.5.3 added new endpoint for reverse compatibility of any existing [oEmbed](http://oembed.com) consumer implementations. Still, returning responsive widgets code and all good semantic data.


[{YOURHOST.HERE}/oembed?url={URL}&format=json&callback=foo](http://iframely.com/oembed?url=http://vimeo.com/62092214)


The `format` and `callback` parameter for JSONP support are both optional. Default format is JSON. 

Given this endpoint, you can just change the URL in your existing oEmbed lib and start receiving the data. Iframely Gateway will convert its responsive widgets into `<html>` field of oEmbed JSON, choosing the best embed object (as oEmbed allows only one).

`photo` and `rich` types are supported. If Iframely doesn't have any embed codes for given URL, it will return `link` type object. The additional unified semantic information as well as `thumbnail`s are returned for all URLs. See the list of meta fields below.


## Main `/iframely` API Endpoint

Parameters:

 - `uri` - (required) URI of the page to be processed.
 - `refresh` - (optional) You can request the cache data to be ingored by sending `true`. Will unconditionally re-fetch the original source page.
 - `group` - (optional) You can add the extra parameter "group=true" to use different output in JSON - the records groupped by link rel. See below.
 - optional `whitelist=true` will add the domain record from the latest file on the server. See [file format](http://iframely.com/qa/format).

Returns JSON of the following structure (see [example](http://iframely.com/iframely?uri=http%3A%2F%2Fvimeo.com%2F67452063)):

    {
      "meta": {                       -- meta object with the unified semantics
        "title": "BLACK&BLUE",        -- e.g. title and others
        ...
      },
      "links": [                      -- List of embed widgets
        {
          "href": "//player.vimeo.com/video/67452063",  
                                      -- SRC of embed
          "type": "text/html",        -- MIME type of embed method.
          "rel": [                    -- List of functional use cases. For example,
            "player"                  -- `player` - is widget with media playback
          ],
          "title": "BLACK&BLUE",      -- different titles, for different content on the page
          "media": {                  -- "media query" semantics to indicate responsive sizes
            "aspect-ratio": 1.778     -- e.g. fluid widget with fixed aspect ratio
          }
        },
        ...
      ]
    }

Please, refer to [Iframely Protocol](http://iframely.com/oembed2) to get the idea of embeds via `<link>` element.



## Unified and Merged META

Most web pages have organic `<meta>` data published using different semantics standards and optimized for different platforms. For example, oEmbed, Open Graph, Twitter Cards, core HTML meta for Google, Dublin Core, Parsely, Sailthru, etc.

[Iframely Gateway](http://iframely.com/gateway) merges various semantics into fields with unified consistent naming keys, so you can reliably use them in your app (if they are present, of course).

Iframely API returns `meta` object that may contain the following fields at the moment:


### General meta:

 - `title`
 - `description`
 - `date` (the publication date)
 - `canonical` - canonical URL of the resource 
 - `shortlink` - URL shortened through publisher
 - `category`
 - `keywords`

### Attribution:

 - `author`
 - `author_url` 
 - `copyright`
 - `license`
 - `license_url`
 - `site`
 
### Stats info:

 - `views` - number of views on the original host, e.g. YouTube
 - `likes`
 - `comments`
 - `duration` (in seconds, duration of video or audio content)


### Geo data (as per Open Graph spec):

 - `country-name`
 - `postal-code` 
 - `street-address`
 - `region`
 - `locality`
 - `latitude`
 - `longitude`

### Product info (per Pinterest spec):

- `price`
- `currency_code`
- `brand`
- `product_id`
- `availability`
- `quantity`


You can get all current attributes are listed in `/meta-mappings` endpoint. [Check it](http://iframely.com/meta-mappings).



## List of Embed Widget Links

`links` is the list of objects with fields `rel`, `href`, `type` and `media`. 

You can generate embed codes for it as referenced in [Iframely Protocol](http://iframely.com/oembed2/types) spec.


### Values of `rel`

`rel` object contains an array of functional use cases. You need to chose link with `rel` which is better suiteable for your apps functionality.

 - `player` - widget with media playback. Like video or music or slideshow players
 - `thumbnail` - the preview image
 - `image` - sizeable image, indicating that this is the main content on the web page. For use in e.g. photo albums "details" page
 - `reader` - text or graphical widget intended for reader functionality (e.g. article)
 - `file` - downloadable file
 - `icon` - attribution favicon or glyph
 - `logo` - logo the source site. Is returned mostly for pages with the news article (custom ones) for better attribution

Iframely uses supplementary `rels` as the way of attributing to the origin of the data:

 - `og` - link extracted from Open Graph markup. Beware, `players` rendered through `og` have higher chance of being unreliable. 
 - `twitter` - link extracted from Twitter Cards semantics.
 - `oembed` - link extracted from oEmbed/1 object.

You would need to make a decision wheather you trust specific origins or not or use [Iframely Domains DB](http://iframely.com/qa). 

Our Domains DB will extend the coverage to 900+ domains, converting oEmbed, Open Graph or Twitter Cards into responsive widgets and also give you additional `rels`, for example `ssl` and `autoplay` for players, so that you can make better user experience decisions.


### MIME `type`

MIME type defines a method to render link as widget.

MIME type is an expected HTTP response "content-type" header of a resource behind `"href"`. Type of content defines the rendering method.

There are following `type`s at the moment:

 - `"text/html"` - widget needs to be rendered as `<iframe>`.
 - `"application/javascript"` - JavaScript widget with dynamic page embedding with as `<script>`.
 - `"application/x-shockwave-flash"` - Flash widget, will be rendered with `<iframe>`.
 - `"video/mp4"` - HTML5 video. Will be rendered with as `<video>`.
 - `"image"` - this is image which will be rendered with as `<img>`. Below are the specific image types. If format is not specified, the engine will try to detect it by fetching image's descriptors.
  - `"image/jpeg"`
  - `"image/icon"`
  - `"image/png"`
  - `"image/svg"`


### Sizes in `media` query

Media section is for media query. Iframely generates attributes as well as puts it into usable JSON.

You can use [iframely.js](http://iframely.com/gateway/iframelyjs) to render responsive widgets.

Plugins use the following media query attributes at the moment:

 - `width`
 - `min-width`
 - `max-width`
 - `height`
 - `min-height`
 - `max-height`
 - `aspect-ratio` - available only if **width** and **height** not present


## Group By Rel

If you are interested in specific `rel` use case, you can send `&group=true` get parameter to the API endpoint. 

If will result in the response being groupped by rel:

    {
      "meta": {
        "canonical": "http://vimeo.com/67452063",
        "title": "BLACK&BLUE",
        "author": "Ruud Bakker",
        "author_url": "http://vimeo.com/ruudbakker",
        "duration": 262,
        "site": "Vimeo",
        "description": "..."
      },
      "links": {
        "player": [
          {
            "href": "//player.vimeo.com/video/67452063",
            "type": "text/html",
            "rel": [
              "player"
            ],
            "title": "BLACK&BLUE",
            "media": {
              "aspect-ratio": 1.778
            }
          }
        ],
        "thumbnail": [
          {
            "href": "http://b.vimeocdn.com/ts/439/417/439417999_1280.jpg",
            "type": "image",
            "rel": [
              "thumbnail",
              "oembed"
            ],
            "title": "BLACK&BLUE",
            "media": {
              "width": 1280,
              "height": 720
            }
          }
        ],
        "icon": [
          {
            "href": "http://a.vimeocdn.com/images_v6/apple-touch-icon-72.png",
            "type": "image",
            "rel": [
              "icon"
            ],
            "title": "BLACK&BLUE",
            "media": {
              "width": 72,
              "height": 72
            }
          }
        ]
      }
    }





(c) 2013 [Itteco Software Corp](http://itteco.com). Licensed under MIT. [Get it on Github](https://github.com/itteco/iframely)