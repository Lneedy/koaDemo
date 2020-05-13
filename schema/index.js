const {GraphQLObjectType, GraphQLSchema} = require('graphql')
const testSchema = require('./test')
module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueries',
    fields: Object.assign(testSchema.query)
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutations',
    fields: Object.assign(testSchema.mutation)
  })
})
