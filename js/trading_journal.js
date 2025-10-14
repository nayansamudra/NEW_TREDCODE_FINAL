
route = "/api/journal"

//-------------Add Trades------------------------
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        callback(reader.result);
    };
    reader.onerror = function (error) {
        logger.error('Error converting image to base64:', error);
    };
}

const add_trade = () => {
    let trade_type = ($('#checkbox').is(':checked')) ? 'Short' : 'Long';
    let entry_ts = Math.floor(new Date($('#Entry_date_time').val()).getTime() / 1000);
    let exit_ts = Math.floor(new Date($('#Exit_date_time').val()).getTime() / 1000);
    let symbol_Ticker = $('#Symbol_Ticker').val()
    let entry_price = $('#Entry_price').val()
    let exit_price = $('#Exit_price').val()
    let quantity = Math.abs($('#Quantity').val())
    let imageInput = $('#Image_input')[0].files[0];
    let find_Trade = $('#Find_Trade').val()
    let entry_reason = $('#Entry_reason').val()
    let exit_reason = $('#Exit_reason').val()
    let mistakes = $('#Mistakes').val()


    var inputValue = $('#Entry_date_time').val();
    var inputDate = new Date(inputValue);

    var dayOfWeek = inputDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        var startTime = new Date(inputDate);
        startTime.setHours(9, 15, 0, 0);
        var endTime = new Date(inputDate);
        endTime.setHours(15, 30, 0, 0);

        if (inputDate >= startTime && inputDate <= endTime) {
            logger.info("Date & Time are in correct range");
        } else {
            toast_function("warning", "Time is not between 9:15 AM and 3:30 PM.");
            return;
        }
    } else {
        toast_function("warning", "Date is not between Monday and Friday.");
        return;
    }

    var inputValue1 = $('#Exit_date_time').val();
    var inputDate1 = new Date(inputValue1);

    var dayOfWeek = inputDate1.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        var startTime = new Date(inputDate1);
        startTime.setHours(9, 15, 0, 0);
        var endTime = new Date(inputDate1);
        endTime.setHours(15, 30, 0, 0);

        if (inputDate1 >= startTime && inputDate1 <= endTime) {
            logger.info("Date & Time are in correct range");
        } else {
            toast_function("warning", "Time is not between 9:15 AM and 3:30 PM.");
            return;
        }
    } else {
        toast_function("warning", "Date is not between Monday and Friday.");
        return;
    }

    // input validation
    if (entry_ts == "" || exit_ts == "" || symbol_Ticker == '' || entry_price == '' || exit_price == '' || quantity == '') {
        toast_function('warning', 'Please Enter all fields!')
        return;
    } else if (quantity === '0' || quantity === 0) {
        toast_function('warning', 'Quantity cannot be zero')
        return;
    } else if (exit_ts < entry_ts) {
        toast_function('warning', 'Exit Date should be greater than Entry Date')
        return;
    }

    data_dict = {
        'trade_type': trade_type,
        'entry_ts': entry_ts,
        'exit_ts': exit_ts,
        'symbol_Ticker': symbol_Ticker,
        'entry_price': entry_price,
        'exit_price': exit_price,
        'quantity': quantity,
        'find_Trade': find_Trade,
        'entry_reason': entry_reason,
        'exit_reason': exit_reason,
        'mistakes': mistakes
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
        root + route + "/curd_journal",
        { 'op': 'create', 'data': data },
        function (response, status) {
            if (response === "success") {
                toast_function('success', 'Trade added Successfully!')
                $("input[type='datetime-local']").val("");
                $("input[type='text']").val("");
                $("input[type='number']").val("");
                $("input[type='file']").val("");
                $("textarea").val("");
                if (user_has_selected_range) {
                    view_trade()
                }
                $('#success_message').show()
                $('#add_update_table').hide()
                // $('#exampleModal1 .modal-title').css('color', '#3caf39 !important')
                $('#exampleModal1 .modal-title').text('')
                $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
                $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

                $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
                $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
                $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint')
            } else if (response == 'err_max_limit_reached') {
                toast_function('warning', 'Max limit for adding trade reached for today!')
            } else {
                toast_function('danger', 'Unable to add Trade please try later')
            }
        }
    ).fail(function (jqXHR, textStatus, errorThrown) { // Capture error details
        logger.error("Error: " + textStatus, errorThrown);
    });
}


//-------------Update Trades------------------------
const update_trade = (trade_id1, entry_ts1, exit_ts1, data1) => {

    $('#add_trade').click()

    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#success_message').hide()
    $('#add_update_table').show()
    $('#Image_input_row').hide()

    $('#exampleModal1 .modal-title').text('Update Trade Inputs:')

    trade_id = trade_id1

    var timestamp = entry_ts1; // Your timestamp
    var date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    var formattedDateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    $('#Entry_date_time').val(formattedDateTime);

    var timestamp = exit_ts1; // Your timestamp
    var date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    var formattedDateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    $('#Exit_date_time').val(formattedDateTime);

    if (data1['trade_type'] == 'Long') {
        $('#checkbox').prop('checked', false);
        $('#exampleModal1 .modal-header').css('background-color', '#3caf39')
        $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    } else if (data1['trade_type'] == 'Short') {
        $('#checkbox').prop('checked', true);
        $('#exampleModal1 .modal-header').css('background-color', '#fc5c5d')
        $('#exampleModal1 .modal-footer').css('background-color', '#fc5c5d')
    }

    if (data1.hasOwnProperty('link')) {
        image_link_present = true
        image_link = data1['link']
    } else {
        image_link_present = false
    }

    $('#Symbol_Ticker').val(data1['symbol_Ticker'])
    $('#Entry_price').val(data1['entry_price'])
    $('#Exit_price').val(data1['exit_price'])
    $('#Quantity').val(data1['quantity'])
    $('#Find_Trade').val(data1['find_Trade'])
    $('#Entry_reason').val(data1['entry_reason'])
    $('#Exit_reason').val(data1['exit_reason'])
    $('#Mistakes').val(data1['mistakes'])
}

const update_trade_API = (trade_id) => {

    let trade_type = ($('#checkbox').is(':checked')) ? 'Short' : 'Long';
    let entry_ts = Math.floor(new Date($('#Entry_date_time').val()).getTime() / 1000);
    let exit_ts = Math.floor(new Date($('#Exit_date_time').val()).getTime() / 1000);
    let symbol_Ticker = $('#Symbol_Ticker').val()
    let entry_price = $('#Entry_price').val()
    let exit_price = $('#Exit_price').val()
    let quantity = Math.abs($('#Quantity').val())
    let find_Trade = $('#Find_Trade').val()
    let entry_reason = $('#Entry_reason').val()
    let exit_reason = $('#Exit_reason').val()
    let mistakes = $('#Mistakes').val()

    var inputValue = $('#Entry_date_time').val();
    var inputDate = new Date(inputValue);

    var dayOfWeek = inputDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        var startTime = new Date(inputDate);
        startTime.setHours(9, 15, 0, 0);
        var endTime = new Date(inputDate);
        endTime.setHours(15, 30, 0, 0);

        if (inputDate >= startTime && inputDate <= endTime) {
            logger.info("Date and time are in correct range.");
        } else {
            toast_function("warning", "Time is not between 9:15 AM and 3:30 PM.");
            return;
        }
    } else {
        toast_function("warning", "Date is not between Monday and Friday.");
        return;
    }

    var inputValue1 = $('#Exit_date_time').val();
    var inputDate1 = new Date(inputValue1);

    var dayOfWeek = inputDate1.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        var startTime = new Date(inputDate1);
        startTime.setHours(9, 15, 0, 0);
        var endTime = new Date(inputDate1);
        endTime.setHours(15, 30, 0, 0);

        if (inputDate1 >= startTime && inputDate1 <= endTime) {
            logger.info("Date and time are in correct range.");
        } else {
            toast_function("warning", "Time is not between 9:15 AM and 3:30 PM.");
            return;
        }
    } else {
        toast_function("warning", "Date is not between Monday and Friday.");
        return;
    }

    // input validation
    if (entry_ts == "" || exit_ts == "" || symbol_Ticker == '' || entry_price == '' || exit_price == '' || quantity == '') {
        toast_function('warning', 'Please Enter all fields!')
        return;
    } else if (quantity == '0' || quantity == 0) {
        toast_function('warning', 'Quantity cannot be zero')
        return;
    } else if (exit_ts < entry_ts) {
        toast_function('warning', 'Exit Date should be greater than Entry Date')
        return;
    }

    data_dict = {
        'trade_id': trade_id,
        'trade_type': trade_type,
        'entry_ts': entry_ts,
        'exit_ts': exit_ts,
        'symbol_Ticker': symbol_Ticker,
        'entry_price': entry_price,
        'exit_price': exit_price,
        'quantity': quantity,
        'find_Trade': find_Trade,
        'entry_reason': entry_reason,
        'exit_reason': exit_reason,
        'mistakes': mistakes
    };

    if (image_link_present) {
        data_dict['link'] = image_link
    }

    data = JSON.stringify(data_dict);

    $.post(
        root + route + "/curd_journal",
        { 'op': 'update', 'data': data },
        function (data, status) {
            if (data == "success") {
                toast_function('success', 'Trade updated Successfully!')

                $('#checkbox').prop('checked', false);
                $("input[type='datetime-local']").val("");
                $("input[type='text']").val("");
                $("input[type='number']").val("");
                $("input[type='file']").val("");
                $("textarea").val("");

                if (user_has_selected_range) {
                    view_trade()
                }
            } else {
                toast_function('danger', 'Unable to update Trade please try later')
            }

            $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
            $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
            $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
            $('#Image_input_row').show()

            $('#success_message').hide()
            $('#add_update_table').show()

            $('#add_n_update_trade_close').click()

            $('#exampleModal1 .modal-title').text('Add Trade Inputs:')
            $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
            $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

        }
    ).fail(function (response) {
        logger.error("Error: " + response);
    });
}

//-------------View Trades------------------------
const view_trade = () => {
    trade_type = ($('#checkbox1').is(':checked')) ? 'Select' : 'All';

    entry_ts = Math.floor(new Date($('#Entry_date').val()).getTime() / 1000);
    exit_ts = Math.floor(new Date($('#Exit_date').val()).getTime() / 1000);

    if (trade_type == 'All') {
        data_dict = {}
        exit_ts = Date.now() / 1000
    } else {
        if ($('#Entry_date').val() == "" || $('#Exit_date').val() == "") {
            toast_function('warning', 'Please Enter all fields!')
            return;
        } else {
            data_dict = {
                'start_time': entry_ts,
                'end_time': exit_ts,
            };
        }
    }

    exit_ts_month = parseInt(moment.unix(exit_ts).format('MM'))
    exit_ts_year = parseInt(moment.unix(exit_ts).format('YYYY'))

    data = JSON.stringify(data_dict);

    $.post(
        root + route + "/curd_journal",
        { 'op': 'read', 'data': data },
        function (data, status) {
            view_trade_data = data
            if (status == "success") {
                $('#view_trade_close').click()
                if (view_trade_data.length != 0) {

                    $('#TradeBook_warning_message').text('')

                    empty_value()

                    print_view_data()
                    all_stats()
                    dataTable()
                    dataTable_monthly()
                    $('#equity_curve_container').show()
                    $('#day_chart_and_monthly_table').show()
                    $('#tradelist_table').show()
                    winner_losser()
                } else {
                    // alert('No Data / Empty Array');
                    toast_function('danger', 'No Data')

                    $('#TradeBook_warning_message').text('Please select the range to see the data')

                    empty_value()
                    empty_table_chart()
                }
            } else {
                // alert("Error");
                toast_function('danger', 'Error')
            }
        }
    ).fail(function (response) {
        logger.error("Error: " + response);
    });
}

const print_view_data = () => {
    print_data = []
    var temp = {}
    for (var i = 0; i < view_trade_data.length; i++) {
        parse_data = JSON.parse(view_trade_data[i][4])
        if (parse_data['trade_type'] == 'Long') {
            count = (parseFloat(parse_data['exit_price']) - parseFloat(parse_data['entry_price'])) * parseFloat(parse_data['quantity'])
        } else if (parse_data['trade_type'] == 'Short') {
            count = (parseFloat(parse_data['entry_price']) - parseFloat(parse_data['exit_price'])) * parseFloat(parse_data['quantity'])
        }
        temp['count'] = count
        // temp['count'] = Math.abs(count)
        temp['date'] = moment.unix(view_trade_data[i][3]).format('YYYY-MM-DD')
        print_data.push(temp)
        temp = {}
    }

    resultMap = {};
    print_data.forEach(entry => {
        if (resultMap.hasOwnProperty(entry.date)) {
            resultMap[entry.date].count += entry.count;
            resultMap[entry.date].no_of_trades += 1;
        } else {
            resultMap[entry.date] = {
                count: entry.count,
                date: entry.date,
                no_of_trades: 1
            };
        }
    });
    resultArray = Object.values(resultMap);

    $("#CalendarHeatmap").CalendarHeatmap('updateOptions', {
        lastMonth: exit_ts_month,
        lastYear: exit_ts_year,
    });
    $("#CalendarHeatmap").CalendarHeatmap('updateDates', resultArray);

    count_Array = []
    for (var i = 0; i < resultArray.length; i++) {
        count_Array.push(resultArray[i]['count'])
        x_axis.push(resultArray[i]['date'])
        y_axis.push(resultArray[i]['count'])
        x_axis1.push(resultArray[i]['date'])
        y_axis1.push(resultArray[i]['count'])
    }
    let value = checkArrayValues(count_Array)

    x_axis = x_axis.reverse()
    y_axis = y_axis.reverse()
    x_axis1 = x_axis1.reverse()
    y_axis1 = y_axis1.reverse()
    var sum = 0;
    var cumulativeArray = [];
    for (var i = 0; i < y_axis.length; i++) {
        sum += y_axis[i];
        cumulativeArray.push(sum);
    }

    y_axis = cumulativeArray

    if (value == 'Negative') {
        positiveArray = count_Array;
        minValue = Math.min(...positiveArray);
        maxValue = Math.max(...positiveArray);
        numSubranges = 3;
        subranges = calculateSubranges(minValue, maxValue, numSubranges);
        subranges1 = []
        temp = {}
        for (var i = 0; i < subranges.length; i++) {
            temp['start'] = subranges[i]['start']
            temp['end'] = subranges[i]['end']
            if (i == 0) {
                temp['color'] = '#f90e03'
                temp['class'] = ['ch-day', 'lvl-0', 'green-0']
            } else if (i == 1) {
                temp['color'] = '#fe5858'
                temp['class'] = ['ch-day', 'lvl-1', 'green-1']
            } else if (i == 2) {
                temp['color'] = '#ff8a8a'
                temp['class'] = ['ch-day', 'lvl-2', 'green-2']
            }
            subranges1.push(temp)
            temp = {}
        }
    } else if (value == 'Positive') {
        positiveArray = count_Array;
        minValue = Math.min(...positiveArray);
        maxValue = Math.max(...positiveArray);
        numSubranges = 3;
        subranges = calculateSubranges(minValue, maxValue, numSubranges);
        subranges1 = []
        temp = {}
        for (var i = 0; i < subranges.length; i++) {
            temp['start'] = subranges[i]['start']
            temp['end'] = subranges[i]['end']
            if (i == 0) {
                temp['color'] = '#8ed98e'
                temp['class'] = ['ch-day', 'lvl-3', 'green-3']
            } else if (i == 1) {
                temp['color'] = '#6bd368'
                temp['class'] = ['ch-day', 'lvl-4', 'green-4']
            } else if (i == 2) {
                temp['color'] = '#33d026'
                temp['class'] = ['ch-day', 'lvl-5', 'green-5']
            }
            subranges1.push(temp)
            temp = {}
        }
    } else if (value == 'Mixed') {
        positiveArray = count_Array;
        minValue = Math.min(...positiveArray);
        maxValue = -0.1
        numSubranges = 3;
        subranges = calculateSubranges(minValue, maxValue, numSubranges);
        subranges1 = []
        temp = {}
        for (var i = 0; i < subranges.length; i++) {
            temp['start'] = subranges[i]['start']
            temp['end'] = subranges[i]['end']
            if (i == 0) {
                temp['color'] = '#f90e03'
                temp['class'] = ['ch-day', 'lvl-0', 'green-0']
            } else if (i == 1) {
                temp['color'] = '#fe5858'
                temp['class'] = ['ch-day', 'lvl-1', 'green-1']
            } else if (i == 2) {
                temp['color'] = '#ff8a8a'
                temp['class'] = ['ch-day', 'lvl-2', 'green-2']
            }
            subranges1.push(temp)
            temp = {}
        }
        // subranges1.push({ 'start': 0, 'end': 0, 'color': '#ecebeb' })
        minValue = 0
        maxValue = Math.max(...positiveArray);
        numSubranges = 3;
        subranges = calculateSubranges(minValue, maxValue, numSubranges);
        temp = {}
        for (var i = 0; i < subranges.length; i++) {
            temp['start'] = subranges[i]['start']
            temp['end'] = subranges[i]['end']
            if (i == 0) {
                temp['color'] = '#8ed98e'
                temp['class'] = ['ch-day', 'lvl-3', 'green-3']
            } else if (i == 1) {
                temp['color'] = '#6bd368'
                temp['class'] = ['ch-day', 'lvl-4', 'green-4']
            } else if (i == 2) {
                temp['color'] = '#33d026'
                temp['class'] = ['ch-day', 'lvl-5', 'green-5']
            }
            subranges1.push(temp)
            temp = {}
        }
    }

    setTimeout(() => {
        const chDays = document.querySelectorAll('.ch-day');
        chDays.forEach(day => {
            const dataVal = day.getAttribute('data-val'); // Get the 'data-val' attribute
            if (dataVal !== null) {
                const parsedDataVal = parseInt(dataVal);
                if (!isNaN(parsedDataVal)) {
                    for (const range of subranges1) {
                        if (parsedDataVal >= range.start && parsedDataVal <= range.end) {
                            // Remove any existing classes on the element
                            day.classList = [];
                            // Add the new classes based on the array of classes in the range
                            day.classList.add(...range.class);
                            break; // Exit the loop once a matching range is found
                        }
                    }
                }
            }
        });
    }, 300);


    const chlvls = document.querySelectorAll('.ch-lvl');
    chlvls.forEach(day => {
        day.setAttribute('data-title', '')
    });

    resize_function()
    updateCalendar(exit_ts)

    // ---- updating Equity Curve - canvas chart (chart.js) 
    function addData(chart) {
        chart.data.labels = x_axis;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = y_axis;
        });
        chart.update();
    }
    addData(chart_1);

    // ----- updating bar chart - ApexchartChart
    dayCounts = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0
    };
    resultArray.forEach(function (item) {
        var date = new Date(item.date);
        var dayOfWeek = date.toLocaleDateString('en-IN', { weekday: 'long' });
        // Check if the day of the week is Monday, Tuesday, Wednesday, Thursday, or Friday
        if (dayCounts.hasOwnProperty(dayOfWeek)) {
            dayCounts[dayOfWeek] += item.count;
        }
    });

    apexchart.updateSeries([{
        data: Object.values(dayCounts)
    }])

    apexchart_Daily_PnL.updateOptions({
        xaxis: {
            type: 'Text',
            categories: x_axis1,
        }
    })
    apexchart_Daily_PnL.updateSeries([{
        data: y_axis1
    }])
}

const all_stats = () => {

    var smallestExitTimestamp = Number.MAX_SAFE_INTEGER;
    var largestExitTimestamp = Number.MIN_SAFE_INTEGER;

    for (var i = 0; i < view_trade_data.length; i++) {
        var entryTimestamp = parseInt(view_trade_data[i][3]);
        var exitTimestamp = parseInt(view_trade_data[i][3]);

        if (entryTimestamp < smallestExitTimestamp) {
            smallestExitTimestamp = entryTimestamp;
        }

        if (exitTimestamp > largestExitTimestamp) {
            largestExitTimestamp = exitTimestamp;
        }
    }

    // Calculting value and storing in result dict
    result = {
        "Total_Profit": 0,
        "Total_Trades": 0,
        "Avg_Winner": 0,
        "Avg_Losser": 0,
        "Biggest_Winner": 0,
        "Biggest_Loss": 0,
        "Average_pnl": 0,
        "Risk_Reward": 0
    };

    profitMakingCount = 0;
    lossMakingCount = 0;
    sumProfitMakingTrades = 0;
    sumLossMakingTrades = 0;

    for (var i = 0; i < resultArray.length; i++) {
        var entry = resultArray[i];
        result.Total_Profit += entry.count;
        result.Total_Trades += entry.no_of_trades;

        if (entry.count > result.Biggest_Winner) {
            result.Biggest_Winner = entry.count;
        }
        if (entry.count < result.Biggest_Loss) {
            result.Biggest_Loss = entry.count;
        }
        if (entry.count > 0) {
            profitMakingCount += entry.no_of_trades;
            sumProfitMakingTrades += entry.count;
        } else if (entry.count < 0) {
            lossMakingCount += entry.no_of_trades;
            sumLossMakingTrades += entry.count;
        }
    }

    result.Biggest_Winner = 0
    result.Biggest_Loss = 0

    for (var i = 0; i < print_data.length; i++) {
        var entry = print_data[i];

        if (entry.count > result.Biggest_Winner) {
            result.Biggest_Winner = entry.count;
        }
        if (entry.count < result.Biggest_Loss) {
            result.Biggest_Loss = entry.count;
        }
    }

    if (resultArray.length > 0) {
        result.Avg_Winner = (sumProfitMakingTrades / profitMakingCount);
        if (isNaN(result.Avg_Winner)) { result.Avg_Winner = 0 }

        result.Avg_Losser = (sumLossMakingTrades / lossMakingCount);
        if (isNaN(result.Avg_Losser)) { result.Avg_Losser = 0 }

        result.Average_pnl = (result.Total_Profit / result.Total_Trades);
        if (isNaN(result.Average_pnl)) { result.Average_pnl = 0 }
    }

    for (var key in result) {
        if (key !== 'Risk_Reward' && key !== 'Total_Trades') {
            result[key] = format_Currency(result[key]);
        }
    }

    $('.selected_range').show()

    $('#All_stats_Entry_date').text(moment.unix(smallestExitTimestamp).format('YYYY-MM-DD'))
    $('#All_stats_Exit_date').text(moment.unix(largestExitTimestamp).format('YYYY-MM-DD'))

    $('#total_profits').text(result.Total_Profit[0])
    $('#avg_winner').text(result.Avg_Winner[0])
    $('#avg_losser').text(result.Avg_Losser[0])
    $('#biggest_win').text(result.Biggest_Winner[0])
    $('#biggest_win1').text(result.Biggest_Winner[0])
    $('#biggest_loss').text(result.Biggest_Loss[0])
    $('#biggest_loss1').text(result.Biggest_Loss[0])
    $('#avg_pnl').text(result.Average_pnl[0])

    $('#total_profits').attr('data-title', result.Total_Profit[2])
    $('#avg_winner').attr('data-title', result.Avg_Winner[2])
    $('#avg_losser').attr('data-title', result.Avg_Losser[2])
    $('#biggest_win').attr('data-title', result.Biggest_Winner[2])
    $('#biggest_win1').attr('data-title', result.Biggest_Winner[2])
    $('#biggest_loss').attr('data-title', result.Biggest_Loss[2])
    $('#biggest_loss1').attr('data-title', result.Biggest_Loss[2])
    $('#avg_pnl').attr('data-title', result.Average_pnl[2])

    $('#total_trades').text(result.Total_Trades)

    if (parseFloat(result.Avg_Losser[1]) != 0) {
        $('#risk_reward').text('1:' + Math.abs(parseFloat(parseFloat(result.Avg_Winner[1]).toFixed(2) / parseFloat(result.Avg_Losser[1]).toFixed(2)).toFixed(2)))
    } else if (parseFloat(result.Avg_Losser[1]) == 0) {
        $('#risk_reward').text('1:---')
    }

    if (result.Total_Profit[1] >= 0) {
        $('#total_profits').css('color', 'rgb(123, 219, 123)')
    } else {
        $('#total_profits').css('color', 'rgb(252, 92, 93)')
    }

    if (result.Average_pnl[1] >= 0) {
        $('#avg_pnl').css('color', 'rgb(123, 219, 123)')
    } else {
        $('#avg_pnl').css('color', 'rgb(252, 92, 93)')
    }

    updateCalendar(largestExitTimestamp)

    exit_ts_month = parseInt(moment.unix(largestExitTimestamp).format('MM'))
    exit_ts_year = parseInt(moment.unix(largestExitTimestamp).format('YYYY'))

    $("#CalendarHeatmap").CalendarHeatmap('updateOptions', {
        lastMonth: exit_ts_month,
        lastYear: exit_ts_year,
    });

    resize_function()
}

const dataTable = () => {
    if (Array.isArray(view_trade_data)) {
        if (view_trade_data.length != 0) {
            data_table_array = []
            for (var i = 0; i < view_trade_data.length; i++) {
                parse_data = JSON.parse(view_trade_data[i][4])
                if (parse_data['trade_type'] == 'Long') {
                    status1 = (parseFloat(parse_data['exit_price']) - parseFloat(parse_data['entry_price'])) * parseFloat(parse_data['quantity'])
                    roc = (parseFloat(parse_data['exit_price']) - parseFloat(parse_data['entry_price'])) / parseFloat(parse_data['entry_price']) * 100 * 1
                    roc = parseFloat(roc.toFixed(2))
                } else if (parse_data['trade_type'] == 'Short') {
                    status1 = (parseFloat(parse_data['entry_price']) - parseFloat(parse_data['exit_price'])) * parseFloat(parse_data['quantity'])
                    roc = (parseFloat(parse_data['exit_price']) - parseFloat(parse_data['entry_price'])) / parseFloat(parse_data['entry_price']) * 100 * (-1)
                    roc = parseFloat(roc.toFixed(2))
                }

                if (parse_data.hasOwnProperty('link')) {
                    image_is_there = true
                    action = `<i class="fa-regular fa-eye fa-xl Modal_Open" id="fa-eye-${i}" style="color: #fff; cursor:pointer" data-bs-toggle="modal" data-bs-target="#exampleModal4" onclick="view_trade_image('image', ${view_trade_data[i][0]})"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-trash fa-xl Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="delete_trade(${view_trade_data[i][0]})" style="cursor:pointer"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-pen-to-square fa-xl" onclick='update_trade(${view_trade_data[i][0]}, ${view_trade_data[i][2]}, ${view_trade_data[i][3]}, ${view_trade_data[i][4]})' style="cursor:pointer"></i>`
                } else {
                    image_is_there = false
                    action = `<i class="fa-regular fa-eye fa-xl Modal_Open" id="fa-eye-${i}" style="color: #fff; cursor:pointer" data-bs-toggle="modal" data-bs-target="#exampleModal4" onclick="view_trade_image('no_image', ${view_trade_data[i][0]})"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-trash fa-xl Modal_Open" data-bs-toggle="modal" data-bs-target="#exampleModal3" onclick="delete_trade(${view_trade_data[i][0]})" style="cursor:pointer"></i>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-pen-to-square fa-xl" onclick='update_trade(${view_trade_data[i][0]}, ${view_trade_data[i][2]}, ${view_trade_data[i][3]}, ${view_trade_data[i][4]})' style="cursor:pointer"></i>`
                }

                if (parseFloat(status1).toFixed(2) >= 0) {
                    data_table_array.push([
                        'WIN',
                        [moment.unix(view_trade_data[i][2]).format('DD/MM/YY HH:mm'), moment.unix(view_trade_data[i][2]).format('MMM DD, YYYY HH:mm'), view_trade_data[i][0]],
                        [moment.unix(view_trade_data[i][3]).format('DD/MM/YY HH:mm'), moment.unix(view_trade_data[i][3]).format('MMM DD, YYYY HH:mm')],
                        parse_data['symbol_Ticker'],
                        format_Currency(parse_data['entry_price']),
                        format_Currency(parse_data['exit_price']),
                        parse_data['quantity'],
                        parse_data['trade_type'],
                        format_Currency(status1),
                        roc,
                        action,
                        view_trade_data[i][0]
                    ])
                } else {
                    data_table_array.push([
                        'LOSS',
                        [moment.unix(view_trade_data[i][2]).format('DD/MM/YY HH:mm'), moment.unix(view_trade_data[i][2]).format('MMM DD, YYYY HH:mm'), view_trade_data[i][0]],
                        [moment.unix(view_trade_data[i][3]).format('DD/MM/YY HH:mm'), moment.unix(view_trade_data[i][3]).format('MMM DD, YYYY HH:mm')],
                        parse_data['symbol_Ticker'],
                        format_Currency(parse_data['entry_price']),
                        format_Currency(parse_data['exit_price']),
                        parse_data['quantity'],
                        parse_data['trade_type'],
                        format_Currency(status1),
                        roc,
                        action,
                        view_trade_data[i][0]
                    ])
                }
            }

            if (counter_for_data_table == 0) {
                counter_for_data_table += 1;
                data_table = $("#dataTable").DataTable({
                    data: data_table_array,
                    columnDefs: [
                        { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], className: "dt-body-start" },
                    ],
                    fnRowCallback: function (nRow, aData) {

                        if (aData[0] == 'WIN') {
                            $("td:eq(0)", nRow).html(`<div class='px-1 py-1 rounded' style='background: rgb(123, 219, 123); color:#257125;'>` + aData[0] + "</div>");
                        } else {
                            $("td:eq(0)", nRow).html(`<div class='px-1 py-1 rounded' style='background: rgb(252, 92, 93); color:#712525;'>` + aData[0] + "</div>");
                        }

                        $("td:eq(1)", nRow).html(`<div class='px-1 py-1 rounded' data-title-table='${aData[1][1]}'>` + aData[1][0] + "</div>");
                        $("td:eq(2)", nRow).html(`<div class='px-1 py-1 rounded' data-title-table='${aData[2][1]}'>` + aData[2][0] + "</div>");

                        if (aData[7] == 'Long') {
                            $("td:eq(7)", nRow).html(`<div class='mx-2 my-2 px-1 py-1 rounded' style='border:1px solid rgb(123, 219, 123);'>` + aData[7] + "</div>");
                        } else {
                            $("td:eq(7)", nRow).html(`<div class='mx-2 my-2 px-1 py-1 rounded' style='border:1px solid rgb(252, 92, 93);'>` + aData[7] + "</div>");
                        }

                        if (aData[8][1] >= 0) {
                            $("td:eq(8)", nRow).html(`<div class='px-1 py-1' style='color:#7BDB7B;' data-title-table='${aData[8][2]}'>` + aData[8][0] + "</div>");
                        } else {
                            $("td:eq(8)", nRow).html(`<div class='px-1 py-1' style='color:#FC5C5D;' data-title-table='${aData[8][2]}'>` + aData[8][0] + "</div>");
                        }

                        if (aData[9] >= 0) {
                            $("td:eq(9)", nRow).html(`<div class='px-1 py-1' style='color:#7BDB7B;'>` + aData[9] + "%</div>");
                        } else {
                            $("td:eq(9)", nRow).html(`<div class='px-1 py-1' style='color:#FC5C5D;'>- ` + Math.abs(aData[9]) + "%</div>");
                        }

                        $("td:eq(3)", nRow).html(`<div class='px-1 py-1' style='color:#ffbd5a;' data-title-table='${aData[3]}'>` + aData[3] + "</div>");
                        $("td:eq(6)", nRow).html(`<div class='px-1 py-1' style='color:#ffbd5a;' data-title-table='${aData[6]}'>` + aData[6] + "</div>");

                        $("td:eq(4)", nRow).html(`<div class='px-1 py-1' data-title-table='${aData[4][2]}'>` + aData[4][0] + "</div>");
                        $("td:eq(5)", nRow).html(`<div class='px-1 py-1' data-title-table='${aData[5][2]}'>` + aData[5][0] + "</div>");

                        $("td:eq(0)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(1)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(2)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(3)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(4)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(5)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(6)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(7)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(8)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                        $("td:eq(9)", nRow).addClass("Modal_Open").attr({ "data-bs-toggle": "modal", "data-bs-target": "#exampleModal4", "onclick": `view_trade_image('image', '${aData[1][2]}')` });
                    },
                    autoWidth: false,
                    paging: false,
                    info: false,
                    ordering: false,
                    order: [[1, "asc"]],
                    searching: false,
                });
            } else if (counter_for_data_table > 0) {

                data_table.clear();
                data_table.rows.add(data_table_array);
                data_table.draw();
            }
        }
    }
}

const dataTable_monthly = () => {

    if (Array.isArray(resultArray)) {
        if (resultArray.length != 0) {

            function getYearMonth(dateString) {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Adding 1 because months are zero-indexed
                return `${year}-${month < 10 ? '0' + month : month}`;
            }

            function createMonthlyTotalArray(resultArray) {
                const monthlyTotals = {};

                resultArray.forEach(entry => {
                    const yearMonth = getYearMonth(entry.date);
                    if (!monthlyTotals[yearMonth]) {
                        monthlyTotals[yearMonth] = 0;
                    }
                    monthlyTotals[yearMonth] += entry.count;
                });

                const years = Array.from(new Set(resultArray.map(entry => getYearMonth(entry.date).split('-')[0])));
                const months = Array.from({ length: 12 }, (_, index) => index + 1);

                const resultArray1 = [];

                years.forEach(year => {
                    const yearTotal = [year];
                    let yearlyTotal = 0;
                    months.forEach(month => {
                        const yearMonth = `${year}-${month < 10 ? '0' + month : month}`;
                        if (monthlyTotals[yearMonth]) {
                            yearTotal.push(monthlyTotals[yearMonth]);
                            yearlyTotal += monthlyTotals[yearMonth];
                        } else {
                            yearTotal.push(0);
                        }
                    });
                    yearTotal.push(yearlyTotal);
                    resultArray1.push(yearTotal);
                });

                const verticalTotalRow = ['Total'];
                months.forEach(month => {
                    let monthTotal = 0;
                    years.forEach(year => {
                        const yearMonth = `${year}-${month < 10 ? '0' + month : month}`;
                        if (monthlyTotals[yearMonth]) {
                            monthTotal += monthlyTotals[yearMonth];
                        }
                    });
                    verticalTotalRow.push(monthTotal);
                });

                const grandTotal = verticalTotalRow.slice(1).reduce((total, value) => total + value, 0);
                verticalTotalRow.push(grandTotal);

                resultArray1.push(verticalTotalRow);

                resultArray1.sort((a, b) => b[0] - a[0]);

                return resultArray1;
            }

            data_table_array_monthly = createMonthlyTotalArray(resultArray);

            new_data_table_array_monthly = []
            temp_array = []
            for (var i = 0; i < data_table_array_monthly.length; i++) {
                temp_array.push(data_table_array_monthly[i][0])
                for (var j = 1; j < data_table_array_monthly[i].length; j++) {
                    temp_array.push(format_Currency(data_table_array_monthly[i][j]))
                }
                new_data_table_array_monthly.push(temp_array)
                temp_array = []
            }
            data_table_array_monthly = new_data_table_array_monthly

            if (counter_for_data_table_monthly == 0) {
                counter_for_data_table_monthly += 1;
                data_table_monthly = $("#Monthly_dataTable").DataTable({
                    data: data_table_array_monthly,
                    columnDefs: [
                        { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], className: "dt-body-start" },
                    ],
                    fnRowCallback: function (nRow, aData) {

                        $("td:eq(0)", nRow).html("<div class='px-1 py-1' style='color:#ffbd5a'>" + aData[0] + "</div>");
                        for (var j = 0; j < data_table_array_monthly.length; j++) {
                            for (var i = 1; i < 14; i++) {
                                if (aData[i][1] > 0) {
                                    $(`td:eq(${i})`, nRow).html(`<div class='mx-0 my-1 px-0 py-1 rounded' style='color:rgb(123, 219, 123)' data-title-monthtable='${aData[i][2]}'>` + aData[i][0] + "</div>");
                                } else if (aData[i][1] < 0) {
                                    $(`td:eq(${i})`, nRow).html(`<div class='mx-0 my-1 px-0 py-1 rounded' style='color:rgb(252, 92, 93)' data-title-monthtable='${aData[i][2]}'>` + aData[i][0] + "</div>");
                                } else if (aData[i][1] == 0) {
                                    $(`td:eq(${i})`, nRow).html(`<div class='mx-0 my-1 px-0 py-1 rounded' style='color:#fff' data-title-monthtable='${aData[i][2]}'>` + aData[i][0] + "</div>");
                                }
                            }
                        }
                    },
                    autoWidth: false,
                    paging: false,
                    info: false,
                    order: [[0, "asc"]],
                    ordering: false,
                    searching: false,
                });
            } else if (counter_for_data_table > 0) {

                data_table_monthly.clear();
                data_table_monthly.rows.add(data_table_array_monthly);
                data_table_monthly.draw();
            }
        }
    }



}


/*-------------- ALL HELPER FUNCTION - START ---------------*/

// All array value are +ve, -ve or mix
function checkArrayValues(arr) {
    let allPositive = true;
    let allNegative = true;

    for (const value of arr) {
        if (value > 0) {
            allNegative = false;
        } else if (value < 0) {
            allPositive = false;
        }
    }

    if (allPositive) {
        return "Positive";
    } else if (allNegative) {
        return "Negative";
    } else {
        return "Mixed";
    }
}

function calculateSubranges(min, max, numSubranges) {
    const rangeSize = (max - min + 1) / numSubranges;
    const subranges = [];

    for (let i = 0; i < numSubranges; i++) {
        const startValue = min + i * rangeSize;
        const endValue = startValue + rangeSize - 1;
        // subranges.push({ start: startValue.toFixed(0), end: endValue.toFixed(0) });
        subranges.push({ start: parseInt(startValue), end: parseInt(endValue) });
    }

    return subranges;
}

function extractTimestamp(text) {
    const datePattern = /(\d{2}-\d{2}-\d{2})/; // Updated regex pattern for "DD-MM-YY"
    const match = text.match(datePattern);
    if (match) {
        const dateString = match[1];

        const [day, month, year] = dateString.split("-");

        const date = new Date(`20${year}`, parseInt(month) - 1, day);

        const timestamp = date.getTime() / 1000;
        return timestamp;
    }
    return null;
}

function empty_value() {
    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    $('#All_stats_Entry_date').text('------')
    $('#All_stats_Exit_date').text('------')

    $('#total_profits').text('------')
    $('#avg_winner').text('------')
    $('#avg_losser').text('------')
    $('#biggest_win').text('------')
    $('#biggest_win1').text('------')
    $('#biggest_loss').text('------')
    $('#biggest_loss1').text('------')
    $('#avg_pnl').text('------')
    $('#total_trades').text('------')
    $('#risk_reward').text('------')

    $('#Top_Winner_1_Name').text('Winner 1')
    $('#Top_Winner_1_Value').text('-------')
    $('#Top_Winner_2_Name').text('Winner 2')
    $('#Top_Winner_2_Value').text('-------')
    $('#Top_Winner_3_Name').text('Winner 3')
    $('#Top_Winner_3_Value').text('-------')

    $('#Top_Losser_1_Name').text('Losser 1')
    $('#Top_Losser_1_Value').text('-------')
    $('#Top_Losser_2_Name').text('Losser 2')
    $('#Top_Losser_2_Value').text('-------')
    $('#Top_Losser_3_Name').text('Losser 3')
    $('#Top_Losser_3_Value').text('-------')
}

function empty_table_chart() {
    if (counter_for_data_table_monthly == 1) {
        data_table_array_monthly = []
        data_table_monthly.clear();
        data_table_monthly.rows.add(data_table_array_monthly);
        data_table_monthly.draw();
    }

    if (counter_for_data_table == 1) {
        data_table_array = []
        data_table.clear();
        data_table.rows.add(data_table_array);
        data_table.draw();
    }


    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    function addData(chart) {
        chart.data.labels = x_axis;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = y_axis;
        });
        chart.update();
    }
    addData(chart_1);

    apexchart.updateSeries([{
        data: []
    }])

    apexchart_Daily_PnL.updateOptions({
        xaxis: {
            type: 'Text',
            categories: x_axis1,
        }
    })
    apexchart_Daily_PnL.updateSeries([{
        data: y_axis1
    }])

    resultArray = []
    $("#CalendarHeatmap").CalendarHeatmap('updateDates', resultArray);

    $("#CalendarHeatmap").CalendarHeatmap('updateOptions', {
        lastMonth: moment().month() + 1,
        lastYear: moment().year(),
    });

    resize_function()

    calendar.setDate(moment().format("YYYY-MM-DD"));

    $('#equity_curve_container').hide()
    $('#day_chart_and_monthly_table').hide()
    $('#tradelist_table').hide()

    user_has_selected_range = false

}

function format_Currency(value) {
    var floatValue = parseFloat(value);
    var symbol = floatValue >= 0 ? '₹' : '- ₹';
    floatValue = Math.abs(floatValue);
    var formattedValue = '';

    if (floatValue >= 10000000) {
        formattedValue = (floatValue / 10000000).toFixed(2) + 'Cr';
    } else if (floatValue >= 100000) {
        formattedValue = (floatValue / 100000).toFixed(2) + 'L';
    } else if (floatValue >= 1000) {
        formattedValue = (floatValue / 1000).toFixed(2) + 'k';
    } else if (floatValue == 0) {
        formattedValue = floatValue;
    } else {
        formattedValue = floatValue.toFixed(2);
    }

    var oldValueWithSymbol = value >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

    return [symbol + formattedValue, value, oldValueWithSymbol];
}

/*-------------- ALL HELPER FUNCTION - END ---------------*/


//-------------Delete Trades------------------------
const delete_trade = (trade_id) => {

    delete_trade_id = trade_id
}

const confirm_yes = () => {
    Yes_button_Clicked = true
    if (Yes_button_Clicked) {
        Yes_button_Clicked = false
        data_dict = {
            'trade_id': delete_trade_id
        };

        data = JSON.stringify(data_dict);

        $.post(
            root + route + "/curd_journal",
            { 'op': 'delete', 'data': data },
            function (data, status) {
                $('#delete_trade_close').click()

                if (data == "success") {
                    if (user_has_selected_range) {
                        view_trade()
                    }
                    setTimeout(() => {
                        toast_function('success', 'Trade deleted Successfully!')
                    }, 200);
                } else {
                    toast_function('danger', 'Unable to delete Trade')
                }
            }
        ).fail(function (response) {
            logger.error("Error: " + response);
        });
    }
}

//-------------Delete Trades------------------------

const winner_losser = () => {

    const symbolReturn = []

    for (const entry1 of data_table_array) {
        const [status, entryTime, exitTime, symbol, entry, exit, quantity, type, returnAmount, action] = entry1;

        // Convert 'returnAmount' to a number
        const numericReturn = parseFloat(returnAmount[1]);
        symbolReturn.push([symbol, numericReturn])
    }

    symbolReturn.sort(function (a, b) {
        return b[1] - a[1];
    });

    var top3Max = symbolReturn.slice(0, 3);
    var top3Min = symbolReturn.slice(-3);

    var Winner_losser_Dict = {
        Winner_1: top3Max[0],
        Winner_2: top3Max[1],
        Winner_3: top3Max[2],
        Losser_3: top3Min[0],
        Losser_2: top3Min[1],
        Losser_1: top3Min[2]
    };

    const winnersHaveNegativeReturn = Object.values(Winner_losser_Dict)
        .slice(0, 3)
        .some(([_, returnAmount]) => returnAmount < 0);

    const losersHavePositiveReturn = Object.values(Winner_losser_Dict)
        .slice(3)
        .some(([_, returnAmount]) => returnAmount > 0);

    // Update Winner_losser_Dict based on conditions
    if (winnersHaveNegativeReturn) {
        if (Winner_losser_Dict.Winner_1[1] < 0) Winner_losser_Dict.Winner_1 = ['', ''];
        if (Winner_losser_Dict.Winner_2[1] < 0) Winner_losser_Dict.Winner_2 = ['', ''];
        if (Winner_losser_Dict.Winner_3[1] < 0) Winner_losser_Dict.Winner_3 = ['', ''];
    }

    if (losersHavePositiveReturn) {
        if (Winner_losser_Dict.Losser_1[1] > 0) Winner_losser_Dict.Losser_1 = ['', ''];
        if (Winner_losser_Dict.Losser_2[1] > 0) Winner_losser_Dict.Losser_2 = ['', ''];
        if (Winner_losser_Dict.Losser_3[1] > 0) Winner_losser_Dict.Losser_3 = ['', ''];
    }


    function formatCurrency(value) {
        var floatValue = parseFloat(value);
        var symbol = floatValue >= 0 ? '₹' : '- ₹';
        floatValue = Math.abs(floatValue);
        var formattedValue = '';

        if (floatValue >= 10000000) {
            formattedValue = (floatValue / 10000000).toFixed(2) + 'Cr';
        } else if (floatValue >= 100000) {
            formattedValue = (floatValue / 100000).toFixed(2) + 'L';
        } else if (floatValue >= 1000) {
            formattedValue = (floatValue / 1000).toFixed(2) + 'k';
        } else {
            formattedValue = floatValue.toFixed(2);
        }

        var oldValueWithSymbol = value >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

        return [symbol + formattedValue, value, symbol + formattedValue, oldValueWithSymbol];
    }

    // Update Winners and Lossers with formatted amounts
    for (let i = 1; i <= 3; i++) {
        if (Winner_losser_Dict[`Winner_${i}`][1] !== '') {
            const formattedWinner = formatCurrency(Winner_losser_Dict[`Winner_${i}`][1]);
            Winner_losser_Dict[`Winner_${i}`][2] = formattedWinner[0];
            Winner_losser_Dict[`Winner_${i}`][3] = formattedWinner[2];
            Winner_losser_Dict[`Winner_${i}`][4] = formattedWinner[3];
        }

        if (Winner_losser_Dict[`Losser_${i}`][1] !== '') {
            const formattedLosser = formatCurrency(Winner_losser_Dict[`Losser_${i}`][1]);
            Winner_losser_Dict[`Losser_${i}`][2] = formattedLosser[0];
            Winner_losser_Dict[`Losser_${i}`][3] = formattedLosser[2];
            Winner_losser_Dict[`Losser_${i}`][4] = formattedLosser[3];
        }
    }

    // checking that is there any value Undefined or NaN
    for (const key in Winner_losser_Dict) {
        if (Winner_losser_Dict.hasOwnProperty(key)) {
            const value = Winner_losser_Dict[key];
            if (value[1] === undefined || isNaN(value[1]) || value[1] === '₹NaN' || value[1] === '- ₹NaN') {
                Winner_losser_Dict[key] = ['', ''];
            }
        }
    }

    function updateNameAndValue(idPrefix, index, data) {
        const nameId = `#${idPrefix}_${index}_Name`;
        const valueId = `#${idPrefix}_${index}_Value`;

        if ($(nameId).length && data[0] !== '') {
            $(nameId).text(data[0]);
        }

        if ($(valueId).length && data[1] !== '') {
            $(valueId).text(data[2]);
            $(valueId).attr('data-title', data[4]);
        }
    }

    // Update Winners
    updateNameAndValue('Top_Winner', 1, Winner_losser_Dict.Winner_1);
    updateNameAndValue('Top_Winner', 2, Winner_losser_Dict.Winner_2);
    updateNameAndValue('Top_Winner', 3, Winner_losser_Dict.Winner_3);

    // Update Lossers
    updateNameAndValue('Top_Losser', 1, Winner_losser_Dict.Losser_1);
    updateNameAndValue('Top_Losser', 2, Winner_losser_Dict.Losser_2);
    updateNameAndValue('Top_Losser', 3, Winner_losser_Dict.Losser_3);
}

const view_trade_image = (img_src, trade_id) => {



    $('#modal_image').attr('src', '');

    Delete_trade_button_id = trade_id

    for (var i = 0; i < view_trade_data.length; i++) {
        if (trade_id == view_trade_data[i][0]) {
            row_data = view_trade_data[i]
            break;
        }
    }

    $('#image_modal_entry_date_time').text(moment.unix(row_data[2]).format('MMM DD, YYYY HH:mm'))
    $('#image_modal_exit_date_time').text(moment.unix(row_data[3]).format('MMM DD, YYYY HH:mm'))

    parsed_row_data = JSON.parse(row_data[4])

    if (parsed_row_data.hasOwnProperty('link')) {
        $('#modal_image').attr('src', parsed_row_data['link']);
    }

    if (parsed_row_data['trade_type'] == 'Long') {
        returns = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) * parseFloat(parsed_row_data['quantity'])
        roc = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) / parseFloat(parsed_row_data['entry_price']) * 100 * 1
        roc = parseFloat(roc.toFixed(2))
    } else if (parsed_row_data['trade_type'] == 'Short') {
        returns = (parseFloat(parsed_row_data['entry_price']) - parseFloat(parsed_row_data['exit_price'])) * parseFloat(parsed_row_data['quantity'])
        roc = (parseFloat(parsed_row_data['exit_price']) - parseFloat(parsed_row_data['entry_price'])) / parseFloat(parsed_row_data['entry_price']) * 100 * (-1)
        roc = parseFloat(roc.toFixed(2))
    }

    if (parseFloat(returns).toFixed(2) >= 0) {
        status1 = 'WIN'
        $('#image_modal_status').css('color', 'rgb(123, 219, 123)')
        $('#image_modal_returns').css('color', 'rgb(123, 219, 123)')
    } else {
        status1 = 'LOSS'
        $('#image_modal_status').css('color', 'rgb(252, 92, 93)')
        $('#image_modal_returns').css('color', 'rgb(252, 92, 93)')
    }

    if (roc >= 0) {
        $('#image_modal_returns').css('color', 'rgb(123, 219, 123)')
        roc = roc + '%'
    } else {
        $('#image_modal_returns').css('color', 'rgb(252, 92, 93)')
        roc = '- ' + Math.abs(roc) + '%'
    }

    if (parsed_row_data['trade_type'] == 'Long') {
        $('#image_modal_type').css('color', 'rgb(123, 219, 123)')
    } else if (parsed_row_data['trade_type'] == 'Short') {
        $('#image_modal_type').css('color', 'rgb(252, 92, 93)')
    }

    entry_price = format_Currency(parsed_row_data['entry_price'])
    exit_price = format_Currency(parsed_row_data['exit_price'])
    returns = format_Currency(returns)

    $('#image_modal_status').text(status1)
    $('#image_modal_returns').text(returns[0]).attr('data-title-table', returns[2])
    $('#image_modal_roc').text(roc)
    $('#image_modal_type').text(parsed_row_data['trade_type'])
    $('#image_modal_entry_price').text(entry_price[0]).attr('data-title-table', entry_price[2])
    $('#image_modal_exit_price').text(exit_price[0]).attr('data-title-table', exit_price[2])
    $('#image_modal_symbol').text(parsed_row_data['symbol_Ticker'])
    $('#image_modal_quantity').text(parsed_row_data['quantity'])
    $('#image_modal_trade_logic').text(parsed_row_data['find_Trade'])
    $('#image_modal_entry_reason').text(parsed_row_data['entry_reason'])
    $('#image_modal_exit_reason').text(parsed_row_data['exit_reason'])
    $('#image_modal_mistake_lesson').text(parsed_row_data['mistakes'])
}

resize_function = () => {
    let month_length = $(".ch-month").length;

    if ($(window).width() < 1610 && month_length == 12) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1610 && month_length == 12) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1500 && month_length == 11) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1500 && month_length == 11) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1370 && month_length == 10) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1370 && month_length == 10) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1205 && month_length == 9) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1205 && month_length == 9) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 1090 && month_length == 8) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 1090 && month_length == 8) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 885 && month_length == 7) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 885 && month_length == 7) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 773 && month_length == 6) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 773 && month_length == 6) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 660 && month_length == 5) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 660 && month_length == 5) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 550 && month_length == 4) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 550 && month_length == 4) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 430 && month_length == 3) {
        $('.ch-year').removeClass('d-flex justify-content-center')
    } else if ($(window).width() >= 430 && month_length == 3) {
        $('.ch-year').addClass('d-flex justify-content-center')
    }

    if ($(window).width() < 540) {
        $('.ch-day').width(9) //15px
        $('.ch-day').height(9)

        $('.ch-week').width(11)
        $('.ch-day-labels').width(11) //17px

        $('.ch-day-label').css('line-height', '11px')  // 17px
    } else {
        $('.ch-day').width(15)
        $('.ch-day').height(15)

        $('.ch-week').width(17)
        $('.ch-day-labels').width(17)

        $('.ch-day-label').css('line-height', '17px')
    }
}

$(document).ready(function () {

    $('#coming_soon').hide()

    previous_timestamp = 0
    scrollPosition = 0;

    x_axis = []
    y_axis = []

    x_axis1 = []
    y_axis1 = []

    counter_for_data_table = 0
    counter_for_data_table_monthly = 0

    Yes_button_Clicked = false
    user_has_selected_range = false

    // -------- For Tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));


    // Set default values for entry and exit date fields
    $('.disable_color').css('color', '#9f9f9f');
    $('#select_range').css('color', '#9f9f9f');
    $('#Entry_date').attr('disabled', 'true');
    $('#Exit_date').attr('disabled', 'true');


    $('.ch-year').addClass('d-flex justify-content-center')

    // -------------- SUGGESTION STRAT ------------------//

    $.post(root + "/api/journal/instr_list", function (data, status) {
        logger.info(status)
    }).done(function (response) {
        response = JSON.parse(response)
        Stockname = []
        for (var i = 0; i < response.length; i++) {
            Stockname.push({ "stockName": response[i] })
        }
        $("#Symbol_Ticker").fuzzyComplete(Stockname);
    }).fail(function (response) {
        logger.error("Error: " + response);
    });

    // -------------- SUGGESTION END ------------------//

    // -------- chartjs linechart initialization

    var ctx = document.getElementById("linechart").getContext('2d');

    var gradientAbove = ctx.createLinearGradient(0, 0, 0, 300);
    gradientAbove.addColorStop(0, 'rgba(51, 208, 38, 1)');
    gradientAbove.addColorStop(1, 'rgba(5, 55, 3, 0.01');

    var gradientBelow = ctx.createLinearGradient(0, 0, 0, 300);
    gradientBelow.addColorStop(1, 'rgba(255, 35, 35, 1)');
    gradientBelow.addColorStop(0, 'rgba(5, 35, 35, 0)');

    chart_1 = new Chart(ctx, {
        type: "line",
        data: {
            labels: x_axis,
            datasets: [
                {
                    fill: {
                        target: "origin",
                        above: gradientAbove,
                        below: gradientBelow,
                    },
                    backgroundColor: '#1c1c1c',
                    data: y_axis,
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    position: 'right',
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        display: false,
                        drawOnChartArea: false,
                        drawTicks: false,
                    }
                },
                x: {
                    ticks: {
                        display: true,
                        maxTicksLimit: 10,
                        padding: 15,
                        color: "white",
                    },
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                    }
                },
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    enabled: true,
                    displayColors: false,
                    titleColor: "white",
                    titleSpacing: 3,
                    TitleFont: {
                        weight: "bold",
                    },
                    backgroundColor: "black",
                    bodyFont: {
                        weight: "bold",
                    },
                    callbacks: {
                        labelTextColor: function (context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value >= 0 ? "rgba(51, 208, 38, 1)" : "rgba(255, 35, 35, 1)"; // Green for positive values, red for negative values
                        },
                        label: function (context) {
                            const value = context.dataset.data[context.dataIndex];
                            if (parseFloat(value) >= 0) {
                                return '₹' + parseFloat(value);
                            } else {
                                return '- ₹' + Math.abs(parseFloat(value));
                            }
                        },
                    },
                },
                crosshair: {
                    line: {
                        color: '#e7e7e7',  // crosshair line color
                        width: 1        // crosshair line width
                    },
                    sync: {
                        enabled: true,            // enable trace line syncing with other charts
                        group: 1,                 // chart group
                        suppressTooltips: false   // suppress tooltips when showing a synced tracer
                    },
                },
                legend: {
                    display: false,
                    color: '#1c1c1c',
                    legendText: 'MTM Value'
                },
                title: {
                    display: true,
                    text: "",
                    align: "start",
                    color: "white",
                    font: {
                        size: 20,
                    },
                    padding: { bottom: 25 },
                },
            },
        },
    });


    // ------ Apexchart
    var options = {
        series: [{
            name: 'MTM Value',
            data: []
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: 0,
                        to: 100000000,
                        color: '#7bdb7b'
                    }, {
                        from: -100000000,
                        to: 0,
                        color: '#fc5c5d'
                    }]
                },
                columnWidth: '80%',
            }
        },
        dataLabels: {
            enabled: false,
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                },
                formatter: function (y) {
                    if (y >= 0) {
                        var final = '₹' + Math.abs(y.toFixed(2))
                    } else {
                        var final = '- ₹' + Math.abs(y.toFixed(2))
                    }
                    return final
                }
            }
        },
        xaxis: {
            type: 'Text',
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                }
            }
        },
        grid: {
            show: false
        }
    };

    apexchart = new ApexCharts(document.querySelector("#bar_chart_apexchart"), options);
    apexchart.render();

    var options_1 = {
        series: [{
            name: 'MTM Value',
            data: []
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: 0,
                        to: 100000000,
                        color: '#7bdb7b'
                    }, {
                        from: -100000000,
                        to: 0,
                        color: '#fc5c5d'
                    }]
                },
                columnWidth: '80%',
            }
        },
        dataLabels: {
            enabled: false,
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                },
                formatter: function (y) {
                    if (y >= 0) {
                        var final = '₹' + Math.abs(y.toFixed(2))
                    } else {
                        var final = '- ₹' + Math.abs(y.toFixed(2))
                    }
                    return final
                }
            }
        },
        xaxis: {
            type: 'Text',
            categories: [],
            labels: {
                show: true,
                style: {
                    colors: '#fff',
                }
            }
        },
        grid: {
            show: false
        }
    };

    apexchart_Daily_PnL = new ApexCharts(document.querySelector("#barchart"), options_1);
    apexchart_Daily_PnL.render();

    // ------- Calendar HeatMap
    $("#CalendarHeatmap").CalendarHeatmap([], {
        months: 12,
        lastMonth: moment().month() + 1,
        lastYear: moment().year(),
        labels: {
            days: true,
            custom: {
                weekDayLabels: "dd"
            }
        },
        legend: {
            minLabel: "Max Loss",
            maxLabel: "Max Profit",
        },
        tooltips: {
            show: false
        },
    });
    resize_function()

    $("input[type='file']").on("change", function () {
        try {
            if (this.files[0].size > 2000000) {
                toast_function('warning', 'Please upload a file less than 2MB. Thanks!!')
                $(this).val('');
                return;
            }
        }
        catch (e) { logger.error("File Removed!"); return }


        var allowed_ext = ['jpg', 'png', 'jpeg']
        var curr_ext = $("#Image_input").val()
        curr_ext = curr_ext.split('.').pop();
        curr_ext = curr_ext.toLowerCase();
        logger.info("Extension:" + curr_ext)
        if (allowed_ext.includes(curr_ext)) {
            logger.info("Ext allowed")
        }
        else {
            toast_function("warning", "Please upload a image only!")
            $(this).val('');
        }

    });
});

$(window).on("resize", function () {
    resize_function()
});

$('.modal').on('shown.bs.modal', function () {
    $('html').css('overflow', 'hidden')
}).on('hidden.bs.modal', function () {
    $('html').attr('style', 'overflow-x:hidden !important; overflow-y:auto !important')
    $('body').css('overflow-x', 'clip')
});

$(document).on("click", ".ch-day", function () {
    let text = $(this).attr('data-title')
    const output1 = extractTimestamp(text)
    if (previous_timestamp != 0) {


        current_click_month = moment.unix(output1).format('MM')
        previous_click_month = moment.unix(previous_timestamp).format('MM')

        current_click_year = moment.unix(output1).format('YYYY')
        previous_click_year = moment.unix(previous_timestamp).format('YYYY')
        if (current_click_month != previous_click_month) {
            updateCalendar(output1)

            data_table.clear();
            data_table.rows.add(data_table_array);
            data_table.draw();

            filtered_x_axis1 = [];
            filtered_y_axis1 = [];
            for (let i = 0; i < x_axis1.length; i++) {
                const date = new Date(x_axis1[i]);
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to get the correct month value
                const year = (date.getFullYear()).toString() // Adding 1 to get the correct month value

                if (month === current_click_month && year == current_click_year) {
                    filtered_x_axis1.push(x_axis1[i]);
                    filtered_y_axis1.push(y_axis1[i]);
                }
            }
            apexchart_Daily_PnL.updateOptions({
                xaxis: {
                    type: 'Text',
                    categories: filtered_x_axis1,
                }
            })
            apexchart_Daily_PnL.updateSeries([{
                data: filtered_y_axis1
            }])

            filtered_x_axis = [];
            filtered_y_axis = [];
            var sum = 0;
            var cumulativeArray = [];
            for (var i = 0; i < filtered_y_axis1.length; i++) {
                sum += filtered_y_axis1[i];
                cumulativeArray.push(sum);
            }
            filtered_x_axis = filtered_x_axis1
            filtered_y_axis = cumulativeArray

            function addData(chart) {
                chart.data.labels = filtered_x_axis;
                chart.data.datasets.forEach((dataset) => {
                    dataset.data = filtered_y_axis;
                });
                chart.update();
            }
            addData(chart_1);
        }
    }
});


//---------------------------------- ONE month Calendar part -----------------------------------------//

$(function (e) {
    calendar = $("#calendar").calendarGC({
        dayBegin: 0,
        events: getHoliday(),
    });
});

const getHoliday = () => {
    var d = new Date();
    var totalDay = new Date(d.getFullYear(), d.getMonth(), 0).getDate();
    events = [];

    for (var i = 1; i <= totalDay; i++) {
        var newDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (newDate.getDay() == 0) {   //if Sunday
            events.push({
                date: newDate,
                eventName: 'Sun',
                dateColor: "#ffbd5a",
            });
            events.push({
                date: newDate,
                eventName: 'Sun',
                dateColor: "#ffbd5a"
            });
        }

        if (newDate.getDay() == 6) {   //if Saturday
            events.push({
                date: newDate,
                eventName: 'Sat',
                dateColor: "#ffbd5a"
            });
            events.push({
                date: newDate,
                eventName: 'Sat',
                dateColor: "#ffbd5a"
            });
        }
    }
    return events;
}

const updateCalendar = (date) => {
    previous_timestamp = date

    const timestampMoment = moment.unix(date);
    const year = timestampMoment.year();
    const month = timestampMoment.month() + 1;

    monthResultArray = resultArray.filter(item => {
        const itemMoment = moment(item.date);
        return itemMoment.year() === year && itemMoment.month() + 1 === month;
    });

    events = []
    for (var i = 0; i < monthResultArray.length; i++) {
        var floatValue = parseFloat(monthResultArray[i]['count'])
        var symbol = floatValue >= 0 ? '₹' : '- ₹';
        floatValue = Math.abs(floatValue);
        var formattedValue = '';

        if (floatValue >= 10000000) {
            formattedValue = (floatValue / 10000000).toFixed(1) + 'Cr';
        } else if (floatValue >= 100000) {
            formattedValue = (floatValue / 100000).toFixed(1) + 'L';
        } else if (floatValue >= 1000) {
            formattedValue = (floatValue / 1000).toFixed(1) + 'k';
        } else {
            formattedValue = floatValue.toFixed(1);
        }

        var oldValueWithSymbol = parseFloat(monthResultArray[i]['count']) >= 0 ? '₹' + floatValue.toFixed(2) : '- ₹' + floatValue.toFixed(2);

        events.push({
            date: new Date(monthResultArray[i]['date']),
            eventName: `${symbol + formattedValue}`,
            className: `badge mtm_value`,
            dateColor: '#fff',
            titleName: `${oldValueWithSymbol}`
        })
        events.push({
            date: new Date(monthResultArray[i]['date']),
            eventName: `${monthResultArray[i]['no_of_trades']} Trades`,
            className: `badge`,
            dateColor: '#fff',
            titleName: `${monthResultArray[i]['no_of_trades']} Trades`
        })
    }

    var d = new Date(moment.unix(date).format('YYYY-MM-DD'));
    var totalDay = new Date(d.getFullYear(), d.getMonth(), 0).getDate();

    for (var i = 1; i <= totalDay; i++) {
        var newDate = new Date(d.getFullYear(), d.getMonth(), i);
        if (newDate.getDay() == 0) {   //if Sunday
            events.push({
                date: newDate,
                eventName: "Sun",
                className: `badge`,
                dateColor: "#ffbd5a"
            }); events.push({
                date: newDate,
                eventName: "Sun",
                className: `badge`,
                dateColor: "#ffbd5a"
            });
        }

        if (newDate.getDay() == 6) {   //if Saturday
            events.push({
                date: newDate,
                eventName: "sat",
                className: `badge`,
                dateColor: "#ffbd5a"
            }); events.push({
                date: newDate,
                eventName: "sat",
                className: `badge`,
                dateColor: "#ffbd5a"
            });
        }
    }

    calendar.setEvents(events);
    calendar.setDate(moment.unix(date).format('YYYY-MM-DD'));
    background_color_one_month_cal()
}

const background_color_one_month_cal = () => {
    var tdElements = document.querySelectorAll('td div.gc-event.badge.mtm_value');

    // Loop through each selected <div> element
    tdElements.forEach(function (divElement) {
        var tdElement = divElement.parentElement; // Get the parent <td> element
        var content = (divElement.textContent.trim()); // Parse content as a float

        content = content.replace(/[^0-9-]/g, '');


        if (!isNaN(content)) {
            if (content > 0) {
                tdElement.style.backgroundColor = '#7bdb7b'; // Set background color to green for positive numbers
            } else if (content < 0) {
                tdElement.style.backgroundColor = '#fc5c5d'; // Set background color to red for negative numbers
            }
        }
    });
}

$(document).on("click", ".slider1", function () {
    if ($('#checkbox1').is(':checked')) {
        $('.disable_color').css('color', '#9f9f9f');
        $('#select_range').css('color', '#9f9f9f');
        $('#all').css('color', '#fff');
        $('#Entry_date').attr('disabled', 'true');
        $('#Exit_date').attr('disabled', 'true');
    } else {
        $('.disable_color').css('color', '#fff');
        $('#select_range').css('color', '#fff');
        $('#all').css('color', '#9f9f9f');
        $('#Entry_date').removeAttr('disabled');
        $('#Exit_date').removeAttr('disabled');
    }
})

$(document).on("click", ".event", (e) => {
    data = e
    var text = data['currentTarget'].innerText
    var lines = text.split('\n');
    var Date = lines[0];
    var Month = moment.unix(previous_timestamp).format('MMM')
    var Year = moment.unix(previous_timestamp).format('YYYY')
    clicked_date = Month + ' ' + Date + ', ' + Year

    filteredArray = data_table_array.filter(function (item) {
        var dateTime = moment(item[2][0], "DD/MM/YY HH:mm");
        var datePart = dateTime.format("MMM D, YYYY");

        return datePart === clicked_date;
    });

    data_table.clear();
    data_table.rows.add(filteredArray);
    data_table.draw();
})

$(document).on("click", ".data_Table_1", () => {
    data_table.clear();
    data_table.rows.add(data_table_array);
    data_table.draw();
})

$(document).on("click", ".bar_chart", () => {
    function addData(chart) {
        chart.data.labels = x_axis;
        chart.data.datasets.forEach((dataset) => {
            dataset.data = y_axis;
        });
        chart.update();
    }
    addData(chart_1);

    apexchart_Daily_PnL.updateOptions({
        xaxis: {
            type: 'Text',
            categories: x_axis1,
        }
    })
    apexchart_Daily_PnL.updateSeries([{
        data: y_axis1
    }])
})


//-----------------------Modal form-------------------------//
$('.btn-close1').hover(
    function () {
        $(this).addClass('bg-white'); // Add class on mouseenter
    },
    function () {
        $(this).removeClass('bg-white'); // Remove class on mouseleave
    }
);

$(document).on("click", ".slider", function () {
    if ($('#checkbox').is(':checked')) {
        $('#long_text').css('color', '#fff');
        $('#short_text').css('color', '#fff');
        $('#exampleModal1 .modal-header').css('background-color', '#3caf39')
        $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    } else {
        $('#long_text').css('color', '#fff');
        $('#short_text').css('color', '#fff');
        $('#exampleModal1 .modal-header').css('background-color', '#fc5c5d')
        $('#exampleModal1 .modal-footer').css('background-color', '#fc5c5d')
    }
})

$(document).on("click", "#add_trade", function () {
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')

    $('#exampleModal1 .modal-title').text('Add Trade Inputs:')
    $('#Image_input_row').show()

    $('#success_message').hide()
    $('#add_update_table').show()

    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')
})

//------- character upto 300 only
var maxChars = 300;

$("textarea").on("input", function () {
    var $this = $(this);
    var remainingChars = maxChars - $this.val().length;

    if (remainingChars >= 0) {
        $this.siblings(".char-count").text(remainingChars + " characters remaining");
    } else {
        // Trim the content to the maximum limit
        $this.val($this.val().substring(0, maxChars));
        $this.siblings(".char-count").text("0 characters remaining");
    }
});




//---------- Trade Submit
document.querySelector("#add_trade_submit").addEventListener("click", () => {
    add_trade();
});

//---------- Trade View
document.querySelector("#view_trade_submit").addEventListener("click", () => {
    user_has_selected_range = true
    view_trade();
});

//---------- Trade Update
document.querySelector("#update_trade_submit").addEventListener("click", () => {
    update_trade_API(trade_id);
});

//---------- Show Individual Day
document.querySelector("#individual_day_curve").addEventListener("click", () => {
    $('#individual_day_curve').removeClass('gb_active').addClass('gb_active')
    $('#equity_curve').removeClass('gb_active')

    $('#show_hide_chart').removeClass().addClass('d-none')
    $('#show_hide_apexchart').removeClass()
});

//---------- Show Equity Curve
document.querySelector("#equity_curve").addEventListener("click", () => {
    $('#individual_day_curve').removeClass('gb_active')
    $('#equity_curve').removeClass('gb_active').addClass('gb_active')

    $('#show_hide_chart').removeClass()
    $('#show_hide_apexchart').removeClass().addClass('d-none')
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

    $('#checkbox').prop('checked', false);
    $("input[type='datetime-local']").val("");
    $("input[type='text']").val("");
    $("input[type='number']").val("");
    $("input[type='file']").val("");
    $("textarea").val("");
    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

    $('#success_message').hide()
    $('#add_update_table').show()
    // $('#exampleModal1 .modal-title').css('color', '#f8f9fa !important')
    $('#exampleModal1 .modal-title').css('Add Trade Inputs')

    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
});

//-------- User won't able to select sat/sun & Time between 9:15 - 15:30 only

document.addEventListener("DOMContentLoaded", function () {
    const dateTimeInput = document.getElementById("Entry_date_time");

    dateTimeInput.addEventListener("input", function () {
        const selectedDate = new Date(dateTimeInput.value);
        const currentDate = new Date(); // Get the current date and time
        const selectedTime = selectedDate.getHours() * 100 + selectedDate.getMinutes();

        // Check if the selected date is in the future
        if (selectedDate > currentDate) {
            // Display an error message
            toast_function('warning', 'Please select a date and time in the past or present.')
            dateTimeInput.value = ""; // Clear the input value
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const dateTimeInput1 = document.getElementById("Exit_date_time");

    dateTimeInput1.addEventListener("input", function () {
        const selectedDate = new Date(dateTimeInput1.value);
        const currentDate = new Date(); // Get the current date and time
        const selectedTime = selectedDate.getHours() * 100 + selectedDate.getMinutes();

        // Check if the selected date is in the future
        if (selectedDate > currentDate) {
            // Display an error message
            toast_function('warning', 'Please select a date and time in the past or present.')

            dateTimeInput1.value = ""; // Clear the input value
        }
    });
});

function validateInput(input) {
    const inputValue = input.value;

    // Use a regular expression to allow only digits and a single dot (.)
    const validInput = inputValue.replace(/[^0-9.]/g, "");

    // Split the valid input by dot (.)
    const parts = validInput.split(".");

    // If there is more than one dot, remove all dots except the first one
    if (parts.length > 2) {
        parts.splice(2);
    }

    // Join the parts back together with a single dot (.)
    const finalValue = parts.join(".");

    // Update the input field value with the valid input
    input.value = finalValue;
}

function validateInput1(input) {
    const inputValue = input.value;

    // Use a regular expression to allow only digits and a single dot (.)
    const validInput = inputValue.replace(/[^0-9]/g, "");

    // Split the valid input by dot (.)
    const parts = validInput.split(".");

    // If there is more than one dot, remove all dots except the first one
    if (parts.length > 2) {
        parts.splice(2);
    }

    // Join the parts back together with a single dot (.)
    const finalValue = parts.join(".");

    // Update the input field value with the valid input
    input.value = finalValue;
}

//-------- Delete Trade using Image Modal
document.querySelector("#delete_trade_button").addEventListener("click", () => {
    delete_trade(Delete_trade_button_id)
});

//-------- Edit Trade using Image Modal
$('#exampleModal4').on('show.bs.modal', function (event) {
    setTimeout(() => {
        $('#edit_trade_button').attr('onclick', `update_trade(${row_data[0]}, ${row_data[2]}, ${row_data[3]}, ${row_data[4]})`)
    }, 1000);
});

//------------- Add another trade
$(document).on("click", "#add_another_trade", function () {
    $('#success_message').hide()
    $('#add_update_table').show()
    // $('#exampleModal1 .modal-title').css('color', '#f8f9fa !important')
    $('#exampleModal1 .modal-title').css('Add Trade Inputs')
    $('#checkbox').prop('checked', false);
    $('#exampleModal1 .modal-footer').css('background-color', '#3caf39')
    $('#exampleModal1 .modal-header').css('background-color', '#3caf39')

    $('#add_trade_submit').removeClass().addClass('btn btn-secondary bg-faint')
    $('#update_trade_submit').removeClass().addClass('btn btn-secondary bg-faint d-none')
    $('#add_another_trade').removeClass().addClass('btn btn-secondary bg-faint d-none')
});

//------------- English Video 
$(document).on("click", "#english_language", function () {
    $('#coming_soon').hide()
    $('iframe').show()

    $('#english_language').removeClass('gb_active')
    $('#hindi_language').removeClass('gb_active')

    $('#english_language').addClass('gb_active')

    $('#video_container').removeClass().addClass('px-0 mt-3 video-container')
});

//------------- Hindi Video 
$(document).on("click", "#hindi_language", function () {
    $('#coming_soon').show()
    $('iframe').hide()

    $('#english_language').removeClass('gb_active')
    $('#hindi_language').removeClass('gb_active')

    $('#hindi_language').addClass('gb_active')

    $('#video_container').removeClass().addClass('px-0 mt-3 d-flex align-items-center justify-content-center')

    iframe = $('iframe')[0];
    player = new Vimeo.Player(iframe);
    player_one = player
    player.pause()
});

//------------- Hindi Video 
$(document).on("click", ".video_modal_close", function () {
    iframe = $('iframe')[0];
    player = new Vimeo.Player(iframe);
    player_one = player
    player.pause()
    player.setCurrentTime(0)
});

$(document).on("click", "#TradeBook_warning_message", function () {
    $("#exampleModal2").modal("show");
})