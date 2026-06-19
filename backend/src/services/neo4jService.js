const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'sentinelmesh123')
);
const runQuery = async (cypher, params = {}) => {
  const session = driver.session();
  try { return await session.run(cypher, params); }
  finally { await session.close(); }
};
module.exports = { runQuery };
