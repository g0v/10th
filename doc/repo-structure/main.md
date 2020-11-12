## Repo Structure ( TBD Tentative ) 

 - src
   - ls, styl, pug
 - static
   - assets and other
 - locales - for i18n
   - intl
     - zh-TW, en , ... etc 
 - engine
   - watch
   - route
   - module
     - db
     - util? # 額外的工具模組
     - view
   - other files
     - index.ls
 - doc
 - test
 - tool
 - script
 - .view, .engine - prebuilt files
 - user
 - config # 需要考慮到支援不同網域. ( 參考 repo-structure/config.md )
   - build, nginx, key, mail, site
 - other files
   - start
   - package.json, package-lock.json, .gitignore, .git, node_modules, server.log
   - secret ( 公開與非公開? )
