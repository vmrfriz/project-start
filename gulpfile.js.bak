'use strict';

/*******************************
             REQUIRE
*******************************/
var gulp            = require('gulp');
var notify          = require('gulp-notify');
var browserSync     = require("browser-sync").create();
var clean           = require('gulp-clean');
// HTML
//var rigger          = require('gulp-rigger');
var jade            = require('gulp-jade');
var htmlmin         = require('gulp-htmlmin');
// CSS
var sass            = require('gulp-sass');
var autoprefixer    = require('gulp-autoprefixer');
var sourcemaps      = require('gulp-sourcemaps');
var changed         = require('gulp-changed');
var rename          = require('gulp-rename');
var cssnano         = require('cssnano');
// JavaScript
var uglify          = require('gulp-uglify');
var sourcemaps      = require('gulp-sourcemaps');
// Images
var imagemin        = require('gulp-imagemin');
var pngquant        = require('imagemin-pngquant');
var cache           = require('gulp-cache');
var spritesmith     = require('gulp.spritesmith');

/*******************************
             TASKS
*******************************/
// DEFAULT
//gulp.task('default' function () {
//
//});

// WATCH
gulp.task('watch', ['browser-sync', 'sass', 'jade', 'js'], function () {
	gulp.watch('./app/scss/**/*.scss', ['sass']);
	gulp.watch('./app/jade/**/*.jade', ['jade']);
	gulp.watch('./app/css/**/*.css', browserSync.stream())
	gulp.watch('./app/*.html', browserSync.reload);
	gulp.watch('./app/js/**/*.js', browserSync.reload);
});

// HTML (jade)
gulp.task( 'jade', function () {
	return gulp.src( './app/jade/**/*.jade' )
		//.pipe( rigger() )
		.pipe( jade({ pretty: '\t' }) )
		.pipe( rename({sufix: '.jade'}) )
		.pipe( gulp.dest('./app/') );
});

gulp.task( 'html', function () {
	return gulp.src( './app/*.html' )
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			removeComments: true,
			removeEmptyAttributes: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			minifyCSS: true,
			minifyJS: true,
			minifyURLs: true
		}))
		.pipe( gulp.dest('./app/') );
});

// SASS
gulp.task( 'sass', function () {
	return gulp.src( './app/scss/**/*.scss' )
		.pipe( sass({ sourceMap: true })
			.on( 'error', notify.onError({
				message: "<%= error.message %>",
				title  : "Sass Error!"
			}))
		)
		.pipe( autoprefixer(['last 2 versions'], { cascade: true }) )
		.pipe( gulp.dest( './app/css/' ) )
});

// CSS
gulp.task( 'css', ['sass'], function () {
	return gulp.src( './app/css/**/*.css' )
		.pipe( sourcemaps.init() )
		.pipe( changed('./app/css/') )
		.pipe( uncss({
			html: ['./app/**/*.html']
		}) )
		.pipe( cssnano() )
		.pipe( rename({sufix: '.min'}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './app/css/' ) );
});

gulp.task( 'js', function () {
	return gulp.src( './app/js/**/*.js' )
		.pipe( sourcemaps.init() )
		//.pipe( concat('main.js') )
		.pipe( gulp.dest('./dist/js/') )
		.pipe( rename({ suffix: '.min' }) )
		.pipe( uglify() )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './dist/js/' ) );
});

gulp.task( 'img', function () {
	return gulp.src(['app/img/**/*', '!app/img/sprite/**/*.*', '!app/img/sprite.png'])
		.pipe( cache( imagemin({
					interlaced: true,
					progressive: true,
					svgoPlugins: [{removeViewBox: false}],
					use: [pngquant()]
		}) ) )
		.pipe( gulp.dest('dist/img') )
		.pipe( notify({ message: 'Images task complete' }) );
});

gulp.task('build', ['clean', 'img', 'css', 'html', 'js'], function() {

	var buildCss = gulp.src('app/css/**/*.css')
		.pipe(gulp.dest('./dist/css'));

	var buildFonts = gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('./dist/fonts'));

	var buildJs = gulp.src('app/js/**/*')
		.pipe(gulp.dest('./dist/js'));

	var buildHtml = gulp.src('app/*.html')
		.pipe(gulp.dest('./dist'));

	var buildPhp = gulp.src(['app/**/*.php', 'app/**/*.ico'])
		.pipe(gulp.dest('./dist'));

});

/*******************************
             HELPERS
*******************************/
// BrowserSync
gulp.task('browser-sync', function () {
	browserSync.init({
		server: './app',
		notify: false
	});
});

// CLEAN
gulp.task('clean', function () {
	return del.sync( path.clean );
});

gulp.task('sprite', function () {
	var spriteData = gulp.src('app/img/sprite/**/*.*').pipe( spritesmith({
		imgName: 'sprite.png',
		cssName: '_sprite.scss',
		cssFormat: 'scss',
		algorithm: 'binary-tree',
		cssVarMap: function(sprite) {
			sprite.name = 'sprite-' + sprite.name
		}
	}) );
	spriteData.img.pipe( gulp.dest('./app/img/') );
	spriteData.css.pipe( gulp.dest('./app/scss/') );
});