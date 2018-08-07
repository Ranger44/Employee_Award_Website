// Award
function edit_row_award(current_row) {
	console.log("Hit edit button id: " + current_row.parentNode.parentNode.cells[0].textContent);
	window.location.href = "/admin_edit_aw?id=" + current_row.parentNode.parentNode.cells[0].textContent;
	//var div_edit = document.getElementById("div_edit");
	//if (div_edit.style.display === "none") {
		//div_edit.style.display = "block";
	//}

}

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

function delete_row_en(current_row){
	var table = document.getElementById('employee_table');
	var req = new XMLHttpRequest();
	var url = 'http://flip2.engr.oregonstate.edu:4247/admin_delete_en?id=' + current_row.parentNode.parentNode.cells[0].textContent;

	req.open('GET',url,true);
	req.addEventListener('load',function (){
		if(req.status >= 200 && req.status < 400){
			console.log("Delete successful");
		}else{
			console.log("Error network request: "+req.statusText);
		}
	});

	req.send(null);
	event.preventDefault();

	//delete row in employee_table
	var row_count = table.rows.length;
	for(var i=0; i<row_count;i++){
		var row =table.rows[i];
		if(row == current_row.parentNode.parentNode){
			table.deleteRow(i);
			row_count--;
			i--;
		}
	}
}

function edit_row_en(current_row){
	window.location.href = "http://flip2.engr.oregonstate.edu:4247/admin_edit_en?id="+current_row.parentNode.parentNode.cells[0].textContent;
}

function view_row_en(current_row){
	window.location.href = "http://flip2.engr.oregonstate.edu:4247/admin_view_en?id="+current_row.parentNode.parentNode.cells[0].textContent+"&first="+ current_row.parentNode.parentNode.cells[1].textContent+"&last="+current_row.parentNode.parentNode.cells[2].textContent;
}



function delete_row_en_aw(current_row){
	var table = document.getElementById('award_table');
	var req = new XMLHttpRequest();
	var url = 'http://flip2.engr.oregonstate.edu:4247/admin_delete_en_aw?id=' + current_row.parentNode.parentNode.cells[0].textContent;

	req.open('GET',url,true);
	req.addEventListener('load',function (){
		if(req.status >= 200 && req.status < 400){
			console.log("Delete successful");
		}else{
			console.log("Error network request: "+req.statusText);
		}
	});

	req.send(null);
	event.preventDefault();

	//delete row in employee_table
	var row_count = table.rows.length;
	for(var i=0; i<row_count;i++){
		var row =table.rows[i];
		if(row == current_row.parentNode.parentNode){
			table.deleteRow(i);
			row_count--;
			i--;
		}
	}
}
