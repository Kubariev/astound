'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

//import path from 'path';
import gulp from 'gulp';
import del from 'del';
import minify from 'gulp-babel-minify';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const config = {
  isProd: !!$.util.env.prod
};

// Optimize images
gulp.task('images', () =>
  gulp.src([
    'app/images/**/*',
    '!app/images/svg/*'
  ])
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('build/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html',
    '!app/components',
    '!app/styles',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('build'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src('app/styles/styles.scss')
    .pipe($.newer('build/css'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    // Concatenate and minify styles
    .pipe($.if(config.isProd, $.cssnano()))
    .pipe($.size({title: 'styles', pretty: true}))
    .pipe(gulp.dest('build/css'))
    .pipe($.sourcemaps.write('./maps'))
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('templates', () =>
  gulp.src(['app/*.html'])
    .pipe($.fileInclude({
      prefix: '@@',
      basepath: 'app/components'
    }))
    // Minify any HTML
    .pipe($.if(config.isProd, $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('build'))
);

// Clean output directory
gulp.task('clean', () => del(['build/*', '!build/.git'], {dot: true}));


gulp.task('serve', ['styles', 'templates'], () => {
  browserSync({
    notify: false,
    logPrefix: 'task',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['build'],
    port: 3000
  });
});

gulp.task('watch', () => {
  gulp.watch(['app/**/*.html'], ['templates', reload]);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
});


gulp.task('build', ['clean'], cb =>
  runSequence(
    ['styles', 'templates'],
    ['images', 'copy'],
    cb
  )
);

gulp.task('default', () => {
  runSequence(
    'build',
    'watch',
    'serve'
  )
});
