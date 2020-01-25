var ProductModule = function () {

    const TABLENAME = 'settings'

    return {

        getInvoiceSr: (callback) => {
            knex.select().from(TABLENAME).where("name", 'insrno').orWhere('name', 'insrpre')
                .then((result) => {
                    callback(result);
                })
        },


        // after invoice create increments ++
        updateInvoiceSr: (callback) => {

            knex.select().from(TABLENAME).where("name", 'insrno')
                .then((result) => {
                    no = Number(result[0].data);
                    no++;
                    console.log(no)
                    knex(TABLENAME)
                        .update({ data: no }).where('name', 'insrno').then((result) => {
                            callback(result)
                        })
                })
        },



        getSetting: (name, callback) => {

            knex.select("data").from(TABLENAME).where("name", name).then(

                (rows) => {

                    callback(JSON.parse(rows[0].data))

                }

            );

        },

        // for json
        updateSettingJson: (name, data, callback) => {

            knex(TABLENAME).update({ data: JSON.stringify(data) }).where("name", name).then((result) => {
                callback(result);

            })
        },
        

        // no json
        updateSettingData: (row, callback) => {


            knex(TABLENAME)
                .update({ data: row.data }).where('name', row.name).then((result) => {
                    callback(result)
                })

        },


    }
}();

module.exports = ProductModule;

