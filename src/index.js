import $ from 'jquery';
import 'corejs-typeahead/dist/typeahead.jquery.min.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/typeaheadjs.css';

import {LOCATIONS_SEARCH_URI, RAIN_PREDICTION_URI} from './constants';
import './user-account.js';

const DEFAULT_INPUT_VALUE = 'New York City, ';
const DEFAULT_TYPEAHEAD_OBJECT = {
  geonameId: 5128581,
  locationName: 'New York City',
  longitude: -74.00597,
  latitude: 40.71427,
  countryCode: 'US',
  countryName: 'United States of America',
  admin1Code: 'NY',
  admin1Name: 'New York',
};

const inputBar = $('#search');

inputBar
  .typeahead(
    {
      hint: true,
      highlight: true,
      minLength: 1,
    },
    {
      source: function(query, syncResults, asyncResults) {
        if (query.trim().length === 0) {
          return;
        }
        $.get(
          LOCATIONS_SEARCH_URI,
          {
            query: query,
          },
          asyncResults,
        );
      },
      async: true,
      limit: 10,
      display: function({locationName, admin1Code, countryName, admin1Name}) {
        if (admin1Name) {
          return locationName + ', ' + admin1Name;
        }
        if (/^\d+$/.test(admin1Code)) {
          return locationName + ', ' + countryName;
        }
        return locationName + ', ' + admin1Code;
      },
      templates: {
        notFound: '<div>No results found</div>',
      },
    },
  )
  .typeahead('val', DEFAULT_INPUT_VALUE);

inputBar.bind('typeahead:select', function(ev, suggestion) {
  getRainPrediction(suggestion);
  $(this).typeahead('close');
});

inputBar.bind('typeahead:autocompleted', function(ev, suggestion) {
  getRainPrediction(suggestion);
  $(this).typeahead('close');
});

inputBar.trigger('typeahead:autocompleted', DEFAULT_TYPEAHEAD_OBJECT);

function showHourlyData(data) {
  const hourlyData = data.hourly.data.slice(1);
  hourlyData.unshift(data.currently);

  const table = $('#probTable');

  hourlyData.map(function(current, index) {
    const row = $('<tr></tr>');
    row.appendTo(table);

    const TD_HTML = '<td></td>';

    const timeCell = $(TD_HTML);
    if (index === 0) {
      timeCell.text('Now');
    } else {
      timeCell.text(new Date(current.time * 1000).toLocaleString());
    }
    timeCell.appendTo(row);

    const summaryCell = $(TD_HTML);
    summaryCell.text(current.summary);
    summaryCell.appendTo(row);

    const probCell = $(TD_HTML);
    probCell.text(current.precipProbability);
    probCell.appendTo(row);
  });
}

function getRainPrediction({longitude, latitude}) {
  toggleLoadingDiv();
  const request = new Promise(function(resolve, reject) {
    $.get(RAIN_PREDICTION_URI, {
      longitude,
      latitude,
    })
      .done(resolve)
      .fail(reject);
  });

  request
    .then(function(data) {
      removeResultsRows();
      return data;
    })
    .then(showHourlyData)
    .catch(handleRequestError)
    .then(toggleLoadingDiv);
}

function handleRequestError() {
  const errorDiv = $('.loading-error');
  errorDiv.css('display', 'block');
}

function toggleLoadingDiv() {
  const loadingDiv = $('.loading');
  const display = loadingDiv.css('display');
  if (display === 'block') {
    loadingDiv.css('display', 'none');
  } else {
    loadingDiv.css('display', 'block');
  }
}
function removeResultsRows() {
  $('#probTable > tbody > tr').remove();
}
