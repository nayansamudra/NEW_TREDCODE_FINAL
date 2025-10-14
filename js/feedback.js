
route = '/api/feedback/curd_feedback'

const validateName = (inputElement) => {
    var nameInput = inputElement.value;
    var nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(nameInput)) {
        toast_function("warning", "Name should contain only letters and spaces.");
        inputElement.value = nameInput.replace(/[^A-Za-z\s]+/g, '');
    }
}

const validateNumber = (inputElement) => {
    var numberInput = inputElement.value;
    var numberRegex = /^\d+$/;

    var sanitizedNumber = numberInput.replace(/\D/g, '');

    if (sanitizedNumber.length > 15) {
        sanitizedNumber = sanitizedNumber.slice(0, 15);
    }

    if (!numberRegex.test(sanitizedNumber)) {
        toast_function("warning", "WhatsApp Number should contain only numbers.");
    }

    inputElement.value = sanitizedNumber;
}


//-------------Add Feedback------------------------
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        callback(reader.result);
    };
    reader.onerror = function (error) {
        logger.error('Error converting file to base64:', error);
    };
}

const add_feedback = () => {

    let name = $('#name').val()
    let number = $('#number').val()
    let topic = $('#form-select').val()
    let imageInput = $('#Image_input')[0].files[0];
    let feedback = $('#feedback_text').val()

    // input validation
    if (name == "" || number == "" || topic == '' || feedback == '') {
        toast_function('warning', 'Please Enter all the required fields!');
        return;
    }

    if (number.length > 15) {
        toast_function('warning', 'WhatsApp Number cannot exceed 15 numbers!');
        return;
    }

    if (number.length < 10) {
        toast_function('warning', 'WhatsApp Number cannot be less than 10 numbers!');
        return;
    }

    if (feedback.length > 1500) {
        toast_function('warning', 'Feedback cannot exceed 1500 characters!');
        return;
    }

    data_dict = {
        'name': name,
        'number': number,
        'topic': topic,
        'feedback': feedback,
    };

    if (imageInput) {
        getBase64(imageInput, function (base64Image) {
            data_dict['link'] = base64Image;
            sendDataToServer(data_dict);
        });
    } else {
        sendDataToServer(data_dict); // If no image, just send the data without waiting
    }
}

function sendDataToServer(data_dict) {
    // Convert data_dict to JSON string
    data = JSON.stringify(data_dict);

    $.post(
        root + route,
        { 'op': 'create', 'data': data },
        function (response, status) {
            if (response === "success") {
                toast_function('success', 'Feedback Send Successfully!')
                $("input").val("");
                $("textarea").val("");
                $('#form-select').val('Default')
                $('#phone').val('Default')
            } else if (response == 'err_max_limit_reached') {
                toast_function('warning', 'You have already submitted feedback!')
            }
            else {
                toast_function('danger', 'Unable to send Feedback please try again later')
            }
        }
    ).fail(function (jqXHR, textStatus, errorThrown) { // Capture error details
        toast_function('danger', 'Unable to send Feedback please try again later')
        logger.error("Error: " + textStatus, errorThrown);
    });
}

$(document).ready(function () {
    

    $("input[type='file']").on("change", function () {
        try {
            if (this.files[0].size > 2000000) {
                toast_function('warning', 'Please upload a file less than 2MB. Thanks!!')
                $(this).val('');
                return;
            }
        }
        catch (e) { logger.error("File Removed!"); return }


        var allowed_ext = ['jpg', 'png', 'jpeg', 'txt', 'docx', 'doc', 'pdf']
        var curr_ext = $("#Image_input").val()
        curr_ext = curr_ext.split('.').pop();
        curr_ext = curr_ext.toLowerCase();
        logger.info("Extension:" + curr_ext)
        if (allowed_ext.includes(curr_ext)) {
            logger.info("Ext allowed")
        }
        else {
            toast_function("warning", "Only Image (jpg, jpeg, png) and document (txt, docx, pdf) allowed!")
            $(this).val('');
        }
    });

    $("#feedback_text").on("input", function () {
        var currentLength = $(this).val().length;
        var maxLength = 1500;

        $("#error_message").text(currentLength === maxLength ? "Maximum character limit reached (1500 characters)." : "");
    });
});

//---------- Trade Submit
document.querySelector("#send_feedback").addEventListener("click", () => {
    add_feedback();
});
