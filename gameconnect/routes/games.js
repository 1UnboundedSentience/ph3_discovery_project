var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for games
//this will be accessible from http://127.0.0.1:3000/games if the default route for / is left unchanged
router.route('/')
    //GET all games
    .get(function(req, res, next) {
        //retrieve all games from Monogo
        mongoose.model('Game').find({}, function (err, games) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/games folder. We are also setting "games" to be an accessible variable in our jade view
                    html: function(){
                        res.render('games/index', {
                              title: 'All my Games',
                              "games" : games
                          });
                    },
                    //JSON response will show all games in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }
        });
    })
    //POST a new game
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title = req.body.title;
        var platform = req.body.platform;
        var developer = req.body.developer;
        var genre = req.body.genre;
        //call the create function for our database
        mongoose.model('Game').create({
            title : title,
            platform : platform,
            developer : developer,
            genre : genre
        }, function (err, game) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Game has been created
                  console.log('POST creating new game: ' + game);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("games");
                        // And forward to success page
                        res.redirect("/games");
                    },
                    //JSON response will show the newly created game
                    json: function(){
                        res.json(game);
                    }
                });
              }
        })
    });

/* GET New Game page. */
router.get('/new', function(req, res) {
    res.render('games/new', { title: 'Add New Game' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Game').findById(id, function (err, game) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(game);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Game').findById(req.id, function (err, game) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + game._id);
        // var gamedob = game.dob.toISOString();
        // gamedob = gamedob.substring(0, gamedob.indexOf('T'))
        res.format({
          html: function(){
              res.render('games/show', {
                // "gamedob" : gamedob,
                "game" : game
              });
          },
          json: function(){
              res.json(game);
          }
        });
      }
    });
  });

//GET the individual game by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the game within Mongo
    mongoose.model('Game').findById(req.id, function (err, game) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the game
            console.log('GET Retrieving ID: ' + game._id);
            //format the date properly for the value to show correctly in our edit form
          // var gamedob = game.dob.toISOString();
          // gamedob = gamedob.substring(0, gamedob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('games/edit', {
                          title: 'Game' + game._id,
                        // "gamedob" : gamedob,
                          "game" : game
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(game);
                 }
            });
        }
    });
});

//PUT to update a game by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var title = req.body.title;
    var platform = req.body.platform;
    var developer = req.body.developer;
    var genre = req.body.genre;

   //find the document by ID
        mongoose.model('Game').findById(req.id, function (err, game) {
            //update it
            game.update({
                title : title,
                platform : platform,
                developer : developer,
                genre : genre
            }, function (err, gameID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              }
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/games");
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(game);
                         }
                      });
               }
            })
        });
});

//DELETE a Game by ID
router.delete('/:id/edit', function (req, res){
    //find game by ID
    mongoose.model('Game').findById(req.id, function (err, game) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            game.remove(function (err, game) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + game._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/games");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : game
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;
