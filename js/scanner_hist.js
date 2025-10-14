
route = '/calcApi2'

const fetch_data = () => {

    var selectedDateTime = $('#select_date_time').val();
    var timestamp = Math.floor(new Date(selectedDateTime).getTime() / 1000);
    ts = timestamp - 19800; // Adjust for the time zone, if necessary
    var currentTimestamp = Math.floor(Date.now() / 1000);

    if (ts <= currentTimestamp) {
        ts = ts.toFixed(1)
        console.log(ts)
        $.post('https://students.tradingcafeindia.com/calcApi2/hd_hist', { 'ts': ts }, function (data, status) {
            API_Data = data
            Fetch_Table_Data()
        })
    } else {
        toast_function('warning', 'Please Select Past date')
    }
}

// -------------------------- Datatable ------------------------

$.fn.dataTable.ext.errMode = 'none';

const Fetch_Table_Data = () => {
    scan_value = $("input[name='market_option']:checked").val()
    segment_value = $("input[name='market_option_1']:checked").val()

    DS_data_1 = JSON.parse(API_Data[0][1]);

    // Formating All the table Data
    hd_fno = DS_data_1['hd_fno']
    for (var i = 0; i < hd_fno.length; i++) {
        // data pre preprocessing
        let Name = hd_fno[i][0];
        let LTP = hd_fno[i][1];
        let Volume = hd_fno[i][2];
        let Delivery_percentage = hd_fno[i][3];
        let ts = hd_fno[i][4];
        let Avg_delivery_percentage = hd_fno[i][5];
        hd_fno[i][0] = Name
        hd_fno[i][1] = LTP;
        hd_fno[i][2] = Volume;
        hd_fno[i][3] = parseFloat(Avg_delivery_percentage).toFixed(2);
        hd_fno[i][4] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;
        hd_fno_date = `${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`
    }

    hd_n500 = DS_data_1['hd_n500']
    for (var i = 0; i < hd_n500.length; i++) {
        // data pre preprocessing
        let Name = hd_n500[i][0];
        let LTP = hd_n500[i][1];
        let Volume = hd_n500[i][2];
        let Delivery_percentage = hd_n500[i][3];
        let ts = hd_n500[i][4];
        let Avg_delivery_percentage = hd_n500[i][5];
        hd_n500[i][0] = Name
        hd_n500[i][1] = LTP;
        hd_n500[i][2] = Volume;
        hd_n500[i][3] = parseFloat(Avg_delivery_percentage).toFixed(2);
        hd_n500[i][4] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;
        hd_n500_date = `${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`
    }

    dsp_fno = DS_data_1['dsp_fno']
    for (var i = 0; i < dsp_fno.length; i++) {
        // data pre preprocessing
        let Name = dsp_fno[i][0];
        let LTP = dsp_fno[i][1];
        let Delivery_percentage = dsp_fno[i][2];
        let Increase_in_Delivery = dsp_fno[i][3];
        let ts = dsp_fno[i][4];
        let Avg_delivery_percentage = dsp_fno[i][5];
        dsp_fno[i][0] = Name
        dsp_fno[i][1] = LTP;
        dsp_fno[i][2] = parseFloat(Avg_delivery_percentage).toFixed(2);
        dsp_fno[i][3] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;
        dsp_fno[i][4] = Increase_in_Delivery;
        dsp_fno_date = `${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`
    }

    dsp_n500 = DS_data_1['dsp_n500']
    for (var i = 0; i < dsp_n500.length; i++) {
        // data pre preprocessing
        let Name = dsp_n500[i][0];
        let LTP = dsp_n500[i][1];
        let Delivery_percentage = dsp_n500[i][2];
        let Increase_in_Delivery = dsp_n500[i][3];
        let ts = dsp_n500[i][4];
        let Avg_delivery_percentage = dsp_n500[i][5];
        dsp_n500[i][0] = Name
        dsp_n500[i][1] = LTP;
        dsp_n500[i][2] = parseFloat(Avg_delivery_percentage).toFixed(2);
        dsp_n500[i][3] = `${Delivery_percentage} <progress max=100 value=${Delivery_percentage}>`;
        dsp_n500[i][4] = Increase_in_Delivery;
        dsp_n500_date = `${moment.unix(ts).format('ddd MMM DD, YYYY')} IST`
    }

    // Changing Table Heading
    if (scan_value == '_hd_data_') {
        $('#3rd_col_heading').text('Volume')
        $('#4th_col_heading').text('Avg. Del %')
        $('#5th_col_heading').text('Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
    } else if (scan_value == '_dsp_data_') {
        $('#3rd_col_heading').text('Avg. Del %')
        $('#4th_col_heading').text('Delivery (%)')
        $('#5th_col_heading').text('Increase in Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
    }

    // Printing Selected Table 
    if (scan_value == '_hd_data_' && segment_value == 'fno') {
        DS_data = hd_fno
        $('#updated_date').text(hd_fno_date)
    } else if (scan_value == '_hd_data_' && segment_value == 'n500') {
        DS_data = hd_n500
        $('#updated_date').text(hd_n500_date)
    } else if (scan_value == '_dsp_data_' && segment_value == 'fno') {
        DS_data = dsp_fno
        $('#updated_date').text(dsp_fno_date)
    } else if (scan_value == '_dsp_data_' && segment_value == 'n500') {
        DS_data = dsp_n500
        $('#updated_date').text(dsp_n500_date)
    }

    // Converting Table into Datatable
    if (DS_data) {
        if (counter_for_datatable == 0) {
            counter_for_datatable += 1;
            datatable = $("#scanner_datatable").DataTable({
                paging: false,
                pageLength: 50,
                info: false,
                scrollX: true,
                ordering: false
            });
        }
        datatable.clear();
        datatable.rows.add(DS_data);
        datatable.draw();
    }
}

$(document).on('click', "input[type='radio']", function () {

    scan_value = $("input[name='market_option']:checked").val()
    segment_value = $("input[name='market_option_1']:checked").val()

    // Changing Table Heading
    if (scan_value == '_hd_data_') {
        $('#3rd_col_heading').text('Volume')
        $('#4th_col_heading').text('Avg. Del %')
        $('#5th_col_heading').text('Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc').removeClass('dataTableSc_dsp')
        }
    } else if (scan_value == '_dsp_data_') {
        $('#3rd_col_heading').text('Avg. Del %')
        $('#4th_col_heading').text('Delivery (%)')
        $('#5th_col_heading').text('Increase in Delivery (%)')
        if (!$('.dataTables_scrollHeadInner table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollHeadInner table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
        if (!$('.dataTables_scrollBody table').hasClass('dataTableSc_dsp')) {
            $('.dataTables_scrollBody table').addClass('dataTableSc_dsp').removeClass('dataTableSc')
        }
    }

    // Printing Selected Table 
    if (scan_value == '_hd_data_' && segment_value == 'fno') {
        DS_data = hd_fno
        $('#updated_date').text(hd_fno_date)
    } else if (scan_value == '_hd_data_' && segment_value == 'n500') {
        DS_data = hd_n500
        $('#updated_date').text(hd_n500_date)
    } else if (scan_value == '_dsp_data_' && segment_value == 'fno') {
        DS_data = dsp_fno
        $('#updated_date').text(dsp_fno_date)
    } else if (scan_value == '_dsp_data_' && segment_value == 'n500') {
        DS_data = dsp_n500
        $('#updated_date').text(dsp_n500_date)
    }

    // Converting Table into Datatable
    if (DS_data) {
        datatable.clear();
        datatable.rows.add(DS_data);
        datatable.draw();
    }

    setTimeout(() => {
        if (scan_value == '_dsp_data_') {
            $('#4th_col_heading').removeAttr("style")
        } else if (scan_value == '_hd_data_') {
            $('#5th_col_heading').removeAttr("style")
        }
    }, 30);

})

$(document).ready(function () {

    counter_for_datatable = 0

    $("#scanner_datatable_ip").keyup(function () {
        $('#scanner_datatable').dataTable().fnFilter(this.value);
    });

})