const {
  src,
  dest,
  series,
  parallel,
  watch
} = require('gulp');

const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const cssmin = require('postcss-csso');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');
const sync = require('browser-sync').create();

// Styles

const styles = () => {
  return src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      cssmin()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(dest('build/css'))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML

const html = () => {
  return src('source/*.html')
    .pipe(
      htmlmin({collapseWhitespace: true})
    )
    .pipe(dest('build'));
}

// Scripts

const scripts = () => {
  return src('source/js/script.js')
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(dest('build/js'))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Images

const images = () => {
  return src(['source/img/**/*.{png,jpg,svg}', '!source/img/sprite/*.svg'])
    .pipe(imagemin([
      imagemin.mozjpeg(
        {progressive: true}
      ),
      imagemin.optipng(
        {optimizationLevel: 3}
      ),
      imagemin.svgo()
    ]))
    .pipe(dest('build/img'))
}

exports.images = images;

// WebP

const createWebp = () => {
  return src('source/img/**/*.{jpg,png}')
    .pipe(
      webp({quality: 90})
    )
    .pipe(dest('build/img'))
}

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return src('source/img/sprite/*.svg')
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(svgstore())
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img'));
}

exports.sprite = sprite;

// Copy

const copy = (done) => {
  src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico'
  ], {
    base: 'source'
  })
  .pipe(dest('build'))

  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });

  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();

  done();
}

const watcher = () => {
  watch('source/less/**/*.less', series(styles));
  watch('source/js/script.js', series(scripts));
  watch('source/*.html', series(html, reload));
};

// Build

const build = series(
  clean,

  parallel(
    styles,
    html,
    scripts,
    sprite,
    copy,
    images
  )
);

exports.build = build;

// Default

exports.default = series(
  build,

  series(
    server,
    watcher
  )
);
