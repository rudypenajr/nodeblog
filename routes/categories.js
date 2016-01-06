var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

// Added by Rudy Pena !!
router.get('/', function (req, res, next) {
    var db = req.db;
    var categories = db.get('categories');

    categories.find({}, {}, function (err, categories) {
        res.render( 'categories', {
            'categories': categories
        });
    });
});
// End of !!

router.get('/show/:title', function (req, res, next) {
    var db = req.db;
    var posts = db.get('posts');

    console.log( 'what is the title?', req.params );

    posts.find({category: req.params.title}, {}, function (err, posts) {
        res.render( 'index', {
            'title': req.params.title,
            'posts': posts
        });
    });
});

router.get('/add', function (req, res, next) {
    res.render('addcategory', {
        'title': 'Add Category'
    });
});

router.post('/add', function (req,res,next) {
    // get form values
    console.log( req.body );
    var title = req.body.title;

    // form Validation
    req.checkBody('title', 'Title field is required.').notEmpty();

    // check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('addcategory', {
            'errors': errors,
            'title': title
        });
    } else {
        var categories = db.get('categories');

        categories.insert({
            'title': title
        }, function (err, post){
            if (err) {
                res.send('There was an issue submitting the category.');
            } else {
                req.flash('success', 'Category Submitted.');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;
