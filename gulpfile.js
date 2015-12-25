var browserify = require('browserify');
var tsify = require('tsify');
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var glob = require("glob");
function find(pattern) {
  var result = [];
  glob(pattern, function (err, files) {
    if (err) {
      console.log(err);
    }
    console.log(pattern);
    result = files;
  });
  return result;
}

var gulp = require("gulp");
var ts = require("gulp-typescript");
var less = require("gulp-less");
var jade = require("gulp-jade");

gulp.task("ts", function() {
  gulp.src("./js/**/*.ts").pipe(ts({
    target: 'ES5',
    module: 'amd'
  })).js.pipe(gulp.dest("./js/"))
});
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
gulp.task("browserify", function() {
  browserify()
    .add("js/main.ts").add("js/modules/initDOM.ts").add("js/modules/list.ts").add("js/modules/packLoader.ts").add("js/modules/packManager.ts").add("js/modules/preferences.ts").add("js/modules/ui.ts")
    .add("js/modules/event.ts")
    .plugin(tsify, { noImplicitAny: true, declaration: true })
    .bundle().on("error", (err) => { console.error(err.toString()); }).pipe(source("all.js"))
    .pipe(gulp.dest('js/'));
});
gulp.task("tsb", function() {
  gulp.src("./js/**/*.ts").pipe(ts({
    target: 'ES5',
    module: 'commonjs'
  })).js.pipe(gulp.dest("./js/"));
  browserify({
    entries: find("./js/**/*.js")
  }).bundle().pipe(source("./js/all.js")).pipe(gulp.dest("./js/"));
  
  // var browserified = transform(function(filename) {
  //   var b = browserify(filename);
  //   b.add(filename);
  //   return b.bundle();
  // });
  // gulp.src(["./js/**/*.js"]).pipe(browserified).pipe(uglify()).pipe(gulp.dest("./js/"));
});
