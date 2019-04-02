"use strict";

const fetchSchema = require("./fetch-schema");

const fetchAndParseSchema = async (registry, schemaID, parseOptions) => {
  let fetchedSchema;
  try {
    fetchedSchema = await fetchSchema(registry, schemaID, parseOptions);
    registry.cache.set(schemaID, fetchedSchema);
  } catch (error) {
    throw new Error(`Could not fetch or parse Schema with ID: ${schemaID}: ${error}`);
  }

  return fetchedSchema;
};

const decode = registry => async (obj, parseOptions = null) => {
  let schemaID;

  if (obj.readUInt8(0) !== 0) {
    throw new Error("Message doesn't contain schema identifiery byte.");
  }
  schemaID = obj.readUInt32BE(1);
  let schema;
  schema = await registry.cache.getById(schemaID);
  console.log("schema from cache", schema)
  if (!schema) {
    schema = await fetchAndParseSchema(registry, parseOptions);
    console.log("fetched schema", schema)
  }
  return schema.fromBuffer(obj.slice(5));
};

module.exports = decode;

// module.exports = (registry) => (obj, parseOptions = null) => new Promise((resolve, reject) => {
//   let schemaId;

//   if (obj.readUInt8(0) !== 0) {
//       return reject(new Error(`Message doesn't contain schema identifier byte.`));
//     }
//     schemaId = obj.readUInt32BE(1);
//     let promise = registry.cache.getById(schemaId);

//     if (promise) {
//       return resolve(promise);
//     }

//     console.log("SCHEMA ID:", schemaId);

//     const promise = fetchSchema(registry, schemaId, parseOptions);

//     registry.cache.set(schemaId, promise);

//     promise
//       .then((result) => registry.cache.set(schemaId, result))
//       .catch(reject);

//     return resolve(promise);
// }).then((schema) => {
//   console.log(typeof schema, JSON.stringify(schema,null,2))
//   return schema.fromBuffer(obj.slice(5))
// });
