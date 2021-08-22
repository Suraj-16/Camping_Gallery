const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
};

module.exports.renderNewForm = (req,res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
    
    const camp = new Campground(req.body.campground);
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${camp._id}`)
};

module.exports.showCampground = async (req,res) => {
    const camp = await Campground.findById(req.params.id).populate('author').populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    console.log(camp);
    if(!camp){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", {camp});
};

module.exports.editCampground = async (req, res) => {

    const camp = await Campground.findById(req.params.id);
    
    if(!camp){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", {camp});
};

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
     const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
     const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
     camp.images.push(...imgs);
     await camp.save();
     if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});

     }
     req.flash("success", "Successfully Updated campground");
     res.redirect(`/campgrounds/${camp._id}`);
 };

 module.exports.deleteCampground = async (req,res) => {

    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};