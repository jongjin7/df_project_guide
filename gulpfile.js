var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var lessToCss = require('gulp-less');
var minifycss = require('gulp-minify-css');
var htmlReplace = require('gulp-html-replace');
var sourcemaps  = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var lessAutoprefixModule = require('less-plugin-autoprefix');
var lessAutoprefix = new lessAutoprefixModule({ browsers: ['last 2 versions'] });
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var inquirer = require('inquirer');
var clean = require('gulp-clean');

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
// | Build Task : default                                              |
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
            dirs.devSrc + '/assets/bootstrap/**/*',
            '!' + dirs.devSrc + '/assets/bootstrap/less/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/bootstrap'))
});

gulp.task('copy:lte-lib', function () {
    return gulp.src([
            dirs.devSrc + '/assets/lte_lib/**/*',
            '!' + dirs.devSrc + '/assets/lte_lib/less/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/lte_lib'))
});

gulp.task('copy:lte-lib-css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/lte_lib/less/AdminLTE.less',
            dirs.devSrc + '/assets/lte_lib/less/skins/all-skins.less'
        ])
        .pipe(lessToCss())
        .pipe(gulp.dest(dirs.buildSrc +'/assets/lte_lib/css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:images', function () {
    return gulp.src([
            dirs.devSrc + '/assets/images/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/images'))
});

gulp.task('copy:css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/**/*.css'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'))
});

gulp.task('copy:js', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/**/*'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js'))
});

gulp.task('copy:etc', function () {
    return gulp.src([
            dirs.devSrc + '/index.html'])
        .pipe(gulp.dest(dirs.buildSrc));
});

gulp.task('copy:data-json', function () {
    return gulp.src([
            dirs.devSrc + '/assets/data/*.json'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/data'));
});

//watch tasks
gulp.task('copy:watch-css', function () {
    return gulp.src([
            dirs.devSrc + '/assets/css/**/*',
            '!' + dirs.devSrc + '/assets/css/fonts'
        ])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:watch-app', function () {
    return gulp.src([dirs.devSrc + '/assets/js/interactive/App.js'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/'))
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영
});

gulp.task('copy:watch-collections', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/interactive/collections/**/*.js'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/collections'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:watch-models', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/interactive/models/**/*.js'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/models'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('copy:watch-views', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/interactive/views/**/*.js'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/interactive/views'))
        .pipe(browserSync.reload({stream:true}));
});



// ---------------------------------------------------------------------
// | Distribution task : optimize                                      |
// ---------------------------------------------------------------------

//HTML Replace
gulp.task('replace:html', function () {
    gulp.src(dirs.buildSrc + '/html/**/*.html')
        .pipe(htmlReplace({
            'minifyCss': 'styles.min.css',
            'minifyVendor': 'vendor.min.js',
            'minifyApp': 'app.min.js'
        }))
        .pipe(gulp.dest(dirs.distSrc + '/html'));
});

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


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

// project별로 task를 생성한다.
// only copy build
gulp.task('copy-project',[
    'include',
    'copy:etc',
    'copy:css',
    'copy:js',
    'copy:images',
    'copy:bootstrap',
    'copy:lte-lib',
    'copy:lte-lib-css',
    'copy:data-json'
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


//파일 변경 감지 테스트
gulp.task('watch', function () {
    gulp.watch(dirs.devSrc + '/assets/js/interactive/App.js', ['copy:watch-app']);
    gulp.watch(dirs.devSrc + '/assets/js/interactive/collections/**/*.js', ['copy:watch-collections']);
    gulp.watch(dirs.devSrc + '/assets/js/interactive/models/**/*.js', ['copy:watch-models']);
    gulp.watch(dirs.devSrc + '/assets/js/interactive/views/**/*.js', ['copy:watch-views']);
    gulp.watch(dirs.devSrc + '/assets/css/**/*.css', ['copy:watch-css']);
    gulp.watch(dirs.devSrc + '/assets/lte_lib/less/**/*.less', ['copy:lte-lib-css']);
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
