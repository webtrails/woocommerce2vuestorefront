const config = require('../../config')
const WooCommerceAPI = require('woocommerce-api');
const tagsTemplate = require('../templates/tag')
const sendToElastic = require('../common/sendToElastic')

const connector = () => {
  let { host, protocol } = config.woo.api;

  return new WooCommerceAPI({
    url: `${protocol}://${host}`,
    consumerKey: config.woo.api.auth.consumer_key,
    consumerSecret: config.woo.api.auth.consumer_secret,
    wpAPI: true,
    version: 'wc/v1'
  })
}

const importer = ({ config, elasticClient, apiConnector, logger }) => {

  connector().getAsync('tags?per_page=100').then(
    (result) => {
      let body = result.toJSON().body
      let tags = JSON.parse(body)
      
      const tagsAsAttributeOptions = tags.map( tag => ({
        id: tag.id,
        name: tag.name
      }));

      const attribute = tagsTemplate.fill(tagsAsAttributeOptions)
      await sendToElastic(attribute, 'attribute', {config, elasticClient, logger}

    }).catch(error => logger.info(error))

  function importtags() {
    logger.info('tags are being imported...')
  }

  return {
    importtags
  }
}

module.exports = Object.freeze({
  importer
})