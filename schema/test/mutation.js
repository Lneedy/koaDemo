const {GraphQLNonNull, GraphQLString} = require('graphql')
const _ = require('axios')
const {apiUrl} = require('../../config/dev.config')
const url = apiUrl
const type = require('./model').itemType
// 新增
const add = {
  type,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLString)
    },
    title: {type: GraphQLString},
    author: {type: GraphQLString}
  },
  async resolve(ctx, args) {
    return await _.post(url + '/test', {
      id: args.id,
      title: args.title,
      author: args.author
    }).then(res => res.data)
  }
}
module.exports = {
  add
}
