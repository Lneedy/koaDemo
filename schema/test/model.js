const {GraphQLString, GraphQLObjectType, GraphQLList} = require('graphql')

const itemType = new GraphQLObjectType({
  name: 'item',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    },
    author: {
      type: GraphQLString
    }
  })
})

const userType = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    year: {type: GraphQLString},
    month: {type: GraphQLString},
    message: {type: GraphQLString},
    item: {
      type: itemType
    }
  })
})

// Type
module.exports = {
  itemType,
  userType
}
