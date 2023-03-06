/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9283928147503363, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.979757085020243, 500, 1500, "deleteFeedingPoint"], "isController": false}, {"data": [0.9534412955465587, 500, 1500, "createFeedingPoint"], "isController": false}, {"data": [0.985280192820866, 500, 1500, "getFeedingPoint"], "isController": false}, {"data": [0.97165991902834, 500, 1500, "updateFeedingPoint"], "isController": false}, {"data": [0.951722338204593, 500, 1500, "listLanguages"], "isController": false}, {"data": [0.7944785276073619, 500, 1500, "searchByBounds"], "isController": false}, {"data": [0.8598267034265459, 500, 1500, "searchFeedingPoints"], "isController": false}, {"data": [0.951010101010101, 500, 1500, "searchPets"], "isController": false}, {"data": [0.9890736548842068, 500, 1500, "searchCategories"], "isController": false}, {"data": [0.9968673860076575, 500, 1500, "listLanguagesSettings"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 63185, 0, 0.0, 364.3900134525591, 142, 29437, 306.0, 571.0, 665.0, 1131.0, 13.371883976447199, 173.915403018274, 27.901257316667525], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["deleteFeedingPoint", 247, 0, 0.0, 344.0283400809719, 183, 623, 378.0, 442.80000000000007, 489.4, 542.7600000000004, 0.05277535326902717, 0.10201333398946416, 0.17600374161496854], "isController": false}, {"data": ["createFeedingPoint", 247, 0, 0.0, 377.582995951417, 181, 817, 417.0, 499.20000000000005, 544.8, 718.8000000000017, 0.05277262455354253, 0.08324090334554937, 0.2054215639359575], "isController": false}, {"data": ["getFeedingPoint", 11617, 0, 0.0, 271.34914349659914, 160, 1833, 218.0, 397.2000000000007, 438.0, 725.2799999999988, 2.46828643936136, 4.733221054975201, 7.927923924862807], "isController": false}, {"data": ["updateFeedingPoint", 247, 0, 0.0, 281.0040485829959, 184, 883, 220.0, 472.20000000000005, 510.6, 840.1600000000001, 0.05277030198499657, 0.10249553755792716, 0.1835623199907791], "isController": false}, {"data": ["listLanguages", 5748, 0, 0.0, 451.64091858037614, 261, 28373, 306.0, 495.0, 573.1000000000004, 1441.8500000000076, 1.2169506747534182, 1.3624545859911785, 0.8140734494200113], "isController": false}, {"data": ["searchByBounds", 1467, 0, 0.0, 479.6428084526248, 241, 2462, 450.0, 673.0, 742.5999999999999, 1194.0799999999988, 0.3126805053189789, 5.023429515470439, 0.686676619325872], "isController": false}, {"data": ["searchFeedingPoints", 25390, 0, 0.0, 455.96561638440295, 172, 29437, 371.0, 652.9000000000015, 747.0, 1194.9900000000016, 5.375751022483089, 157.88636823496194, 13.724883070732625], "isController": false}, {"data": ["searchPets", 990, 0, 0.0, 362.0585858585859, 145, 25238, 324.5, 498.0, 550.4499999999999, 928.8100000000003, 0.21103153493254023, 1.4118937279829094, 0.4618375681482643], "isController": false}, {"data": ["searchCategories", 11486, 0, 0.0, 274.68274421034204, 142, 29055, 175.0, 353.0, 392.0, 641.1299999999992, 2.4319875601486043, 2.120253552660915, 2.950888288299781], "isController": false}, {"data": ["listLanguagesSettings", 5746, 0, 0.0, 214.7572224155936, 145, 2233, 174.0, 351.0, 372.0, 461.0, 1.2166993145531932, 1.2314736434046152, 0.8234107665872685], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 63185, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
