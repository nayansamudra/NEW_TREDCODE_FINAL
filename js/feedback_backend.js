
route = '/api/feedback/curd_feedback'

//---------- Delete Signal
const del_feedback = (ts) => {

    delete_feedbacd_id = ts

};

const confirm_yes = () => {
    $('#delete_feedback_close').click()
    Yes_button_Clicked = true
    if (Yes_button_Clicked) {
        Yes_button_Clicked = false

        data_dict = {
            'feed_id': delete_feedbacd_id
        };

        data = JSON.stringify(data_dict);

        $.post(
            root + route,
            { 'op': 'delete', 'data': data },
            function (data, status) {
                if (data == "success") {
                    toast_function('success', 'Feedback deleted Successfully!')
                    Fetch_All_Feedback();
                }

            }
        ).fail(function (response) {
            logger.error("Error: " + response);
        });
    }
}


//------------- View Signal

function isImageURL(url) {
    // Define a list of known image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png'];

    // Extract the file extension from the URL
    const urlParts = url.split('.');
    if (urlParts.length > 1) {
        const extension = `.${urlParts[urlParts.length - 1]}`.toLowerCase();

        // Check if the extension is in the list of known image extensions
        return imageExtensions.includes(extension);
    }

    // If no extension or unrecognized extension, assume it's not an image
    return false;
}

const view_feedback = (ts, date) => {

    $('#modal_image').attr('src', '');
    $('#exampleModalLabe4').text('');
    $('#image_modal_email').text('');
    $('#image_modal_name').text('');
    $('#image_modal_number').text('');
    $('#image_modal_Topic').text('');
    $('#image_modal_file_link').html('');
    $('#image_modal_comments').text('');

    for (var i = 0; i < All_Feedback.length; i++) {
        if (date == All_Feedback[i][0]) {
            Modal_data = All_Feedback[i]
            break;
        }
    }

    if (isImageURL(Modal_data[5])) {
        $('#modal_image').attr('src', Modal_data[5]);
    }

    targetTimestamp = parseInt(ts);
    matchingFeedback = null;
    $.each(ts_feedback, function (index, item) {
        if (item.timestamp === targetTimestamp) {
            matchingFeedback = item.Feedback;
            return false; // Exit the loop when a match is found
        }
    });
    if (matchingFeedback !== null) {
        $('#image_modal_comments').text(matchingFeedback);
    }

    $('#exampleModalLabe4').text(Modal_data[0]);
    $('#image_modal_email').text(Modal_data[1]);
    $('#image_modal_name').text(Modal_data[2]);
    $('#image_modal_number').text(Modal_data[3]);
    $('#image_modal_Topic').text(Modal_data[4]);
    $('#image_modal_file_link').html(`<a href="${Modal_data[5]}" style="color:#ffc24f">${Modal_data[5]}</a>`);
    

}

//---------- Fetch All Signal
const Fetch_All_Feedback = () => {
    data_dict = {}
    data = JSON.stringify(data_dict);
    $.post(root + route, { 'op': 'read', 'data': data }, function (data, status) {
        All_Feedback = data;
        ts_feedback = []
        for (var i = 0; i < All_Feedback.length; i++) {
            feedback_data = JSON.parse(All_Feedback[i][2])
            // data pre preprocessing
            let ts = All_Feedback[i][0];
            let user_email = All_Feedback[i][1]
            let Image = feedback_data['link'] ? feedback_data['link'] : '';
            let Name = feedback_data['name']
            let Topic = feedback_data['topic']
            let Number = feedback_data['number']
            let Comments = feedback_data['feedback']

            ts_feedback.push({
                'timestamp': All_Feedback[i][0],
                'Feedback': feedback_data['feedback']
            })

            All_Feedback[i][0] = moment.unix(All_Feedback[i][0]).format("DD/MM/YYYY HH:mm:ss");
            All_Feedback[i][1] = user_email;
            All_Feedback[i][2] = Name;
            All_Feedback[i][3] = Number;
            All_Feedback[i][4] = Topic;
            All_Feedback[i][5] = Image;
            All_Feedback[i][6] = `<div class="w-100" style="cursor:pointer"><a href="#" data-toggle="tooltip" title="${Comments}">${shorten(Comments)}</a></div>`;
            var str =
                `<button class="m-2 Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="del_feedback('${ts}')">&nbsp;Delete&nbsp;</button>` +
                `<button class="m-2 Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal4" onclick="view_feedback('${ts}', '${All_Feedback[i][0]}')">&nbsp;View&nbsp;</button>`;
            All_Feedback[i][7] = str;
        }
        if (All_Feedback) {
            if (counter_for_datatable == 0) {
                counter_for_datatable += 1;
                datatable = $("#feedbackDatatable").DataTable({
                    paging: true,
                    pageLength: 50,
                    info: false,
                    scrollX: true,
                    scrollY: 550,
                    order: false
                });
            }
            datatable.clear();
            datatable.rows.add(All_Feedback);
            datatable.draw();
        }
    }).fail(function (response) {
        logger.error("Error: " + response);
    });
};



//---------- Shorten Function
const shorten = (text, length = 75) => {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    temp.push(text);
    text = text.substring(0, length);
    return text + "...";
};



//---------- Show_Hide Table
const show_hide = () => {
    counter_for_show_hide += 1;
    if (counter_for_show_hide % 2 == 0) {
        $('.wrapper_1_button').text('Hide')
        $('#table_datatable').show()
    }
    else {
        $('.wrapper_1_button').text('Show')
        $('#table_datatable').hide()
    }
}


//---------- On Ready - Refresh
$(document).ready(function () {

    $.ajaxSetup({ async: false }); // to stop async

    scrollPosition = 0;
    Yes_button_Clicked = false

    counter_for_datatable = 0;
    counter_for_show_hide = 0;
    temp = [];

    Fetch_All_Feedback();

    $("#feedbackDatatable tbody").on("click", "td", function () {
        var cell = $(this);
        var text = cell.text();

        if (
            cell.children().length === 0 &&
            cell.contents().length === 1 &&
            cell.contents()[0].nodeType === Node.TEXT_NODE
        ) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    logger.info("Text copied to clipboard: " + text);
                    toast_function('success', 'Text copied to clipboard')
                })
                .catch((err) => {
                    logger.error("Failed to copy text: " + err);
                    toast_function('danger', 'Failed to copy text')
                });
        }
    });
});

//---------- Intersection Observer - MODAL CLOSE - (page will not go back to top)
$(document).on("click", ".Modal_Open", function () {
    scrollPosition = window.scrollY;
});

//------ Close the modal and restore scroll position
$(document).on("click", ".close_modal", function () {
    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
    }, 350);
});