### Install dependencies

```bash
bower install
npm install
# Link the pdp8 lib
npm link ../lib
```

### Start the App

You can use a simple web server to try the app:
```bash
# Start a simple server
python3 -m http.server
```

The app is compatible with [NW.js](http://nwjs.io/), so you can [download it](http://nwjs.io/downloads/) and run the application from the app folder like this:
```bash
/path/to/nw .
```

If you have troubles with *NW.js* check the [guide](http://docs.nwjs.io/en/latest/For%20Users/Getting%20Started/) to start with it.

### Generate compatible Javascript code

```bash
babel ./js/app.js --presets es2015 --out-file ./js/app-compiled.js

# You can compress it like that

uglifyjs ./js/app-compiled.js --compress -o ./js/app-compiled.min.js
```