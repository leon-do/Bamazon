var mysql = require('mysql');
var http = require('http')
var url = require('url');



// ========== start SQL ============================

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'Bamazon'
});

connection.connect();



// ========== Listen to shyt from the shitty website ============================

var myServer = http.createServer(function(request, response){
    // console.log(request.url) //this will log everything after localhost:8080/
    var urlData = url.parse(request.url,true).query;

    //console.log(urlData.itemID)
    //console.log(urlData.clientQuantity)

    // gets itemID and clientQuantity from client side
    var itemID = urlData.itemID;
    var clientQuantity = urlData.clientQuantity;

    readmySQL(itemID, clientQuantity);

})
myServer.listen(8080);







// ========== read mySQL sh1t ============================

function readmySQL(itemID, clientQuantity){

    // search the itemID (that client provides) and find StockQuantity (from sql)
    connection.query('SELECT StockQuantity FROM Bamazon.Products WHERE itemID=?', itemID, function(err, rows, fields) {
        if (err) throw err;

        //StockQuantity is the number from mySQL
        var StockQuantity = parseInt(rows[0].StockQuantity);


        if (StockQuantity < clientQuantity){
          console.log('Insufficient quantity!')
        } else {
          var itemsLeft = StockQuantity - clientQuantity;
          console.log(itemsLeft + " items left")

          calculateCost(itemID,clientQuantity)
          updateSQL(itemID,itemsLeft);
        }


    });//connect.query

}//readmysQL







// ========== update SQL once the item is ordered ===================

function updateSQL(itemID,itemsLeft){

    connection.query('UPDATE Bamazon.Products SET StockQuantity=? WHERE itemID=?', [itemsLeft, itemID], function(err, rows, fields) {
      if (err) throw err;

    })

}//updateSQL









// ========== calculate and display cost ===================

function calculateCost(itemID,clientQuantity){
    //get price and store it in var pricePerItem

    connection.query('SELECT Price FROM Bamazon.Products WHERE itemID=?;', [itemID], function(err, rows, fields) {

        if (err) throw err;

        var pricePerItem = rows[0].Price;

        var totalCost = clientQuantity * pricePerItem;

        console.log('total cost is: ' + totalCost)

    })//connectionquery

}//calculateCost












;
