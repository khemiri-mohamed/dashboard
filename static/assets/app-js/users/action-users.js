function action_users() {
    let form_id = '#users-form';
    let modal_id = '#users-modal';
    let action_btn = '.users-action-btn';

    let button_clicked = null;
    let action_type = '';
    $(document).off("click", action_btn).on("click", action_btn, function(e){
        e.preventDefault();
        e.stopPropagation();
        let loading_element = button_clicked = $(this);
        show_loading_icon(loading_element);
        $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">New Users');

        action_type = $(this).data('value');

        if (action_type === 'new') {
            $("#block-password").show();
            $(form_id).trigger('reset');
        }

        if (action_type === 'edit'){
            $("#block-password").hide();
            let pk = $(this).closest('tr').data("pk");
            $.ajax({
                url: '/users/select/' + pk,
                async: false,
                success: function (response) {
                    let username = response['data'].username;
                    let first_name = response['data'].first_name;
                    let last_name = response['data'].last_name;

                    $(form_id).attr('data-id', pk);
                    $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">Edit</span><span class="badge bg-primary">' + name + '</span>');

                    $("#username").val(username);
                    $("#first_name").val(first_name);
                    $("#last_name").val(last_name);
                },
                error: function (xhr, status, error) {
                    notifier("error");
                },
                complete: function() {
                    hide_loading_icon(loading_element);
                }
            });
        }
        $(modal_id).modal('show');
    });

    $(document).on("submit", form_id, function (e) {
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $(form_id+' button[type="submit"]');
        show_loading_icon(loading_element);

        let username = $("#username").val();
        let password = $("#password").val();
        let first_name = $("#first_name").val();
        let last_name = $("#last_name").val();

        if (username) {
            let formData = new FormData();
            if (action_type === 'edit') formData.append('pk', document.querySelector(form_id).getAttribute("data-id"));
            formData.append('action_type', action_type);

            formData.append('username', username);
            if (action_type === 'new') formData.append('password', password);
            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

            $.ajax({
                url: '/users/action',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                async: false,
                success: function (response) {
                    $(modal_id).modal('hide');
                    let status = response.status;
                    if (status === 'exist') {
						notifier("warning", username + " exist");
                    } else if (status === 'updated') {
                        reload_table();
                        notifier("info", 'Record Updated Successfully');
                    } else {
                        reload_table();
                        notifier("success", username + " Created Successfully.");
                        $(form_id).trigger('reset');
                    }
                },
                error: function (xhr, status, error) {
                    var errors = JSON.parse(xhr.responseText).message;
                    var firstError = errors[Object.keys(errors)[0]][0];
                    notifier('error', firstError);
                },
                complete: function() {
                    hide_loading_icon(loading_element);
                }
            });
        } else {
            hide_loading_icon(loading_element);
			notifier("error", "Please Enter a Valid Username and Try Again.");
        }
    });

    $(modal_id).on('hidden.bs.modal', event => {
        hide_loading_icon(button_clicked);
    });
}

function password_users() {
    let form_id = '#password-form';
    let modal_id = '#password-modal';
    let action_btn = '.users-password-btn';

    let button_clicked = null;
    $(document).off("click", action_btn).on("click", action_btn, function(e){
        e.preventDefault();
        e.stopPropagation();
        let loading_element = button_clicked = $(this);
        show_loading_icon(loading_element);
        let id = $(this).closest('tr').data("pk");
        let username = $(this).data('name');
        $(form_id).attr('data-id', id);
        $(modal_id+' .modal-title').html('<span class="badge bg-primary me-1">New Password</span><span class="badge bg-primary">' + username + '</span>');
        $(form_id).trigger('reset');
        $(modal_id).modal('show');
    });

    $(document).on("submit", form_id, function (e) {
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $(form_id+' button[type="submit"]');
        show_loading_icon(loading_element);
        let id = document.querySelector(form_id).getAttribute("data-id");
        let new_password = $("#new_password").val();

        if (new_password) {
            let formData = new FormData();
            formData.append('id', id);
            formData.append('new_password', new_password);
            formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

            $.ajax({
                url: '/users/change-password',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                async: false,
                success: function (response) {
                    $(modal_id).modal('hide');
                    let status = response.status;
                    if (status === 'exist') {
						notifier("warning", username + " exist");
                    } else if (status === 'updated') {
                        reload_table();
                        notifier("info", 'Record Updated Successfully');
                    } else {
                        reload_table();
                        notifier("success", username + " Created Successfully.");
                        $(form_id).trigger('reset');
                    }
                },
                error: function (xhr, status, error) {
                    var errors = JSON.parse(xhr.responseText).message;
                    var firstError = errors[Object.keys(errors)[0]][0];
                    notifier('error', firstError);
                },
                complete: function() {
                    hide_loading_icon(loading_element);
                }
            });
        } else {
            hide_loading_icon(loading_element);
            notifier("error", "Error: Please enter valid credentials and try again.");
        }
    });

    $(modal_id).on('hidden.bs.modal', event => {
        hide_loading_icon(button_clicked);
    });
}

