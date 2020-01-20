module.exports = {
  theme: {
    fontFamily : {
        'sans' : ['Roboto', 'sans-serif' ],
        'serif': ["Noto Serif", 'serif'  ]
    },
    extend: {
        zIndex : {
            '-1' : '-1',
        },
        fontSize : {
            '7xl': '5rem',
        },
        colors : {
            '2gray' : '#222222',
            '9gray' : '#999999',
            'cgray' : '#cccccc',
            'egray' : '#eeeeee'
        },
        width : {
            '70pct' : '70%',
            '15pct' : '15%',
        },
        margin : {
            '5pct' : '5%'
        }
    }
  },
  variants: {},
  plugins: [],
  corePlugins: {
      backgroundAttachment: false,
  }
}
