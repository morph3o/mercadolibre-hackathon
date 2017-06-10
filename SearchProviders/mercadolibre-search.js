var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request');

function create(serviceName, serviceKey, index) {
  var SEARCH_ENDPOINT = "https://api.mercadolibre.com/sites/MLC/search?q=";

  return {
    search: function (query) {
      return new Promise(function (resolve, reject) {
        console.log('MercadoLibre.inputQuery:', query);

        var options = {
          url: SEARCH_ENDPOINT + query.searchText
        };

        console.log('MercadoLibre.query:', query);
        request.get(options, function (err, httpResponse, mercadoLibreResponse) {
          if (err) {
            return reject(err);
          }

          console.log("Response: => ", mercadoLibreResponse.results);

          resolve({
            results: JSON.parse(mercadoLibreResponse).results,
            facets: []
          });
        });
      });
    }
  };
}

// Helpers
function getFacets(azureResponse) {
  var rawFacets = azureResponse['@search.facets'];
  if (!rawFacets) {
    return [];
  }

  var facets = _.toPairs(rawFacets)
    .filter(function (p) { return _.isArray(p[1]); })
    .map(function (p) { return { key: p[0], options: p[1] }; });

  return facets;
}

function createFilterParams(filters) {
  if (!filters || !filters.length) {
    return '';
  }

  return filters.map(function (f) {
    return util.format('%s eq \'%s\'', f.key, escapeFilterString(f.value));
  }).join(' and ');
}

function escapeFilterString(string) {
  return string.replace(/'/g, '\'\'');
}

// Exports
module.exports = {
  create: create
};