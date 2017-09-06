import $ from 'jquery';
import {LOGIN_URI} from './constants';

const signInModal = $('#signInModal');
const emailInput = $('#inputEmail');
const passwordInput = $('#inputPassword');

const unauthorizedAlert = $('#unauthorizedAlert');

unauthorizedAlert.first().click(toggleUnauthorizedAlert);

$('#signInForm').submit(function(event) {
  event.preventDefault();
  const email = emailInput.val();
  const password = passwordInput.val();
  const authorization = btoa(email + ':' + password);

  $.ajax(LOGIN_URI, {
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + authorization);
    },
  })
    .then(handleLoginSuccess)
    .catch(handleLoginError);
});

function handleLoginSuccess() {
  signInModal.modal('hide');
  emailInput.val('');
  passwordInput.val('');
}

function handleLoginError(error) {
  if (error.status === 401) {
    toggleUnauthorizedAlert();
    passwordInput.val('');
  }
}

function toggleUnauthorizedAlert() {
  let hidden = unauthorizedAlert.attr('hidden');
  if (hidden === undefined || hidden === false || hidden === 'false') {
    unauthorizedAlert.attr('hidden', 'false');
  } else {
    unauthorizedAlert.removeAttr('hidden');
  }
}
