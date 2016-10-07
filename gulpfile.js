var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var mergeStream = require('merge-stream');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

var errorHandler = function (error) {
    console.error(error.message);
    this.emit('end');
};

var plumberOption = {
    errorHandler: errorHandler
}

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
    require('del')([
        dirs.buildSrc
    ], done);
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.devSrc + '/assets/js/**/*.js'
    ])
});

gulp.task('include',function() {

    gulp.src([dirs.devSrc + '/html/**/*.html',
        '!' + dirs.devSrc + '/html/inc/*'
    ])
        .pipe(plumber(plumberOption)) //빌드 과정에서 오류 발생시 gulp가 죽지않도록 예외처리
        .pipe(plugins.newer(dirs.buildSrc + '/html')) //수정된것만 빌드하기 위해 다음 단계 진행
        .pipe(plugins.include({
            hardFail: true,
            includePaths: dirs.devSrc +'/html/inc/'
        }))
        .pipe(gulp.dest(dirs.buildSrc + '/html'));
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

gulp.task('copy:js0', function () {
    return gulp.src([dirs.devSrc + '/assets/js/**/*'])
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js')) //dist 폴더에 저장
        .pipe(browserSync.reload({stream:true})); //browserSync 로 브라우저에 반영
});

//자바스크립트 파일을 browserify로 번들링
gulp.task('copy:js', function () {
    /*var entries = [{
        src: dirs.devSrc + '/assets/js/common/first1.js',
        filename: 'first1.js'
    }, {
        src: dirs.devSrc + '/assets/js/common/second1.js',
        filename: 'second1.js'
    }, {
        src: dirs.devSrc + '/assets/js/common/third1.js',
        filename: 'third1.js'
    }];*/

    var entries =[];

    var $this = this;

    $this.fs    = require("fs");
    $this.path = dirs.devSrc + '/assets/js/common/';

    //현재 폴더에 존재하는 파일 검색 테스트
    $this.fs.readdir($this.path, function( err, folders ){
        for( var i = 0; i < folders.length; i++ ) {
            var folder = folders[i];
            var fPath  = $this.path + folder;  // 하위 폴더 경로 반환
            var files  = $this.fs.readdirSync( fPath );  // 하위 폴더 내 파일 검색

            //console.log('Path:', fPath );
            for(var h= 0, leng = files.length; h < leng; h++){
                //console.log( fPath+'/'+files[h] );
                var tmp = {
                    src: fPath+'/'+files[h],
                    filename: files[h]
                }

                entries.push(tmp)

            }

        };
    });

    setTimeout(function(){
        console.log('entries', entries)

        return mergeStream.apply(null, entries.map(function (entry) {
            var target = watchify(browserify({entries: entry.src, debug: true, cache: {}, packageCache: {}}))
            //.transform(babelify, {presets: ['interactive', 'common']});

            var bundle = function () {
                console.log(gutil.colors.green(entry.filename), 'bundling..');
                console.time(gutil.colors.green(entry.filename));

                return target.bundle()
                    .on('error', function (err) {
                        //browserify bundling 과정에서 오류가 날 경우 gulp가 죽지않도록 예외처리
                        console.error(err);
                        this.emit('end');
                    })
                    .pipe(source('main.js')) //vinyl object 로 변환
                    .pipe(buffer()) //buffered vinyl object 로 변환
                    //.pipe(sourcemaps.init({loadMaps: true, debug: true})) //소스맵 생성 준비
                    //.pipe(uglify()) //minify 해서
                    //.pipe(sourcemaps.write('./')) //생성된 소스맵을 스트림에 추가
                    .pipe(gulp.dest(dirs.buildSrc +'/assets/js')) //dist 폴더에 저장
                    .on('end', function () {
                        console.timeEnd(gutil.colors.green(entry.filename));
                    })
                    .pipe(browserSync.reload({stream: true})); //browserSync 로 브라우저에 반영
            };

            target.on('update', bundle);
            return bundle();
        }));
    }, 100)


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
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(plugins.concatCss('styles.min.css'))
        .pipe(plugins.uglifycss())
        .pipe(plugins.sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/css'));
});

gulp.task('compress:js-interactive', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/**/*.js',
            '!' + dirs.devSrc + '/assets/js/vendor/**/*',
            '!' + dirs.devSrc + '/assets/js/common/**/*'
        ])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stripDebug())
        .pipe(plugins.uglify())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/'));
});

gulp.task('compress:js-vendor', function () {
    return gulp.src([
            dirs.devSrc + '/assets/js/vendor/**/*',
            '!' + dirs.devSrc + '/assets/js/vendor/ie8le_fallback/**/*',
            '!' + dirs.devSrc + '/assets/js/vendor/ie9le_fallback/**/*'
        ])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stripDebug())
        .pipe(plugins.uglify())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.sourcemaps.write('./maps'))
        .pipe(gulp.dest(dirs.buildSrc +'/assets/js/'));
});

// project별로 task를 생성한다.
// only copy build
gulp.task('copy-project', [
    'include',
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



gulp.task('sync', function () {
    return browserSync.reload({stream:true})
});

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch1', function () {
    plugins.livereload.listen();
    gulp.watch(dirs.devSrc + '/**').on('change', plugins.livereload.changed);
});

gulp.task('webserver',['watch'], function () {
    var opt = {
        uri: 'http://localhost:8000/index.html',
        app:'chrome'
    }
    console.log('server start')
    return gulp.src(dirs.buildSrc + "/")
        .pipe(plugins.webserver({
            livereload:true
        }))
        .pipe(open(opt))
});

//파일 변경 감지 테스트
gulp.task('watch', function () {
    gulp.watch(dirs.devSrc + '/assets/js/**/*.js', ['copy:js']);
    gulp.watch(dirs.devSrc + '/assets/css/**/*.css', ['copy:css']);
    gulp.watch(dirs.devSrc + '/html/**/*.html', ['include']);
});

gulp.task('server', ['copy-project'], function () {
    return browserSync.init({
        server: {
            baseDir: './build'
        }
    });
});



// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build0', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy-project',
        done);
});

gulp.task('default-s', function (done) {
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
