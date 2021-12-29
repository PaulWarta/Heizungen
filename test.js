let string = `<?xml version="1.0" encoding="ISO-8859-1" ?><state><datapoint ise_id='1540' value='19.000000'/></state>`;
let index = string.indexOf("value='");
console.log(string.slice(string.indexOf("value='") + 7, string.indexOf("value='") + 11));