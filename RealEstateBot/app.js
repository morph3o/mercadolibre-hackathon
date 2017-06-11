var util = require('util');
var _ = require('lodash');
var builder = require('botbuilder');
var restify = require('restify');

/// <reference path="../SearchDialogLibrary/index.d.ts" />
var SearchLibrary = require('../SearchDialogLibrary');
var MercadoLibreSearch = require('../SearchProviders/mercadolibre-search');
var CalendarioTestSearch = require('../SearchProviders/calendario-pruebas');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen for messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/messages', connector.listen());

// Bot with main dialog that triggers search and display its results
var bot = new builder.UniversalBot(connector, [
    function (session) {
        // Trigger Search
        if (session.message.text.match(/buscar/i)) {
            SearchLibrary.begin(session);
        }
        if (session.message.text.match(/pruebas/i)) {
            CalendarioTestSearch
                .search({}).
                then((result) => {
                   var cards = [] 
                   result.results.forEach( (item) => {
                       var card = new builder.HeroCard(session)
                            .title(item.title)
                            .text(`el dia ${item.date}`)
                       cards.push(card);
                   });
                   var reply = new builder.Message(session)
                       .attachmentLayout(builder.AttachmentLayout.carousel)
                       .attachments(cards);
                   session.send(reply); 
                });
        }
    }
]);

// Azure Search
var mercadoLibreSearchClient = MercadoLibreSearch.create('tucolegio_bot', 'c097bca6-7afe-4987-a6ea-10a40629206d', 'listings');
var itemsResultsMapper = SearchLibrary.defaultResultsMapper(itemToSearchHit);

// Register Search Dialogs Library with bot
bot.library(SearchLibrary.create({
    multipleSelection: true,
    search: function (query) { return mercadoLibreSearchClient.search(query).then(itemsResultsMapper); },
    refiners: [],
    refineFormatter: function (refiners) {
        return _.zipObject(
            refiners.map(function (r) { return 'By ' + _.capitalize(r); }),
            refiners);
    }
}));

// Maps the AzureSearch RealState Document into a SearchHit that the Search Library can use
function itemToSearchHit(item) {
    return item;
   
}