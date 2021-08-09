//function to check if a string/object or basically anything is empty or not
const isEmpty = value => {
  return(
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) || //if there are no keys, then it's an empty object
    (typeof value === 'string' && value.trim().length === 0)
  )
};

module.exports = isEmpty;