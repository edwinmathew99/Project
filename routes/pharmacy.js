var exp = require('express');
var router = exp.Router();

var sqlcon = require("../config/db");

//display of tables-Admin//
router.get("/inventory", (req, res) => {
    sqlcon.query("select sno,med_details.med_name,invoice_id,expiry_date,med_details.unit_price,stocks, supplier_details.supplier_name from ((pharmacy.pharmacy_inventory inner join med_details on pharmacy_inventory.med_id=med_details.med_id) inner join supplier_details on pharmacy_inventory.supplier_id=supplier_details.supplier_id) "
        , function (err, result) {
            if (err) throw err
            res.send(result);
        })

})




router.get("/soldmeds", (req, res) => {
    sqlcon.query("select pharmacy_sales.sno,med_details.med_name,units_sold,sale_date,customer.customer_name from ((pharmacy_sales inner join med_details on pharmacy_sales.med_id=med_details.med_id) inner join customer on pharmacy_sales.customer_id=customer.customer_id)", function (err, result) {
        if(err) throw err
        res.send(result);
    })

})

router.get("/supplier", (req, res) => {
    sqlcon.query("select * from supplier_details", function (err, result) {
        res.send(result);
    })

})

//Empty Meds-Admin//
router.get("/emptymeds", function (req, res) {
    sqlcon.query(`select med_details.med_name from pharmacy_inventory inner join med_details on pharmacy_inventory.med_id=med_details.med_id where pharmacy_inventory.stocks='0'`, function (err, result) {
        if(err) throw err
        res.send(result);
    });
})
//Remnant Stocks_Admin//
router.get("/remstocks", function (req, res) {
    sqlcon.query(`select med_details.med_name,stocks from pharmacy_inventory inner join med_details on pharmacy_inventory.med_id=med_details.med_id`, function (err, result) {
        res.send(result);
    });
})



//New Entry into tables-Admin//
router.post("/inventory", function (req, res) {
    var entry = req.body;
    sqlcon.query("insert into pharmacy_inventory (sno,med_id,invoice_id,expiry_date,stocks,supplier_id) values(?,?,?,?,?,?)", [entry.sno, entry.med_id, entry.invoice_id, entry.expiry_date, entry.stocks, entry.supplier_id], function (err, result) {
        if (err) throw err
        

    })
    sqlcon.query(`insert into med_details (med_id,med_type,med_name,unit_price) values(?,?,?,?)`, [entry.med_id, entry.med_type, entry.med_name, entry.price], function (err, result) {
        if (err) throw err
        res.send(`Data inserted`);

    })
    

})
    *
    router.post("/meddetails", function (req, res) {
        var entry = req.body;
        sqlcon.query("insert into med_details (med_tpn,med_type) values(?,?)", [entry.med_tpn, entry.med_type], function (err, result) {
            if (err) throw err
            res.send(`Data inserted`);

        })


    })

router.post("/supplier", function (req, res) {
    var entry = req.body;
    sqlcon.query("insert into supplier_details (supplier_id,supplier_name) values(?,?)", [entry.supplier_id, entry.supplier_name], function (err, result) {
        if (err) throw err
        res.send(`Data inserted`);

    })


})



    //Updation-Admin//
    *
    router.put('/inventory/:sno', function (req, res) {
        var entry = req.body;
        sqlcon.query(`update pharmacy_inventory set sno=?,med_id=?,batch=?,med_name=?,med_type=?,expiry_date=?,stocks=?,supplier=?,price=? where (sno=${req.params.sno})`, [entry.sno, entry.med_id, entry.batch, entry.med_name, entry.med_type, entry.expiry_date, entry.stocks, entry.supplier, entry.price], function (err, result) {
            if (err) throw err
            else {
                res.send(`Update of inventory sno ${req.params.sno} successfull`);
                res.send(result);
            }
        })
    })





router.put('/supplier/:id', function (req, res) {
    var entry = req.body;
    sqlcon.query(`update supplier_details set supplier_id=?,supplier_name=? where (supplier_id=${req.params.id})`, [entry.supplier_id, entry.supplier_name], function (err, result) {
        if (err) throw err
        else {
            res.send(`Update of supplier_details with supplier id ${req.params.id} successfull`);
            res.send(result);
        }
    })
})





//Deletion-Admin//
router.delete("/inventory/:sno", function (req, res) {
    sqlcon.query(`DELETE FROM pharmacy_inventory WHERE (sno = ${req.params.sno} )`, function (err, result) {
        if (err) throw err;
        res.send(`Deleted record with sno ${req.params.sno}`);
    })
})


router.delete("/supplier/:id", function (req, res) {
    sqlcon.query(`DELETE FROM supplier_details WHERE (supplier_id= ${req.params.id} )`, function (err, result) {
        if (err) throw err
        res.send(`Deleted record with supplier id ${req.params.id}`);

    });

})

//USER//

//Purchase//

router.post('/useradd', function (req, res) {

    console.log(req.body);
    var data = req.body;
    sqlcon.query(`select med_id into @id from pharmacy.med_details where med_name=?`, [data.med_name], function (err, result) {
        if (err) throw err
    });
    sqlcon.query(`insert into pharmacy_sales(med_id,units_sold,customer_id,sale_date) values (@id,?,?,CURDATE()) `, [data.qty, data.customer_id], function (err, result) {
        if (err) throw err

    })

    sqlcon.query(`select (stocks-${data.qty}) into @stk from pharmacy.pharmacy_inventory where med_id=@id`, function (err, result) {
        if (err) throw err
    });

    sqlcon.query(`update pharmacy_inventory set pharmacy_inventory.stocks=@stk where med_id=@id`, function (err, result) {
        if (err) throw err
        else {
            res.send(`medicine added`)
        }
    });
})




//User deletion of item//
router.delete("/userdelete/:uid/:medname", function (req, res) {

    sqlcon.query(`select med_details.med_id into @id from med_details where med_name=?`, [req.params.medname], function (err, result) {
        if (err) throw err
    })
    sqlcon.query(`select stocks into @stk from pharmacy_inventory where med_id=@id`, function (err, result) {
        if (err) throw err
    })

    sqlcon.query(`select units_sold into @sto from pharmacy_sales where (med_id=@id and customer_id=?)`, [req.params.uid], function (err, result) {
        if (err) throw err
    })
    sqlcon.query(`update pharmacy_inventory set stocks=@stk+@sto where med_id=@id`, function (err, result) {
        if (err) throw err
    })

    sqlcon.query(`DELETE FROM pharmacy_sales WHERE med_id=@id and customer_id=?`, [req.params.uid], function (err, result) {
        if (err) throw err
        res.send(`Deleted record of ${req.params.medname} purchased by ${req.params.uid}`);

    });

})

//User cart display//
router.get('/usercartdisplay/:uid', function (req, res) {
    sqlcon.query(`select sno,med_details.med_name,units_sold,med_details.unit_price,sale_date,med_details.unit_price*units_sold as Net_amount from (pharmacy.pharmacy_sales inner join med_details on pharmacy_sales.med_id=med_details.med_id) where customer_id=?;`, [req.params.uid], function (err, result) {
        if (err) throw err
        else {
            res.send(result);
        }
    })
   


})


//User Update//
router.put('/usercartupdate', function (req, res) {
    var entry = req.body;
    sqlcon.query(`select med_details.med_id into @id from med_details where med_name=?`, [entry.med_name], function (err, result) {
        if (err) throw err
    })
    sqlcon.query(`select units_sold into @val from pharmacy_sales where customer_id=? and med_id=@id`, [entry.customer_id], function (err, result) {
        if (err) throw err
    })
    sqlcon.query(`select stocks into @sto from pharmacy_inventory where med_id=@id`, function (err, result) {
        if (err) throw err
    })

    sqlcon.query(`update pharmacy_inventory set stocks=@sto+@val where med_id=@id`, function (err, result) {
        if (err) throw err
        
    })
    sqlcon.query(`update pharmacy_sales set units_sold=? where customer_id=? and med_id=@id`, [entry.qty, entry.customer_id], function (err, result) {
        if (err) throw err
        else {
            res.send(result)
        }
    })

})

module.exports = router;