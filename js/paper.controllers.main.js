(function () {

    'use strict';

    var module = angular.module('paper.controllers.main', []);

    module.controller('MainCtrl', ['$scope', '$element', 'Facebook', function ($scope, $element, Facebook) {
        
        var view;
        
        view = {
            tiles: $element.find('[data-role="tile-list"]') 
        };
        
        $scope.articles = [];

        /*(var syncToServer = function () {
            socket.emit('broadcast:msg', {
                message: JSON.stringify($scope.shared)
            });
        };*/
        
        $element.delegate('.js-flip-tile', 'click', function(event) {
           
           var tile = $(this).closest('.tile');
           
           
           
           tile.toggleClass('flip');
           
            
        });
        
        
        console.log('wow');
        
        console.log(Facebook);
        
        /*Facebook.connect(function() {
            console.log('wow i am connected to facebook');    
        });*/
        
        Facebook.getStream(function(response) {
            //console.log('wow i am connected to facebook');    
            console.log(response);
            
            $scope.$root.safeApply(function() {
                
            
                $scope.articles = response;
                
                setTimeout(function() {
                    
                
                
                view.tiles.isotope({
                  // options
                  itemSelector : '.tile'
                });                
                }, 0);
                
                console.log('done');
                
            });
        });
        
        
        
    }]);

})();