var uglify = require("gulp-uglify");
var glob = require("glob");
var gulp = require("gulp");
var ts = require("gulp-typescript");
var less = require("gulp-less");
var jade = require("gulp-jade");
var minimist = require("minimist");
var find = require("gulp-find-glob");
var webpack = require("gulp-webpack");
var tsConfig = require("./js/tsconfig.json");

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
gulp.task("wpack", function() {
  gulp.src("./js/{main.ts,modules/**/*.ts}")
    .pipe(ts(tsConfig.compilerOptions))
    .js.pipe(gulp.dest("./js_temp"));
  gulp.src("./js_temp/**/*.js")
    .pipe(webpack({
      entry: "./js_temp/main.js",
      output: {
        filename: "wpack.js"
      },
      resolve: {
        extensions: [ "", ".js" ]
      }
    }))
    .pipe(gulp.dest("./js"));
});
// gulp.task("deljs", function() {
//   del(["./js/{main.js,modules/*.js}"]);
// });