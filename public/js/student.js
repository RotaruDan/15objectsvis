$().ready(function () {
    var now = Date.now();

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    var es = getUrlParameter('es');
    var token = getUrlParameter('token');
    var code = $('#code');
    code.append('<b> ' + token.toUpperCase() + '</b>');

    setUpTime();
    setUpUniqueCount();
    setUpUniqueCorrectIncorrect();
    setUpFullResponses(true, 'corrtable');
    setUpFullResponses(false, 'errotable');
    setUpRepeatedResponses();
    setUpPreTest();
    setUpPostTest();

    function setUpTime() {

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "query": "out.name:" + token,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "out.timestamp": {
                                        "gte": 1366296203028,
                                        "lte": now,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                },
                "_source": {
                    "excludes": []
                },
                "aggs": {
                    "2": {
                        "terms": {
                            "field": "out.name.keyword",
                            "size": 5,
                            "order": {
                                "1": "desc"
                            }
                        },
                        "aggs": {
                            "1": {
                                "max": {
                                    "field": "out.timestamp"
                                }
                            },
                            "3": {
                                "min": {
                                    "field": "out.timestamp"
                                }
                            }
                        }
                    }
                }
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            var time = $('#time');
            var sta = $('#sta');
            var end = $('#end');
            var bucket = msg.aggregations['2'].buckets[0];
            var deltMilis = bucket['1'].value - bucket['3'].value;

            var deltaTime = msToTime(deltMilis);

            time.append('<b> ' + deltaTime + '</b>');
            sta.append('<b> ' + bucket['3'].value_as_string + '</b>');
            end.append('<b> ' + bucket['1'].value_as_string + '</b>');
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });

        function msToTime(duration) {
            var milliseconds = parseInt((duration % 1000) / 100)
                , seconds = parseInt((duration / 1000) % 60)
                , minutes = parseInt((duration / (1000 * 60)) % 60)
                , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
        }
    }

    function setUpUniqueCount() {

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "query": "out.name:" + token,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "out.timestamp": {
                                        "gte": 1366299249463,
                                        "lte": now,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                },
                "_source": {
                    "excludes": []
                },
                "aggs": {
                    "1": {
                        "cardinality": {
                            "field": "out.response.keyword"
                        }
                    }
                }
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            var dobj = $('#dobj');
            var val = msg.aggregations['1'].value;

            dobj.append('<b> ' + val + '</b>');
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }

    function setUpUniqueCorrectIncorrect() {

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "query": "out.name:" + token,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "out.timestamp": {
                                        "gte": 1366300608963,
                                        "lte": now,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                },
                "_source": {
                    "excludes": []
                },
                "aggs": {
                    "2": {
                        "filters": {
                            "filters": {
                                "out.success:true": {
                                    "query_string": {
                                        "query": "out.success:true",
                                        "analyze_wildcard": true
                                    }
                                },
                                "out.success:false": {
                                    "query_string": {
                                        "query": "out.success:false",
                                        "analyze_wildcard": true
                                    }
                                }
                            }
                        },
                        "aggs": {
                            "1": {
                                "cardinality": {
                                    "field": "out.response.keyword"
                                }
                            }
                        }
                    }
                }
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            var corr = $('#corr');
            var erro = $('#erro');
            var buckets = msg.aggregations['2'].buckets;
            var trr = buckets["out.success:true"];
            var fals = buckets["out.success:false"];

            corr.append('<b> ' + trr["1"].value + '</b> (unicas) - Totales <b> ' + trr.doc_count + ' </b>');
            erro.append('<b> ' + fals["1"].value + '</b> (unicas) - Totales <b> ' + fals.doc_count + ' </b>');
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }

    function setUpFullResponses(success, id) {

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "sort" : [
                    { "out.timestamp" : {"order" : "asc"}}
                ],
                "size": 1000,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "query": "out.name:" + token + " && out.success:" + success,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "out.timestamp": {
                                        "gte": 1366301569212,
                                        "lte": now,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                }
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            var corrtable = $('#' + id);

            var i = 0;
            msg.hits.hits.forEach(function (trace) {
                i++;
                var out = trace._source.out;
                var response = out.response;

                var ext = out.ext;

                var object = '';
                var other = '';
                for (var key in ext.targets) {
                    if (ext.targets[key]) {
                        object = key;
                    } else {
                        other += ' ' + key;
                        var mappings = ext['mappings_' + key];
                        if(mappings.length > 3) {
                            other += ' (' + ext['mappings_' + key] + '),';
                        } else {
                            other += ',';
                        }
                    }
                }
                if (other.endsWith(',')) {
                    other = other.substring(0, other.length - 1);
                }

                var data =
                    '   <tr>\n' +
                    '      <th scope="row">' + i + '</th>\n';
                if (success) {
                    data += '      <td>' + object + '</td>\n';
                }
                data += '      <td>' + response + '</td>\n';

                if (success) {
                    data += '      <td>' + ext['mappings_' + object] + ' </td>\n';
                }

                data += '      <td>' + other + ' </td>\n' +
                    '<td>' + out.timestamp + ' </td>\n' +
                    '    </tr>';
                corrtable.append(data);
            });
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }

    function setUpRepeatedResponses() {

        var request = $.ajax({
            url: es + '_search',
            type: 'POST',
            data: JSON.stringify({
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "query": "out.name:" + token,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "out.timestamp": {
                                        "gte": 1366377000856,
                                        "lte": now,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                },
                "_source": {
                    "excludes": []
                },
                "aggs": {
                    "4": {
                        "terms": {
                            "field": "out.response.keyword",
                            "size": 100,
                            "order": {
                                "_count": "desc"
                            }
                        }
                    }
                }
            }),
            dataType: 'json'
        });

        request.done(function (msg) {
            var corrtable = $('#repeatedtable');

            var i = 0;
            msg.aggregations['4'].buckets.forEach(function (hit) {
                ++i;
                var data =
                    '    <tr>\n' +
                    '       <th scope="row">' + i + '</th>\n' +
                    '       <td>' + hit.key + ' </td>\n' +
                    '       <td>' + hit.doc_count + ' </td>\n' +
                    '    </tr>';
                corrtable.append(data);
            });
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }

    function setUpPreTest() {

        var request = $.ajax({
            url: '/pre/' + token,
            type: 'GET',
            dataType: 'json'
        });

        request.done(function (msg) {
            if(msg.line) {
                var answers = msg.line.split(',');

                var age = $('#age');
                var sex = $('#sex');
                var edu = $('#edu');
                var dis = $('#dis');
                var dia = $('#dia');
                var uti = $('#uti');

                age.append('<b> ' + answers[5] + '</b>');

                var sexObj = {
                    '"A1"' : 'Masculino',
                    '"A2"' : 'Femenino'
                };

                sex.append('<b> ' + sexObj[answers[6]] + '</b>');

                var eduObj = {
                    '"A1"' : 'Sin estudios',
                    '"A2"' : 'Primaria',
                    '"A3"' : 'Secundaria',
                    '"A4"' : 'Secundaria',
                    '"A5"' : 'Grado universitario  (licenciado, ingenirero, grado)',
                    '"A6"' : 'Postgrado universitario (Máster)',
                    '"A7"' : 'Doctorado'
                };
                edu.append('<b> ' + eduObj[answers[8]] + '</b>');

                var disData = '';
                if(answers[10].indexOf('Y') !== -1) {
                    disData += 'Ninguno, '
                }
                if(answers[11].indexOf('Y') !== -1) {
                    disData += 'Móvil, '
                }
                if(answers[12].indexOf('Y') !== -1) {
                    disData += 'Ordenador, '
                }
                if(answers[13].indexOf('Y') !== -1) {
                    disData += 'Tablet, '
                }
                if(answers[14].indexOf('""') !== -1) {
                    disData += answers[14]
                }

                if(disData.endsWith(', ')) {
                    disData = disData.substring(0, disData.length - 2);
                }

                dis.append('<b> ' + disData + '</b>');

                var diasObj = {
                    '"0"' : 'Nunca utilizo ningún dispositivo electrónico (móvil, ordenador, tablet, etc).',
                    '"1"' : 'Un día a la semana.',
                    '"2"' : 'Dos días a la semana.',
                    '"3"' : 'Tres días a la semana.',
                    '"4"' : 'Cuatro días a la semana.',
                    '"5"' : 'Cinco días a la semana.',
                    '"6"' : 'Seis días a la semana.',
                    '"7"' : 'Todos los días de la semana.'
                };

                dia.append('<b> ' + diasObj[answers[15]] + '</b>');


                var utiData = '';
                if(answers[16].indexOf('Y') !== -1) {
                    utiData += 'Nada, '
                }
                if(answers[17].indexOf('Y') !== -1) {
                    utiData += 'Comunicarme, '
                }
                if(answers[18].indexOf('Y') !== -1) {
                    utiData += 'Aprender, '
                }
                if(answers[19].indexOf('Y') !== -1) {
                    utiData += 'Jugar, '
                }
                if(answers[20].indexOf('Y') !== -1) {
                    utiData += 'Realizar gestiones, '
                }
                if(answers[21].indexOf('Y') !== -1) {
                    utiData += 'Informarme, '
                }
                if(answers[22].indexOf('Y') !== -1) {
                    utiData += 'Trabajar, '
                }
                if(answers[23].indexOf('""') !== -1) {
                    utiData += answers[23]
                }

                if(utiData.endsWith(', ')) {
                    utiData = utiData.substring(0, utiData.length - 2);
                }

                uti.append('<b> ' + utiData + '</b>');
            }
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }


    function setUpPostTest() {

        var request = $.ajax({
            url: '/post/' + token,
            type: 'GET',
            dataType: 'json'
        });

        request.done(function (msg) {
            if(msg.line) {
                var answers = msg.line.split(',');

                var ans = {
                    '"A7"' : 'Totalmente de acuerdo',
                    '"A6"' : 'Muy de acuerdo',
                    '"A5"' : 'De acuerdo',
                    '"A4"' : 'Ni en desacuerdo ni de acuerdo',
                    '"A3"' : 'En desacuerdo',
                    '"A2"' : 'Muy en desacuerdo',
                    '"A1"' : 'Totalmente en desacuerdo'
                };

                var gus = $('#gus');
                var fac = $('#fac');
                var dur = $('#dur');
                var dif = $('#dif');

                gus.append('<b> ' + ans[answers[5]] + '</b>');
                fac.append('<b> ' + ans[answers[6]] + '</b>');
                dur.append('<b> ' + ans[answers[7]] + '</b>');
                dif.append('<b> ' + ans[answers[8]] + '</b>');

                var succ = {
                    '"A1"' : 'No la conozco',
                    '"A2"' : 'No la uso',
                    '"A3"' : 'La uso poco',
                    '"A4"' : 'La uso bastante',
                    '"A5"' : 'La uso a diario'
                };

                var wha = $('#wha');
                var ins = $('#ins');
                var fae = $('#fae');
                var twi = $('#twi');
                var tel = $('#tel');

                wha.append('<b> ' + succ[answers[9]] + '</b>');
                ins.append('<b> ' + succ[answers[10]] + '</b>');
                fae.append('<b> ' + succ[answers[11]] + '</b>');
                twi.append('<b> ' + succ[answers[12]] + '</b>');
                tel.append('<b> ' + succ[answers[13]] + '</b>');

                var opi = $('#opi');
                opi.append('<b> ' + answers[14] + '</b>');
            }
        });

        request.fail(function (jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }
});

