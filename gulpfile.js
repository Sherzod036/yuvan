const { src, dest, series, watch } = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sync = require('browser-sync').create();

function clear() {
	return del('build');
}

function bmcss() {
	return src(['node_modules/universal-parallax/dist/universal-parallax.css'])
		.pipe(concat('bundle.min.css'))
		.pipe(csso({ comments: false }))
		.pipe(dest('build/css'));
}

function style() {
	return src('src/scss/**/*.scss')
		.pipe(
			sass({
				outputStyle: 'expanded',
			})
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 5 versions'],
				cascade: false,
			})
		)
		.pipe(dest('build/css'));
}

function bmjs() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/universal-parallax/dist/universal-parallax.js',
	])
		.pipe(concat('bundle.min.js'))
		.pipe(uglify())
		.pipe(dest('build/js'));
}

function script() {
	return src('src/js/script.js').pipe(dest('build/js'));
}

function pics() {
	return src('src/img/**/*.*').pipe(dest('build/img'));
}

function fonts() {
	return src('src/fonts/**/*.*').pipe(dest('build/fonts'));
}

function markup() {
	return src(['src/**/*.html', '!src/**/_*.html'])
		.pipe(
			include({
				prefix: '@@',
			})
		)
		.pipe(dest('build'));
}

function serve() {
	sync.init({
		server: {
			baseDir: './build',
		},
		port: 3000,
		notify: false,
	});

	watch('src/scss/**/*.scss', series(style)).on('change', sync.reload);
	watch('src/js/**/*.js', series(script)).on('change', sync.reload);
	watch('src/img/**/*.*', series(pics)).on('change', sync.reload);
	watch('src/fonts/**/*.*', series(fonts)).on('change', sync.reload);
	watch('src/**/*.html', series(markup)).on('change', sync.reload);
}

exports.default = series(
	clear,
	bmcss,
	style,
	bmjs,
	script,
	pics,
	fonts,
	markup,
	serve
);
