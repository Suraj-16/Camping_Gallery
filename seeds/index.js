const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelper');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useCreateIndex : true,
    useNewUrlParser : true,
    useUnifiedTopology : true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error : "));
db.once("open", () => {
    console.log("Conncted Succesfully !!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const price = Math.floor(Math.random() * 20) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '610fdec50f99624ed4542aa8',
            title : `${sample(descriptors)} ${sample(places)}`,
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates minima sunt esse doloribus vitae ad fugiat, adipisci accusamus ratione officiis consequatur, assumenda error sapiente totam mollitia. Rem repellat unde nulla.',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dxso92brz/image/upload/v1629122640/YelpCamp/fv8okg6oacss8ttpg2c6.jpg',
                  filename: 'YelpCamp/fv8okg6oacss8ttpg2c6'
                },
                {
                  url: 'https://res.cloudinary.com/dxso92brz/image/upload/v1629122690/YelpCamp/f6xwhkcfn5urusky4wsr.jpg',
                  filename: 'YelpCamp/f6xwhkcfn5urusky4wsr'
                }
              ]
        });
    await camp.save();
    }
}

seedDB();