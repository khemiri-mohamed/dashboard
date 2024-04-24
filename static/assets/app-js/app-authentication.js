// Self-executing function to define several utility functions
$(function(e) {

	$(document).on("submit", "#login-form", function(e){
		e.preventDefault();
		e.stopPropagation();
		var loading_element = $('#login-form button[type="submit"]');
		let csrf_token = $('#login-form input[name="csrfmiddlewaretoken"]').val();
		let username = $('#username').val();
		let password = $('#password').val();
		let next = getUrlParameter('next', '/');
		let remember = $('#id_remember').is(":checked");
		if (username && password){
			show_loading_icon(loading_element);
			var formData = {
				"csrfmiddlewaretoken": csrf_token,
				"username": username,
				"password": password,
				"remember": remember,
				"next": next,
			};
			$.ajax({
				url: "/accounts/login/",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				data:formData,
				success: function (response) {
					if (response.includes('id="login-form"')){
						notifier("error", "Error: Unable to log in with provided credentials.");
						hide_loading_icon(loading_element);
					}else {
						document.location.href = next;
					}
				},
				error: function(xhr, status, error) {
					hide_loading_icon(loading_element);
					notifier("error", "Error: Unable to log in with provided credentials.");
				}
			});
		}else {
			hide_loading_icon(loading_element);
			notifier("error", "Error: Please enter valid credentials and try again.");
		}
	});

	$(document).on("submit", "#logout-form", function(e){
		e.preventDefault();
		e.stopPropagation();
		$.ajax({
			url: "/accounts/logout/",
			error: function(xhr, status, error) {
				hide_loading_icon(loading_element);
				notifier("error", "Error: Unable to log in with provided credentials.");
			}
		}).done(function (response) {
				document.location.href="/";
		});
	});

});