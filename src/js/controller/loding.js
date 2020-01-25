module.exports = ["$scope", "$rootScope", "$location", function ($scope, $rootScope, $location) {

    var goTo = function (result) {

        $location.path(result).replace();
        $scope.$apply();

    };

    (async (goTo) => {

        // check migrations
        try {

            const migrate = async () => {

                return knex.migrate.latest()

            };

            await migrate().then(function (result) {
            })

           

        } catch (ex) {

            console.error('Error migrating 23454: ', ex);

        }

        // check and get data
        try{

            const checkDataStore = async () => {

                return knex.select("data").from('settings').where("name",'storeInfo' )
            }

            await checkDataStore().then((rows) => {

                $rootScope.storeInfo = JSON.parse(rows[0].data)

                if ($rootScope.storeInfo) {


                    goTo('/index')

                } else {

                    $rootScope.storeInfo = {logo:'./assets/storeLogo.png'}

                    goTo('/settings')

                    $rootScope.isHideNav=true

                }

            })

        }catch(e){
            console.error("error code is 34523",e)
        }
       

    })(goTo);


}];