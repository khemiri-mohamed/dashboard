// // Example starter JavaScript for disabling form submissions if there are invalid fields
// (function () {
//   'use strict';
//
//   // Fetch all the forms we want to apply custom Bootstrap validation styles to
//   var forms = document.querySelectorAll('.needs-validation');
//
//   // Loop over them and prevent submission
//   Array.prototype.slice.call(forms)
//     .forEach(function (form) {
//       form.addEventListener('submit', function (event) {
//         if (!form.checkValidity()) {
//           event.preventDefault();
//           event.stopPropagation()
//         }
//
//         form.classList.add('was-validated')
//       }, false)
//     })
// })();

//
// $(document).ready(function () {
//     'use strict';
//
//     $('.needs-validation').each(function () {
//         var form = $(this);
//         form.on('submit', function (event) {
//             var requiredFields = form.find('[required]');
//             var isValid = true;
//
//             requiredFields.each(function () {
//                 if (!this.checkValidity()) {
//                     isValid = false;
//                     $(this).addClass('is-invalid');
//                 } else {
//                     $(this).addClass('is-invalid');
//                 }
//
//                 // if ($(this).is('select')) {
//                 //     var select = $(this).next('.select2-container').first().find('select').get(0);
//                 //     if (!select.checkValidity()) {
//                 //         isValid = false;
//                 //         select.addClass('is-invalid');
//                 //     } else {
//                 //         select.removeClass('is-invalid');
//                 //     }
//                 // }
//             });
//
//             if (!isValid) {
//                 event.preventDefault();
//                 event.stopPropagation();
//             } else {
//                 form.addClass('was-validated');
//             }
//         });
//     });
// });


// $(document).ready(function () {
//     'use strict';
//     var forms = $('.needs-validation');
//     forms.each(function () {
//         $(this).on('submit', function (event) {
//             if (!this.checkValidity()) {
//                 event.preventDefault();
//                 event.stopPropagation()
//             }
//             $(this).addClass('was-validated');
//         });
//     });
// });


$(document).ready(function () {
    'use strict';
    var forms = $('.needs-validation');
    forms.each(function () {
        $(this).on('submit', function (event) {
            var isValid = true;
            var requiredFields = $(this).find('[required]');
            requiredFields.filter('#new-barcode').each(function () {
                if (!this.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            if (!isValid || !this.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            $(this).addClass('was-validated');
        });
    });
});