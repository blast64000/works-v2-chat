var request = require('request');
var fs = require('fs');
var options = {
  'method': 'POST',
  'url': 'http://apis-storage.worksmobile.com/k/emsg/r/kr1/1656636347569624838.1656722747.1.3812571.0.0.0/test1.png',
  'headers': {
    'Authorization': 'Bearer kr1AAABSm/RnV6gRc/Sxmm3CyxtNZa6eejLIypOhEU8yIVnpdd2Z4fBtfuuSVcLN1ReI1nA7E973g89ob8uL+E/dNscJrVoxknKj8hR1YyKJXZWlodDVResRPA2cJB9Mx2M2ar75QemD1QbuXGUcYvRfyfHMq6Z4J339kr38tkNvc4oxayOiEGk1GqsOO63bW3TUkHdB2FvPxlfXcTR3mgwMufL71m1jyRFf0omXCr66Uj3LnxVy955RW3sq9vq0J39GEaRJ+cIZdEUV0T/FgMrOP7sla9iR7rNdbyeG26/Tn2hyTuGVF7IjhPTQrTvYDKbu1s8yuKXqncfueuoBANC3GZmkMjh992rXrDjk6WiNnwtuSnvzqtNZ4bRFLEC6lAUbde8AMvo8cspnLS81o2C2uDI7BkGyaTwVJ23vIK0NJUO696oHOP1zkvHirRAVKXcqIbdHQ==',
    'Cookie': 'WORKS_RE_LOC=kr1; WORKS_TE_LOC=kr1'
  },
  formData: {
    'test1.png': {
      'value': fs.createReadStream('test1.png'),
      'options': {
        'filename': 'test1.png',
        'contentType': null
      }
    }
  }
};

request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
