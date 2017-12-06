/*
	============ TODO List ============

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
var browserSync     = require('browser-sync').create(); // for start http-server, watching changes and dynamic rebuild page
var clean           = require('gulp-clean');            // clean directory: clean()
var rename          = require('gulp-rename');           // rename files, add suffix or prefix..
var changed         = require('gulp-changed');          // skip recompile if file not changed
var cached          = require('gulp-cached');           // only process what you need and save time + resources
var notify          = require('gulp-notify');           // Windows tray notifications
// html
var pug             = require('gulp-pug');              // compile .pug files to .html
var pug             = require('gulp-pug-inheritance');  // make changes to the parent file for the HTTP server response
var filter          = require('gulp-filter');           // for pug-inheritance
var htmlhint        = require("gulp-htmlhint");         // HTML validator
// css
var sass            = require('gulp-sass');             // compile .scss files to .css
var sourcemaps      = require('gulp-sourcemaps');       // css source map
var autoprefixer    = require('gulp-autoprefixer');     // adds css prefixes
var postcss         = require('gulp-postcss');          // Core for CSS Lint
var reporter        = require('postcss-reporter');      // Reporter for PostCSS
var syntax_scss     = require('postcss-scss');          // SCSS syntax for CSS Lint
var stylelint       = require('stylelint');             // CSS List
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
	gutil.log('+----------------+------------------------');
	gutil.log('| command        | description');
	gutil.log('+----------------+------------------------');
	gutil.log('| gulp help      | this information');
	gutil.log('| gulp pug       | pug compilation');
	gutil.log('| gulp scss      | scss compilation');
	gutil.log('| gulp scss-lint | list source SCSS files');
	gutil.log('| gulp sprites   | generates img/sprite.png & scss/_sprite.scss');
	gutil.log('|                | from the files /img/sprite/');
	gutil.log('| gulp images    | image compression');
	gutil.log('| gulp fonts     | generation of missing types of fonts');
	gutil.log('| gulp watch     | HTTP Server, watch and compile .pug and .scss');
	gutil.log('| gulp build     | src/ -> compile, minimize, optimize -> build/');
	gutil.log('+----------------+------------------------');
	gutil.log('| v1.0 - github.com/vmrfriz/project-start');
	gutil.log('+----------------+------------------------');
});

/*************************************
	gulp pug
		- выборка всех *.pug и *.jade файлов из src/pug/
		- добавление суффикса .pug | file.pug -> file.pug.html
		- игнорирование не изменённых файлов
		- кэш для ускорения компиляции
		- компиляция родительного файла при изменении дочернего
		- компиляция *.pug -> *.html
		- валидация html
		- сохранение результата в src/
**************************************/
gulp.task('pug', function () {
	return gulp
		.src('src/pug/**/*.[pug|jade]')
		.pipe( rename({sufix: '.pug'}) ) // using before pug(opts.filename)
		.pipe( changed('src/', {extension: '.html'}) )
		.pipe( cached('pug') )
		.pipe( pugInheritance({basedir: 'src'}) )
		.pipe( filter(function (file) {
			return !/\/_/.test(file.path) && !/^_/.test(file.relative);
		}) )
		.pipe( pug().on( 'error', notify.onError({ message: "<%= error.message %>", title  : "PUG Error" }) ) )
		.pipe( htmlhint() )
		.pipe( gulp.dest('src/') );
});

/*************************************
	gulp scss
		- выборка всех *.scss и *.sass файлов из src/scss/
		- игнорирование не изменённых файлов
		- кэш для ускорения компиляции
		- создание sourcemap
		- компиляция scss, вывод ошибки при наличии
		- запись sourcemap в скомпилированный файл
		- сохранение sourcemap перед изменением файла
		- добавление префиксов
		- запись sourcemap
		- сохранение результата в src/css/
*************************************/
gulp.task('scss', function () {
	return gulp
		.src('src/scss/**/*.[scss|sass]')
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

/*************************************
	gulp scss-lint
		- выборка всех *.scss и *.sass файлов из src/scss/
		- линтинг CSS по параметрам ниже
*************************************/
gulp.task("scss-lint", function() {
	var stylelintConfig = {
		"rules": {
			"block-no-empty": true,
			"color-no-invalid-hex": true,
			"declaration-colon-space-after": "always",
			"declaration-colon-space-before": "never",
			"function-comma-space-after": "always",
			"function-url-quotes": "double",
			"media-feature-colon-space-after": "always",
			"media-feature-colon-space-before": "never",
			"media-feature-name-no-vendor-prefix": true,
			"max-empty-lines": 5,
			"number-leading-zero": "never",
			"number-no-trailing-zeros": true,
			"property-no-vendor-prefix": true,
			"rule-no-duplicate-properties": true,
			"declaration-block-no-single-line": true,
			"rule-trailing-semicolon": "always",
			"selector-list-comma-space-before": "never",
			"selector-list-comma-newline-after": "always",
			"selector-no-id": true,
			"string-quotes": "double",
			"value-no-vendor-prefix": true
		}
	}
	var processors = [
		stylelint(stylelintConfig),
		reporter({
			clearMessages: true,
			throwError: true
		})
	];
	return gulp
		.src('src/scss/**/*.[scss|sass]')
		.pipe( postcss(processors, {syntax: syntax_scss}) );
});

/*************************************
	gulp sprites
		- выборка всех *.jpg, *.jpeg и *.png файлов из src/img/sprite/
		- создание спрайта
		- сохранение sprite.png в src/img/
		- сохранение _sprite.scss в src/scss/
*************************************/
gulp.task('sprites', function () {
	var spriteData = gulp
		.src('src/img/sprite/*.[jpg|jpeg|png]')
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

/*************************************
	gulp images
		- выборка всех *.jpg, *.jpeg и *.png файлов из src/img/
		- кэш для ускорения компиляции
		- сжатие изображений
		- сохранение результата в src/img/
*************************************/
gulp.task('images', function () {
	return gulp
		.src(['src/img/**/*.[jpeg|jpg|png]', '!src/img/sprite/**/*.*'])
		.pipe( cached(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 5,
			svgoPlugins: [{removeViewBox: true}],
			//use: [pngquant()]
		})) )
		.pipe( gulp.dest('build/img') );
});

/*************************************
	gulp fonts
		-
		-
		-
*************************************/
gulp.task('fonts', function () {});

/*************************************
	gulp watch
		-
		-
		-
*************************************/
gulp.task('watch', function () {
	gulp.watch('src/scss/**/*.[scss|sass]', ['scss-lint', 'scss']);  // lint and compile *.scss and *.sass files
	gulp.watch('./app/css/**/*.css', browserSync.stream());          // reset styles in loaded page
});

/*************************************
	gulp build
		-
		-
		-
*************************************/
gulp.task('build', function () {});

/*************************************
	gulp clean
		-
		-
		-
*************************************/
gulp.task('clean', function () {});

/*************************************
	gulp browser-sync
		-
		-
		-
*************************************/
gulp.task('browser-sync', function () {
	browserSync.init({
		server: './app',
		notify: false
	});
});

