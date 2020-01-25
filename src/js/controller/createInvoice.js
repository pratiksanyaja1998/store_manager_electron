module.exports = ["$scope", "$rootScope", "$location", function ($scope, $rootScope, $location) {


    $rootScope.isWaiting = false;
    $rootScope.location = '/invoice';

    $scope.isLoading = false;

    $scope.isEditingInvoiceFormSetting = false

    SettingModule.getSetting('invoiceForm' , (rs) => {

        $scope.settings = rs
        $scope.$apply()

    })

    $scope.changeSettings = () => {

        SettingModule.updateSettingJson('invoiceForm' , $scope.settings, () => {

        })
    }


    SettingModule.getInvoiceSr((result) => {
        $scope.srno = result[1].data + result[0].data;
    })

    var today = new Date();

    $scope.dd = today.getDate();
    $scope.mm = today.getMonth() + 1;
    $scope.yyyy = today.getFullYear();

    $scope.billno = "";


    $scope.CustomerFilter = {
        offset: 0,
        limit: 16,
        searchInput: '',
        isNext: true
    }


    let getCustomerToDatabase = () => CustomerModule.getCustomers($scope.CustomerFilter, (row) => {
        if (row.length < $scope.CustomerFilter.limit)
            $scope.CustomerFilter.isNext = false
        else
            $scope.CustomerFilter.isNext = true

        $scope.customer = row
        $scope.$apply();
    });




    $scope.chnageCustomerSearchData = () => {
        getCustomerToDatabase()
        $scope.isSearchingCustomer = true
    }


    $scope.clickPrevCustomer = () => {
        $scope.CustomerFilter.offset = $scope.CustomerFilter.offset - $scope.CustomerFilter.limit
        getCustomerToDatabase()
    }

    $scope.clickNextCustomer = () => {
        $scope.CustomerFilter.offset = $scope.CustomerFilter.offset + $scope.CustomerFilter.limit
        getCustomerToDatabase()
    }



    $scope.clickNewCustomer = function () {

        $scope.newCustomer = {
            name: "",
            phno: "",
            gstin: "",

            //billing addr
            barea: "",
            bcity: "",
            bstate: "",
            bpincode: "",

            isb_d: false,//is samebilling addr dellivery addr

            //delivry addr
            darea: "",
            dcity: "",
            dstate: "",
            dpincode: "",

        };

        $scope.CustomerFilter = {
            offset: 0,
            limit: 16,
            searchInput: '',
            isNext: true
        }

        $scope.isSearchingCustomer = false
        $scope.searchCustomerInput = '';
    }

    $scope.clickNewCustomer();

    $scope.clickSameBDAddr = function () {
        if ($scope.newCustomer.isb_d) {

            $scope.newCustomer.darea = $scope.newCustomer.barea;
            $scope.newCustomer.dcity = $scope.newCustomer.bcity;
            $scope.newCustomer.dstate = $scope.newCustomer.bstate;
            $scope.newCustomer.dpincode = $scope.newCustomer.bpincode;

        } else {

            $scope.newCustomer.darea = '';
            $scope.newCustomer.dcity = '';
            $scope.newCustomer.dstate = '';
            $scope.newCustomer.dpincode = '';

        }
    }

    $scope.isSelectFromDatabaseCustomer = false;
    $scope.selectCustomerIntoSearchData = function (customer) {
        id = customer.id
        delete customer.$$hashKey
        delete customer.id
        delete customer.email
        delete customer.info

        $scope.isSelectFromDatabaseCustomer = true;
        $scope.newCustomer = {
            ...customer,
            customer: id,
            isb_d: (customer.isb_d == 1) ? true : false
        };
        $scope.isSearchingCustomer = false
        $scope.searchCustomerInput = '';
    }



    $scope.productCategory = false;

    ProductCategoryModule.getProductCategorys((row) => {

        $scope.productCategory = row
        $scope.$apply();

    })


    $scope.ProductFilter = {
        offset: 0,
        limit: 16,
        searchInput: '',
        isNext: true,
        catagory: null,
    }



    let getProductFromDatabase = () => {
        ProductModule.getProducts($scope.ProductFilter, (row) => {
            $scope.products = row
            if (row.length < $scope.ProductFilter.limit)
                $scope.ProductFilter.isNext = false
            else
                $scope.ProductFilter.isNext = true

            $scope.$apply();
        });

    }


    $scope.changeProductFilterData = () => {
        $scope.isSearchingProduct = true
        $scope.ProductFilter.offset = 0
        getProductFromDatabase()
    }



    $scope.clickPrevProduct = () => {
        $scope.ProductFilter.offset = $scope.ProductFilter.offset - $scope.ProductFilter.limit
        getProductFromDatabase()
    }

    $scope.clickNextProduct = () => {
        $scope.ProductFilter.offset = $scope.ProductFilter.offset + $scope.ProductFilter.limit
        getProductFromDatabase()
    }


    $scope.invoceProduct = [];

    $scope.clickClearProducts = () => {
        $scope.invoceProduct = [];
        $scope.isSearchingProduct = false;

        $scope.ProductFilter = {
            offset: 0,
            limit: 16,
            searchInput: '',
            isNext: true,
            catagory: null,
        }

        $scope.invoceProductTotal = 0.0;
        $scope.invoceProductTotalWithDiscout = 0.0;
        $scope.invoceProductDescout = 0;

    }

    $scope.invoceProductTotal = 0.0;
    $scope.invoceProductTotalWithDiscout = 0.0;
    $scope.invoceProductDescout = 0;

    // start counter product table
    $scope.ProductSearchError  = {
        flag:false,
        message:false
    }

    $scope.selectProducIntoSearchData = (productRow) => {

        $scope.ProductSearchError.flag =false

        isProductExist = $scope.invoceProduct.find((o, i) => {

            
                if (o.products === productRow.id) {
                    return true; // stop searching
                }
            
        })

        if (isProductExist){

            $scope.ProductSearchError.flag = true
            $scope.ProductSearchError.message = "Product Already Exists In Invoice Products." 

            return;
        }
            

        productRow = { ...productRow }

        delete productRow.$$hashKey

        delete productRow.category

        delete productRow.bprice

        delete productRow.discount

        productid = productRow.id

        delete productRow.id

        //default settings
        productRow.gst = productRow.gst + "";
        productRow.qty = 1;

        $scope.invoceProduct.push({ ...claculateTable(productRow), products: productid, invoice: 0 });

        $scope.searchProductCategory = null;


    }

    function claculateTable(productRow) {
        
        //calulate gst
        rate = (Number(productRow.price) * Number(productRow.qty))

        if ($scope.settings.gstInProductWise) {
            productRow.total = roundToTwo(rate + ((rate * Number(productRow.gst)) / 100)) //PRODUCT PRICE FINAL WITH round up
        } else {
            productRow.total = rate
        }

        //add for show with gst qty discout
        if (!isNaN(productRow.total))
            $scope.invoceProductTotal += productRow.total;

        if ($scope.settings.gstInProductWise) {
            $scope.invoceProductTotalWithGst = roundToTwo($scope.invoceProductTotal);
        } else {
            $scope.invoceProductTotalWithGst = roundToTwo($scope.invoceProductTotal + (($scope.invoceProductTotal * $scope.gst) / 100));
        }

        $scope.invoceProductTotalWithDiscout = roundToTwo($scope.invoceProductTotalWithGst - (($scope.invoceProductTotalWithGst * $scope.invoceProductDescout) / 100));

        return productRow
        //done calutation
    }

    function roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    $scope.changeInvoceProductsData = function (index) {

        $scope.error = false

        if (!isNaN($scope.invoceProduct[index].total))
            $scope.invoceProductTotal -= $scope.invoceProduct[index].total;


        claculateTable($scope.invoceProduct[index])

    }

    $scope.deleteInvoiceProduct = (index) => {
        if (!isNaN($scope.invoceProduct[index].total))
            $scope.invoceProductTotal -= $scope.invoceProduct[index].total;

        //invoice price with descout
        $scope.invoceProductTotalWithDiscout = $scope.invoceProductTotal - (($scope.invoceProductTotal * Number($scope.invoceProductDescout)) / 100);
        $scope.invoceProductTotalWithDiscout = roundToTwo($scope.invoceProductTotalWithDiscout)


        $scope.invoceProduct.splice(index, 1);
        $scope.$evalAsync()
    }

    $scope.clickCreateProduct = function () {
        $scope.invoceProduct.push({
            name: "",
            // discount: 0,
            gst: $scope.gst + "",
            hsn: "",
            qty: 1,
            price: 0.0,
            total: 0.0,
            invoice: 0,
        });
    }

    $scope.changeDiscount = function () {
        $scope.invoceProductTotalWithDiscout = $scope.invoceProductTotal - (($scope.invoceProductTotal * $scope.invoceProductDescout) / 100);
        $scope.invoceProductTotalWithDiscout = roundToTwo($scope.invoceProductTotalWithDiscout)
    }

    $scope.changeGst = () => {

        $scope.invoceProductTotalWithGst = roundToTwo($scope.invoceProductTotal + (($scope.invoceProductTotal * $scope.gst) / 100));
        $scope.invoceProductTotalWithDiscout = roundToTwo($scope.invoceProductTotalWithGst - (($scope.invoceProductTotalWithGst * $scope.invoceProductDescout) / 100));

    }

    //product table counter end

    $scope.gst = '0'

    $scope.tprchage = false;
    $scope.desciption = "";
    $scope.paymentMethrd = null;
    $scope.gsttype = "GST";

    $scope.clickClearOtherDetail = () => {
        $scope.tprchage = false;
        $scope.desciption = "";
        $scope.paymentMethrd = null;
        $scope.gsttype = "GST";
    }

    $scope.error = false
    $scope.saveInvoce = () => {


        if ($scope.invoceProduct.length <= 0) {

            $scope.error = 'One Items Must be Required.'

            return
        }

        $scope.isLoading = true

        InvoiceModule.insertInvoice(
            {
                invoice: {
                    ...$scope.newCustomer,
                    gstin: $scope.newCustomer.gstin.toUpperCase(),
                    tprchage: $scope.tprchage,
                    desciption: $scope.desciption,
                    paymentMethrd: $scope.paymentMethrd,
                    dd: $scope.dd,
                    mm: $scope.mm,
                    srno: $scope.srno,
                    yyyy: $scope.yyyy,
                    gst: $scope.gst,
                    billno: $scope.billno,
                    gsttype: $scope.gsttype,
                    total: $scope.invoceProductTotalWithDiscout,
                    discount: $scope.invoceProductDescout
                },
                invoiceProducts: $scope.invoceProduct
            }, (result) => {
                InvoiceModule.showInvoice(result.invoiceid)
                $location.path('/invoice');
                $scope.$apply();
            })

    }


    $scope.error = false


    $scope.clickToCancel = () => {

        $location.path('/invoice');
    }


    document.addEventListener("keydown", (event) => {

        if (event.keyCode == '27') {
            $location.path('/invoice');
            $scope.$apply()
        }

        if (event.keyCode == 8) {
            $scope.isEditingInvoiceFormSetting = false
            $scope.$apply()
        }

    });

}];
