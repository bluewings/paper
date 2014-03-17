(function () {

    'use strict';

    var module = angular.module('paper', [
        'paper.services',
        'paper.controllers.main'
    ]);

    module.config(['$provide', function ($provide) {

        return $provide.decorator('$rootScope', [
            '$delegate', function ($delegate) {
            $delegate.safeApply = function (fn) {
                var phase = $delegate.$$phase;
                if (phase === "$apply" || phase === "$digest") {
                    if (fn && typeof fn === 'function') {
                        fn();
                    }
                } else {
                    $delegate.$apply(fn);
                }
            };
            return $delegate;
        }]);
    }]);

})();