const { promisify } = require('util');
const Hapi = require('hapi');
const csv = require('csvtojson')

const NO_IMAGE = 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available';
const NO_IMAGE2 = 'http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708';

const csvFilePath='./data/marvel.csv';
const heroesData = [];

// Load the data before running the server
csv()
.fromFile(csvFilePath)
.on('json', (jsonObj)=> {
    // Ignore all heroes with no image
    if (jsonObj.thumbnail.path !== NO_IMAGE && jsonObj.thumbnail.path !== NO_IMAGE2) {
        jsonObj.thumbnail.url = `${jsonObj.thumbnail.path}.${jsonObj.thumbnail.extension}`;
        heroesData.push(jsonObj);
    }
})
.on('done', (error)=> {

    if (error) { 
        throw error;
    }

    const heroes = { results: heroesData };

    const server = new Hapi.Server();

    server.connection({ 
        port: process.env.PORT || 3001, 
        host: '0.0.0.0',
        routes: { cors: true } 
    });

    server.route({
        method: 'GET',
        path:'/heroes', 
        handler: function (request, reply) {
            return reply(heroes);
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log(`Server running at: ${server.info.uri}`);
    });
});

