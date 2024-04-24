var base_datatable;

function inisialize_table() {
	let table = $('#base_datatable').DataTable({
		responsive: false,
		processing: true,
		searching: false,
		serverSide: true,
	 	order: [[3, 'desc']],
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
            //         return null;
            //     },
            // },
            {
                data: null,
                searchable: false,
                orderable: false,
                width: 1,
                render: function (data, type, row, meta) {
                    if (type === 'display') {
                         data = '<label class="custom-control custom-checkbox mb-0">' +
                        '<input type="checkbox" class="custom-control-input dt-checkboxes" name="check">' +
                        '<span class="custom-control-label" for="check"></span>' +
                        '</label>';
                    }
                    return data;
                },
                checkboxes: {
                    selectRow: true,
                    selectAllRender: '<label class="custom-control custom-checkbox mb-0">' +
                        '<input type="checkbox" class="custom-control-input dt-checkboxes" name="check">' +
                        '<span class="custom-control-label" for="check"></span>' +
                        '</label>',
                },
            },
			{
				title: 'Action',
				searchable: false,
				orderable: false,
				width: 1,
				className: "text-center text-muted fs-15 fw-semibold",
				data: function (data) {
					return '<a class="users-action-btn btn btn-primary btn-sm rounded-11 me-2" data-value="edit"><i><svg class="table-edit" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 5.63l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z"/></svg></i></a>' +
                           '<a class="users-password-btn btn btn-primary btn-icon rounded-11 me-2" data-name="' + data.username + '"><i class="fe fe-lock"></i></a>'+
                           '<a class="delete-btn btn btn-danger btn-sm rounded-11" data-name="' + data.username + '"><i><svg class="table-delete" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="16"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg></i></a>';
				},
			},
			{
				title: "username",
				data: "username",
				name: "username",
				className: "text-muted fs-15 fw-semibold",
				width: 30,
			},
			{
				title: "first name",
				data: "first_name",
				name: "first_name",
				className: "text-muted fs-15 fw-semibold",
				width: 30,
			},
			{
				title: "last name",
				data: "last_name",
				name: "last_name",
				className: "text-muted fs-15 fw-semibold",
				width: 1,
			},
			{
				title: "last login",
				data: "last_login",
				name: "last_login",
				className: "text-muted fs-15 fw-semibold",
				width: 1,
			},
			{
				title: "date joined",
				data: "date_joined",
				name: "date_joined",
				className: "text-muted fs-15 fw-semibold",
				width: 1,
			},
		],
        "drawCallback": function () {
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

function reload_table(reset = false) {
    if (!reset) {
        let ajax_data = {};
        let filter_by_users = $.cookie('filter_by_users');
        let filter_by_user = $.cookie('filter_by_user');
        let filter_by_start_created_at = $.cookie('filter_by_start_created_at');
        let filter_by_end_created_at = $.cookie('filter_by_end_created_at');
        let filter_by_start_updated_at = $.cookie('filter_by_start_updated_at');
        let filter_by_end_updated_at = $.cookie('filter_by_end_updated_at');

        if (filter_by_users) {
            ajax_data['users'] = filter_by_users
        }
        if (filter_by_user) {
            ajax_data['user'] = filter_by_user
        }
        if (filter_by_start_created_at) {
            ajax_data['start_created_at'] = filter_by_start_created_at;
        }
        if (filter_by_end_created_at && filter_by_start_created_at !== filter_by_end_created_at) {
            ajax_data['end_created_at'] = filter_by_end_created_at;
        }
        if (filter_by_start_updated_at) {
            ajax_data['start_updated_at'] = filter_by_start_updated_at;
        }
        if (filter_by_end_updated_at && filter_by_start_updated_at !== filter_by_end_updated_at) {
            ajax_data['end_updated_at'] = filter_by_end_updated_at;
        }
        base_datatable.ajax.url('data-dt?format=datatables&' + $.param(ajax_data)).load();
    } else {
        base_datatable.ajax.url('data-dt?format=datatables').load();
    }
    $('#delete_selected_btn').addClass("disabled");
}

$(function (e) {
    base_datatable = inisialize_table();

    show_hide_pass();
    change_length_dt();
    action_users();
    password_users();
    delete_form('users');
    delete_selected_form('users');
});

$(document).ready(function () {
    $('.select2').select2({});
    $('#base_datatable_length select').select2({minimumResultsForSearch: Infinity});
    $('.dropify').dropify({
        allowedFileExtensions: ['jpg', 'png']// Only allow jpg and png file extensions
    });
});

