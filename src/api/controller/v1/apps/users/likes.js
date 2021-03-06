/* eslint-disable no-undef */
const BaseRest = require('../Base');
module.exports = class extends BaseRest {
  /**
   * 获取我喜欢的全部内容
   *
   * @returns {Promise.<*>}
   */
  async indexAction () {
    const userMeta = this.model('usermeta')
    const userId = this.get('id')
    const intersection = this.get('intersection')
    if (think.isEmpty(userId)) {
      return this.fail('请求参数错误')
    }
    let data = {}
    const userLiked = await userMeta.where(`meta_key = 'picker_${this.appId}_liked_posts' and user_id = ${userId}`).find()
    let myLiked = []
    // 请求相同最爱的交集,这里接下来要改成分页的，从前台发过来10 条数据
    if (intersection && !think.isEmpty(userLiked)) {
      const meId = this.ctx.state.user.id
      myLiked = await userMeta.where(`meta_key = 'picker_${this.appId}_liked_posts' and user_id = ${meId}`).find()
      let ourLikes = think._.intersectionBy(JSON.parse(myLiked.meta_value), JSON.parse(userLiked.meta_value), 'post_id')
      const items = []
      for (const item of ourLikes) {
        items.push(item.post_id)
      }
      const list = await this.model('posts', {appId: this.appId}).getItems(items)
      _formatMeta(list)
      const thumbnailIds = []
      for (const item of list) {
        if (!Object.is(item.meta, undefined) && !Object.is(item.meta._thumbnail_id, undefined)) {
          thumbnailIds.push(item.meta._thumbnail_id)
        } else {
          item.featured_image = this.getRandomCover()
        }
      }
      // 查询出图片地址
      const images = await this.model('postmeta', {appId: this.appId}).getAttachments(thumbnailIds)
      for (const imgItem of images) {
        for (const item of list) {
          // if (!Object.is(item.meta, undefined) && !Object.is(item.meta._thumbnail_id, undefined)) {
          //   break
          // }
          if (item.meta._thumbnail_id === imgItem.post_id) {
            item.featured_image = JSON.parse(imgItem.meta_value)
          }
          // item.modified = think.moment
        }
      }
      for (let groupItem of list) {
        for (const item of list) {
          if (!Object.is(item.meta, undefined) && !Object.is(item.meta._liked, undefined)) {
            item.like_count = item.meta._liked.length
          }
          if (groupItem.post_id === item.id.toString()) {
            Reflect.deleteProperty(item, 'date')
            Reflect.deleteProperty(item, 'meta')
            groupItem = Object.assign(groupItem, item)
          }
        }
      }
      return this.success(list)
    } else {
      data = userLiked
    }
    // console.log(JSON.stringify(data))
    if (!think.isEmpty((data))) {
      data.meta_value = JSON.parse(data.meta_value)
      // 按添加时间排序
      data.meta_value = think._.orderBy(data.meta_value, ['modified'], ['desc'])
      const items = []
      for (const item of data.meta_value) {
        items.push(item.post_id)
      }
      const list = await this.model('posts', {appId: this.appId}).getItems(items)
      _formatMeta(list)
      const thumbnailIds = []
      for (const item of list) {
        if (!Object.is(item.meta, undefined) && !Object.is(item.meta._thumbnail_id, undefined)) {
          thumbnailIds.push(item.meta._thumbnail_id)
        } else {
          item.featured_image = this.getRandomCover()
        }
      }
      // 查询出图片地址
      const images = await this.model('postmeta', {appId: this.appId}).getAttachments(thumbnailIds)
      for (const imgItem of images) {
        for (const item of list) {
          // if (!Object.is(item.meta, undefined) && !Object.is(item.meta._thumbnail_id, undefined)) {
          //   break
          // }
          if (item.meta._thumbnail_id === imgItem.post_id) {
            item.featured_image = JSON.parse(imgItem.meta_value)
          }
          // item.modified = think.moment
        }
      }
      for (let groupItem of data.meta_value) {
        for (const item of list) {
          if (!Object.is(item.meta, undefined) && !Object.is(item.meta._liked, undefined)) {
            item.like_count = item.meta._liked.length
          }
          if (groupItem.post_id === item.id.toString()) {
            Reflect.deleteProperty(item, 'date')
            Reflect.deleteProperty(item, 'meta')
            groupItem = Object.assign(groupItem, item)
          }
        }
      }
      // 这段代码处理分组数据 (已交由小程序端处理 v 0.2.3.3 版本开始)
      // let groupedItems = think._(data.meta_value)
      //   .groupBy(item => item.date)
      //   .map((items, year) => {
      //     return {
      //       year: year,
      //       likes: items
      //     }
      //   })
      //   .reverse()
      //   .value()
      // return this.success(groupedItems)
      // ~END
      return this.success(data.meta_value)
    } else {
      return this.success([])
    }
  }
}
