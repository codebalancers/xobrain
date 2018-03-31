# Xobrain

Cross platform contextual desktop wiki for MacOS, Windows and Linux.  

![Xobrain main window](https://raw.githubusercontent.com/codebalancers/xobrain/master/docs/xobrain.png)

## Build and start
Prepare environment: Install yarn if not yet available:

```
npm install -g yarn
```


The rebuild step is necessary to provide the sqlite libraries to electron. This only needs to be done once.

```
yarn
```

In a `postinstall` step yarn will run `electron:rebuild`. 

Build and run
```
yarn run build.dev
yarn run app
```


## Used libraries

* electron
* ionic
* simplemde, marked
* d3
* knex
* sqlite
