const config = require('../../config')
const WooCommerceAPI = require('woocommerce-api');
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

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

const extractSubcategories = async (parent_id) => {

  let result = await connector().getAsync(`products/categories?parent=${parent_id}`)
  let parsed = JSON.parse(result.toJSON().body)
  let subcats = []
  if (parsed.length > 0) {
    for (let child of parsed) {

      let childData = {
        "entity_type_id": 3,
        "attribute_set_id": 0,
        "parent_id": parent_id,
        "created_at": "2018-10-12",
        "updated_at": "2018-10-12",
        "position": 1,
        "level": 2,
        "children_count": 1,
        "available_sort_by": null,
        "include_in_menu": true,
        "name": entities.decode(child.name),
        "id": child.id,
        "children_data": child.id !== parent_id && await extractSubcategories(child.id),
        "is_anchor": true,
        "is_active": true,
        "path": `1/2/${child.id}`,
        "url_key":  child.slug,
        "url_path":  child.id,
        "product_count": 10,
      }

      childData.children_count = childData.children_data.length
      subcats.push(childData)
    }
  }

  return subcats

}



const fill = async ({ id,
                      description,
                      name,
                      parent,
                      slug
                    },
                    {
                      logger
                    }
                    ) => {

  let include_in_menu = true
  let level = 2 // A higher level will hide it from the main menu
  // Check if category is a sub-category
  if ( parent > 0 ) {
    // Hide sub category from main menu
    include_in_menu = false
    level = 3
  }

  let output = {
    "entity_type_id": 3,
    "attribute_set_id": 0,
    "parent_id": parent,
    "created_at": "2018-10-12",
    "updated_at": "2018-10-12",
    "is_active": true,
    "position": 1,
    "level": level,
    "children_count": 1,
    "available_sort_by": null,
    "include_in_menu": include_in_menu,
    "name": entities.decode(name),
    "id": id,
    "is_anchor": true,
    "path": `1/${slug}`,
    "url_key": slug,
    "url_path": slug,
    "product_count": 10,
    "children_data": await extractSubcategories(parseInt(id)),
  };

  output.children_count = output.children_data.length;

  return output;
}

module.exports = {
  fill
}