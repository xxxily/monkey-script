import { defineConfig } from 'vite'
import postcssNesting from 'postcss-nesting'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      /**
       * 使用postcss-nesting（vite官方推荐）
       * https://cn.vitejs.dev/guide/features.html#css
       * https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting
       */
      plugins: [postcssNesting()],
    },
  },
  
  plugins: [
    // https://github.com/lisonge/vite-plugin-monkey/blob/main/README_zh.md
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'https://github.com/xxxily',
        name: '操作记录器',
        description: '浏览器操作记录辅助，端测代码生成辅助工具',
        match: ['*://*/*'],
        version: '1.0.3',
        license: 'Apache License 2.0',
        author: 'ankvps',
        'run-at': 'document-start',
      },
      format: {
        align: 4,

        // align: (userScriptCommentArr) => {
        //   console.log('----------userscript----------', userScriptCommentArr)

        //   const customComment = [
        //     ['name', '这是测试111'],
        //     ['name:en', 'Web Access Accelerator'],
        //     ['name:zh', '操作记录器'],
        //     ['name:zh-TW', '操作记录器'],
        //     ['name:ja', '操作记录器'],
        //     ['name:ko', '操作记录器'],
        //     ['name:de', '操作记录器'],
        //     ['description:en', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //     ['description:zh', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //     ['description:zh-TW', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //     ['description:ja', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //     ['description:ko', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //     ['description:de', '浏览器操作记录辅助，单测代码生成辅助工具'],
        //   ]

        //   return [...userScriptCommentArr, ...customComment]
        // },
      },
      build: {
        // 自动导入Grant函数
        autoGrant: true,
      },
      server: {
        open: true,
      },
    }),
  ],
})
