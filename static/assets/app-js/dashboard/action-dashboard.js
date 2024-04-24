function action_brokerage() {
    let form_id = '#brokerage-form';
    let modal_id = '#brokerage-modal';
    let brokerage_name_id = '#brokerage-name';
    let brokerage_url_id = '#brokerage-url';

    $(brokerage_name_id + ',' + brokerage_url_id).on("input", function () {
        if ($(brokerage_name_id).val() !== '' && $(brokerage_url_id).val() !== '') {
            $(form_id+' button[type="submit"]').removeClass('disabled');
        } else {
            $(form_id+' button[type="submit"]').addClass('disabled');
        }
    });

    let button_clicked = null;
    let action_type = '';
    let button_id = ".action-btn";
    $(document).off("click", button_id).on("click", button_id, function(e){
        e.preventDefault();
        e.stopPropagation();
        let loading_element = button_clicked = $(this);
        show_loading_icon(loading_element);
        $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">New Brokerage</span>');

        action_type = $(this).data('value');

        if (action_type === 'new') {
            $(form_id+' button[type="submit"]').addClass('disabled');// enable/disable the submit button
            $(brokerage_name_id).val('');
            $(brokerage_url_id).val('');
        }

        if (action_type === 'edit'){
            $(form_id+' button[type="submit"]').removeClass('disabled');// enable/disable the submit button
            let pk = $(this).closest('tr').data("pk");
            $.ajax({
                url: '/dashboard/select-brokerage/' + pk,
                async: false,
                success: function (response) {
                    let brokerage_name_value = response['data'].company_link;
                    let brokerage_url_value = response['data'].loadboard_link;
                    $(form_id).attr('data-id', pk);
                    $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">Edit</span><span class="badge bg-primary">' + brokerage_name_value + '</span>');
                    $(brokerage_name_id).val(brokerage_name_value);
                    $(brokerage_url_id).val(brokerage_url_value);
                },
                error: function (xhr, status, error) {
                    hide_loading_icon(loading_element);
                    notifier("error");
                },
            });
        }
        $(modal_id).modal('show');
    });

    $(document).on("submit", form_id, function (e) {
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $(form_id+' button[type="submit"]');
        show_loading_icon(loading_element);
        let brokerage_name_value = $(brokerage_name_id).val();
        let brokerage_url_value = $(brokerage_url_id).val();

        if (brokerage_url_value) {
            let formData = new FormData();
            if (action_type === 'edit') formData.append('pk', document.querySelector(form_id).getAttribute("data-id"));
            formData.append('action_type', action_type);
            formData.append('brokerage_name', brokerage_name_value);
            formData.append('brokerage_url', brokerage_url_value);
            formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

            $.ajax({
                url: '/dashboard/action',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    $(modal_id).modal('hide');
                    let status = response.status;
                    if (status === 'exist') {
						notifier("warning", brokerage_name_value + " exist");
                    } else if (status === 'fail') {
						notifier("error", "Fail to Create " + brokerage_name_value);
                    } else if (status === 'updated') {
                        reload_table();
                        notifier("info", 'Record Updated Successfully');
                    } else {
                        reload_table();
                        notifier("success", brokerage_name_value + " Created Successfully.");
                        $(form_id)[0].reset();
                    }
                },
                error: function (xhr, status, error) {
                    notifier("error");
                },
                complete: function() {
                    hide_loading_icon(loading_element);
                }
            });
        } else {
            hide_loading_icon(loading_element);
			notifier("error", "Please Enter a Valid Name, Url and Try Again.");
        }
    });

    $(modal_id).on('hidden.bs.modal', event => {
        hide_loading_icon(button_clicked);
    });
}

function update_brokerage_status() {
    $(document).on('select2:select', 'select[id^="script_status_"]', function () {
        let pk = $(this).closest('tr').data('pk');
        let formData = new FormData();
        formData.append('pk', pk);
        formData.append('brokerage_status', $(this).val());
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

        $.ajax({
            url: '/dashboard/update-status-brokerage',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
            },
            error: function (xhr, status, error) {
                notifier("error");
            }
        });
    });
}

function update_risk_level() {
    $(document).on('select2:select', 'select[id^="risk_level_"]', function () {
        let pk = $(this).closest('tr').data('pk');
        let formData = new FormData();
        formData.append('pk', pk);
        formData.append('risk_level', $(this).val());
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

        $.ajax({
            url: '/dashboard/update-risk-level',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
            },
            error: function (xhr, status, error) {
                notifier("error");
            }
        });
    });
}
