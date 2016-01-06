var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function (req, res, next) {
    var posts = db.get('posts');

    // posts.find({_id: req.params.id}, {}, function (err, posts) {
    posts.findById( req.params.id, function (err, post) {
        res.render( 'show', {
            'post': post
        });
    });
});

router.get('/add', function(req,res,next){
    // res.render('addpost', {
    //     "title": "Add Post",
    // });
    // Deprecated code because of the addition of
    // 'categories', we need to pass in 'categories' data


    var categories = db.get('categories');
    categories.find({},{},function(err, categories){
        res.render('addpost', {
            "title": "Add Post",
            "categories": categories
        });
    });
});

router.post('/addcomment', function (req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();

    req.checkBody('name', 'Name field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('email', 'Email is not formatted correctly.').isEmail();
    req.checkBody('body', 'Body field is required.').notEmpty();

    var errors = req.validationErrors();
    var posts = db.get('posts');
    if ( errors ) {
        posts = db.get('posts');
        posts.findById( postid, function ( err, post ) {
            res.render( 'show', {
                'errors': err,
                'post': post
            });
        });
    } else {
        var comment = {
            'name': name,
            'email': email,
            'body': body,
            'commentdate': commentdate
        };
        posts = db.get('posts');

        posts.update(
            {
                '_id': postid
            }, {
                $push: {
                    'comments': comment
                }
            }, function ( err, doc ) {
                if (err) {
                    throw err;
                } else {
                    req.flash('success', 'Comment Added');
                    res.location('/posts/show/' + postid);
                    res.redirect('/posts/show/' + postid);
                }
            }
        );
    }
});

router.post('/add', function(req,res,next){
    //  Get Form Values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    var mainImageName;
    // console.log(req.files.mainimage);

    if (req.files && req.files.mainimage) {
        console.log('Image was uploaded.');
        var mainImageOriginalName = req.files.mainimage.originalname;
        mainImageName = req.files.mainimage.name;
        var mainImageMime = req.files.mainimage.mimetype;
        var mainImagePath = req.files.mainimage.path;
        var mainImageExt = req.files.mainimage.extension;
        var mainImageSize = req.files.mainimage.size;
    } else {
        mainImageName = 'noimage.png';
    }

    // Form Validation
    req.checkBody('title', 'Title field is required.').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if (errors) {
        console.log('error has occurred!', errors);
        res.render('addpost', {
            'errors': errors,
            'title': title,
            'body': body
        });
    } else {
        var posts = db.get('posts');

        // Submit to DB
        posts.insert({
            'title': title,
            'body': body,
            'category': category,
            'date': date,
            'author': author,
            'mainimage': mainImageName
        }, function (err, post){
            if (err) {
                res.send('There was an issue submitting the post.');
            } else {
                req.flash('success', 'Post Submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;
