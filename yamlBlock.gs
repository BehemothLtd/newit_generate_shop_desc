function splitPriceCollection() {
  const splitPriceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('分割設定');
  const dataSplitPrice = splitPriceSheet.getDataRange().getValues();
  const header = dataSplitPrice.splice(0, 1)[0];
  const collection_name_index = header.indexOf('Collection Name');
  const mercari_price_ge_index = header.indexOf('mercari_price_ge');
  const mercari_price_le_index = header.indexOf('mercari_price_le');
  const max_items_index = header.indexOf('max_items');
  const shopeeShopIndex = header.indexOf('Shopee_shop');
  let splitPrices = {}
  dataSplitPrice.forEach((row) => {
    const object = { collection_name: row[collection_name_index], mercari_price_ge: row[mercari_price_ge_index], mercari_price_le: row[mercari_price_le_index], max_items: row[max_items_index] }
    if (!splitPrices[row[shopeeShopIndex]]) {
      splitPrices[row[shopeeShopIndex]] = {}
    }
    const collectionNameSplit = row[collection_name_index].split(" - ");
    const collectionOriginName = collectionNameSplit.slice(0, collectionNameSplit.length - 1).join("");
    if (splitPrices[row[shopeeShopIndex]][collectionOriginName]) {
      splitPrices[row[shopeeShopIndex]][collectionOriginName].push(object)
    } else {
      splitPrices[row[shopeeShopIndex]][collectionOriginName] = [object]
    }
  })
  return splitPrices;
}

function getShopOptions() {
  const currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('options');
  const currentData = currentSheet.getDataRange().getValues();
  const header = currentData.splice(0, 1)[0];

  const shop_code_index = header.indexOf('Shopee_shop'),
    item_sync_enabled_index = header.indexOf('item_sync_enabled'),
    regular_price_update_enabled_index = header.indexOf('regular_price_update_enabled'),
    discount_price_update_enabled_index = header.indexOf('discount_price_update_enabled'),
    discount_id_index = header.indexOf('discount_id'),
    discount_multiplier_index = header.indexOf('discount_multiplier'),
    shopee_logistic_id_index = header.indexOf('shopee_logistic_id'),
    shopee_logistic_enabled_index = header.indexOf('shopee_logistic_enabled'),
    shopee_logistic_is_free_index = header.indexOf('shopee_logistic_is_free'),
    shopee_weight_index = header.indexOf('shopee_weight'),
    shopee_days_to_ship_index = header.indexOf('shopee_days_to_ship'),
    shopee_status_index = header.indexOf('shopee_status')

  let options = {}
  currentData.forEach((row) => {
    options[row[shop_code_index]] = {
      group: row[header.indexOf('group')],
      item_sync_enabled: row[item_sync_enabled_index],
      regular_price_update_enabled: row[regular_price_update_enabled_index],
      discount_price_update_enabled: row[discount_price_update_enabled_index],
      discount_id: row[discount_id_index],
      discount_multiplier: row[discount_multiplier_index],
      shopee_logistic_id: row[shopee_logistic_id_index],
      shopee_logistic_enabled: row[shopee_logistic_enabled_index],
      shopee_logistic_is_free: row[shopee_logistic_is_free_index],
      shopee_weight: row[shopee_weight_index],
      shopee_days_to_ship: row[shopee_days_to_ship_index],
      shopee_status: row[shopee_status_index],
    }
  });
  return options;
}

function getCriteria() {
  const currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('criteria');
  const currentData = currentSheet.getDataRange().getValues();
  const header = currentData.splice(0, 1)[0];
  let criterias = {}
  currentData.forEach((row) => {
    criterias[row[header.indexOf('Shopee_shop')]] = {
      mercari_seller_rating_score_ge: row[header.indexOf('mercari_seller_rating_score_ge')],
      mercari_num_of_seller_ratings_ge: row[header.indexOf('mercari_num_of_seller_ratings_ge')],
      shipping_duration_max_days_le: row[header.indexOf('shipping_duration_max_days_le')],
      translated_description_length_le: row[header.indexOf('translated_description_length_le')],
      translated_description_length_ge: row[header.indexOf('translated_description_length_ge')],
      translated_name_length_le: row[header.indexOf('translated_name_length_le')],
      translated_name_length_ge: row[header.indexOf('translated_name_length_ge')],
      price_le: row[header.indexOf('price_le')],
      mercari_price_le: row[header.indexOf('mercari_price_le')],
      preprocess_ng_words: row[header.indexOf('preprocess_ng_words')],
      postprocess_ng_words: row[header.indexOf('postprocess_ng_words')],
    }
  });
  return criterias;
}

function getPricingRule() {
  const currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('pricing_rule');
  const currentData = currentSheet.getDataRange().getValues();
  const header = currentData.splice(0, 1)[0];
  let pricingRule = {}
  currentData.forEach((row) => {
    pricingRule[row[header.indexOf('Shopee_shop')]] = {
      currency: row[header.indexOf('currency')],
      deduction: row[header.indexOf('deduction')],
      commission: row[header.indexOf('commision')],
      domestic_shipping_fee: row[header.indexOf('domestic_shipping_fee')],
      intl_shipping_fee: row[header.indexOf('intl_shipping_fee')],
      multiplier: row[header.indexOf('multiplier')],
      jpy_multiplier: row[header.indexOf('jpy_multiplier')],
    }
  });
  return pricingRule;
}

function rowToObject(row, index) {
  return {
    shopeeShop: row[index.shopeeShopIndex],
    collectionName: row[index.collectionNameIndex],
    shopeeCategoryId: row[index.shopeeCategoryIdIndex],
    refCategoryName: row[index.refCategoryNameIndex],
    attributeId: row[index.attributeIdIndex],
    attributeValue: row[index.attributeValueIndex],
    commission: row[index.commissionIndex],
    intl_shipping_fee: row[index.intlShippingFeeIndex],
    mercari_category_id: row[index.mercariCategoryIdIndex],
    mercari_brand_id: row[index.mercariBrandIdIndex],
    mercari_keyword: row[index.mercariKeywordIndex],
    mercari_price_ge: row[index.mercariPriceGeIndex],
    mercari_price_le: row[index.mercariPriceLeIndex],
    max_items: row[index.maxItemsIndex],
    brand: row[index.brandIndex],
    products: row[index.productsIndex],
    productDefaultName: row[index.productDefaultNameIndex],
    model: row[index.modelIndex],
    subModel: row[index.subModelIndex],
    size: row[index.sizeIndex],
    other: row[index.otherIndex],
    terminologyNames: row[index.terminologyNamesIndex],
    mandatory: row[index.mandatoryIndex],
  }
}

function groupByShopeeShop() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('分割前');
  const data = sheet.getDataRange().getValues();
  const header = data.splice(0, 1)[0];
  const shopeeShopIndex = header.indexOf('Shopee_shop');
  const collectionNameIndex = header.indexOf('Collection Name');
  const shopeeCategoryIdIndex = header.indexOf('shopee_category_id');
  const refCategoryNameIndex = header.indexOf('ref. category_name');
  const attributeIdIndex = header.indexOf('attribute_id_0');
  const attributeValueIndex = header.indexOf('attribute_value_0');
  const commissionIndex = header.indexOf('commision');
  const intlShippingFeeIndex = header.indexOf('intl_shipping_fee');
  const mercariCategoryIdIndex = header.indexOf('mercari_category_id');
  const mercariBrandIdIndex = header.indexOf('mercari_brand_id');
  const mercariKeywordIndex = header.indexOf('mercari_keyword');
  const mercariPriceGeIndex = header.indexOf('mercari_price_ge');
  const mercariPriceLeIndex = header.indexOf('mercari_price_le');
  const maxItemsIndex = header.indexOf('max_items');
  const brandIndex = header.indexOf('ブランド名');
  const productsIndex = header.indexOf('商品名辞書 (optional)');
  const productDefaultNameIndex = header.indexOf('商品名デフォルト');
  const modelIndex = header.indexOf('モデル辞書 (optional)');
  const subModelIndex = header.indexOf('サブモデル辞書 (optional)');
  const sizeIndex = header.indexOf('size(optional)');
  const otherIndex = header.indexOf('その他辞書 (optional)');
  const terminologyNamesIndex = header.indexOf('terminology_names');
  const mandatoryIndex = header.indexOf('キャラクター辞書（mandatory）');
  const index = { shopeeShopIndex, collectionNameIndex, shopeeCategoryIdIndex, refCategoryNameIndex, attributeIdIndex, attributeValueIndex, commissionIndex, intlShippingFeeIndex, mercariCategoryIdIndex, mercariBrandIdIndex, mercariKeywordIndex, mercariPriceGeIndex, mercariPriceLeIndex, maxItemsIndex, brandIndex, productsIndex, productDefaultNameIndex, modelIndex, subModelIndex, sizeIndex, otherIndex, terminologyNamesIndex, mandatoryIndex }
  let shopeeShops = {}
  data.forEach((row) => {
    if (shopeeShops[row[shopeeShopIndex]]) {
      shopeeShops[row[shopeeShopIndex]].push(rowToObject(row, index))
    } else {
      shopeeShops[row[shopeeShopIndex]] = [rowToObject(row, index)]
    }
  });
  return shopeeShops;
}
