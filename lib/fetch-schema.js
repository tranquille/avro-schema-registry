'use strict';

const avsc = require('avsc');

const fetch = (registry, schemaID, parseOptions) => {
  const {protocol, host, port, auth} = registry;
  const requestOptions = {
    host,
    port,
    path: `/schemas/ids/${schemaID}`,
    auth
  };

  protocol.get(requestOptions, (res) => {
    let data = "";
    res.on("data", (d) => {
      data += d;
    })
    res.on("error", (error) => {
      throw new Error(`Could not get Schema from ${requestOptions.host}: ${error}`)
    })
    res.on("end", () => {
      if(res.statusCode !== 200) {
        const error = JSON.parse(data)
        throw new Error(`Schema registry error: ${error.error_code} - ${error.message}`);
      }

      try {
        const schema = JSON.parse(data).schema;
        const parsedSchema = avsc.parse(schema, parseOptions);

        return parsedSchema;
      } catch(error) {
        throw new Error(`Could not parse Schema with ID ${schemaID}: ${error}`)
      }
    })
  })
  
}

module.exports = fetch;


// module.exports = (registry, schemaId, parseOptions) => new Promise((resolve, reject) => {
//   const {protocol, host, port, auth} = registry;
//   const requestOptions = {
//     host,
//     port,
//     path: `/schemas/ids/${schemaId}`,
//     auth
//   };
//   protocol.get(requestOptions, (res) => {
//     let data = '';
//     res.on('data', (d) => {
//       data += d;
//     });
//     res.on('error', (e) => {
//       reject(e);
//     });
//     res.on('end', () => {
//       if (res.statusCode !== 200) {
//         const error = JSON.parse(data);
//         return reject(new Error(`Schema registry error: ${error.error_code} - ${error.message}`));
//       }

//       const schema = JSON.parse(data).schema;
//       resolve(avsc.parse(schema, parseOptions));
//     });
//   });
// });
