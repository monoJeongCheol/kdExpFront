/*********************************/
/*	toast-grid render & function */
/*********************************/

//선택한 row가져오기 (테스트전)
function getSelectedRows() {

	var a = grid.getSelectionRange();
	var c = [];

	if (!a) {
		i = grid.getFocusedCell();
		d = { 'rowKey': i.rowKey };
		c.push(d);

	} else {
		var s = a.start[0];
		var e = a.end[0];

		for (i = s; i <= e; i++) {
			var d = { 'rowKey': i };
			c.push(d);
		}

	}

	if (c.length > 0) return c;
	else return null;
}

/*********************************/
/*	toast-grid render & function */
/*********************************/

// 팝업 rowHeader 단일 선택용 (4.* 대에서 radio header가 사라짐)
class radioRender {

	constructor(props) {
		this.el = document.createElement("div");
		this.render(props);
	}

	render(props) {
		console.log(props);
		this.el.style.cssText = "text-align;center";
		this.el.innerHTML = '<input type="radio" value="' + props.formattedValue + '" name="grid_radio" />';
	}

	getElement() {
		return this.el;
	}

	// $('radio[name=grid_radio]:checked') 로 해당 row 선택
}

// 그리드 내 이미지 추가
class CustomRenderer {
	constructor(props) {
		//console.log(props);
		const el = document.createElement('img');
		const { width, height, display, margin } = props.columnInfo.renderer.options;

		el.src = 'some-image-link';
		el.width = width;
		el.height = height;
		el.display = display;
		el.margin = margin;

		this.el = el;
		this.render(props);
	}

	getElement() {
		return this.el;
	}

	render(props) {
		this.el.src = String(props.value);
	}
}

class CustomTextEditor {
	constructor(props) {
		const el = document.createElement('input');
		const { maxLength } = props.columnInfo.editor.options;

		el.type = 'text';
		el.maxLength = maxLength;
		el.value = String(props.value);

		this.el = el;
	}

	getElement() {
		return this.el;
	}

	getValue() {
		return this.el.value;
	}

	mounted() {
		this.el.select();
	}
}

// 그리드 내 버튼 추가
class customTest {
	constructor(props) {
		const el = document.createElement("div");

		this.el = el;
		this.render(props);
	}
	render(props) {
		console.log(props.formattedValue);
		this.el.innerHTML = converter(props.formattedValue);
	}

	getElement() {
		return this.el;
	}

}

function converter(value) {
	let result;
	result = value + "<input type='button' value='검색' style='float:right;'/>"
	return result;
}

/*var gridUtil = {
	addGrid : (grid, opt) => {

	}
}*/
