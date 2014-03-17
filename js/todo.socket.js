(function () {

    var app = angular.module('todo', []);

    app.factory('socket', function ($rootScope) {

        var socket = io.connect('http://10.101.57.54:8080');

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
        };
    });

    app.controller('TodoCtrl', ['$scope', 'socket', function ($scope, socket) {

        var syncToServer = function () {
            socket.emit('broadcast:msg', {
                message: JSON.stringify($scope.shared)
            });
        };

        $scope.shared = {
            todos: [{
                text: 'learn angular',
                done: true
            }, {
                text: 'build an angular app',
                done: false
            }]
        };

        $scope.addTodo = function () {
            $scope.shared.todos.push({
                text: $scope.todoText,
                done: false
            });
            $scope.todoText = '';
            syncToServer();
        };

        $scope.remaining = function () {
            var count = 0;
            angular.forEach($scope.shared.todos, function (todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        $scope.archive = function () {
            var oldTodos = $scope.shared.todos;
            $scope.shared.todos = [];
            angular.forEach(oldTodos, function (todo) {
                if (!todo.done) $scope.shared.todos.push(todo);
            });
            syncToServer();
        };

        $scope.reportToggle = function () {
            setTimeout(function () {
                syncToServer();
            }, 0);
        };

        socket.on('update:msg', function (message) {

            message = JSON.parse(message);
            if (message) {
                if (!message.todos) {
                    message.todos = [];
                }
                for (inx = 0; inx < message.todos.length; inx++) {
                    delete message.todos[inx].$$hashKey;
                }
                $scope.shared = message;
            }
        });
    }]);

})();