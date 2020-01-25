module.exports = ["$scope", "$rootScope", function ($scope, $rootScope) {


    $rootScope.location = '/products';
    $rootScope.isWaiting = false;


    // settings
    $scope.settings = {
        hsn: true,
        gst: true,
        bprice: true,
        sprice: true,
        // discount: true,
        barcode: true,
        qty: true
    }


    // console.log(window.location)


    SettingModule.getSetting('products', (rs) => {
        $scope.settings = rs
        $scope.$apply()
    })

    $scope.changeSettings = () => {
        SettingModule.updateSettingJson('products', $scope.settings, () => {

        })
    }

    // end settings

    $scope.clickAddNewCateOption = () => {
        $scope.isEditingProductSetting = true
    }


    $scope.filter = {
        offset: 0,
        limit: 13,
        searchInput: '',
        isNext: true,
        catagory: null,
    }


    let getProductFromDatabase = () => {
        ProductModule.getProducts($scope.filter, (row) => {
            $scope.products = row
            if (row.length < $scope.filter.limit)
                $scope.filter.isNext = false
            else
                $scope.filter.isNext = true

            $scope.$apply();
        });

    }

    getProductFromDatabase()

    $scope.changeFilterData = () => {
        $scope.filter.offset = 0
        getProductFromDatabase()
    }



    $scope.clickPrev = () => {
        $scope.filter.offset = $scope.filter.offset - $scope.filter.limit
        getProductFromDatabase()
    }

    $scope.clickNext = () => {
        $scope.filter.offset = $scope.filter.offset + $scope.filter.limit
        getProductFromDatabase()
    }


    $scope.productCategory = [];


    let getProductCategorys = () => {
        ProductCategoryModule.getProductCategorys((row) => {

            $scope.productCategory = row


            $scope.$apply();

        })
    }
    getProductCategorys();

    $scope.newCategory = "";
    $scope.newCategoryError = {
        flag: false,
        message: null
    };

    $scope.clickAddCategory = function () {

        $scope.newCategoryError.flag = false

        if ($scope.newCategory == null || $scope.newCategory == '') {
            $scope.product_category.newcatename.$invalid = true
            return
        }

        ProductCategoryModule.insertProductCategory({ name: $scope.newCategory }, (result) => {
            if (!result.error) {

                $scope.productCategory.push($scope.newCategory);
                $scope.newCategory = "";
            } else {
                $scope.newCategoryError.flag = true
                $scope.newCategoryError.message = result.error
            }
            $scope.$apply();
        });

    }



    $scope.isEditingProduct = false;
    $scope.isEditingProductSetting = false;


    $scope.clickClearProduct = () => {
        $scope.newProduct = {
            name: "",
            hsn: "",
            price: 0,
            gst: '0',
            qty: 0,
            bprice: 0,
            category: null,
            // discount: 0,
            barcode: null
        };

        $scope.error = false
    }
    $scope.clickClearProduct()




    $scope.products = false;

    $scope.clickSaveProduct = function () {

        if ($scope.newProduct.isUpdate) {

            ProductModule.updateProduct({

                hsn: $scope.newProduct.hsn,
                price: $scope.newProduct.price,
                bprice: $scope.newProduct.bprice,
                gst: $scope.newProduct.gst,
                qty: $scope.newProduct.qty,
                category: $scope.newProduct.category,
                barcode: $scope.newProduct.barcode
            }, $scope.newProduct.id, (result) => {
                if (!result.error) {

                    $scope.products[$scope.newProduct.arrayid] = { ...$scope.newProduct }
                    $scope.isEditingProduct = false;
                    $scope.clickClearProduct()

                }
                else {
                    $scope.error = result.error;

                }
                $scope.$apply();
            })

        } else {


            // validations

            if ($scope.newProduct.category == null) {

                $scope.product_form.category.$invalid = true

                return

            } else if ($scope.newProduct.name == '' || $scope.newProduct.name == null) {
                $scope.product_form.pname.$invalid = true

                return
            }

            if ($scope.newProduct.barcode == "")
                $scope.newProduct.barcode = null



            ProductModule.insertProduct($scope.newProduct, (result) => {

                if (!result.error) {

                    getProductFromDatabase()
                    $scope.clickClearProduct()
                    $scope.isEditingProduct = false;

                }
                else {
                    $scope.error = result.error;

                }
                $scope.$apply();
            })

        }

    }

    $scope.clickCancelProduct = () => {

        $scope.isEditingProduct = false;

        $scope.clickClearProduct()
    }


    $scope.deleteProduct = (id) => {



        ProductModule.deleteProduct(id, () => {

            $scope.products.find((o, i) => {

                if (o) {

                    if (o.id === id) {

                        delete $scope.products[i]
                        $scope.$apply();

                        return i; // stop searching
                    }
                }
            })


        })
    }


    $scope.editProduct = (product) => {


        delete product.$$hashKey



        $scope.products.find((o, i) => {
            if (o)
                if (o.id === product.id) {
                    product.gst = product.gst + "";
                    $scope.newProduct = {
                        ...product, arrayid: i, isUpdate: true
                    };
                    $scope.isEditingProduct = true;
                    return;
                }
        })



    }

    $scope.deleteProductCategory = (name) => {

        $scope.newCategoryError.flag = false

        ProductCategoryModule.deleteProductCategory(name, (result) => {


            if (!result.error) {

                getProductCategorys()

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
            $scope.isEditingProduct = true
            $scope.$apply()
            $scope.focusFrist = true
            $scope.clickClearProduct()
            $scope.$apply()
        }

        if (event.keyCode == '27') {
            $scope.isEditingProduct = false
            $scope.isEditingProductSetting = false

            $scope.$apply()
        }


    });

}];