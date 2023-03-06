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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9112044633401067, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9856115107913669, 500, 1500, "deleteFeedingPoint"], "isController": false}, {"data": [0.9772182254196643, 500, 1500, "createFeedingPoint"], "isController": false}, {"data": [0.9730430183356841, 500, 1500, "getFeedingPoint"], "isController": false}, {"data": [0.9676258992805755, 500, 1500, "updateFeedingPoint"], "isController": false}, {"data": [0.904141927176479, 500, 1500, "listLanguages"], "isController": false}, {"data": [0.9380120903277378, 500, 1500, "searchByBounds"], "isController": false}, {"data": [0.8190375673902501, 500, 1500, "searchFeedingPoints"], "isController": false}, {"data": [0.9676258992805755, 500, 1500, "searchPets"], "isController": false}, {"data": [0.995707847485514, 500, 1500, "searchCategories"], "isController": false}, {"data": [0.996709349738894, 500, 1500, "listLanguagesSettings"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 197341, 0, 0.0, 376.61882224170364, 152, 26654, 344.0, 589.0, 638.0, 875.9900000000016, 6.478158696947993, 109.22293512707742, 13.783572412248215], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["deleteFeedingPoint", 417, 0, 0.0, 329.58513189448456, 183, 1021, 370.0, 448.79999999999995, 490.09999999999997, 724.5599999999996, 0.013733844289428023, 0.02686572648512259, 0.045801834226949896], "isController": false}, {"data": ["createFeedingPoint", 417, 0, 0.0, 243.45563549160659, 178, 1037, 212.0, 301.59999999999997, 440.79999999999905, 680.8799999999998, 0.013730411115508647, 0.02163402788936252, 0.05344669795548581], "isController": false}, {"data": ["getFeedingPoint", 28360, 0, 0.0, 309.7508815232726, 172, 4014, 240.0, 424.0, 475.0, 817.0, 0.9313186638164901, 1.8162047394030156, 2.9913155129808944], "isController": false}, {"data": ["updateFeedingPoint", 417, 0, 0.0, 285.4244604316547, 186, 1542, 230.0, 409.3999999999999, 549.7999999999997, 865.7199999999997, 0.01373331147420479, 0.026784955305892883, 0.04777153854601315], "isController": false}, {"data": ["listLanguages", 13979, 0, 0.0, 404.44523928750397, 267, 1681, 351.0, 531.0, 594.0, 699.2000000000007, 0.4590899732602012, 0.5137862716773376, 0.30710608562816194], "isController": false}, {"data": ["searchByBounds", 40032, 0, 0.0, 382.4466426858473, 156, 8423, 342.0, 562.0, 631.9500000000007, 982.0, 1.3160615162763165, 37.21004087206738, 2.9109346489463768], "isController": false}, {"data": ["searchFeedingPoints", 70114, 0, 0.0, 471.43248138745514, 174, 26654, 408.0, 647.0, 718.9500000000007, 1087.9900000000016, 2.3018620545292516, 68.04507203299325, 5.889667984082766], "isController": false}, {"data": ["searchPets", 1668, 0, 0.0, 312.13848920863285, 158, 2842, 282.0, 471.0, 520.0, 870.8599999999997, 0.05485361238168367, 0.3607655137928718, 0.12004584506577452], "isController": false}, {"data": ["searchCategories", 27958, 0, 0.0, 252.33063881536705, 154, 24408, 198.0, 376.0, 400.0, 482.0, 0.9182006328483896, 0.8002878141211395, 1.1141252796036367], "isController": false}, {"data": ["listLanguagesSettings", 13979, 0, 0.0, 256.5742900064376, 152, 1363, 203.0, 383.0, 405.0, 473.2000000000007, 0.45909617005613135, 0.46447623537109217, 0.31069691977431546], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 197341, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
