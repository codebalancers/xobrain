# Xobrain

Cross platform contextual desktop wiki for MacOS, Windows and Linux.  

![alt text](https://raw.githubusercontent.com/codebalancers/xobrain/master/docs/xobrain.png)

## Build and start
Prepare environment: The rebuild step is necessary to provide the sqlite libraries to electron. This only needs to be done once.

```
npm install
npm run electron:rebuild
```

Build and run
```
npm run build.dev
npm run app
```


## Used libraries

* electron
* ionic
* simplemde, marked
* d3
* knex
* sqlite
