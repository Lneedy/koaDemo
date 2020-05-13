const {GraphQLList, GraphQLString} = require('graphql')
const _ = require('axios')
const url = require('./../../config/dev.config').apiUrl
const itemType = require('./model').itemType
const userType = require('./model').userType

// get the all data
/* 
{
  all {
    id,
    title,
    author
  }
}
 */
const all = {
  type: new GraphQLList(itemType),
  args: {},
  async resolve(ctx, args) {
    return await _.get(url + '/test').then(res => res.data)
  }
}
/*
{
  sigle (id:"1") {
    id,
    title,
    author
  }
}
*/

const sigle = {
  type: itemType,
  args: {
    id: {type: GraphQLString}
  },
  async resolve(ctx, args) {
    return await _.get(url + '/test/' + args.id).then(res => res.data)
  }
}
/*
  {
    user {
      id,
      name,
      year,
      month,
      message,
      item:{
        title,
        author
      }
    }
  }
*/
const user = {
  type: userType,
  args: {},
  async resolve (ctx) {
    const getUser = () => _.get(url + '/user').then(res => res.data)
    const getSigle = (id) => _.get(url + '/test/'+ id).then(res => res.data)
    let userData = await getUser()
    let id = userData.id
    let itemData = await getSigle(id)
    return Object.assign({}, userData, {
      item: itemData
    })
  }
}

module.exports = {
  all,
  sigle,
  user
}
