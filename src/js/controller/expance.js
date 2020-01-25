module.exports = ["$scope", "$rootScope", function ($scope, $rootScope) {

    $rootScope.isWaiting = false;
    $rootScope.location = '/expance';

    $scope.isEditingExpanceSetting = false;
    $scope.isEditingExpance = false;


    $scope.expanceCategory = false;


    let getCategorys = ()=> CategoryModule.getCategorys((row) => {

        $scope.expanceCategory = row
        $scope.$apply();

    })

    getCategorys();

    var today = new Date();


    $scope.filter = {
        offset: 0,
        limit: 13,
        searchInput: '',
        isNext: true,
        catagory: null,
        mm: today.getMonth() + 1,
        yyyy: today.getFullYear()
    }

    let getExpanceFromDatabase = () => {
        ExpanceModule.getExpance($scope.filter, (row) => {

            $scope.expance = row
            if (row.length < $scope.filter.limit)
                $scope.filter.isNext = false
            else
                $scope.filter.isNext = true

            $scope.$apply();

        });
    }

    getExpanceFromDatabase()

    $scope.changeFilterData = () => {
        getExpanceFromDatabase()
    }


    $scope.clickPrev = () => {
        $scope.filter.offset = $scope.filter.offset - $scope.filter.limit
        getExpanceFromDatabase()
    }

    $scope.clickNext = () => {
        $scope.filter.offset = $scope.filter.offset + $scope.filter.limit
        getExpanceFromDatabase()
    }


    $scope.newCategory = "";

    $scope.newCategoryError = {
        flag :false,
        message :null
    };

    $scope.clickAddCategory = function () {

        $scope.newCategoryError.flag = false

        if($scope.newCategory==null || $scope.newCategory==''){
            $scope.expance_category.newcatename.$invalid = true
            return
        }

        CategoryModule.insertCategory({ name: $scope.newCategory }, (result) => {

            if (!result.error) {
                $scope.expanceCategory.push($scope.newCategory);
                $scope.newCategory = "";
            } else {
                $scope.newCategoryError.flag = true
                $scope.newCategoryError.message = result.error
            }
            $scope.$apply();

        });

    }

    $scope.clickAddNewCateOption = () => {
        $scope.isEditingExpanceSetting = true
    }

    $scope.clickSaveExpance = function () {


        if ($scope.newExpance.isUpdate) {


            ExpanceModule.updateExpance({

                description: $scope.newExpance.description,

            }, $scope.newExpance.id, () => {

                $scope.expance[$scope.newExpance.arrayid] = { ...$scope.newExpance }

                $scope.$apply();

                $scope.clickClearExpance()
            })

        } else {

            // validations

            if ($scope.newExpance.category == null) {

                $scope.expance_form.category.$invalid = true

                return

            }

            ExpanceModule.insertExpance($scope.newExpance, (result) => {
                getExpanceFromDatabase()
                $scope.clickClearExpance()
                $scope.$apply();

            })

        }

        $scope.isEditingExpance = false;

    }

    $scope.clickClearExpance = () => {
        $scope.newExpance = {
            description: "",
            refno: "",
            price: 0.0,
            category: null,
            dd: today.getDate(),
            mm: today.getMonth() + 1,
            yyyy: today.getFullYear(),

        };



    }

    $scope.clickClearExpance();


    $scope.clickCancelExpance = () => {

        $scope.isEditingExpance = false;

        $scope.clickClearExpance()
    }


    $scope.deleteExpance = (expance) => {

        ExpanceModule.deleteExpance(expance, () => {

            $scope.expance.find((o, i) => {

                if (o) {
                    if (o.id === expance.id) {
                        delete $scope.expance[i]
                        $scope.$apply();

                        return ; // stop searching
                    }
                }
            })

        })
    }


    $scope.editExpance = (expance) => {

        delete expance.$$hashKey

        $scope.expance.find((o, i) => {
            if (o)
                if (o.id === expance.id) {

                    $scope.newExpance = {
                        ...expance, arrayid: i, isUpdate: true
                    };

                    $scope.isEditingExpance = true;

                    return;
                }
        })

    }


    $scope.deleteExpanceCategory = (name) => {




        $scope.newCategoryError.flag = false

        CategoryModule.deleteCategory(name, (result) => {


            if (!result.error) {

                getCategorys();
                
            } else {
                $scope.newCategoryError.flag = true
                $scope.newCategoryError.message = result.error
            }

            $scope.$apply();

           


        })



       
    }


    $scope.focusFrist = true


    document.addEventListener("keydown", (event) => {

        if (event.ctrlKey && event.key == "n") {

            $scope.isEditingExpance = true

            $scope.$apply()
            $scope.focusFrist = true
            $scope.clickClearExpance()
            $scope.$apply()

        }

        if (event.keyCode == '27') {
            $scope.isEditingExpance = false
            $scope.isEditingExpanceSetting = false
            $scope.$apply()
        }

       
    });

}];