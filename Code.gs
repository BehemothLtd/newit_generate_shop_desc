const BREAK_LINE = '\n';
const DOUNBLE_BREAK_LINE = '\n\n';

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Function')
    .addItem('Generate shop desc', 'generateShopDesc')
    .addSeparator()
    .addToUi();
}


function createFile(content = '') {
  const d = new Date();
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const date = ("0" + d.getDate()).slice(-2);
  const hours = ("0" + d.getUTCHours()).slice(-2);
  const minutes = ("0" + d.getUTCMinutes()).slice(-2);
  const seconds = ("0" + d.getUTCSeconds()).slice(-2);
  let dir = DriveApp.getFoldersByName('shop-desc').next();
  const fileName = `kisaragi-production-shop-description-${year}${month}${date}${hours}${minutes}${seconds}.yaml`;
  dir.createFile(fileName, content);
  return dir.getFilesByName(fileName)
}

function getGroup(code) {
  return 'g1';
}

function writeContentToFile(file, data) {
  file.next().setContent(data)
}

function convertObjectToYaml(obj, level = 0, prefix = '') {
  let ret = prefix;
  let prespace = getTab(level);
  const end_line = level == 1 ? DOUNBLE_BREAK_LINE : BREAK_LINE
  if (obj instanceof Array) {
    ret += BREAK_LINE;
    ret += obj.map((item) => {
      return convertObjectToYaml(item, level, prespace);
    }).join(end_line);
  }
  else if (obj instanceof Object) {
    let newPrespace = prespace;
    let newLevel = level;
    ret += BREAK_LINE;
    ret += Object.keys(obj).map(function (key, index) {
      const value = `${newPrespace}${key}: ${convertObjectToYaml(obj[key], newLevel + 1)}`;
      if (key.startsWith("- ")) {
        newLevel += 1;
        newPrespace += "  ";
      }

      return value;
    }).join(end_line);
  }
  else {
    ret += `${obj.toString().replace(/\n/g, '\n' + prespace)}`;
  }

  return ret;
}

function getTab(number) {
  return new Array(number + 1).join('  ');
}

function generateShopDesc() {
  const shopeeShops = groupByShopeeShop();
  const splitPrice = splitPriceCollection();
  const shopOptions = getShopOptions();
  const criterias = getCriteria();
  const pricingRules = getPricingRule();
  content = '';
  Object.keys(shopeeShops).forEach(code => {
    const shop = shopeeShops[code];
    const shopOption = shopOptions[code];
    const criteriaOption = criterias[code];
    const pricingRuleOption = pricingRules[code];
    const shopSplitPrice = splitPrice[code]
    content += `- code: ${code}`
    let rowData = {};
    rowData['group'] = shopOption.group;
    rowData['# item_sync_enabled'] = shopOption.item_sync_enabled;
    rowData['_user'] = [
      `- &${code.replace('.', '_')}_name_prefix 日本直送 二手`,
      `- &${code.replace('.', '_')}_description_preamble |\n  ＊購買前請先詳閱以下注意事項，下單並付款完成視為同意代購及以下內容＊\n\n  【注意事項】\n  1、商品由日本寄出，購買後至送達約需1-3週左右。\n  2、由於商品是直接由日本發送至台灣，因此抵達台灣時有可能會產生關稅，產生關稅時是由收件人負擔。\n  3、店內商品皆為代購日本二手商品網站mercari的商品，代購期間可能會有賣家晚回應・不回應，或收到回覆前商品已經在mercari網站上被售出・刪除的情形，敬請事前理解。\n  4、店內商品皆為日本二手商品網站mercari的商品，由於我們是提供代購服務，如希望了解商品是否有正版品的證明，我們能在「購買前」協助詢問日本賣家，歡迎聊聊聯繫客服人員～\n  5、店內商品皆為賣家個人保存的二手商品，即使是全新未拆封的商品，也可能因賣家保管方式或寄送等原因產生初期損傷，無法保證與正規店販售的商品相同。\n  如希望事先了解商品狀態，歡迎於「購買前」透過聊聊詢問客服人員～\n  ※如有任何想了解的部分，也歡迎您透過聊聊功能詢問我們唷！＼(*´∀｀*)／\n\n  以下商品說明為使用機器翻譯，將日文翻譯成中文的內容。`,
      `- &${code.replace('.', '_')}_description_before_original_text |\n\n  其他品牌也可以前往分店【mercari蝦皮市集_名牌精品包2】逛逛(^_<)\n  https://shopee.tw/mercaristore04.tw\n\n  以下是日文原文。`
    ]
    rowData['shopee_api'] = { baseUri: '<replace_me>', partner_id: '<replace_me>', shopid: '<replace_me>', key: '<replace_me>' }

    rowData['shopee'] = {
      logistics: {
        '- logistic_id': shopOption.shopee_logistic_id,
        enabled: shopOption.shopee_logistic_enabled,
        is_free: shopOption.shopee_logistic_is_free
      },
      weight: shopOption.shopee_weight,
      days_to_ship: shopOption.shopee_days_to_ship,
      status: shopOption.shopee_status,
    }

    rowData['regular_price_update_enabled'] = shopOption.regular_price_update_enabled;
    rowData['# discount_price_update_enabled'] = shopOption.discount_price_update_enabled;

    rowData['pricing_rule'] = {}
    Object.keys(pricingRuleOption).forEach(function (key) {
      if (pricingRuleOption[key]) {
        rowData['pricing_rule'][key] = pricingRuleOption[key]
      }
    });

    rowData['discount_pricing_rule'] = {
      multiplier: shopOption.discount_multiplier,
      discount_id: shopOption.discount_id
    }

    rowData['criteria'] = {}
    Object.keys(criteriaOption).forEach(function (key) {
      if (criteriaOption[key]) {
        rowData['criteria'][key] = criteriaOption[key]
      }
    });


    rowData['collections'] = [];
    shop.forEach(function (data) {
      const nameComponents = [
        { "- name": 'constant', options: { value: `*${code.replace('.', '_')}_name_prefix` } },
        { "- name": 'constant', options: { value: data.brand } },
      ]
      if (data.products && data.products !== '') {
        nameComponents.push({ "- name": "pattern-matching", options: { dictionary: `pattern-matching-dictionary/${data.products}.tsv`, default: data.productDefaultName } })
      }

      const patterns = { model: data.model, mandatory: data.mandatory, subModel: data.subModel, size: data.size, other: data.other };
      Object.keys(patterns).forEach(key => {
        if (patterns[key] && patterns[key] !== "") {
          const options = { dictionary: `pattern-matching-dictionary/${patterns[key]}.tsv` }
          if (key === "mandatory") {
            options['mandatory'] = true;
          }

          nameComponents.push({ "- name": "pattern-matching", options })
        }
      })

      nameComponents.push({ "- name": 'ab-test-id-ends-with-even', options: { value: "mercari" } });

      const pricingRuleCollection = {};
      ['commission', 'intl_shipping_fee'].forEach((key) => {
        if (data[key] && data[key] != rowData['pricing_rule'][key]) {
          pricingRuleCollection[key] = data[key];
        }
      });

      if (shopSplitPrice && shopSplitPrice[data.collectionName]) {
        shopSplitPrice[data.collectionName].forEach((collectionData) => {
          const criteriaCollection = {};
          ['mercari_category_id', 'mercari_brand_id', 'mercari_keyword'].forEach((key) => {
            if (data[key]) {
              criteriaCollection[key] = data[key];
            }
          });
          ['mercari_price_ge', 'mercari_price_le'].forEach((key) => {
            if (collectionData[key] && collectionData[key] != '') {
              criteriaCollection[key] = collectionData[key];
            }
          })
          const collection = {
            "- name": collectionData.collection_name,
            shopee: {
              category_id: data.shopeeCategoryId,
              attributes: {
                "- attributes_id": data.attributeId,
                value: data.attributeValue
              }
            },
            pricing_rule: pricingRuleCollection,
            discount_pricing_rule: {},
            name_components: nameComponents,
            description_components: [
              { "- name": "constant", options: { value: `*${code.replace('.', '_')}_description_preamble` } },
              { "- name": "language-translation", options: { source_language: "ja", target_language: "zh-tw", terminology_names: getTerminologyNames(data.terminologyNames) } },
              { "- name": "constant", options: { value: `*${code.replace('.', '_')}_description_before_original_text` } },
              { "- name": "identity" },
            ],
            criteria: criteriaCollection,
            max_items: collectionData.max_items,
          }
          rowData['collections'].push(collection);
        })
      } else {
        const criteriaCollection = {};
        ['mercari_category_id', 'mercari_brand_id', 'mercari_keyword', 'mercari_price_ge', 'mercari_price_le'].forEach((key) => {
          if (data[key]) {
            criteriaCollection[key] = data[key];
          }
        })
        const collection = {
          "- name": data.collectionName,
          shopee: {
            category_id: data.shopeeCategoryId,
            attributes: {
              "- attributes_id": data.attributeId,
              value: data.attributeValue
            }
          },
          pricing_rule: pricingRuleCollection,
          discount_pricing_rule: {},
          name_components: nameComponents,
          description_components: [
            { "- name": "constant", options: { value: `*${code.replace('.', '_')}_description_preamble` } },
            { "- name": "language-translation", options: { source_language: "ja", target_language: "zh-tw", terminology_names: getTerminologyNames(data.terminologyNames) } },
            { "- name": "constant", options: { value: `*${code.replace('.', '_')}_description_before_original_text` } },
            { "- name": "identity" },
          ],
          criteria: criteriaCollection,
          max_items: data.max_items,
        }
        rowData['collections'].push(collection);
      }

    })
    content += convertObjectToYaml(rowData, 1);
    content += BREAK_LINE;
    content += BREAK_LINE;
    // shopeeShops[code].forEach((rowData) => {

    // })
  });
  createFile(content);
}

function getTerminologyNames(terminologyNames) {
  if (!terminologyNames) return [];

  let currentDate = new Date().toLocaleDateString('en-ZA').replace(/\//g, "");
  return [`- ${terminologyNames}-${currentDate}`]
}