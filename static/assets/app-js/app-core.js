function delete_form(app_name) {
    let button_id = ".delete-btn";
    $(document).off("click", button_id).on("click", button_id, function(e){
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $(this);
        show_loading_icon(loading_element);
        let id = $(this).closest('tr').data("pk");
        let name = $(this).data("name");
        $('#delete-form').attr('data-id', id).attr('data-name', name);
        $('#delete-modal .modal-title').html('<span class="badge bg-danger me-1">Delete</span><span class="badge bg-danger">' + name + '</span>');
        $("#delete-modal").modal('show');
    });

    $(document).on("submit", "#delete-form", function (e) {
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $('#delete-form button[type="submit"]');
        show_loading_icon(loading_element);
        let id = document.querySelector("#delete-form").getAttribute("data-id");
        let name = document.querySelector("#delete-form").getAttribute("data-name");

        let formData = new FormData();
        formData.append('id', id);
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

        // Send an AJAX request to the server with the form data and image file
        $.ajax({
            url: '/' + app_name + '/delete',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                $('#delete-modal').modal('hide');
                let status = response.status;
                if (status === 'some_relation_exists') {
                    notifier("info", response.message, false);
                } else if (status === 'fail') {
                    notifier("error");
                } else {
                    reload_table();
                    notifier("success", 'Record Deleted Successfully');
                }
            },
            error: function (xhr, status, error) {
                notifier("error");
            },
            complete: function() {
                hide_loading_icon(loading_element);
            }
        });
    });

    $('#delete-modal').on('hidden.bs.modal', event => {
        hide_loading_icon($(".delete-btn"));
    });
}

function delete_selected_form(app_name) {
    $(document).on('change', '.dt-checkboxes', function () {
        let value = $(this).closest('tr').data('pk');
        let button = $('#delete_selected_btn');
        if ($(this).is(':checked')) {
            button.removeClass("disabled");
        } else {
            if (!$('.dt-checkboxes').is(':checked')) {
                button.addClass("disabled");
            }
        }
    });

    $(document).on('change', '#selectAll', function () {
        let button = $('#delete_selected_btn');
        if ($(this).is(':checked')) {
            button.removeClass("disabled");
        } else {
            if (!$(this).is(':checked')) {
                button.addClass("disabled");
            }
        }
    });

    let button_id = "#delete_selected_btn";
    $(document).off("click", button_id).on("click", button_id, function(e){
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $(this);
        show_loading_icon(loading_element);
        $('#delete-selected-modal .modal-title').html('<span class="badge bg-danger">Delete Selected Records</span>');
        $("#delete-selected-modal").modal('show');
    });

    $(document).on("submit", "#delete-selected-form", function (e) {
        e.preventDefault();
        e.stopPropagation();
        let loading_element = $('#delete-selected-form button[type="submit"]');
        show_loading_icon(loading_element);

        let data_ids = $("tr[data-pk] .dt-checkboxes:checkbox:checked").map(function () {
            return $(this).closest("tr").data("pk");
        }).get();

        var formData = JSON.stringify({
            "ids": data_ids,
        });

        // Send an AJAX request to the server with the form data and image file
        $.ajax({
            url: '/' + app_name + '/delete_selected',
            type: 'POST',
            dataType: 'json',
            headers: {
                "X-CSRFToken": $.cookie('csrftoken'),
                "Content-Type": "application/json",
            },
            data: formData,
            processData: false,// process the data as it is sent
            contentType: false,// don't set the content type of the request
            success: function (response) {
                $('#delete-selected-modal').modal('hide');
                let status = response.status;
                if (status === 'some_relation_exists') {
                    notifier("info", response.message, false);
                } else if (status === 'fail') {
                    notifier("error");
                } else {
                    reload_table();
                    notifier("success", 'Record Deleted Successfully');
                }
            },
            error: function (xhr, status, error) {
                notifier("error");
            },
            complete: function() {
                hide_loading_icon(loading_element);
            }
        });
    });

    $('#delete-selected-modal').on('hidden.bs.modal', event => {
        hide_loading_icon($("#delete_selected_btn"));
    });
}

function fct_flatpickr(selector, id) {
    return flatpickr(selector, {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: "",
        onChange: function (dateObj, dateStr, instance) {
            if (dateObj) {
                let filter_by_start = moment(dateObj[0]).format('YYYY-MM-DD');
                let filter_by_end = moment(dateObj[1]).format('YYYY-MM-DD');
                $.cookie('filter_by_start_'+id, filter_by_start);
                $.cookie('filter_by_end_'+id, filter_by_end);
                if (filter_by_start) {
                    reload_table();
                }
            }
        },
        onReady: function (dateObj, dateStr, instance) {
            let $cal = $(instance.calendarContainer);
            if ($cal.find('.flatpickr-today').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-today">Today</div>');
                $cal.find('.flatpickr-today').on('click', function () {
                    let filter_by_start = moment().format('YYYY-MM-DD');
                    let filter_by_end = moment().format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-yesterday').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-yesterday">Yesterday</div>');
                $cal.find('.flatpickr-yesterday').on('click', function () {
                    let filter_by_start = moment().subtract(1, 'd').format('YYYY-MM-DD');
                    let filter_by_end = moment().subtract(1, 'd').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-thisweek').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-thisweek">This Week</div>');
                $cal.find('.flatpickr-thisweek').on('click', function () {
                    let filter_by_start = moment().startOf('week').format('YYYY-MM-DD');
                    let filter_by_end = moment().endOf('week').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-lastweek').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-lastweek">Last Week</div>');
                $cal.find('.flatpickr-lastweek').on('click', function () {
                    let filter_by_start = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                    let filter_by_end = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-thismonth').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-thismonth">This Month</div>');
                $cal.find('.flatpickr-thismonth').on('click', function () {
                    let filter_by_start = moment().startOf('month').format('YYYY-MM-DD');
                    let filter_by_end = moment().endOf('month').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-lastmonth').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-lastmonth">Last Month</div>');
                $cal.find('.flatpickr-lastmonth').on('click', function () {
                    let filter_by_start = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                    let filter_by_end = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-last7day').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-last7day">Last 7 Day</div>');
                $cal.find('.flatpickr-last7day').on('click', function () {
                    let filter_by_start = moment().subtract(7, 'd').format('YYYY-MM-DD');
                    let filter_by_end = moment().format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-last30day').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-last30day">Last 30 Day</div>');
                $cal.find('.flatpickr-last30day').on('click', function () {
                    let filter_by_start = moment().subtract(30, 'd').format('YYYY-MM-DD');
                    let filter_by_end = moment().format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-currentyear').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-currentyear">Current Year</div>');
                $cal.find('.flatpickr-currentyear').on('click', function () {
                    let filter_by_start = moment().startOf('year').format('YYYY-MM-DD');
                    let filter_by_end = moment().endOf('year').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-lastyear').length < 1) {
                $cal.append('<div class="btn btn-sm btn-primary m-1 float-start flatpickr-lastyear">Last Year</div>');
                $cal.find('.flatpickr-lastyear').on('click', function () {
                    let filter_by_start = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
                    let filter_by_end = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
                    $.cookie('filter_by_start_'+id, filter_by_start);
                    $.cookie('filter_by_end_'+id, filter_by_end);
                    instance.setDate([filter_by_start, filter_by_end]);
                    reload_table();
                });
            }
            if ($cal.find('.flatpickr-clear').length < 1) {
                $cal.append('<div class="btn btn-sm btn-danger m-1 float-start flatpickr-clear"><i class="fe fe-x-circle"> Clear</div>');
                $cal.find('.flatpickr-clear').on('click', function () {
                    instance.clear();
                    instance.close();
                    $.cookie('filter_by_start_'+id, '');
                    $.cookie('filter_by_end_'+id, '');
                    reload_table();
                });
            }
        },
    })
}

function inisialize_expired_at (type, defaultDate=moment().format('YYYY-MM-DD')) {
    let input_id = '#product-expired-at';
    let flatpickr_expired_at = flatpickr(input_id, {
        noCalendar: true,
        allowInput: true,
        dateFormat: "d/m/Y",
        defaultDate: defaultDate,
        className: 'no-calendar',
        onReady: function(selectedDates, dateStr, instance) {
            var selectedDate = dateStr;
            var momentObject = moment(selectedDate, "YYYY-MM-DD").startOf('day');
            var dayDiff = momentObject.diff(moment().startOf('day'), "days");
            if (dayDiff > 10) {
                $(input_id).addClass('is-valid');
                $(input_id).removeClass('is-invalid');
            }
            else {
                $(input_id).removeClass('is-valid');
                $(input_id).addClass('is-invalid');
            }
        },
    });

    $(input_id).on('input', function () {
        var selectedDate = $(this).val();
        var momentObject = moment(selectedDate, "YYYY-MM-DD").startOf('day');
        var dayDiff = momentObject.diff(moment().startOf('day'), "days");
        if (dayDiff > 10) {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
        }
        else {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
        }
    });
    return flatpickr_expired_at
}

// Function to display a notification message on the screen
function notifier(type, msg="", autohide=true) {
    if (type === 'error' && !msg) msg = "Something Wrong Please Try Again.";
    notif({
        type: type, // Type of notification (success, error, etc.)
        msg: msg, // The message to display
        position: "left", // Position of the notification on the screen
        width: 600, // Width of the notification
        height: 40, // Height of the notification
        autohide: autohide // Whether to automatically hide the notification after a certain amount of time
    });
}

// Function to reset the file input's preview
function set_dropify_image(input, fname, src) {
    let wrapper = input.closest('.dropify-wrapper');// Find the closest parent element with the class 'dropify-wrapper'
    let preview = wrapper.find('.dropify-preview'); // Find the preview element within the wrapper
    let filename = wrapper.find('.dropify-filename-inner'); // Find the file name element within the wrapper
    let render = wrapper.find('.dropify-render').html('');// Find the render element within the wrapper and clear its content

    // Clear the value of the input, set its title to the file name, and remove/add classes to the wrapper element
    input.val('').attr('title', fname);
    wrapper.removeClass('has-error').addClass('has-preview');
    filename.html(fname);

    // Append an image element to the render element with the source set to the provided file's source
    if (src.includes("default.png")) {
        render.append($('<img />').attr('src', src).css('max-height', input.data('height') || ''));
    } else {
        render.append($('<img />').attr('src', 'data:image/png;base64,' + src).css('max-height', input.data('height') || ''));
    }
    // Fade in the preview
    preview.fadeIn();
}

// Function to add a loading icon to an element
function show_loading_icon(element) {
    if (!element.find('.form-help').length) {
        if (element.find('svg').length) {
            element.addClass("btn-loading disabled btn-sm");
            element.find('svg').css("opacity", "0");
        } else if (element.find('i').length) {
            element.addClass("disabled");
            element.find('i').addClass("btn-loading btn-sm");
        } else {
            element.addClass("btn-loading disabled");
            element.find('span').css("opacity", "0");
        }
    }
}

// Function to remove a loading icon from an element
function hide_loading_icon(element) {
    if (!element.find('.form-help').length) {
        if (element.find('svg').length) {
            element.removeClass("btn-loading disabled btn-sm");
            element.find('svg').css("opacity", "100");
        } else if (element.find('i').length) {
            element.removeClass("disabled");
            element.find('i').removeClass("btn-loading btn-sm");
        } else {
            element.removeClass("btn-loading disabled");
            element.find('span').css("opacity", "100");
        }
    }
}

function getUrlParameter(sParam, vParam) {
    // Get the query string from the current URL
    const queryString = window.location.search;
    // Create a new URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);
    // Check if the URL params object has a key that matches the provided sParam
    if (urlParams.has(sParam)) {
        // If the key exists, return the corresponding value
        return urlParams.get(sParam);
    } else {
        // If the key does not exist, return the provided default value
        return vParam;
    }
}

function wordwrap(longString, wordsPerLine = 4) {
    let words = longString.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
        if ((i % wordsPerLine) === 0 && i !== 0) {
            lines.push(line);
            line = "";
        }
        line += words[i] + " ";
    }
    lines.push(line);
    return lines.join("<br>");
}

function strwrap(longString, lineLength = 20) {
    let lines = [];
    for (let i = 0; i < longString.length; i += lineLength) {
        lines.push(longString.slice(i, i + lineLength));
    }
    return lines.join("<br>");
}

function initialize_select2(selectors, apps, empty=false) {

    var formData = JSON.stringify({
        "apps": apps,
    });

    $.ajax({
        url: '/items',
        type: 'POST',
        dataType: 'json',
        headers: {
            "X-CSRFToken": $.cookie('csrftoken'),
            "Content-Type": "application/json",
        },
        data: formData,
        processData: false,// process the data as it is sent
        contentType: false,// don't set the content type of the request
        async: false,
        success: function (response) {
            if (response.status === 'success') {
                let data = response.items;
                for (let i = 0; i < data.length; i++) {
                    let app_name = Object.keys(data[i]);
                    $(selectors[i]+app_name).empty();
                    $.each(data[i], function(key, value) {
                        if (value.length > 0) {
                            $.each(value, function(index, item) {
                                $(selectors[i]+app_name).append($('<option></option>').attr('value', item.id).text(item.text));
                            });
                        }
                    });
                    if (empty) $(selectors[i]+app_name).val(null).trigger('change');
                }
            }
        },
    });
}

function newOptionSelect2(targetSelect, ajaxUrl) {
    $(targetSelect).select2({
        tags: true,
        createTag: function (params) {
            var term = $.trim(params.term);
             if (term === '' || $(`option[data-select2-tag="true"]`).length) {
                return null;
            }
            return {
                id: term,
                text: term,
                newOption: true
            }
        },
    }).on('select2:selecting', function (e) {
        $(targetSelect).find('option[data-select2-tag="true"]').remove();
        var selected = e.params.args.data;
        if (selected && selected.newOption) {
            let name = selected.text;
            let formData = new FormData();
            formData.append('name', name);
            if(!ajaxUrl.includes("/app_supplier/")) formData.append('image_blob', '');
            formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));
            $.ajax({
                url: ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    var new_option = new Option(name, response.id, false, true);
                    $(targetSelect).append(new_option).trigger('change');
                    notifier("success", name + " Created Successfully.");
                },
                error: function (response) {
                    notifier("error");
                }
            });
        }
    });
}

function inisialize_input_image_link(app_name) {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    $('#' + app_name + '-image-link-btn').addClass('disabled', true);
    $('#' + app_name + '-image-link-input').val('');
    $('#' + app_name + '-image-link-input').on("input", function () {
        let inputVal = $(this).val().trim();
        if (inputVal !== '' && (urlPattern.test(inputVal) || /^data:image\/(png|jpeg);base64,/.test(inputVal))) {
            $('#' + app_name + '-image-link-btn').removeClass('disabled');
        } else {
            $('#' + app_name + '-image-link-btn').addClass('disabled', true);
        }
    });
}

function update_dropify_with_image_link(app_name) {
    let button_id = '#'+app_name+'-image-link-btn';
	$(document).off("click", button_id).on("click", button_id, function(e){
		e.preventDefault();
		e.stopPropagation();
		let loading_element = $(this);
        show_loading_icon(loading_element);
		let image_link = $('#'+app_name+'-image-link-input').val();
        $('#'+app_name+'-image-blob').val('');

        let formData = new FormData();
        formData.append('image_link', image_link);
        formData.append('csrfmiddlewaretoken', $.cookie('csrftoken'));

		$.ajax({
            url: '/image-link',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                let status = response.status;
                if (status === 'success') {
                    notifier("success", "The image has been updated successfully.");
					$('#'+app_name+'-image-blob').val(response.image);
                    set_dropify_image($('.dropify'), image_link, response.image);

                } else {
                    notifier("info", "Unfortunately, We are not able to get this image.");
                }
            },
            error: function (xhr, status, error) {
                notifier("info", "Unfortunately, the automatic filling is not working.");
            },
            complete: function() {
                hide_loading_icon(loading_element);
            }
        });
	});
}

function show_hide_pass() {
    $(document).on("click", "span:has(i[class*='fe-eye'])", function (e) {
        if ($(this).find('i').hasClass('fe-eye-off')) {
            $(this).find('i').removeClass('fe-eye-off');
            $(this).find('i').addClass('fe-eye');
            $(this).parent().find("input[id*='password']").attr('type', 'text');
        } else {
            $(this).find('i').removeClass('fe-eye');
            $(this).find('i').addClass('fe-eye-off');
            $(this).parent().find("input[id*='password']").attr('type', 'password');
        }
    });
}

function titleCase(str) {
    if (str) {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }
    return str;
}
