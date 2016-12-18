/// <reference path="/usr/local/lib/typings/index.d.ts" />

$(document).ready(function () {
	$('#pay').click(function () {
		var transactionId = $('#transactionId').val();
		var userName = $('#userName').val();
		var currDate = new Date();
		var passText = ":" + $('#password').val() + ":" + currDate.getDate() + ":" + currDate.getMonth() + ":" + currDate.getFullYear() + ":";
		
		var md = forge.md.sha256.create();
		md.update(passText);
		var passKey = forge.util.encode64(md.digest().data);

		var parent = window.opener;
		var res = null;

		$.ajax({
			url: '/transfer',
			method: "POST",
			data: {
				transactionId: transactionId,
				userName: userName,
				passKey: passKey
			},
			success: function (data, status) {
				if (status == 'success') {
					res = data;
					$('body').html('Success');
				} else {
					$('body').html('Error');
				}
			},
			error: function (err) {
				console.log(err.responseText);
				$('body').html('Error');
			},
			complete: function () {
				if (parent) {
					var event = new Event('finished');
					event.response = res;
					window.dispatchEvent(event);
					setTimeout(function () {
						window.close();
					}, 3000);
				}
			}
		});
	});
});