var base_datatable;

const urlParams = new URLSearchParams(window.location.search);
let brokerage_id = urlParams.get('id');
console.log('brokerage_id:' + brokerage_id);

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
            data: function (d) {
                if (brokerage_id) {
                    d.brokerage_id = brokerage_id;
                }
            },
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
                    return '<a class="delete-btn btn btn-danger btn-icon rounded-11 me-2" data-name="' + row.email + '"><i><svg class="table-delete" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg></i></a>';
                },
                render: function (data, type, row, meta) {
                    return '<a class="delete-btn btn btn-danger btn-icon rounded-11 me-2" data-name="' + row.email + '"><i><svg class="table-delete" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg></i></a>' +
                            '<a class="action-btn btn btn-primary btn-icon rounded-11 me-2" data-value="edit"><i><svg class="table-edit" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z"/></svg></i></a>';
                },
            },
            {
                title: "email",
                data: "email",
                name: "email",
            },
            {
                title: "password",
                data: "password",
                name: "password",
            },
            {
                title: "account status",
                data: "account_setup_status",
                name: "account_setup_status",
                width: 1,
                render: function (data, type, row) {
                    return '<select class="form-control form-select select2" id="account_status_' + row.id + '" data-id="' + row.id + '" style="width: 100%">' +
                        '<option value="Success"' + (data === "Success" ? ' selected' : '') + '>Success</option>' +
                        '<option value="Pending"' + (data === "Pending" ? ' selected' : '') + '>Pending</option>' +
                        '<option value="Waiting"' + (data === "Waiting" ? ' selected' : '') + '>Waiting</option>' +
                        '<option value="Rejected"' + (data === "Rejected" ? ' selected' : '') + '>Rejected</option>' +
                        '<option value="Reserved"' + (data === "Reserved" ? ' selected' : '') + '>Reserved</option>' +
                    '</select>';
                }
            },
            {
                data: "company_link",
                visible: false,
            },
            {
                data: "loadboard_link",
                visible: false,
            },
        ],
        "drawCallback": function () {
            $('.select2').select2({minimumResultsForSearch: Infinity});
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(element) {
                var tooltip = new bootstrap.Tooltip(element, {
                    template: '<div class="tooltip tooltip-primary" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            });

            $('#count_items').text(table.page.info().recordsTotal);
            let company_link = ''
            try {
                company_link = table.row(0).data().company_link
            }catch (e) {
            }
            $('#page-title').text(company_link);
            $('#statistic-page').attr('href', '/statistic/page?id='+brokerage_id);
            $('#cron-page').attr('href', '/cron/page?id='+brokerage_id);
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
    $.cookie('filter_by_account_status', '');
    $('#filter-by-account_status').val('').trigger('change');
}

function filter_table() {
    $("#filter-by-account_status").on('select2:select', function () {
        $.cookie('filter_by_account_status', $(this).val());
        reload_table();
    });
}

function reload_table(reset = false) {
    if (!reset) {
        let ajax_data = {};

        let filter_by_account_status = $.cookie('filter_by_account_status');
        if (filter_by_account_status) ajax_data['account_status'] = filter_by_account_status;

        if (brokerage_id && brokerage_id !== 'null') {
            ajax_data['brokerage_id'] = brokerage_id;
        }

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
    update_brokerage_account();
    filter_table();
    reset_table();
    reset_table_inisialize();
    delete_form('brokerage');
    delete_selected_form('brokerage');
});

$(document).ready(function () {
    $('.select2').select2({minimumResultsForSearch: Infinity});
});


