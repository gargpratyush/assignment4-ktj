const Validator = require('validator'); //helps us to check string length
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {}; //empty object

  data.text = !isEmpty(data.text) ? data.text : '';

  if(!Validator.isLength(data.text, {min: 10, max: 300})) {
    errors.text = 'Post must be between 10 and 300 characters';
  }

  if(Validator.isEmpty(data.text)) {
    errors.text = 'Text field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };

};