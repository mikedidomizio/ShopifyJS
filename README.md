<h1>Shopify Javascript API</h1>

*Written by Mike DiDomizio (http://mikedidomizio.com)*

*Licensed under the MIT license: http://opensource.org/licenses/MIT*

Retrieve Shopify feeds by AJAX request.  Works locally and can handle JSONP calls.

<h2>Examples</h2>
http://mikedidomizio.com/work/shopify (1.2)

<h2>Usage</h2>

The Shopify Javascript API allows you to access JSON/ATOM/XML feeds

```javascript
var shopify = new Shopify('http://mysite.com/'); //the base url, if all calls will be local, it might as well be set here

//here we have the feed relative to the base url.  http://mysite.com/dir/myFeed.atom will be called in this example
// The first parameter is the URL.  
// The second parameter is an array of the keys you want returned.  Good if you want to reduce the size of an object
shopify.ajax("feeds/espresso.json", ['id', 'title', 'handle', 'type', 'tags']).then(function(data) {
                // data returned
                var html = '';
                for(var i in data[0]) {
                    html += '<tr><td>' + i + '</td><td>' + data[0][i] + '</td></tr>';
                }
                createTable('Returned individual item (espresso feed)', html);
            }, function(error) {
                // error occurred
            });

```

<h2>Development</h2>

ShopifyJS uses Gulp.
Inside the folder run:

```javascript
npm install && gulp watch
```

<h2>Change Log</h2>

<h5>1.2</h5>

- Added browsersync support for development
- Minor code clean up

Fixes:
- Fixed watcher for Gulp file
- Fixed package.json dependencies

<h5>1.1</h5>

- Created Typescript Shopify file
- Changed Shopify JS Object into Class
- Renamed espresso.js to espresso.json
- Updated example.html to have promises instead of callbacks
- Updated parameter descriptions for methods

<h5>1.0</h5>

- Initial commit and code
