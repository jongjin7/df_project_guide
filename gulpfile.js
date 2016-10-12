var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var minifyhtml = require('gulp-minify-html');
var sourcemaps  = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var inquirer = require('inquirer');

var pkg = require('./package.json');
var dirs = pkg['configs'].directories;

var errorHandler = function (error) {
    console.error(error.message);
    this.emit('end');
};

var plumberOption = {
    errorHandler: errorHandler
}

// ---------------------------------------------------------------------
// | Todo tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
    require('del')([
        dirs.buildSrc
    ], done);
});

//html include
gulp.task('include',function() {

    gulp.src([
            dirs.devSrc + '/html/**/*.html',
            '!' + dirs.devSrc + '/html/inc/*'
        ])
        .pipe(plumber(plumberOption)) //빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
        .pipe(plugins.newer(dirs.buildSrc + '/html/**/*')) //수정된것만 빌드하기 위해 다음 단계 진행
        .pipe(plugins.include({
            hardFail: true,
            includePaths: dirs.devSrc +'/html/inc/'
        }))
        .pipe(gulp.dest(dirs.buildSrc + '/html'))
        .pipe(browserSync.reload({stream:true}));
});

//copy task
gulp.task('copy:bootstrap', function () {
    return gulp.src([
            dirs.devSrc + '/assets/bootstrap/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/bootstrap'))
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영;
});
gulp.task('copy:lte-lib', function () {
    return gulp.src([
            dirs.devSrc + '/assets/lte_lib/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/lte_lib'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:images', function () {
    return gulp.src([
            dirs.devSrc + '/assets/images/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/images'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:watch-css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/**/*',
            '!' + dirs.devSrc + '/assets/css/fonts'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'))
        .pipe(browserSync.reload({stream:true}));
});
gulp.task('copy:watch-lte-css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/lte_lib/css/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/lte_lib/css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:js', function () {
    return gulp.src([dirs.devSrc + '/assets/js/**/*'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js')) //dist 폴더에 저장
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영
});

gulp.task('copy:watch-js-1', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/interactive/first/**/*'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/first'))
        .pipe(browserSync.reload({stream:true}));
});
gulp.task('copy:watch-js-2', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/interactive/second/**/*'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/second'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:etc', function () {
    return gulp.src([
            dirs.devSrc + '/index.html'])
        .pipe(gulp.dest(dirs.buildSrc));
});

//optimize task
gulp.task('copy:none-compress', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/fonts/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css/fonts'));
});

gulp.task('compress:css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/*.css',
            '!' + dirs.devSrc + '/assets/css/ie8le.css'
        ])
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(concat('styles.min.css'))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'));
});

gulp.task('compress:js-interactive', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/**/*.js',
            '!' + dirs.devSrc + '/assets/js/vendor/**/*',
            '!' + dirs.devSrc + '/assets/js/common/**/*'
        ])
        .pipe(sourcemaps.init())
        .pipe(plugins.stripDebug())
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/'));
});

gulp.task('compress:js-vendor', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/vendor/**/*',
            '!' + dirs.devSrc + '/assets/js/vendor/ie8le_fallback/**/*',
            '!' + dirs.devSrc + '/assets/js/vendor/ie9le_fallback/**/*'
        ])
        .pipe(sourcemaps.init())
        .pipe(plugins.stripDebug())
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/'));
});

// project별로 task를 생성한다.
// only copy build
gulp.task('copy-project', [
    'include',
    'copy:etc',
    'copy:css',
    'copy:js',
    'copy:images',
    'copy:bootstrap',
    'copy:lte-lib'
]);

// optimise build
gulp.task('optimise-project', [
    'copy:html',
    'copy:images',
    'compress:css',
    'compress:js-ie8le',
    'compress:js-ie9le',
    'compress:js-vendor',
    'compress:js-interactive'
    //'compress:js-bundle',
    //'copy:images'

]);


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

//파일 변경 감지 테스트
gulp.task('watch', function () {
    gulp.watch(dirs.devSrc + '/assets/js/interactive/first/**/*.js', ['copy:watch-js-1']);
    gulp.watch(dirs.devSrc + '/assets/js/interactive/second/**/*.js', ['copy:watch-js-2']);
    gulp.watch(dirs.devSrc + '/assets/css/**/*.css', ['copy:watch-css']);
    gulp.watch(dirs.devSrc + '/assets/lte_lib/css/**/*.css', ['copy:watch-lte-css']);
    gulp.watch(dirs.devSrc + '/html/**/*.html', ['include']);
});

gulp.task('server', ['copy-project'], function () {
    return browserSync.init({
        server: {
            baseDir: './build'
        }
    });
});

gulp.task('sb', function (done) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'task',
            message: '어떤 작업을 수행하시겠습니까?',
            choices: [
                { name: 'JavaScript 빌드', value: 'copy:js' },
                { name: 'CSS 빌드', value: 'copy:css' },
                { name: 'HTML 빌드', value: 'include' },
                new inquirer.Separator(),
                { name: '전체 빌드', value: 'build' }
            ]
        }
    ]).then(function (answers) {
        runSequence(answers.task, done);
    });
});

//빌드
gulp.task('default', [ 'server','watch']);
