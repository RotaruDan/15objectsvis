$().ready(function () {
    var now = Date.now();
    var es = 'https://analytics.e-ucm.es/api/proxy/e/5acf9aebca50e50077decc6d/';

    $('#start').click(function () {
        var esHost = $('#host').val();
        if (!esHost.endsWith('/')) {
            esHost += '/';
        }

        var classId = $('#classid').val();
        if (!classId.endsWith('/')) {
            classId += '/';
        }
        es = esHost + classId;

        var lsHost = $('#lshost').val();
        if (!lsHost.endsWith('/')) {
            lsHost += '/';
        }
        lsHost += 'index.php/admin/remotecontrol';

        var lsUser = $('#lsuser').val();
        var lsPass = $('#lspass').val();

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "size": 0,
                "query": {
                    "bool": {
                        "must": [{"match_all": {}}, {
                            "range": {
                                "out.timestamp": {
                                    "gte": 1366289983360,
                                    "lte": now,
                                    "format": "epoch_millis"
                                }
                            }
                        }], "must_not": []
                    }
                },
                "_source": {"excludes": []},
                "aggs": {"2": {"terms": {"field": "out.name.keyword", "size": 5, "order": {"_count": "desc"}}}}
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            console.log(msg);
            var users = $('#users');
            msg.aggregations['2'].buckets.forEach(function (doc) {
                var uri = './student?token=' + doc.key + '&es=' + es;

                var data = '<button class="btn btn-default subs-btn" type="button" onClick="window.open(\'' + encodeURI(uri) + '\'); return false;"> ' + doc.key + ' </button><br>';
                users.append(data);
            });
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    });
});

