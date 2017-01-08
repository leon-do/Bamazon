var mysql = require('mysql');
var http = require('http')
var url = require('url');
var response = require('response')



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


    if (request.url !== '/'){
        var itemID = urlData.itemID;
        var clientQuantity = urlData.clientQuantity;

        readmySQL(itemID, clientQuantity);
    }




    // ========== read mySQL sh1t ============================

    function readmySQL(itemID, clientQuantity){

        // search the itemID (that client provides) and find StockQuantity (from sql)
        connection.query('SELECT StockQuantity FROM Bamazon.Products WHERE itemID=?',itemID, function(err, rows, fields) {
            if (err) throw err;

            //StockQuantity is the number from mySQL
            var StockQuantity = parseInt(rows[0].StockQuantity);

            //do some math
            var itemsLeft = StockQuantity - clientQuantity;

            if (StockQuantity < clientQuantity){
              console.log('Insufficient quantity!')
              response.setHeader('Access-Control-Allow-Origin', '*');
              response.write(JSON.stringify('Insufficient quantity!'))
              response.end();
            } else {
              console.log("items left: " + itemsLeft)

              //calculate the cost, update mySQL and send the data for index.html to display
              calculateCost(itemID,clientQuantity,itemsLeft)
            }


        });//connect.query

    }//readmySQL













    // ========== calculate and display cost in terminal ===================

    function calculateCost(itemID,clientQuantity,itemsLeft){
        //get price and store it in var pricePerItem

        connection.query('SELECT Price FROM Bamazon.Products WHERE itemID=?', itemID, function(err, rows, fields) {

            if (err) throw err;

            var pricePerItem = rows[0].Price;

            var totalCost = clientQuantity * pricePerItem;

            console.log('total cost is: ' + totalCost)

            updateSQL(itemID,clientQuantity,itemsLeft)

        })//connectionquery

    }//calculateCost







    // ========== update SQL once the item is ordered ===================

    function updateSQL(itemID,clientQuantity,itemsLeft){

        connection.query('UPDATE Bamazon.Products SET StockQuantity=? WHERE itemID=?', [itemsLeft,itemID], function(err, rows, fields) {
          if (err) throw err;


          dataSend(itemID,clientQuantity,itemsLeft)

        })

    }//updateSQL






    // ========== Send data over to front end ===================
    function dataSend(itemID,clientQuantity,itemsLeft){
        var data = {'itemID': itemID, 'clientQuantity':clientQuantity, 'itemsLeft':itemsLeft}
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.write(JSON.stringify(data))
        response.end();
    }





})//myServer
myServer.listen(8080);
