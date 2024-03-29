const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Joi  = require('joi')
const { isLoggedIn, isAuthor, validateCamps } = require('../middleware');



router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.post('/', isLoggedIn, validateCamps, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Created!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    // console.log(campground)
    if(!campground){
        req.flash('error', 'Such Does not Exist')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCamps, catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully Updated!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isAuthor, catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted the Camp!')
    res.redirect('/campgrounds');
}));

module.exports  = router;
