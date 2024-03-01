const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Joi  = require('joi')
const { isLoggedIn } = require('../middleware');


const validateCamps = (req,res,next) =>{
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    });    
    const {error} = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

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
    await campground.save();
    req.flash('success', 'Successfully Created!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Such Does not Exist')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


router.get('/:id/edit',isLoggedIn, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCamps, catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully Updated!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted the Camp!')
    res.redirect('/campgrounds');
}));

module.exports  = router;