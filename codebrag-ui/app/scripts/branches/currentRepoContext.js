angular.module('codebrag.branches')

    .factory('currentRepoContext', function($state, $stateParams, authService, $rootScope, $q, events, UserBrowsingContext) {

        var currentContext,
            contextReady = $q.defer(),
            TO_REVIEW = 'pending',
            ALL = 'all';

        currentContext = {
            commitsFilter: TO_REVIEW,
            repo: null,
            branch: null,

            ready: function () {
                return contextReady.promise;
            },

            isToReviewFilterSet: function () {
                return this.commitsFilter === TO_REVIEW;
            },

            switchBranch: function (newBranch) {
                this.branch = newBranch;
                $rootScope.$broadcast(events.branches.branchChanged, newBranch);
                saveUserContext(this);
            },

            switchRepo: function (newRepo) {
                var self = this;
                if(this.repo === newRepo) return;
                UserBrowsingContext.get({repo: newRepo}).$then(function(response) {
                    self.repo = response.data.repoName;
                    self.branch = response.data.branchName;
                }).then(function() {
                    saveUserContext(self);
                });
            },

            switchCommitsFilter: function (newFilter) {
                this.commitsFilter = (newFilter === TO_REVIEW ? newFilter : ALL);
                $rootScope.$broadcast(events.commitsListFilterChanged, this.commitsFilter);
            }
        };

        function saveUserContext(params) {
            var context = new UserBrowsingContext(params);
            context.$save();
        }

        authService.userAuthenticated.then(function(user) {
            currentContext.branch = user.browsingContext.branchName;
            currentContext.repo  = user.browsingContext.repoName;
            contextReady.resolve();
        });

        $rootScope.currentRepoContext = currentContext;     //FIXME: for now, to get access to switching repo

        return currentContext;

    });