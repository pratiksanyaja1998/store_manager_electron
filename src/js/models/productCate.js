var ProductCategoryModule = function () {


    return {

        getProductCategorys: (callback) => {
            knex.select('name', 'id').from('productCategory').orderBy('name', 'asc')
                .then((result) => {
                    category = result.map((item) => {
                        return item.name
                    })
                    callback(category);
                })
        },

        deleteProductCategory: (name, callback) => {

            knex('products').select().where('category', name).then((rows) => {

                if (rows.length > 0) {
                    callback({ 'error': "Please Delete Frist Product Which Contain " + name + " Category." });
                } else {

                    knex('productCategory')
                        .where('name', name)
                        .del().then((result) => {
                            callback(result)
                        })

                }
            })

        },

        insertProductCategory: (category, callback) => {
            knex('productCategory').insert(category)
                .then((result) => {
                    callback(result)
                }).catch((e) => {
                    if (e.message.indexOf("UNIQUE") >= 0) {
                        callback({ 'error': "Category Must Unique." });
                    }
                });
        },



    }

}();

module.exports = ProductCategoryModule;
