function fetch_chart(chart_date_start, chart_date_end) {
    const urlParams = new URLSearchParams(window.location.search);
    let brokerage_id = urlParams.get('id');
    console.log('brokerage_id:' + brokerage_id);

    $('#echart_spinner').show();
    $.ajax({
        url: '/statistic/chart',
        type: 'GET',
        data: {'brokerage_id': brokerage_id, 'chart_date_start': chart_date_start, 'chart_date_end': chart_date_end},
        dataType: 'json',
        success: function (data) {
            render_chart(data.DataChart);
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        },
        complete: function() {
            $('#echart_spinner').hide();
        }
    });
}

function render_chart(DataChart) {

    const VanList = DataChart.map(function (item) {
        return item[0];
    });

    const FlatList = DataChart.map(function (item) {
        return item[1];
    });

    const RefferList = DataChart.map(function (item) {
        return item[2];
    });

    const DateList = DataChart.map(function (item) {
        return item[3];
    });

    var option = {
        legend: {
            data: ['VAN', 'Flat', 'Reffer'],
        },
        grid: {
            top: 40,
            left: 50,
            right: 40,
            bottom: 50
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: DateList,
            axisLine: {
                lineStyle: {
                    color: 'rgba(119, 119, 142, 0.2)'
                }
            },
            axisLabel: {
                fontSize: 10,
                color: '#77778e'
            },
        },
        yAxis: {
            splitLine: {
                lineStyle: {
                    color: 'rgba(119, 119, 142, 0.2)'
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(119, 119, 142, 0.2)'
                }
            },
            axisLabel: {
                fontSize: 10,
                color: '#77778e'
            },
        },
        series: [{
            name: 'VAN',
            type: 'line',
            data: VanList,
            label: {
                position: 'top',
            },
        },{
            name: 'Flat',
            type: 'line',
            data: FlatList,
            label: {
                position: 'top',
            },
        },{
            name: 'Reffer',
            type: 'line',
            data: RefferList,
            label: {
                position: 'top',
            },
        }],
        color: ['#7dc257', '#eb6f33', '#673ab7']
    };

    var barChart = echarts.init(document.getElementById('echart'));
    barChart.setOption(option);

}

function initializeFlatpickr(selector) {
    return flatpickr(selector, {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: "",
        onChange: function (dateObj, dateStr, instance) {
            if (dateObj.length > 1) {
                let chart_date_start = moment(dateObj[0]).format('YYYY-MM-DD');
                let chart_date_end = moment(dateObj[1]).format('YYYY-MM-DD');
                fetch_chart(chart_date_start, chart_date_end);
            }
        },
        onReady: function (dateObj, dateStr, instance) {
            let $cal = $(instance.calendarContainer);
            if ($cal.find('.flatpickr-today').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-today">Today</div>');
                $cal.find('.flatpickr-today').on('click', function () {
                    let chart_date_start = moment().format('YYYY-MM-DD');
                    let chart_date_end = moment().format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-yesterday').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-yesterday">Yesterday</div>');
                $cal.find('.flatpickr-yesterday').on('click', function () {
                    let chart_date_start = moment().subtract(1, 'd').format('YYYY-MM-DD');
                    let chart_date_end = moment().subtract(1, 'd').format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-thisweek').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-thisweek">This Week</div>');
                $cal.find('.flatpickr-thisweek').on('click', function () {
                    let chart_date_start = moment().startOf('week').format('YYYY-MM-DD');
                    let chart_date_end = moment().endOf('week').format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-lastweek').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-lastweek">Last Week</div>');
                $cal.find('.flatpickr-lastweek').on('click', function () {
                    let chart_date_start = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                    let chart_date_end = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-thismonth').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-thismonth">This Month</div>');
                $cal.find('.flatpickr-thismonth').on('click', function () {
                    let chart_date_start = moment().startOf('month').format('YYYY-MM-DD');
                    let chart_date_end = moment().endOf('month').format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-lastmonth').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-lastmonth">Last Month</div>');
                $cal.find('.flatpickr-lastmonth').on('click', function () {
                    let chart_date_start = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                    let chart_date_end = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-last7day').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-last7day">Last 7 Day</div>');
                $cal.find('.flatpickr-last7day').on('click', function () {
                    let chart_date_start = moment().subtract(7, 'd').format('YYYY-MM-DD');
                    let chart_date_end = moment().format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
            if ($cal.find('.flatpickr-last30day').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-last30day">Last 30 Day</div>');
                $cal.find('.flatpickr-last30day').on('click', function () {
                    let chart_date_start = moment().subtract(30, 'd').format('YYYY-MM-DD');
                    let chart_date_end = moment().format('YYYY-MM-DD');
                    instance.setDate([chart_date_start, chart_date_end]);
                    fetch_chart(chart_date_start, chart_date_end);
                });
            }
        },
    })
}

$(function (e) {
    let chart_date_start = moment().startOf('month').format('YYYY-MM-DD');
    let chart_date_end = moment().endOf('month').format('YYYY-MM-DD');
    let flatpickr_chart = initializeFlatpickr('#filter-by-chart');
    flatpickr_chart.setDate([chart_date_start, chart_date_end]);
    fetch_chart(chart_date_start, chart_date_end);
});

$(document).ready(function () {
    $('.select2').select2({});
    $('#base_datatable_length select').select2({minimumResultsForSearch: Infinity});
});

