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
        order: [[1, 'desc']],
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
            {
                title: "Brokerage",
                data: "company_link",
                name: "company_link",
                width: 1,
                visible: false,
                render: function (data, type, row) {
                    return '<a href="/brokerage/page?id='+brokerage_id+'">'+data+'</a>';
                },
            },
            {
                title: "cron start",
                data: "cron_start",
                name: "cron_start",
            },
            {
                title: "cron end",
                data: "cron_end",
                name: "cron_end",
            },
            {
                title: "cron status",
                data: "cron_status",
                name: "cron_status",
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
    // filter_table();
    // reset_table();
    // reset_table_inisialize();
});

$(document).ready(function () {
    $('.select2').select2({minimumResultsForSearch: Infinity});
});


