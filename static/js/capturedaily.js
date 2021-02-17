// This function captures all of the daily info and passes it through to the Flask server
function captureDaily(){
   
    $.ajax({
        url: '/capturedaily',
        data: $('form').serialize(),
        type: 'POST',

        success: function(response) {
            console.log(response);
            alert(response);
        },
        error: function(error) {
            console.log(error);
            //alert(error);
        }

    });
    // reset the form
    $("#daily_qs")[0].reset();
}