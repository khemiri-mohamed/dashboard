function action_brokerage() {
    let form_id = '#brokerage-form';
    let modal_id = '#brokerage-modal';
    let email_id = '#email';
    let password_id = '#password';
    let account_status_id = '#account_status';

    $(email_id + ',' + password_id).on("input", function () {
        if ($(email_id).val() !== '' && $(password_id).val() !== '') {
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
        $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">New Account</span>');

        action_type = $(this).data('value');

        if (action_type === 'new') {
            $(form_id+' button[type="submit"]').addClass('disabled');// enable/disable the submit button
            $(email_id).val('');
            $(password_id).val('');
        }

        if (action_type === 'edit'){
            $(form_id+' button[type="submit"]').removeClass('disabled');// enable/disable the submit button
            let pk = $(this).closest('tr').data("pk");
            $.ajax({
                url: '/brokerage/select-account/' + pk,
                async: false,
                success: function (response) {
                    let email_value = response['data'].email;
                    let password_value = response['data'].password;
                    let account_status_value = response['data'].account_setup_status;
                    $(form_id).attr('data-id', pk);
                    $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">Edit</span><span class="badge bg-primary">' + email_value + '</span>');
                    $(email_id).val(email_value);
                    $(password_id).val(password_value);
                    $(account_status_id).val(account_status_value).trigger('change');
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
        let email_value = $(email_id).val();
        let password_value = $(password_id).val();
        let account_status_value = $(account_status_id).val();

        if (email_value && password_value) {
            let formData = new FormData();
            if (action_type === 'edit') formData.append('pk', document.querySelector(form_id).getAttribute("data-id"));
            formData.append('action_type', action_type);
            formData.append('email', email_value);
            formData.append('brokerage_id', brokerage_id);
            formData.append('password', password_value);
            formData.append('account_status', account_status_value);
            formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

            $.ajax({
                url: '/brokerage/action',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    $(modal_id).modal('hide');
                    let status = response.status;
                    if (status === 'exist') {
						notifier("warning", email_value + " exist");
                    } else if (status === 'fail') {
						notifier("error", "Fail to Create " + email_value);
                    } else if (status === 'updated') {
                        reload_table();
                        notifier("info", 'Record Updated Successfully');
                    } else {
                        reload_table();
                        notifier("success", email_value + " Created Successfully.");
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
			notifier("error", "Please Enter a Valid email, password and Try Again.");
        }
    });

    $(modal_id).on('hidden.bs.modal', event => {
        hide_loading_icon(button_clicked);
    });
}

function update_brokerage_account() {
    $(document).on('select2:select', 'select[id^="account_status_"]', function () {
        let pk = $(this).closest('tr').data('pk');
        let formData = new FormData();
        formData.append('pk', pk);
        formData.append('brokerage_status', $(this).val());
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

        $.ajax({
            url: '/brokerage/update-account-brokerage',
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
