var browserify = require('browserify');
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var glob = require("glob");
var del = require("del");
var tsify = require("tsify");
var gulp = require("gulp");
var less = require("gulp-less");
var jade = require("gulp-jade");
var buffer = require("vinyl-buffer");
var minimist = require("minimist");
var watchify = require("watchify");

function find(pattern) {
  return new Promise(resolve => {
    glob(pattern, function (err, files) {
      if (err) {
        console.log(err);
      }
      resolve(files);
    });
  });
}
gulp.task("less", function() {
  gulp.src('css/*.less').pipe(less()).pipe(gulp.dest('./css/'));
});
gulp.task("jade", function() {
  gulp.src('*.jade').pipe(jade({
    pretty: true
  })).pipe(gulp.dest('./'));
});
gulp.task("build", function() {
  gulp.watch("./css/*.less", ["less"]);
  gulp.watch("./*.jade", ["jade"]);
});
gulp.task("browserify", function(callBack) {
  rify(false).then(() => {
    callBack();
  });
});
gulp.task("w-browserify", function(callBack) {
  rify(true).then(() => {
    callBack();
  });
});
function rify(isWatch) {
  return new Promise((resolve) => {
    var env = minimist(process.argv.slice(2));
    var isDev = env.dev;
    find("./js/{main.ts,ui.ts,modules/**/*.ts}").then(files => {
      console.log(files);
      var options = {
        entries: files
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
        var f = bundler.plugin(tsify, {
          noImplicitAny: true,
          target: "es5"
        }).bundle();
        if (isDev) {
          return f.pipe(source("./all.js")).pipe(gulp.dest("./js/"))
        } else {
          return f.pipe(source("./all.min.js")).pipe(buffer()).pipe(uglify()).pipe(gulp.dest("./js/"))
        }
      }
      if (isWatch) {
        bundler.on("update", bundle);
        bundler.on("log", function(msg) {
          console.log(msg);
        });
      }
      bundle();
      resolve();
    });
  });
}
gulp.task("deljs", function() {
  del(["./js/{main.js,modules/*.js}"]);
});