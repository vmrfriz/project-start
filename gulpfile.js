/*
	============ TODO List ============
	1. Компиляция *.pug | gulp pug
		1.1. Кэш для ускорения компиляции
		1.2. Уведомление об ошибках

	2. Компиляция *.scss | gulp scss
		2.1. Кэш для ускорения компиляции
		2.2. Расстановка префиксов
		2.3. Создание sourcemaps
		2.4. Уведомление об ошибках

	3. Создание спрайтов | gulp sprites
		3.1. Создание sprite.png в /img/
		3.2. Создание _sprite.scss в /scss/
		3.3. Уведомление об ошибках

##4. Сжатие *.jpg, *.jpeg, *.png | gulp images
##	4.1. Уведомление об ошибках

##5. Запуск локального http-сервера | gulp watch
##	5.1. Отслеживание *.pug - компиляция
##	5.2. Отслеживание *.html - обновление http
##	5.3. Отслеживание *.scss - компиляция
##	5.4. Отслеживание *.css - обновление http
##	5.5. Отслеживание *.js - обновление http
##	5.6. Отслеживание /img/*.* - обновление http
##	5.7. Отслеживание /fonts/*.* - обновление http

##6. Сборка проекта | gulp build
##	6.1. Компиляция *.pug
##	6.2. Компиляция *.scss
##	6.3. Сжатие /img/*.*
##	6.4. Сохранение результатов в /dist/
##	6.4. Минификация *.html + суффикс .min
##	6.5. Минификация *.css + суффикс .min
##	6.6. Минификация *.js + суффикс .min
##	6.7. Сохранение результатов в /dist/

##7. Генерация шрифтов | gulp fonts
##	7.1. Создание отсутствующих расширений шрифтов из *.woff, *.woff2, *.ttf, *.eot в /fonts/
##	7.2. Создание /scss/_fonts.scss с подключением шрифтов
##	7.3. Уведомление об ошибках

	8.

	============ Debug list ============
	Test sourcemap | gulp sass // https://github.com/gulp-sourcemaps/gulp-sourcemaps/issues/60
	Add uncss | gulp build
	Test sprite | gulp sprite

	============ INFO ============
	https://habrahabr.ru/post/252745/
	https://webref.ru/dev/automate-with-gulp/plugins
	http://getinstance.info/articles/tools/9-gulp-plugins/
	https://pugofka.com/blog/technology/the-prepared-starting-package-front-end-development-on-gulp/
	https://makeomatic.ru/blog/2014/12/06/Tips_and_Tricks/

*/

'use strict';

/*******************************
             REQUIRE
*******************************/
// http://getinstance.info/articles/tools/9-gulp-plugins/
var gulp            = require('gulp');                  // project builder
var gutil           = require('gulp-util');             // console.log and other utils: https://github.com/gulpjs/gulp-util
var clean           = require('gulp-clean');            // clean directory: clean()
var rename          = require('gulp-rename');           // rename files, add suffix or prefix..
var changed         = require('gulp-changed');          // skip recompile if file not changed
var cached          = require('gulp-cached');           // only process what you need and save time + resources
var notify          = require('gulp-notify');           // Windows tray notifications
// html
var pug             = require('gulp-pug');              // compile .pug files to .html
var pug             = require('gulp-pug-inheritance');  // make changes to the parent file for the HTTP server response
var filter          = require('gulp-filter');           // for pug-inheritance
// css
var sass            = require('gulp-sass');             // compile .scss files to .css
var sourcemaps      = require('gulp-sourcemaps');       // css source map
var autoprefixer    = require('gulp-autoprefixer');     // adds css prefixes
// js
var concat          = require('gulp-concat');           // concat .js files
var uglify          = require('gulp-uglify');           // minimize .js files
//



/*******************************
             TASKS
*******************************/
// DEFAULT
gulp.task('default', ['help']);

// HELP
gulp.task('help', function() {
	gutil.log('+---------------+------------------------');
	gutil.log('| command       | description');
	gutil.log('+---------------+------------------------');
	gutil.log('| gulp help     | this information');
	gutil.log('| gulp pug      | pug compilation');
	gutil.log('| gulp scss     | scss compilation');
	gutil.log('| gulp sprites  | generates img/sprite.png & scss/_sprite.scss from the files /img/sprite/');
	gutil.log('| gulp images   | image compression');
	gutil.log('| gulp fonts    | generation of missing types of fonts');
	gutil.log('| gulp watch    | HTTP Server, watch and compile .pug and .scss');
	gutil.log('| gulp build    | src/ -> compile, minimize, optimize -> build/');
	gutil.log('+---------------+------------------------');
	gutil.log('| v1.0 - github.com/vmrfriz/project-start');
	gutil.log('+---------------+------------------------');
});

// PUG
gulp.task('pug', function () {
	return gulp
		.src(['src/pug/**/*.pug', 'src/pug/**/*.jade'])
		.pipe( rename({sufix: '.pug'}) ) // using before pug(opts.filename)
		.pipe( changed('src/', {extension: '.html'}) )
		.pipe( cached('pug') )
		.pipe( pugInheritance({basedir: 'src'}) )
		.pipe( filter(function (file) {
			return !/\/_/.test(file.path) && !/^_/.test(file.relative);
		}) )
		.pipe( pug() )
		.pipe( gulp.dest('src/') )
		.on( 'error', notify.onError({
				message: "<%= error.message %>",
				title  : "PUG Error"
		}) );
});

// SCSS
gulp.task('scss', function () {
	return gulp
		.src(['src/scss/**/*.scss', 'src/scss/**/*.sass'])
		.pipe( changed('./src/css/', {extension: '.css'}) )
		.pipe( cached('scss') )
		.pipe( sourcemaps.init() )
		.pipe( sass().on('error', notify.onError({ message: "<%= error.message %>", title  : "SASS Error" })) )
		.pipe( sourcemaps.write({ includeContent: false }) )
		.pipe( sourcemaps.init({ loadMaps: true }) )
		.pipe(autoprefixer({ browser: ['last 2 version', '> 5%'], cascade: true }))
		.pipe(sourcemaps.write('.'))
		.pipe( gulp.dest( 'src/css/' ) );
});

// SPRITES
gulp.task('sprites', function () {
	var spriteData = gulp
		.src('src/img/sprite/*.*')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.scss',
			cssFormat: 'scss',
			algorithm: 'binary-tree',
			cssVarMap: function(sprite) {
				sprite.name = 's-' + sprite.name
			}
		}));

	spriteData.img.pipe(gulp.dest('src/img/'));
	spriteData.css.pipe(gulp.dest('src/scss/'));
});

// IMAGES
gulp.task('images', function () {});

//FONTS
gulp.task('fonts', function () {});

/*******************************
           BIG TASKS
*******************************/
// WATCH
gulp.task('watch', function () {});

// BUILD
gulp.task('build', function () {});

