<h1>Shopify Javascript API</h1>

*Written by Mike DiDomizio (http://mikedidomizio.com)*

*Licensed under the MIT license: http://opensource.org/licenses/MIT*

Allows AJAX calls to Shopify feeds.  Feeds are cached for one day unless specified.  With results you can run methods to get exactly what you need.  Works locally and with PhoneGap.


<h2>Examples</h2>
http://mikedidomizio.com/work/shopify

<h2>Requirements</h2>
- jQuery

<h2>Usage</h2>

The Shopify Javascript API was made with turnkey in mind

```javascript
//the base url, if all calls will be local, it might as well be set here
var shopify = new shopify('http://mysite.com/');

//here we have the feed relative to the base url.  http://mysite.com/dir/myFeed.atom will be called in this example
//The results of the AJAX request will be in the 'result' variable
shopify.ajax('dir/myFeed.atom',function(results) {

  //here we sort by title
	var title = results.sortBy('title');
	
	//this is just an example, it will output the titles in alphabetical order
	var html = '';
	for(var i = 0; i < title.results.length; i++) {
		document.body.innerHTML += title.results[i].title+'<br/>';
	}

//here we have an array of things for the 'results' returned array to contain.  Everything else will be discarded
/*the integer is the number of seconds to set a localStorage variable for the user (if they can use localStorage)
default is set to 1 day, if you expect many changes, set this low.  If you don't want to cache at all, either do not set it or set it to 0
*/
},['id','title'],3600);

```

<h2>Quick Examples</h2>

You can chain methods

<h4>This will sort by ID and then return titles in an array</h4>
```javascript
results.sortBy('id').get('title');
```

After .get() the method chaining is destroyed, sort before!

<h4>A single level of (somewhat) MySQL style query</h4>
Let's say we have three titles, one named 'Godzilla', one named 'Godzilla vs. Mothra' and one named 'Godzilla vs. Mechagodzilla'
```javascript
results.query("title contains 'godzilla'","i").query("title !contains 'Mothra'");
```

This will return the first and the third one.  See, that "i" in the first query method, that's a case-insensitive modifier (regex style).  If that "i" wasn't there, the first one wouldn't be in the results because the "G" in "Godzilla" is capitalized.

If you want everything that isn't "Godzilla", you can just do
```javascript
results.query("title != 'godzilla'","i");
```

<h2>Notes</h2>

This was initially built with PhoneGap in mind

<h2>Change Log</h2>

1.0

- Initial commit and code
