const Validator = require('validator'); //helps us to check string length
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {}; //empty object

  if(!Validator.isLength(data.name, {min: 2, max: 30})){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }

}