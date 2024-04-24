$(document).on("click", "#profile-edit-btn", function(e){
    e.preventDefault();
    e.stopPropagation();

    var loading_element = $('#profile-edit-btn');
    let first_name = $('#first_name').val();
    let last_name = $('#last_name').val();
    let email = $('#email').val();
    if (first_name && last_name){
        show_loading_icon(loading_element);
        let formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));
        $.ajax({
            url: "/accounts/edit-profile/",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                notifier("success", "Profile Updated Successfully.");
                hide_loading_icon(loading_element);
            },
            error: function(xhr, status, error) {
                hide_loading_icon(loading_element);
                notifier("error", "Something Wrong Please Try Again.");
            }
        });
    }else {
        hide_loading_icon(loading_element);
        notifier("error", "Error: Please enter valid first name, last name, email and try again.");
    }
});

$(document).on("click", "#password-edit-btn", function(e){
    e.preventDefault();
    e.stopPropagation();

    var loading_element = $('#password-edit-btn');
    let old_password = $('#old_password').val();
    let new_password1 = $('#new_password1').val();
    let new_password2 = $('#new_password2').val();
    if (old_password && new_password1 && new_password2){
        show_loading_icon(loading_element);
        let formData = new FormData();
        formData.append('old_password', old_password);
        formData.append('new_password1', new_password1);
        formData.append('new_password2', new_password2);
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));
        $.ajax({
            url: "/accounts/edit-password/",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                notifier("success", "Password Updated Successfully.");
                hide_loading_icon(loading_element);
            },
            error: function(xhr, status, error) {
                hide_loading_icon(loading_element);
                var errors = JSON.parse(xhr.responseText).errors;
                var firstError = errors[Object.keys(errors)[0]][0];
                notifier('error', firstError);
            }
        });
    }else {
        hide_loading_icon(loading_element);
		notifier("error", "Error: Please enter valid credentials and try again.");
    }
});

$(function (e) {
    show_hide_pass();
});
