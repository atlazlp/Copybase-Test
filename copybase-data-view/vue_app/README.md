# vue_app

### Install new NPM Packages and build with helper image
```
docker run -it -v C:/Work/Copybase/copybase-data-view/:/vue-setup vue_helper
```

### Run development hot reload container inside Docker
```
docker run -it -p 8080:8080 -v C:/Work/Copybase/copybase-data-view/vue_app:/vue_app vue_app:dev
```

### Build /dist
```
cd vue_app
npm run build
```