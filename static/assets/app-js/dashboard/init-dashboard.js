var base_datatable;

function inisialize_table() {

    let table = $('#base_datatable').DataTable({
        responsive: false,
        processing: true,
        searching: false,
        serverSide: true,
        order: [[1, 'asc']],
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
        pageLength: $.cookie('length_dt'),
        language: {
            searchPlaceholder: 'Search...',
            sSearch: '',
            lengthMenu: '_MENU_ items/page',
            processing: '<img src="/static/assets/images/loader.svg" alt="Loader">',
            emptyTable: "No data available yet.",
        },
        ajax: {
            url: "data-dt?format=datatables",
            type: "POST",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
            }
        },
        columns: [
            // {
            //     data: null,
            //     searchable: false,
            //     orderable: false,
            //     width: 1,
            //     render: function (data, type, row, meta) {
            //         return '<label class="custom-control custom-checkbox mb-0">' +
            //             '<input type="checkbox" class="custom-control-input dt-checkboxes" name="check">' +
            //             '<span class="custom-control-label" for="check"></span>' +
            //             '</label>';
            //     },
            //     checkboxes: {
            //         selectRow: true,
            //         selectAllRender: '<label class="custom-control custom-checkbox mb-0">' +
            //             '<input type="checkbox" class="custom-control-input dt-checkboxes" name="check">' +
            //             '<span class="custom-control-label" for="check"></span>' +
            //             '</label>',
            //     },
            // },
            {
                title: "Action",
                data: null,
                searchable: false,
                orderable: false,
                width: 1,
                render: function (data, type, row, meta) {
                    return '<a class="delete-btn btn btn-danger btn-icon rounded-11 me-2" data-name="' + row.company_link + '"><i><svg class="table-delete" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg></i></a>';
                },
                render: function (data, type, row, meta) {
                    return '<a class="delete-btn btn btn-danger btn-icon rounded-11 me-2" data-name="' + row.company_link + '"><i><svg class="table-delete" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg></i></a>' +
                            '<a class="btn btn-primary btn-icon rounded-11 me-2" href="/brokerage/page?id='+row.id+'" data-bs-placement="bottom" data-bs-toggle="tooltip" title="View"><i class="fe fe-eye"></i></a>'+
                            '<a class="action-btn btn btn-primary btn-icon rounded-11 me-2" data-value="edit"><i><svg class="table-edit" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z"/></svg></i></a>';
                },
            },
            {
                title: "Brokerage",
                data: "company_link",
                name: "company_link",
                render: function (data, type, row) {
                    return '<a href="/brokerage/page?id='+row.id+'">'+data+'</a>';
                },
            },
            {
                title: "active account",
                data: "count_success_account",
                name: "count_success_account",
                searchable: false,
                orderable: false,
            },
            {
                title: "Last Scrape",
                data: "modifiedAt",
                name: "modifiedAt",
            },
            {
                data: "id",
                visible: false,
            },
            {
                data: "loads_scraped_van",
                visible: false,
            },
            {
                data: "loads_scraped_reefer",
                visible: false,
            },
            {
                data: "loads_scraped_flatbed",
                visible: false,
            },
            {
                title: "LS load count",
                orderable: false,
                render: function (data, type, row) {
                    return '<ul style="list-style-type: none;">'+
                        '<li>VAN: ' + (row.loads_scraped_van ? row.loads_scraped_van : 0) + '</li>'+
                        '<li>FLAT: ' + (row.loads_scraped_flatbed ? row.loads_scraped_flatbed : 0) + '</li>'+
                        '<li>REFR: ' + (row.loads_scraped_reefer ? row.loads_scraped_reefer : 0) + '</li>'+
                        '</ul>'
                }
            },
            {
                title: "Script cycle time",
                data: "cycle_time",
                name: "cycle_time",
            },
            {
                title: "Average cycle time",
                data: "average_cycle_time",
                name: "average_cycle_time",
            },
            // {
            //     title: "Script status",
            //     data: "status_task",
            //     name: "status_task",
            //     render: function (data, type, row) {
            //         return '<select class="form-control form-select select2" id="script_status_' + row.id + '" data-id="' + row.id + '" style="width: 100%">' +
            //            '<option value="True"' + (data === true ? ' selected' : '') + '>active</option>' +
            //            '<option value="False"' + (data === false ? ' selected' : '') + '>inactive</option>' +
            //        '</select>';
            //     }
            // },
            {
                title: "Risk level",
                data: "risk_level",
                name: "risk_level",
                render: function (data, type, row) {
                    let content_risk_level = ''
                    if (data === "1") {
                        let title_risk_level = "Easy to scrape, no additional security except (Username + Password)"
                        content_risk_level = '<label>' + data + ' <i class="fa fa-question-circle text-primary" data-bs-placement="bottom" data-bs-toggle="tooltip" title="' + title_risk_level + '"></i></label>'
                    } else if (data === "2") {
                        let title_risk_level = "Additional security like Cloudflare and tracking systems."
                        content_risk_level = '<label>' + data + ' <i class="fa fa-question-circle text-primary" data-bs-placement="bottom" data-bs-toggle="tooltip" title="' + title_risk_level + '"></i></label>'
                    } else if (data === "3") {
                        let title_risk_level = "Additional security + 2 Factor Authentication"
                        content_risk_level = '<label>' + data + ' <i class="fa fa-question-circle text-primary" data-bs-placement="bottom" data-bs-toggle="tooltip" title="' + title_risk_level + '"></i></label>'
                    }
                    return content_risk_level;
                    // return '<select class="form-control form-select select2" id="risk_level_' + row.id + '" data-id="' + row.id + '" style="width: 100%">' +
                    //     '<option value="1"' + (data === "1" ? ' selected' : '') + '>1</option>' +
                    //     '<option value="2"' + (data === "2" ? ' selected' : '') + '>2</option>' +
                    //     '<option value="3"' + (data === "3" ? ' selected' : '') + '>3</option>' +
                    //     '</select>';
                }
            },
            {
                title: "statistic",
                searchable: false,
                orderable: false,
                width: 1,
                render: function (data, type, row) {
                    return '<a class="btn btn-primary btn-icon rounded-11 me-2" href="/statistic/page?id='+row.id+'">statistic <i class="fe fe-bar-chart-2"></i></a>';

                }
            },
            {
                title: "Cron(status)",
                searchable: false,
                orderable: false,
                width: 1,
                render: function (data, type, row) {
                    return '<a class="btn btn-primary btn-icon rounded-11 me-2" href="/cron/page?id='+row.id+'">cron <i class="fe fe-calendar"></i></a>';

                }
            },
            // {
            //     title: "Cron(status)",
            //     data: "risk_level",
            //     name: "risk_level",
            //     render: function (data, type, row) {
            //         return '<ul style="list-style-type: none;">' +
            //                   '<li>07:00 AM - 08:00 AM, Status: success</li>' +
            //                   '<li>08:00 AM - 09:00 AM, Status: failed</li>' +
            //                   '<li>09:00 AM - 10:00 AM, Status: failed</li>' +
            //                   '<li>10:00 AM - 11:00 AM, Status: failed</li>' +
            //                   '<li>10:00 AM - 11:00 AM, Status: success</li>' +
            //                   '<li>11:00 AM - 12:00 PM, Status: pending</li>' +
            //                 '</ul>';
            //     }
            // },
        ],
        "drawCallback": function () {
            $('.select2').select2({minimumResultsForSearch: Infinity});
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(element) {
                var tooltip = new bootstrap.Tooltip(element, {
                    template: '<div class="tooltip tooltip-primary" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            });

            $('#count_items').text(table.page.info().recordsTotal);
        },
    });
    $('#base_datatable_info').addClass('mb-5 mt-5');
    $('#base_datatable_paginate').addClass('mb-5 mt-5');
    $('#base_datatable_processing').removeClass('card');

    return table
}

function change_length_dt() {
    $('#base_datatable_length select').on('change', function () {
        $.cookie('length_dt', $(this).val());
    });
}

function reset_table() {
    let button_id = "#filter-reset";
    $(document).on("click", button_id, function(e){
        reset_table_inisialize();
        reload_table(true);
    });
}

function reset_table_inisialize() {
    $.cookie('filter_by_brokerage', '');
    $.cookie('filter_by_active_brokerages', true);
    $('#filter-by-brokerage').val('');
    $('#filter_by_active_brokerages').prop('checked', true);
}

function filter_table() {
    $("#filter-by-brokerage").on("input", function () {
        $.cookie('filter_by_brokerage', $(this).val());
        reload_table();
    });
    $("#filter_by_active_brokerages").on("change", function () {
        $.cookie('filter_by_active_brokerages', $(this).prop('checked'));
        reload_table();
    });
}

function reload_table(reset = false) {
    if (!reset) {
        let ajax_data = {};

        let filter_by_brokerage = $.cookie('filter_by_brokerage');
        let filter_by_active_brokerages = $.cookie('filter_by_active_brokerages');

        if (filter_by_brokerage) ajax_data['brokerage'] = filter_by_brokerage;
        if (filter_by_active_brokerages) ajax_data['active_brokerages'] = filter_by_active_brokerages;

        base_datatable.ajax.url('data-dt?format=datatables&' + $.param(ajax_data)).load();
    } else {
        base_datatable.ajax.url('data-dt?format=datatables').load();
    }
    $('#delete_selected_btn').addClass("disabled");
}

$(function (e) {
    base_datatable = inisialize_table();

    change_length_dt();
    action_brokerage();
    update_brokerage_status();
    update_risk_level();
    filter_table();
    reset_table();
    reset_table_inisialize();
    delete_form('dashboard');
    delete_selected_form('dashboard');
});

$(document).ready(function () {
    $('.select2').select2({minimumResultsForSearch: Infinity});
});


