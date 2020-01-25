module.exports = ["$scope", "$rootScope", '$location', function ($scope, $rootScope, $location) {



    // rootscope
    $rootScope.isWaiting = false;

    $rootScope.location = '/customer';

   
    SettingModule.getSetting('customer' , (rs) => {
        $scope.settings = rs
        $scope.$apply()

    })

    $scope.changeSettings = () => {
        SettingModule.updateSettingJson('customer' , $scope.settings, (rs) => {

        })
    }

    $scope.isEditingCustomerSetting = false;

    $scope.filter = {
        offset: 0,
        limit: 13,
        searchInput: '',
        isNext: true
    }


    let getCustomerToDatabase = () => CustomerModule.getCustomers($scope.filter, (row) => {
        if (row.length < $scope.filter.limit)
            $scope.filter.isNext = false
        else
            $scope.filter.isNext = true

        $scope.customer = row
        $scope.$apply();
    });

    getCustomerToDatabase()


    $scope.searchCustomer = () => {
        getCustomerToDatabase()
    }

    $scope.clickPrev = () => {
        $scope.filter.offset = $scope.filter.offset - $scope.filter.limit
        getCustomerToDatabase()
    }

    $scope.clickNext = () => {
        $scope.filter.offset = $scope.filter.offset + $scope.filter.limit
        getCustomerToDatabase()
    }

    $scope.isEditingCustomer = false;
    $scope.clickNewCustomer = function () {
        $scope.isEditingCustomer = true;

    }


    $scope.deleteCustomer = (id) => {

        CustomerModule.deleteCustomer(id, () => {
            $scope.customer.find((o, i) => {
                if (o) {
                    if (o.id === id) {
                        delete $scope.customer[i]
                        $scope.$apply();
                        return; // stop searching
                    }
                }
            })
        })

    }


    $scope.editCustomer = function (customer) {


        $scope.customer.find((o, i) => {

            if (o)
                if (o.id === customer.id) {

                    $scope.isEditingCustomer = true;
                    $scope.newCustomer = {
                        ...customer,
                        arrayid: i,
                        isUpdate: true,
                        isb_d: (customer.isb_d == 1) ? true : false
                    };
                    return;
                }
        })

        $scope.error = false
    }



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

    $scope.clickSaveCustomer = function () {


        $scope.error = false

        if ($scope.newCustomer.isUpdate) {


            CustomerModule.updateCustomer({
                phno: $scope.newCustomer.phno,
                gstin: $scope.newCustomer.gstin.toUpperCase(),

                //billing addr
                barea: $scope.newCustomer.barea,
                bcity: $scope.newCustomer.bcity,
                bstate: $scope.newCustomer.bstate,
                bpincode: $scope.newCustomer.bpincode,

                isb_d: $scope.newCustomer.isb_d,//is samebilling addr dellivery addr

                //delivry addr
                darea: $scope.newCustomer.darea,
                dcity: $scope.newCustomer.dcity,
                dstate: $scope.newCustomer.dstate,
                dpincode: $scope.newCustomer.dpincode,

            }, $scope.newCustomer.id, (result) => {

                if (!result.error) {

                    $scope.customer[$scope.newCustomer.arrayid] = { ...$scope.newCustomer }

                    $scope.isEditingCustomer = false;

                    $scope.clickClearCustomer();

                }
                else {
                    $scope.error = result.error;

                }
                $scope.$apply();
            })
        } else {

            // validations
            if ($scope.newCustomer.name == '' || $scope.newCustomer.name == null) {
                $scope.customer_form.cname.$invalid = true

                return
            }

            if ($scope.newCustomer.phno == "")
                $scope.newCustomer.phno = null


            //save customer
            CustomerModule.insertCustomer($scope.newCustomer, (result) => {

                if (!result.error) {

                    data = { ...$scope.newCustomer, gstin: $scope.newCustomer.gstin.toUpperCase(), id: result[0] }
                    $scope.customer.push(data);
                    $scope.isEditingCustomer = false;
                    $scope.clickClearCustomer();

                }
                else {
                    $scope.error = result.error;

                }
                $scope.$apply();
            })

        }
    }

    $scope.clickCancelCustomer = function () {

        $scope.isEditingCustomer = false;

        $scope.clickClearCustomer()

    }

    $scope.error = false


    $scope.clickClearCustomer = function () {
        $scope.newCustomer = {
            name: "",
            phno: null,
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
        $scope.error = false

    }

    $scope.clickClearCustomer();

    $scope.focusFrist = true

    let ispressALT = false

    document.addEventListener("keydown", (event) => {

        if (event.ctrlKey && event.key == "n") {

            $scope.isEditingCustomer = true
            $scope.clickClearCustomer()
            $scope.$apply()
            $scope.focusFrist = true
            $scope.$apply()

        }

        if (event.keyCode == '27') {
            $scope.isEditingCustomer = false
            $scope.isEditingCustomerSetting = false
            $scope.$apply()
        }

       

    });

}];