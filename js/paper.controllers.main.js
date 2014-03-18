(function () {

    'use strict';

    var module = angular.module('paper.controllers.main', ['ngSanitize']);

    module.controller('MainCtrl', ['$scope', '$element', 'SportsNews', function ($scope, $element, SportsNews) {

        var view, criteria;

        view = {
            tiles: $element.find('[data-role="tile-list"]')
        };

        criteria = {
            distance: 30
        };

        $scope.articles = [];

        /*(var syncToServer = function () {
            socket.emit('broadcast:msg', {
                message: JSON.stringify($scope.shared)
            });
        };*/

        $scope.viewContent = function (url) {

            return;
            SportsNews.getNewsContent(url, function (content) {
                console.log(content);
                $scope.$root.safeApply(function () {


                    $scope.html = content;
                });
            });
        }

        $element.delegate('.js-flip-tile', 'click', function (event) {

            var tile = $(this).closest('.tile');



            tile.toggleClass('flip');


        });




        //console.log(Facebook);

        /*Facebook.connect(function() {
            console.log('wow i am connected to facebook');    
        });*/

        SportsNews.getNewsList(function (newsList) {
            //$scope.$root.safeApply(function() {
            $scope.articles = newsList;
            console.log(newsList);
            console.log('wow');

            //});

        });

        var onTileFlip = {};

        $element.delegate('.tile', 'mousedown touchstart', function (event) {

            if (onTileFlip.on === true) {
                return;
            }

            event = getEventOffset(event);

            onTileFlip.x = event.pageX;
            onTileFlip.y = event.pageY;
            onTileFlip.target = $(this);
            onTileFlip.tileIndex = parseInt(onTileFlip.target.attr('data-tile-index'), 10);
            
        });
        
        function fillNews(el, index) {
            console.log(index, $scope.articles);
            var url = $scope.articles[index].url;
        
            SportsNews.getNewsContent(url, function (content) {
                console.log(content);
                
                el.html(content.replace(/<img.*?>/g, ' '));
                //$scope.$root.safeApply(function () {


                    //$scope.html = content;
                //});
            });        
            
        }            

        $element.on('mousemove touchmove', function (event) {

            var delta, tile;

            event = getEventOffset(event);

            if (onTileFlip.on !== true) {

                delta = {
                    x: Math.abs(event.pageX - onTileFlip.x),
                    y: Math.abs(event.pageY - onTileFlip.y)
                };

                if (delta.x > criteria.distance && delta.x > delta.y) {
                    onTileFlip.on = true;
                    onTileFlip.x = event.pageX;
                    onTileFlip.y = event.pageY;
                    onTileFlip.frontside = $(onTileFlip.target);
                    onTileFlip.backside = $('<div class="backside"> I am backside</div>');
                    onTileFlip.distance = $(this).outerWidth() / 2 > event.offsetX ? $(this).outerWidth() - event.offsetX : event.offsetX;
                    onTileFlip.degree = 0;
                    onTileFlip.frontside.parent().append(onTileFlip.backside).addClass('front');
                    fillNews(onTileFlip.backside, onTileFlip.tileIndex);
                }
            } else {

                onTileFlip.degree = ((event.pageX - onTileFlip.x) / onTileFlip.distance) * 180;
                _filpTile(onTileFlip.frontside, onTileFlip.degree);
            }
        });

        $element.on('mouseup touchend', function (event) {

            var tile;
            
            if (onTileFlip.on === true) {
                
                if (onTileFlip.degree > 0) {
                    
                    tile = onTileFlip.frontside;

                    tile.stop().css('borderSpacing', onTileFlip.degree).animate({
                        borderSpacing: 0
                    }, {
                        duration: 700,
                        step: function (now, fx) {
                            if (fx.prop == 'borderSpacing') {
                                _filpTile(tile, now);
                            }
                        },
                        complete: function() {
                            tile.parent().removeClass('front');        
                        }
                    });

                }
                onTileFlip.on = false;
            }
        });
        function _filpTile(el, deg) {

            //cancelAnimationFrame(animFrame);

            //animFrame = requestAnimationFrame(function() {




            if (Math.abs(deg) > 90) {
                //flip.el.css('border', '2px solid yellow')    ;
                // el.css('visibility', 'hidden')    ;

                onTileFlip.backside.css({
                    display: 'block',
                    WebkitTransform: 'rotateY(' + (deg + 180) + 'deg)',
                    height: 150 + Math.abs(deg)
                    //,                opacity: Math.abs(Math.abs( deg) - 90)/ 90
                });
            } else {
                onTileFlip.backside.css({
                    display: 'none'
                });
                //el.css('visibility', 'visible')    ;

            }


            //console.log(Math.abs(Math.abs( deg) - 90)/ 90);

            el.css({
                WebkitTransform: 'rotateY(' + deg + 'deg)',
                height: 150 + Math.abs(deg)

                //,                opacity: Math.abs(Math.abs( deg) - 90)/ 90
            });

            //});
        }



    }]);



    function getEventOffset(event) {

        var offset;

        if (event && event.type && event.type.search(/touch/) != -1) {
            event = event.originalEvent.touches[0];
            offset = $(event.target).offset();
            return {
                pageX: event.pageX,
                pageY: event.pageY,
                offsetX: event.pageX - offset.left,
                offsetY: event.pageY - offset.top,
                target: event.target
            };
        } else {
            return {
                pageX: event.pageX,
                pageY: event.pageY,
                offsetX: event.offsetX,
                offsetY: event.offsetY,
                target: event.target
            };
        }
    }

})();