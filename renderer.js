window.$ = window.jQuery = require('jQuery');

const electron = require('electron'),
    remote = electron.remote,
    ipc = electron.ipcRenderer,
    mainproc = remote.require('./main'),
    freewall = require('./main-process/freewall');

ipc.on('selected-directory', function (event, path, id) {
    $(id).val(path[0]).attr('disabled', true);
});

ipc.on('next-step3', function (event, file, logs) {
    console.log(logs);
    freeWindow(file);
    tabMotion(2);
});

$('#party01').on('click', function (event) {
    ipc.send('open-file-dialog', '#txt-02');
});

$('#submit01').on('click', function (e) {
    e.preventDefault();
    var txt01 = $('#txt-01').val(),
        txt02 = $('#txt-02').val(),
        txt03 = $('#txt-03').val();
    mainproc.configPaser(txt01, txt02, txt03);
    tabMotion(1);
});

$('#party02').on('click', function () {
    ipc.send('jsonFileExtraction');
});

function uiFreeWall (targetEle, w, h, cell) {
    var freeGrid = null;
    freeGrid = freewall(targetEle);

    freeGrid.reset({
        selector: cell,
        animate: true,
        cellW: w,
        cellH: h,
        onResize: function () {
            freeGrid.fitWidth();
        }
    });

    freeGrid.fitWidth();

    freeGrid.container.find('.cell img').load(function () {
        freeGrid.fitWidth();
    });

    return freeGrid;

};

function freeWindow(inUrl) {
    $('#free').queue(function () {
        var params = {};
        var that = $(this);

        $.ajax({
            url: inUrl,
            type: 'get',
            dataType: 'json',
            data: params
        })
        .done(function (obj) {
            for (var i = obj.items.length - 1; i >= 0; i--) {
                var o = obj.items[i];
                var htmlBox = [];
                var imgSrc = o.folder + '/' + o.file + '.png';
                htmlBox.push('<a href="' + o.local + '" class="thumb cell" target="_blank" ><img src="' + imgSrc + '?b=123" /></a>');
                that.append(htmlBox.join());
                if (!i) {
                    var wallMosaic = null;
                    wallMosaic = uiFreeWall(".free-wall", '400', 'auto', '.cell');
                }
            }
        })
        .fail(function (e) {
            console.log("error[" + e + "]");
        });
    });
}

function tabMotion(n) {
    $('[data-tabs]').each(function () {
        var $that = $(this);

        function toggleTab(t) {
            $('.visual-box', $that).each(function (o) {
                $(this).hide();
                if (t == o) {
                    $(this).show();
                }
            });
            $('.nav li', $that).eq(n).addClass('active').siblings().removeClass('active');
        }

        toggleTab(n);
    });
}
tabMotion(0);
