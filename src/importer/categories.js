const categoryTemplate = require('../templates/category')
const sendToElastic = require('../common/sendToElastic')

const importer = ({ config, elasticClient, apiConnector, logger, page = 1, perPage = 20 }) => {
  apiConnector(config).getAsync(`products/categories?order_by=id&page=${page}&per_page=${perPage}`).then(
    (result) => {
      let body = result.toJSON().body
      let array = JSON.parse(body)

      for (let category of array) {
        categoryTemplate.fill(category, { apiConnector, elasticClient, config, logger }).then(converted => {
          sendToElastic(converted, 'category', { config, elasticClient, logger })
        })
      }
    })

  function importCategories() {
    logger.info('categories are being imported...')
  }

  return {
    importCategories
  }
}


module.exports = Object.freeze({
  importer
})