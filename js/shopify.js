/**
*	Shopify Javascript API
*	Retrieves ATOM feeds in expected Shopify format
*
*	@version    1.0
*	@author     Mike DiDomizio (http://mikedidomizio.com)
*	@license    This software is licensed under the MIT license: http://opensource.org/licenses/MIT
*	@copyright	Mike DiDomizio
*/


/**
*	Create the Shopify Object	
*
*	@param	string	website		Expects a base url.  If local, just leave blank
*/
var shopify = function(website) {
	this.website = (website) ? website.trim() : "";
	this.results = [];
};

/**
*	Makes an AJAX call to a Shopify Atom XML feed
*	JSONP is set up but the data on the server side needs to be properly taken care of  
*
*	@param	string			url				url relative to website set in constructor.  If url has callback=? it will make a JSONP call
*	@param	function|null	callback		if set, the function to be called when AJAX request is complete
*	@param	array|null		retrieveArray	if set, will only return this information about the items
*	@param	int|null		timeToExpire	the number of seconds to hold a copy in localStorage, prevents unneeded AJAX calls
*	@param	function|null	errorCallback	called if the AJAX call fails and we don't have a cached version
*/
shopify.prototype.ajax = function(url,callback,retrieveArray,timeToExpire,errorCallback) {
	
	var feedURL = this.website + url.trim();
	
	//if the number of seconds since last called is greater than this number, we grab a new copy
	//if set to 0 it will always make an AJAX call
	var timeToExpire = (timeToExpire && !isNaN(timeToExpire)) ? timeToExpire : 86400;
	
	//the key in localStorage that the data will be cached
	var localStorageKey = "shopifyAPI-"+encodeURIComponent(feedURL);
	
	if(localStorage && localStorage[localStorageKey]) {
		var feeds = JSON.parse(localStorage[localStorageKey]);
		
		if(feeds.url == feedURL && (Math.round((new Date()).getTime() / 1000) - feeds.lastUpdate) < timeToExpire && feeds.data.length > 0) {
			
			this.results = new shopifyResults(feeds.data);
			if(callback) callback(this.results);
			return;
		
		}
	}
	
	//if the feedURL variable contains a callback=? we make a JSONP call instead
	var dataType = (feedURL.match(/\&|\?callback\=\?/)) ? 'jsonp' : 'xml';

	if(feedURL.slice(-2) == 'js' && dataType == 'xml') {
		//json format
		dataType = 'json';
	}
	
	var xmlnsS = "http://jadedpixel.com/-/spec/shopify";
	
	if(!retrieveArray) {
		var retrieveArray = [];
	}
	
	$.ajax({
		dataType : dataType,
		url : feedURL,
		success : function(data, textStatus, request) {
			
			var obj = [];
			
			//is it coming back in json format?
			if(dataType == 'json') {
				//This expects one object to be returned
				if(retrieveArray.length > 0) {
					
					var item = {};
					
					for(var i in data) {
						if(jQuery.inArray(i,retrieveArray) >= 0) {
							item[i] = data[i];
						}
					}
					obj.push(item);
				} else {
					obj.push(data);
				}
			} else {
				
				//if it is a jsonp call, ensure that you know what data you'll be getting back
				if(dataType === 'jsonp') {
					var data = decodeURIComponent(data.data);
				}
				
				//there is always a chance for things to go bad with XML
				try {
	
					$(data).find('entry').each(function(i) {
						
						var item = {};
						
						item.title = $(this).find('> title').text();
						item.id = $(this).find('> id').text();
						item.published = $(this).find('> published').text();
						item.updated = $(this).find('> updated').text();
						
						if(retrieveArray.length == 0 || jQuery.inArray("summary",retrieveArray) >= 0) {
							item.summary = $(this).find('summary').text().trim();
						}
		
						var all = this.getElementsByTagNameNS(xmlnsS,"*");
						for(var i in all) {
							switch(all[i].nodeName) {
								case "s:tag" :
								case "s:type" :
								case "s:vendor" :
										if(all[i].firstChild.nodeValue && (retrieveArray.length == 0 || jQuery.inArray(all[i].nodeName,retrieveArray) >= 0)) {
											
											var tagName = all[i].tagName.match(/^s\:([\w]+)$/);
											
											if(all[i].nodeName == "s:vendor") {
												item[tagName[1]] = all[i].firstChild.nodeValue;
											}else { 
												if(!item[tagName[1]]) {
													item[tagName[1]] = new Array();
												}
												
												item[tagName[1]].push(all[i].firstChild.nodeValue);
											}
										}
									break;
								case "s:variant" :
										if(retrieveArray.length == 0 || jQuery.inArray("s:variant",retrieveArray) >= 0) {
											var variant = {};
											
											if(!item['variant']) {
												item['variant'] = new Array();
											}
											
											for(var j = 1; j < 11; j+=2) {
												variant[all[i].childNodes[j].nodeName] = $(all[i].childNodes[j]).text();
											}
											
											item['variant'].push(variant);
										}
									break;
							}
						}
						
						obj.push(item);
				    });

				} catch (e) {
					//there was an error somewhere
					console.log('Error : '+ e);
					//we had an error, if we have a cached version, we might as well display that
					if(feeds.url == feedURL && feeds.data.length > 0) {
						this.results = new shopifyResults(feeds.data);
						if(callback) callback(this.results);
					}else if(errorCallback && errorCallback != '') {
						//we're screwed, therefore we do our error callback
						errorCallback(jqXHR,textStatus,errorThrown);
					};
					return;
	
				}
		
			}
						    
			//returns the object 		
			this.results = obj;

			//put into localStorage as long as results are greater than 0
			if(localStorage && this.results.length > 0) {
				
				if(!localStorage[localStorageKey])
				{
					localStorage[localStorageKey] = "";
				}				
				
				var obj = {
					'url' : feedURL,
					'lastUpdate' : Math.round((new Date()).getTime() / 1000),
					'data' : this.results
				};
				localStorage[localStorageKey] = JSON.stringify(obj);
			}
			
			
			var results = new shopifyResults(this.results);

			//make the callback
			if(callback) callback(results);
		},error : function(jqXHR,textStatus,errorThrown) {
			console.log('There was an error with the Shopify AJAX call');
			//we had an error, if we have a cached version, we might as well display that
			if(feeds.url == feedURL && feeds.data.length > 0) {
				this.results = new shopifyResults(feeds.data);
				if(callback) callback(this.results);
				return;
			}else if(errorCallback && errorCallback != '') {
				//we're screwed, therefore we do our error callback
				errorCallback(jqXHR,textStatus,errorThrown);
			};
			return;
		}
	});
}


/**
*	Holds methods associated with Shopify results
*
*	@param	array	results		These are the results sent from the Shopify Object
*/
var shopifyResults = function(results) {
	this.results = results;
}

/**
*	Returns an array of this type from all the items, chaining is destroyed
*	
*	@param	string	type	the type to return (title,published etc.)
*	
*	@return	array
*/
shopifyResults.prototype.get = function(type) {
	
	var arr = [];
	for(var i in this.results) {
		if (this.results.hasOwnProperty(i) && !isNaN(i)) {
			arr.push(this.results[i][type]);
		}
	}
	return arr;
}


/**
*	Sorts an array by a certain type
*
*	@note	subType is not working as intended
*
*	@param	string	type	the type to sort by (title,published etc.)
*	@param	string	subType	the subtype to sort by, used for objects in objects
*
*	@return	array
*/
shopifyResults.prototype.sortBy = function(type,subType) {
	var obj = this.results.slice(0);	

	if(subType) {
		/*
		if(type == "variant") {
			
			for(var i = 0; i < obj.length; i ++) {
				
				if(subType == 's:grams' || subType == 's:price') {
					//numerical sort
					obj[i].variant.sort(function(a,b){
						return b[subType] - a[subType];
					});
				}else{
					//alpha sort
					obj[i].variant.sort(function(a,b) {
						if(a[subType] < b[subType]) return 1;
						if(a[subType] > b[subType]) return -1;
						return 0;
					})
				}
			}
		}*/
	}else {
		//sort by type
		
		if(type == "id") {
			//we remove the url from the id and just go by number
			var ids = [];
			type = "stripped_id";
			
			for(var i in obj) {
				var match = obj[i].id.match(/\/(\d+)/);
				if(match[1]) {
					obj[i][type] = parseInt(match[1]);
				}
			}
		}
		
		obj.sort(function(a, b){
		    if(a[type] < b[type]) return -1;
		    if(a[type] > b[type]) return 1;
		    return 0;
		});
	}
	return new shopifyResults(obj);
}

/**
*	Run MYSQL style queries on results
*
*	@param	string		query		Query in MYSQL style syntax.  title = 'Godzilla', title contains 'zilla'
*	@param	string|null	modifiers	Supports case insensitive "i"
*
*	@return	array					Returns an array of objects that match the query
*/
shopifyResults.prototype.query = function(query,modifiers) {
	
	var matches = query.match(/^([\w\:]+)\s?(\!?\=|\!?contains)\s?(?:\'|\")([\w\s\:]+)(?:\'|\")/);
	var modifiers = (!modifiers) ? "" : modifiers;
	
	if(matches.length === 4) {
		
		var obj = [];
		var caseSensitive = (modifiers.indexOf("i") != -1) ? false : true;
		
		if(!caseSensitive) {
			matches[3] = matches[3].toLowerCase();
		}

		for(var i = 0; i < this.results.length; i++) {
					
			var type = this.results[i][matches[1]];

			if(!caseSensitive) {
				var type = type.toLowerCase()
			}
				
			if((matches[2] == "=" && type === matches[3]) 
				|| (matches[2] == "!=" && type !== matches[3])
				|| (matches[2] == "contains" && type.indexOf(matches[3]) != -1)
				|| (matches[2] == "!contains" && type.indexOf(matches[3]) == -1)
			) {
				obj.push(this.results[i]);
			}
		}
	}

	return new shopifyResults(obj);
}