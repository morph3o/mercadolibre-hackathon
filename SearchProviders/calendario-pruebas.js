var _ = require('lodash');
var uuid = require('uuid');
var loremIpsum = require('lorem-ipsum');
var moment = require('moment')

var Refiners = ['region', 'type'];

function refineFormatter(refiners) {
    return _.zipObject(
        refiners.map(function (r) { return 'By ' + _.capitalize(r); }),
        refiners);
}

function search(query) {
    console.log('mock-search.query:', query);

    // mock items facets
    var region = (_.find(query.filters, ['key', 'region']) || { value: undefined }).value;
    var type = (_.find(query.filters, ['key', 'type']) || { value: undefined }).value;

    var i = (query.pageNumber - 1) * 3;
    var result = {
        results: [
            { title: 'Prueba lenguaje ', description: loremIpsum(), date: moment().day(-2) },
            { title: 'Prueba Matematicas', description: loremIpsum(), date: moment() },
            { title: 'Prueba Ingles ', description: loremIpsum(), date: moment().day(2) }
        ]
    };

    return Promise.resolve(result);
}

module.exports = {
    search: search,
    refiners: Refiners,
    refineFormatter: refineFormatter
};
