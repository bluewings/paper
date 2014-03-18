(function () {

    'use strict';

    var w = window,
        config, ready = false, cache = {};

    config = {
        appId: '591654544205657'
    };
    
    cache = {
        newsContent: {}
    };

    var module = angular.module('paper.services', []).value('version', '0.1');

    module.factory('SportsNews', ['$http', function ($http) {

        return {
            getNewsList: function(callback) {
                
                $http.jsonp('http://10.64.51.102:100/data/getNewsList.json?callback=JSON_CALLBACK').success(function(data){
                    if (callback && typeof callback == 'function') {
                        callback(data.newsList);
                    }
                });
            },
            getNewsContent: function(url, callback) {
                
                if (cache.newsContent[url]) {
                    if (callback && typeof callback == 'function') {
                        callback(cache.newsContent[url]);
                    }                    
                }
                
                $http.jsonp('http://10.64.51.102:100/data/getNewsContent.json?url=' + encodeURIComponent(url) + '&callback=JSON_CALLBACK').success(function(data){
                    if (callback && typeof callback == 'function') {
                        cache.newsContent[url] = data.content;
                        callback(data.content);
                    }
                });
            }
        };
    }]);

    module.factory('Facebook', ['$http', function ($http) {

        var prepare = function () {

            var root;

            if (w.FB === undefined) {
                if (!document.getElementById('fb-root')) {
                    root = document.createElement('div');
                    root.id = 'fb-root';
                    document.body.appendChild(root);
                }
                w.fbAsyncInit = function () {
                    w.FB.init({
                        appId: config.appId,
                        status: true,
                        cookie: true
                    });
                    ready = true;
                };
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s);
                    js.id = id;
                    js.src = '//connect.facebook.net/en_US/all.js';
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            }
        };

        var connect = function (callback) {

            function getUserInfo() {

                FB.api('/me', function (response) {

                    if (callback && typeof callback == 'function') {
                        callback(w.FB);
                    }
                });
            }

            if (ready === true) {
                FB.getLoginStatus(function (response) { // Check if the current user is logged in and has authorized the app
                    if (response && response.status == 'connected') { // Check the result of the user
                        getUserInfo();
                    } else {
                        FB.login(function (response) {
                            getUserInfo();
                        }, {
                            scope: 'read_stream'
                        });
                    }
                });
            } else {
                prepare();
                setTimeout(function () {
                    connect(callback);
                }, 0);
            }
        };

        var getPhotos = function(item) {

            var photos = [],
                inx, image;

            if (item.attachment && item.attachment.media) {

                for (inx = 0; inx < item.attachment.media.length; inx++) {
                    if (item.attachment.media[inx].type == 'photo') {
                        if (item.attachment.media[inx].photo.images) {
                            image = item.attachment.media[inx].photo.images.pop();
                            photos.push({
                                width: image.width,
                                height: image.height,
                                src: image.src
                            });
                        }
                    }
                }
            }
            return photos;
        }

        return {
            prepare: prepare,
            connect: connect,
            getStream: function (callback) {

                connect(function (FB) {

                    FB.api({
                        method: 'fql.query',
                        query: "SELECT action_links,actor_id,app_data,app_id,attachment,attribution,claim_count,comment_info,created_time,description,description_tags,expiration_timestamp,feed_targeting,filter_key,impressions,is_exportable,is_hidden,is_published,like_info,likes,message,message_tags,parent_post_id,permalink,place,post_id,privacy,promotion_status,scheduled_publish_time,share_count,share_info,source_id,subscribed,tagged_ids,target_id,targeting,timeline_visibility,type,updated_time,via_id,viewer_id,with_location,with_tags,xid FROM stream WHERE filter_key = 'owner' LIMIT 100"
                    }, function (response) {

                        var streams = [],
                            inx, each;

                        for (inx = 0; inx < response.length; inx++) {
                            each = response[inx];
                            if (each.message) {
                                each.photos = getPhotos(response[inx]);
                                streams.push(each);
                            }
                        }

                        if (callback && typeof callback == 'function') {
                            callback(streams);
                        }
                    });
                });

            }
        };
    }]);

})();