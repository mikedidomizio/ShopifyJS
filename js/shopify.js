"use strict";
class Shopify {
    constructor(host) {
        this.host = host;
        this.website = host ? host.trim() : "";
    }
    ;
    ajax(url, itemsToRetrieve) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var feedURL = self.website + url.trim(), xmlnsS = "http://jadedpixel.com/-/spec/shopify", dataType = "json";
            if (feedURL.slice(-4).toLowerCase() !== 'json') {
                dataType = feedURL.match(/\&|\?callback\=\?/) ? 'jsonp' : 'xml';
            }
            ;
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        var data = xmlHttp.responseText, obj = [];
                        if (dataType === 'json') {
                            data = JSON.parse(data);
                            if (itemsToRetrieve.length > 0) {
                                var item = {};
                                for (var i in data) {
                                    if (itemsToRetrieve.indexOf(i) !== -1) {
                                        item[i] = data[i];
                                    }
                                }
                                obj.push(item);
                            }
                            else {
                                obj.push(data);
                            }
                        }
                        else {
                            if (dataType === 'jsonp') {
                                data = decodeURIComponent(data);
                            }
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(data, "text/xml");
                            for (var i in xmlDoc) {
                                try {
                                    if (typeof xmlDoc[i] == "object") {
                                        for (var j in xmlDoc[i]) {
                                            if (typeof xmlDoc[i][j] === "string") {
                                                var dom = parser.parseFromString(xmlDoc[i][j], "text/xml");
                                                var entries = dom.documentElement.getElementsByTagName("entry");
                                                for (var e in entries) {
                                                    if (entries[e].nodeName === "entry") {
                                                        var entry = entries[e];
                                                        var item = {};
                                                        item.title = entry.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                                                        item.published = entry.getElementsByTagName("published")[0].childNodes[0].nodeValue;
                                                        item.updated = entry.getElementsByTagName("updated")[0].childNodes[0].nodeValue;
                                                        if (itemsToRetrieve.indexOf("summary") != -1) {
                                                            item.summary = entry.getElementsByTagName("summary")[0].childNodes[0].nodeValue;
                                                        }
                                                        var all = entry.getElementsByTagNameNS(xmlnsS, "*");
                                                        for (var i in all) {
                                                            switch (all[i].nodeName) {
                                                                case "s:tag":
                                                                case "s:type":
                                                                case "s:vendor":
                                                                    if (all[i].firstChild.nodeValue != "" && (itemsToRetrieve.length == 0 || itemsToRetrieve.indexOf(all[i].nodeName) != -1)) {
                                                                        var tagName = all[i].tagName.match(/^s\:([\w]+)$/);
                                                                        if (all[i].nodeName == "s:vendor") {
                                                                            item[tagName[1]] = all[i].firstChild.nodeValue;
                                                                        }
                                                                        else {
                                                                            if (!item[tagName[1]]) {
                                                                                item[tagName[1]] = new Array();
                                                                            }
                                                                            item[tagName[1]].push(all[i].firstChild.nodeValue);
                                                                        }
                                                                    }
                                                                    break;
                                                                case "s:variant":
                                                                    if (itemsToRetrieve.length == 0 || itemsToRetrieve.indexOf("s:variant") != -1) {
                                                                        var variant = {};
                                                                        if (typeof item.variant == "undefined") {
                                                                            item.variant = [];
                                                                        }
                                                                        for (var k = 1; k < 11; k += 2) {
                                                                            variant[all[i].childNodes[k].nodeName] = all[i].childNodes[k].nodeValue;
                                                                        }
                                                                        item.variant.push(variant);
                                                                    }
                                                                    break;
                                                            }
                                                        }
                                                        obj.push(item);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (err) {
                                    console.warn(err);
                                }
                            }
                        }
                        resolve(obj);
                    }
                    else {
                        reject(xmlHttp.responseText);
                    }
                }
            };
            xmlHttp.open("GET", feedURL, true);
            xmlHttp.send(null);
        });
    }
}
