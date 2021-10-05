var mysql=require("mysql");
var connection= mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'welcome@123',
    database:'pharmacy'

})
connection.connect(function(err){
    if(err)throw err
    console.log('connection to database successful');
})

module.exports=connection;