// 'use strict'
importScripts('sw-toolbox.js')
toolbox.precache(['src/vocgui/templates/index.html', 'src/css/style.min.css'])
// toolbox.router.get('/images/*', toolbox.cacheFirst)
toolbox.router.get('/*', toolbox.networkFirst, {
networkTimeoutSeconds: 5})
