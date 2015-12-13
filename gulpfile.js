var gulp = require("gulp");
var ts = require("gulp-typescript");
var less = require("gulp-less");
gulp.task("ts", function() {
  gulp.src("./js/**/*.ts").pipe(ts({
    target: 'ES5',
    module: 'amd'
  })).js.pipe(gulp.dest("./js/"))
});
gulp.task("less", function() {
  gulp.src('css/*.less').pipe(less()).pipe(gulp.dest('./css/'));
});
gulp.task("watch", function() {
  gulp.watch("./js/**/*.ts", ["ts"]);
  gulp.watch("./css/*.less", ["less"]);
});
