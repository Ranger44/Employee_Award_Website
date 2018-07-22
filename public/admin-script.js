// Award
function delete_row_award(current_row) {
	var table = document.getElementById('award_table');
	var req = new XMLHttpRequest();
	var url = 'http://flip2.engr.oregonstate.edu:4247/admin_delete_aw?id=' + current_row.parentNode.parentNode.cells[0].textContent;

	req.open('GET', url, true);
	req.addEventListener('load', function () {
		if (req.status >= 200 && req.status < 400)
			console.log("Delete successful");
		else
			console.log("Error in network request: " + req.statusText);
	});

	req.send(null);
	event.preventDefault();

	//delete row in html
	var row_count = table.rows.length;
	for (var i = 0; i < row_count; i++) {
		var row = table.rows[i];

		if (row == current_row.parentNode.parentNode) {
			table.deleteRow(i);
			row_count--;
			i--;
		}
	}
}
