function test(){
    var $this = this;


    $this.fs    = require("fs");
    $this.path = "/folderPath";

    $this.fs.readdir($this.path, function( err, folders ){
        for( var i = 0; i < folders.length; i++ ) {
            var folder = folders[i];
            var fPath  = $this.path + "/" + folder;  // 하위 폴더 경로 반환
            var files  = $this.fs.readdirSync( fPath );  // 하위 폴더 내 파일 검색

            console.log( fPath );
            console.log( files );
        };
    });

}

test()