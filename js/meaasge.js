const Fetch_All_Message = () => {
    $.get(root, function (data, status) {
        All_message = data;
    }).done(function (response) {
        var htmlData = All_message

        var parsedData = $('<div>').html(htmlData);     // Parse the HTML data

        messages = [];                              // Initialize an array to store the messages

        parsedData.find('.chat-message').each(function () {     // Loop through each chat-message div
            var message = {};

            // Extract the message text
            var messageText = $(this).find('p').text().trim();
            message.message = messageText || '';

            // Extract the timestamp and convert it to a timestamp using moment.js
            var timestampText = $(this).find('.chat-time').text().trim();
            var timestamp = moment(timestampText, 'YYYY-MM-DD HH:mm').unix().valueOf();
            message.timestamp = timestamp || '';

            // Extract the image link if it exists
            var imageLink = $(this).find('img').attr('src');
            message.image = imageLink || '';

            // Add the message to the messages array
            messages.push(message);


            // $.post("https://tredcode.tradingcafeindia.com/api/admin/insert_signal_temp", { 'text': message.message, 'link': message.image, 'ts': message.timestamp },
            //     function (data, status) {
            //         All_signal = data;
            //     })
        });

    })
        .fail(function (response) {
            console.log("Error: " + response);
        });
};


$(document).ready(function () {

    $.ajaxSetup({ async: false }); // to stop async

    root = "https://ebs.tredcode.com/adminsignal";

    Fetch_All_Message()
});