var gulp = require("gulp");
var less = require("gulp-less");
var jade = require("gulp-jade");

// Browserify 関連
var browserify = require('browserify');
var source = require("vinyl-source-stream"); // BrowserifyをGulpで使える「Vinyl」形式へ変換
var tsify = require("tsify"); // TypescriptでBrowserify
var uglify = require("gulp-uglify"); // --min オプションの時、minする
var watchify = require("watchify"); // Browserifyをwatchする
var streamify = require("gulp-streamify"); // gulp-uglifyで使う
var minimist = require("minimist"); // --dev --min などのオプションを扱う

// Less をコンパイル
gulp.task("less", function() {
  gulp.src('css/*.less').pipe(less()).pipe(gulp.dest('./css/'));
});

// Jade をコンパイル
gulp.task("jade", function() {
  gulp.src('*.jade').pipe(jade({
    pretty: true
  })).pipe(gulp.dest('./'));
});

// Less + Jade を Watch
gulp.task("build", function() {
  gulp.watch("./css/*.less", ["less"]);
  gulp.watch("./*.jade", ["jade"]);
});

// Browserify 関係
gulp.task("brify", function(callBack) {
  runBrowserify(minimist(process.argv.slice(2)).watch, minimist(process.argv.slice(2)).dev);
});
function runBrowserify(watch, min) {
  var isWatch = typeof watch !== "undefined";
  var isMin = typeof min !== "undefined";
  console.log("isWatch: " + isWatch);
  console.log("isMin: " + isMin);
  
  var options = {
    entries: [ "./js/main.ts" ]
  };
  
  var bundler = null;
  if (isWatch) {
    options.cache = {};
    options.packageCache = {};
    bundler = watchify(browserify(options));
  } else {
    bundler = browserify(options);
  }

  function bundle() {
    console.log("tsify...");
    var f = bundler.plugin(tsify, {
      noImplicitAny: true,
      target: "es5"
    }).bundle();
    console.log("source...");
    if (isMin) {
      f.pipe(source("./all.js")).pipe(gulp.dest("./js/"));
    } else {
      f.pipe(source("./all.min.js")).pipe(streamify(uglify())).pipe(gulp.dest("./js/"));
    }
  }
  if (isWatch) {
    bundler.on("update", bundle);
    bundler.on("log", function(msg) {
      console.log(msg);
    });
  }
  bundle();
}
