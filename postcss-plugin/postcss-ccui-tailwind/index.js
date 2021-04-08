const postcss = require('postcss');
const resolveConfig = require('tailwindcss/resolveConfig');
const e = require('tailwindcss/lib/util/escapeClassName').default;
const { resolve } = require('path');

const AT_RULE = 'tailwindloop';
const NAME = `postcss-${AT_RULE}`;
const AT_RULES_REGEX = /themeSetting|prop|property|filter|allow|replace|selector|separator/;

// Extract to helper file
const tailwindKeyToPropMap = {
  borderRadius: 'border-radius',
  boxShadow: 'box-shadow',
  flexGrow: 'flex-grow',
  gridTemplateColumns: 'grid-template-columns',
  gap: 'gap',
  justifyContent: 'justify-content',
}

// Extract to helper file
const themeObjHelpers = {
  justifyContent: { 
    'justify-start': 'flex-start',
    'justify-end': 'flex-end',
    'justify-center': 'center',
    'justify-between': 'space-between',
    'justify-around': 'space-around',
    'justify-evenly': 'space-evenly',
  }
}

module.exports = (opts = {}) => {

  if (!opts.tailwindConfig) {
    throw new Error(`${NAME} cannot resolve the tailwind.config file`, opts.tailwindConfig, { plugin: NAME });
  }

  const theme = resolveConfig(require(resolve(process.cwd(), opts.tailwindConfig)));

  const handler = (root) => {
    /* 
      Currently only working once per file and only for the last one
      It appears that the at rule needs a unique param to differentiate itself
      Currently it just takes the last one
    */
    let themeSetting = false;
    let themeSettingChild = false;
    let themeObj = false;
    let prop = false;
    let filter = false;
    let allow = false;
    let replaceKey = opts.replaceKey || `%%`;
    let separator = theme.separator || ':';
    let rawSelector = false;

    root.walkAtRules(AT_RULES_REGEX, atRule => {
      switch (atRule.name) {
        case 'themeSetting':
          themeSetting = postcss.list.comma(atRule.params)[0];
          themeSettingChild = postcss.list.comma(atRule.params)[1];
          themeObj = theme.theme[themeSetting] || themeObjHelpers[themeSetting];
          prop = tailwindKeyToPropMap[themeSetting];
          break;
        case 'prop':
        case 'property':
          prop = atRule.params;
          break;
        case 'filter': 
          filter = postcss.list.comma(atRule.params);
          break;
        case 'allow': 
          allow = postcss.list.comma(atRule.params);
          break;
        case 'replace':
          replaceKey = atRule.params;
          break;
        case 'separator':
          separator = `${e(atRule.params)}`;
          break;
        case 'selector':
          rawSelector = atRule.params;
          break;
      }
      atRule.remove();
    });

    // console.log('\n\nprop',prop);
    // console.log('rawSelector',rawSelector);
    // console.log('themeObj',themeObj);

    if (filter) { filter.forEach(key => { if (themeSetting.hasOwnProperty(key)) delete themeSetting[key]; }); }
    if (allow) { for (let key in themeSetting) { if (!allow.includes(key)) delete themeSetting[key]; }}

    if (themeObj && prop && rawSelector) {
      for (let key in themeObj) {
        let value = themeSettingChild && themeObj[key][themeSettingChild] ? themeObj[key][themeSettingChild] : themeObj[key];
        if (!themeSettingChild && typeof themeObj[key] === 'object' && themeObj[key]['DEFAULT']) value = themeObj[key]['DEFAULT'];
        const selector = rawSelector.includes(replaceKey) 
          ? rawSelector.replace(replaceKey, e([separator,key].join(''))) 
          : [rawSelector,e([separator,key].join(''))].join('');
        const variantRule = new postcss.Rule({ selector });
        variantRule.append(new postcss.Declaration({ prop, value }));
        root.append(variantRule);
      }
    }

    root.parent.insertBefore(root,root.nodes);
    root.remove();
  }
  
  return {
    postcssPlugin: 'postcss-ccui-tailwind',
    AtRule: { [AT_RULE]: handler },
  }
}
module.exports.postcss = true
