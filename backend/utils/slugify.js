
function toSlug(text){
  return text.toString().toLowerCase()
    .replace(/[\s\W-]+/g,'-')
    .replace(/^-+|-+$/g,'');
}

module.exports = { toSlug };
