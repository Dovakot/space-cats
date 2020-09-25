const gulp = require(`gulp`);
const plumber = require(`gulp-plumber`);
const sourcemap = require(`gulp-sourcemaps`);
const less = require(`gulp-less`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const cssmin = require(`gulp-cssmin`);
const server = require(`browser-sync`).create();
const rename = require(`gulp-rename`);
const clean = require(`del`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const svgstore = require(`gulp-svgstore`);
const posthtml = require(`gulp-posthtml`);
const include = require(`posthtml-include`);
const uglify = require(`gulp-uglify-es`).default;

gulp.task(`clean`, () => {
  return clean(`build`);
});

gulp.task(`copy`, () => {
  return gulp.src([
    `source/fonts/**/*`,
    `source/img/**`,
    `source/*.ico`
  ], {
    base: `source`
  })
  .pipe(gulp.dest(`build`));
});

gulp.task(`html`, () => {
  return gulp.src(`source/*.html`)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(`build`));
});

gulp.task(`css`, () => {
  return gulp.src(`source/less/style.less`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(cssmin())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});

gulp.task(`js`, () => {
  return gulp.src(`source/js/**/*.js`)
    .pipe(sourcemap.init())
    .pipe(uglify())
    .pipe(rename(`script.min.js`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`build/js`))
    .pipe(server.stream());
});

gulp.task(`imagemin`, () => {
  return gulp.src(`build/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(`build/img`));
});

gulp.task(`webp`, function() {
  return gulp.src(`source/img/**/*.{png,jpg}`)
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest(`build/img`));
});

gulp.task(`sprite`, () => {
  return gulp.src(`build/img/sprite-*.svg`)
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename(`sprite.svg`))
    .pipe(gulp.dest(`build/img`));
});

gulp.task(`server`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(`source/less/**/*.less`, gulp.series(`css`));
  gulp.watch(`source/js/**/*.js`, gulp.series(`js`));
  gulp.watch(`source/img/sprite-*.svg`, gulp.series(`sprite`, `html`, `refresh`));
  gulp.watch(`source/*.html`, gulp.series(`html`, `refresh`));
});

gulp.task(`refresh`, (done) => {
  server.reload();
  done();
});

gulp.task(`build`, gulp.series(
  `clean`,
  `copy`,
  `css`,
  `imagemin`,
  `webp`,
  `sprite`,
  `html`,
  `js`
));

gulp.task(`start`, gulp.series(`build`, `server`));
