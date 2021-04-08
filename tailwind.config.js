const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const { readFileSync } = require('fs');
const { resolve } = require('path');

module.exports = {
  mode: 'jit',
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      gridTemplateColumns: {
        '25-75': '25% 75%',
        '75-25': '75% 25%',
        '33-66': '33% 66%',
        '66-33': '66% 33%',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '80ch',
          }
        }
      }
    },
    colors: {
      primary: {
        DEFAULT: '#03899C',
        inverted: 'rgb(255,255,255)',
        hover: '#015965',
        'inverted-hover': 'rgb(235,235,235)',
      },
      secondary: {
        DEFAULT: '#FFAE00',
        inverted: 'rgb(30,30,30)',
        hover: '#FFD373',
        'inverted-hover': 'rgb(10,10,10)',
      },
      success: {
        DEFAULT: colors.green['500'],
        inverted: 'rgb(255,255,255)',
        hover: colors.green['800'],
        'inverted-hover': 'rgb(235,235,235)',
      },
      danger: {
        DEFAULT: colors.red['500'],
        inverted: 'rgb(255,255,255)',
        hover: colors.red['800'],
        'inverted-hover': 'rgb(235,235,235)',
      },
      warning: {
        DEFAULT: colors.yellow['200'],
        inverted: 'rgb(30,30,30)',
        hover: colors.yellow['400'],
        'inverted-hover': 'rgb(10,10,10)',
      },
      info: {
        DEFAULT: colors.purple['400'],
        inverted: 'rgb(255,255,255)',
        hover: colors.purple['800'],
        'inverted-hover': 'rgb(235,235,235)',
      },
      light: {
        DEFAULT: colors.gray['200'],
        inverted: 'rgb(30,30,30)',
        hover: colors.gray['300'],
        'inverted-hover': 'rgb(10,10,10)',
      },
      dark: {
        DEFAULT: colors.gray['700'],
        inverted: 'rgb(255,255,255)',
        hover: colors.gray['900'],
        'inverted-hover': 'rgb(235,235,235)',
      },
      link: {
        DEFAULT: colors.blue['600'],
        inverted: 'rgb(255,255,255)',
        hover: colors.blue['800'],
        'inverted-hover': 'rgb(235,235,235)',
      },
      white: {
        DEFAULT: 'rgb(235,235,235)',
        inverted: 'rgb(30,30,30)',
        hover: 'rgb(255,255,255)',
        'inverted-hover': 'rgb(10,10,10)',
      },
      black: {
        DEFAULT: 'rgb(30,30,30)',
        inverted: 'rgb(255,255,255)',
        hover: 'rgb(10,10,10)',
        'inverted-hover': 'rgb(235,235,235)',
      },
      transparent: {
        DEFAULT: 'transparent',
        inverted: 'transparent',
        hover: 'transparent',
        'inverted-hover': 'transparent',
      },
    },
    fontFamily: {
      'sans': ['system-ui','-apple-system','Segoe UI','Roboto','Helvetica Neue','Arial','Noto Sans','Liberation Sans','sans-serif','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji']
    },
    screens: {
      'sm': {'max': '767px'},
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    icons: [
      'list',
      'x',
      'arrow-up',
      'arrow-right',
      'arrow-down',
      'arrow-left',
      'caret-up-fill',
      'caret-right-fill', 
      'caret-down-fill', 
      'caret-left-fill', 
      'chevron-up',
      'chevron-right', 
      'chevron-down', 
      'chevron-left', 
      'plus',
      'dash',
    ],
    spacing: () => {
      const styles = {};
      [0,'0.5',1,2,3,4,5,6,7,8,9,10,11,12,14,16,20].forEach(space => styles[space] = defaultTheme.spacing[space.toString()])
      return styles;
    },
  },
  variants: {
    extend: {
      // color: ['var'],
      backgroundColor: ['var','hover-var'],
      borderRadius: ['var'],
      boxShadow: ['var'],
      flexDirection: ['var'],
      flexGrow: ['var'],
      flexWrap: ['var'],
      fontSize: ['var'],
      gap: ['var'],
      gridTemplateColumns: ['var'],
      justifyContent: ['var'], // Manual
      maxWidth: ['var'],
      padding: ['var'],
      textAlign: ['var'], // Manualal
      textColor: ['var','hover-var'], // Manualal
    },
  },
  plugins:  [
    require('@tailwindcss/typography'),
    // Icons
    plugin(({ addBase, theme }) => {
      const icons = theme('icons') || [];
      icons.forEach(icon => {
        const iconPath = resolve(process.cwd(),`./node_modules/bootstrap-icons/icons/${icon}.svg`);
        const svg = readFileSync(iconPath, 'utf-8').replace(/\n/g, "");
        addBase({ [`[class*=icon--${icon}]`]: { 'mask-image': `url('data:image/svg+xml,${svg}')` }});
      });
    }),
    // Create CSS Variables from configured variants
    plugin(({ addVariant, e }) => {
      const convertToVar = (container, separator, e, variant='var') => {
        container.walkRules(rule => {
          // Only escape the new addition because the second half is already escaped
          rule.selector = `.${e(`${variant}${separator}`)}${rule.selector.slice(1)}`
          rule.nodes.forEach(node => node.prop = node.prop.startsWith('--') ? node.prop : `--${variant.replace('var','')}${node.prop}`);
        });
      }
      addVariant('var', ({ separator, container }) => convertToVar(container, separator, e)); 
      addVariant('hover-var', ({ separator, container }) => convertToVar(container, separator, e, 'hover-var')); 
    }), 
  ],
  purge: {
    enabled: true,
    content: [
      './src/template/policies.json',
      './src/components/**/**/*.js',
      './src/components/**/**/*.css',
      './src/site/*.js',
      './src/site/*.css',
      './tailwind.config.js',
    ],
    css: ['./src/main.css'],
  },
};
