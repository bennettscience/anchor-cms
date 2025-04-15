"use strict";

/*
 global module,
 require
 * gulp-cli requires a new syntax for tasks.
 * https://gulpjs.com/docs/en/getting-started/creating-tasks
 */

const { dest, src, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

const path = require("path"),
  plumber = require("gulp-plumber"),
  rename = require("gulp-rename"),
  // autoprefixer = require("gulp-autoprefixer"),
  babel = require("gulp-babel"),
  concat = require("gulp-concat"),
  /**
   * @TODO JSHint is disabled for now, JS will be refactored later on
   */
  // jshint       = require('gulp-jshint'),
  uglify = require("gulp-uglify"),
  imageMin = require("gulp-imagemin"),
  cache = require("gulp-cache"),
  cleanCss = require("gulp-clean-css"),
  sourceMaps = require("gulp-sourcemaps"),
  browserSync = require("browser-sync");

/**
 * holds the configuration data.
 * for now, there are two presets:
 *  - development: writes out beautified source code with maps, compatibility reduced
 *  - production: writes out minified and optimized source code without maps
 */
const config = {
  path: {
    base: path.join(__dirname, "anchor", "views", "assets"),
    scss: "scss",
    css: "css",
    js: "js",
    img: "img",
  },
  development: {
    autoprefixer: "last 1 versions",
    babel: {
      presets: ["env"],
    },
    cleanCss: {
      compatibility: "*",
      format: "beautify",
      inline: ["local"],
      level: 1,
    },
    imageMin: {
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    },
    scss: {
      outputStyle: "nested",
      sourceComments: true,
      sourceMap: true,
    },
    rename: {
      suffix: ".min",
    },
    uglify: {
      warnings: "verbose",
      compress: false,
      output: {
        beautify: true,
      },
    },
  },
  production: {
    autoprefixer: "last 3 versions",
    babel: {
      presets: ["env"],
    },
    cleanCss: {
      compatibility: "ie9",
      inline: ["local", "remote", "!fonts.googleapis.com"],
      level: 2,
    },
    imageMin: {
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    },
    scss: {
      outputStyle: "compressed",
      sourceMap: true,
    },
    rename: {
      suffix: ".min",
    },
    uglify: {
      warnings: false,
      compress: true,
      mangle: true,
    },
  },

  get scssPath() {
    return path.join(this.path.base, this.path.scss);
  },

  get cssPath() {
    return path.join(this.path.base, this.path.css);
  },

  get jsPath() {
    return path.join(this.path.base, this.path.js);
  },

  get imgPath() {
    return path.join(this.path.base, this.path.img);
  },
};

/**
 * starts browserSync
 */
// gulp.task("browser-sync", () =>
//   browserSync({
//     server: {
//       baseDir: "./",
//     },
//   }),
// );

/**
 * reloads the browser
 */
// gulp.task("bs-reload", () => browserSync.reload());

/**
 * optimizes images
 */
function images(cb) {
  return src(path.join(config.imgPath, "**", "*"), { encoding: false })
    .pipe(cache(imageMin(config.development.imageMin)))
    .pipe(dest(config.imgPath));
}

/**
 * compiles SCSS
 */
function styles(cb) {
  return (
    src(path.join(config.scssPath, "**", "*.scss"))
      .pipe(
        plumber({
          errorHandler: (error) => console.log(error),
        }),
      )
      .pipe(sourceMaps.init({ base: config.path }))
      .pipe(sass(config.development.scss))
      // .pipe(autoprefixer(config.development.autoprefixer))
      .pipe(cleanCss(config.development.cleanCss))
      .pipe(rename(config.development.rename))
      .pipe(
        sourceMaps.write(".", {
          includeContent: false,
          sourceRoot: "../scss",
        }),
      )
      .pipe(dest(config.cssPath))
      .pipe(browserSync.reload({ stream: true }))
  );
}

/**
 * compiles SCSS for prod
 */
function styles_prod(cb) {
  return (
    src(path.join(config.scssPath, "**", "*.scss"))
      .pipe(
        plumber({
          errorHandler: (error) => {
            console.log("ERROR:");
            console.error(error.message);
            // this.emit('end');
          },
        }),
      )
      .pipe(sass(config.production.scss))
      // .pipe(autoprefixer(config.production.autoprefixer))
      .pipe(rename(config.production.rename))
      .pipe(cleanCss(config.production.cleanCss))
      .pipe(dest(config.cssPath))
      .pipe(browserSync.reload({ stream: true }))
  );
}

/**
 * compiles javascript
 */
function scripts(cb) {
  return (
    src(path.join(config.jsPath, "**", "*.js"))
      .pipe(
        plumber({
          errorHandler: (error) => {
            console.log("ERROR:");
            console.error(error.message);
            // this.emit('end');
          },
        }),
      )
      // .pipe(jshint())
      // .pipe(jshint.reporter('default'))
      .pipe(concat("main.js"))
      .pipe(babel(config.development.babel))
      .pipe(dest(config.jsPath))
      .pipe(rename(config.development.rename))
      .pipe(uglify(config.development.uglify))
      .pipe(dest(config.jsPath))
      .pipe(browserSync.reload({ stream: true }))
  );
}

/**
 * compiles javascript for prod
 */
function scripts_prod(cb) {
  return (
    src(path.join(config.jsPath, "**", "*.js"))
      .pipe(
        plumber({
          errorHandler: (error) => {
            console.log("ERROR:");
            console.error(error.message);
            // this.emit('end');
          },
        }),
      )
      // .pipe(jshint())
      // .pipe(jshint.reporter('default'))
      .pipe(concat("main.js"))
      .pipe(babel(config.production.babel))
      .pipe(dest(config.jsPath))
      .pipe(rename(config.production.rename))
      .pipe(uglify(config.production.uglify))
      .pipe(dest(config.jsPath))
      .pipe(browserSync.reload({ stream: true }))
  );
}

/**
 * watches source files
 */
// gulp.task("watch", ["browser-sync"], () => {
//   gulp.watch(path.join(config.scssPath, "**", "*.scss"), ["styles"]);
//   gulp.watch(path.join(config.jsPath, "**", "*.js"), ["scripts"]);
//   gulp.watch(path.join(__dirname, "**", "*.php"), ["bs-reload"]);
// });

function help(cb) {
  console.log(
    [
      "⚓\tAnchorCMS asset compilation script",
      "",
      "Available tasks:",
      "  \x1b[36mimages\x1b[0m\t\x1b[2mOptimizes images\x1b[0m",
      "  \x1b[36mstyles\x1b[0m\t\x1b[2mCompiles SCSS for development\x1b[0m",
      "  \x1b[36mstyles_prod\x1b[0m\t\x1b[2mCompiles SCSS for production\x1b[0m",
      "  \x1b[36mscripts\x1b[0m\t\x1b[2mCompiles JavaScript for development\x1b[0m",
      "  \x1b[36mscripts_prod\x1b[0m\t\x1b[2mCompiles JavaScript for production\x1b[0m",
    ].join("\n"),
  );
  cb();
}

exports.default = help;
exports.build = series(images, styles, scripts);
exports.buildProd = series(styles_prod, scripts_prod);
exports.buildCss = styles;
