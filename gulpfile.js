var browserify = require('browserify');
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var glob = require("glob");
var del = require("del");
var tsify = require("tsify");
var gulp = require("gulp");
var ts = require("gulp-typescript");
var less = require("gulp-less");
var jade = require("gulp-jade");
var buffer = require("vinyl-buffer");
var minimist = require("minimist");

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
  gulp.watch("./js/**/*.ts", ["ts"]);
  gulp.watch("./css/*.less", ["less"]);
  gulp.watch("./*.jade", ["jade"]);
});
gulp.task("mountain", function() {
  var env = minimist(process.argv.slice(2));
  find("./js/{main.ts,modules/*.ts}").then(files => {
    console.log(files);
    var f = browserify({
      entries: files
    }).plugin(tsify, {
      noImplicitAny: true,
      target: "es5"
    }).bundle();
    if (env.dev) {
      f.pipe(source("./all.js")).pipe(gulp.dest("./js/"))
    } else {
      f.pipe(source("./all.min.js")).pipe(buffer()).pipe(uglify()).pipe(gulp.dest("./js/"))
    }
    console.log("fuga");
  });
});
gulp.task("deljs", function() {
  del(["./js/{main.js,modules/*.js}"]);
});