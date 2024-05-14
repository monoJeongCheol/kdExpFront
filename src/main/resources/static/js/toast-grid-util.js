// Toast 참조
// https://nhn.github.io/tui.grid/4.0.0/tutorial-example01-basic
// https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/ko/data-source.md
class ToastGridUtil {
    constructor(gridOpt) {
        // 그리드 테마
        // Fixme: 공통테마 작업필요, 테마가 변환이 필요한경우 변수처리 필요
		var bscOpt = {
            cell :{
                normal : {
                    border : '#e0e0e0',
                    showVerticalBorder: true,
                    showHorizontalBorder: true
                },
                focused: {
			      border: '#418ed4',
			      background : '#418ed4'
			    }
            },
            row : {
			 	hover :{
					 background : '#e5e5f2'
				}
			}
		}
		if(gridOpt.hasOwnProperty('rowHover')){
			bscOpt.row = { hover :{  background : 'white' } }
		}

        tui.Grid.applyTheme('clean', bscOpt);

        // 체크박스 여부
        this.isRowCheck = false;
        // pagination 여부
        this.isPagination = false;
        this.isFnCallBack = false;
        this.isDefaultRowData = false;
        this.columnList = [];
        // draggableOption
        this.isDraggableColumn = true;
        this.isDraggableRow = false;
        this.jobId = null;

		if(!gridOpt.hasOwnProperty('minRowHeight')){
			gridOpt.minRowHeight = 30;
		}
		if(!gridOpt.hasOwnProperty('header')){
			gridOpt.header = { height: 35 }
		}
		if(!gridOpt.hasOwnProperty('columnOptions')){
			gridOpt.columnOptions = { resizable: true}
		}

        // 그리드 생성시 옵션
        this.gridOpt = gridOpt;
        this.grid = new tui.Grid(this.gridOpt);
        let _columnList = this.columnList;

        if (this.gridOpt.hasOwnProperty('rowHeaders'))
            if (this.gridOpt.rowHeaders.indexOf("checkbox") > -1)
                this.isRowCheck = true;

        if (this.gridOpt.hasOwnProperty('pagination'))
        	this.isPagination = true;

		if (this.gridOpt.hasOwnProperty('data')){
			if (this.gridOpt.data.hasOwnProperty('fnCallBack'))
				this.isFnCallBack = true;
		}

		if (this.gridOpt.hasOwnProperty('defaultRowData')){
			this.isDefaultRowData = true;
			this.defaultRowData = this.gridOpt.defaultRowData;
		}

		if (this.gridOpt.hasOwnProperty('columns')){
			this.gridOpt.columns.forEach(function(column){
				_columnList.push(column.name);
			});
		}

		if (this.gridOpt.draggable){
			if (this.gridOpt.hasOwnProperty('isDraggableColumn'))
				this.isDraggableColumn = this.gridOpt.isDraggableColumn;

			if (this.gridOpt.hasOwnProperty('isDraggableRow'))
				this.isDraggableRow = this.gridOpt.isDraggableRow;
		}

		if (this.gridOpt.hasOwnProperty('jobId')){
			this.jobId = this.gridOpt.jobId;
		}

		// 그리드 이벤트 생성
		this._setCommEvent();

		//그리드 컬럼순서 조정
		this._setCustomColumnOrder();

    }

    // api 요청
    // Get일때 param urlString, Post일때 formData
    _sendRequest(url, method, param){
		let _gridUtil = this;
		return new Promise(function(resolve, reject){
			let xhr = new XMLHttpRequest();
			url = (method == 'GET') ? url+"?"+param : url;

			xhr.open(method, url, true);
			xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
			xhr.responseType = 'json';
			xhr.addEventListener('readystatechange', function (ev) {
			    if (ev.target.readyState === XMLHttpRequest.DONE) {
					let errResult = {isLogin: false, message: '오류가 발생했습니다. 관리자에게 문의하세요.'};
			        if (ev.target.status === 401){
						errResult.isLogin = true;
						errResult.message = '로그인 후 다시 이용해주세요.';
						reject(errResult);
					}else{
						if (ev.target.response.result){
							resolve(ev.target.response.data.contents);
						}else{
							if (ev.target.response.hasOwnProperty('message')){
								errResult.message = ev.target.response.message;
								reject(errResult);
							}else{
								reject(errResult);
							}
						}
					}
			    }
			});

			(method == 'GET') ?  xhr.send() : xhr.send(param);
		});
	}

	//그리드 컬럼순서 조정
	_setCustomColumnOrder(){
		if (this.jobId != null){
			let _gridUtil = this;
			this._sendRequest('/comm/api/findCustomGridColumn', 'GET', 'jobId='+jobId).then(
				function(responseData){
					let sortCustomColumns = [];
					if (responseData != null){
						let customColumnList = responseData.split(',');
						customColumnList.forEach(function(columnName){
							_gridUtil.gridOpt.columns.forEach(function(column){
								if(columnName == column.name){
									sortCustomColumns.push(column);
								}
							});
						});
					}
					if (sortCustomColumns.length > 0)
						_gridUtil.get().setColumns(sortCustomColumns);
				}
			).catch(function(errResult){
				_gridUtil._responseExceptAlert(errResult.isLogin, errResult.message);
			});
		}
	}

	// 그리드 사용자 컬럼순서 저장
	saveCustomColumnOrder(){
		if (this.jobId != null){
			let _gridUtil = this;
			let sortColumns = [];
			let data = new FormData();

			this.get().getColumns().forEach(function(column){
				sortColumns.push(column.name);
			});

			data.append('jobId', this.jobId);
	        data.append('customColumnList', sortColumns.toString());

			this._sendRequest('/comm/api/saveCustomGridColumn', 'POST', data)
			.then(function(responseData){
				_gridUtil._responseExceptAlert(false, responseData);
			}).catch(function(errResult){
				_gridUtil._responseExceptAlert(errResult.isLogin, errResult.message);
			});
		}else{
			_gridUtil._responseExceptAlert(false, '필수파라미터가 없어서 저장이 불가합니다.');
		}
	}

    // 그리드 커스텀 공통 이벤트
    _setCommEvent(){
        let _gridUtil = this;
        let _grid = this.grid;
        let _gridOpt = this.gridOpt;
        let _isFnCallBack = this.isFnCallBack;

		// response event
		_grid.on('response', function(ev){
			if (ev.xhr.status == 401) {
				_gridUtil._responseExceptAlert(true, '로그인 후 다시 이용해주세요.');
            }else{
                let resultJson = JSON.parse(ev.xhr.response);
				if (resultJson.result){
					if (_isFnCallBack){
						let fnCallBack = _gridOpt.data.fnCallBack;
						fnCallBack(resultJson);
					}
				}else{
					if (resultJson.hasOwnProperty('message'))
						_gridUtil._responseExceptAlert(false, resultJson.message);
					else
						_gridUtil._responseExceptAlert(false, '오류가 발생했습니다. 관리자에게 문의하세요.');
				}
            }
		});

		// readData, setData event
		_grid.on('onGridUpdated', function(ev){
			_gridUtil._setCommRowEvent('onGridUpdated', ev);
		});

		// drop event
		_grid.on('drop', function(ev){
			_gridUtil._setCommRowEvent('drop', ev);
		});

	 	// cell change event
	 	_grid.on('afterChange', function(ev){
			_gridUtil._setCommRowEvent('afterChange', ev);
	 	});

		// checkbox cell check event
		_grid.on('check', function(ev) {
	 		_grid.addRowClassName(ev.rowKey, "red");
 		});
 		// checkbox cell uncheck event
 		_grid.on('uncheck', function(ev) {
	 		_grid.removeRowClassName(ev.rowKey, "red");
 		});
		// checkbox cell checkAll event
	 	_grid.on('checkAll', function() {
	 		_grid.getCheckedRowKeys().forEach(function(rowKey){
				 _grid.addRowClassName(rowKey, "red");
			});
 		});
		// checkbox cell uncheckAll event
	 	_grid.on('uncheckAll' ,function() {
			_grid.getData().forEach(function(row){
				_grid.removeRowClassName(row.rowKey, "red");
			});
	 	});

		// 그리드 클릭시 row 배경색
	 	/*_grid.on('click' , function(ev) {

			if(ev.targetType != 'etc'){

	 			if(ev.columnName == 'radioRender'){
					return;
				}

				if(ev.columnName != '_checked'){

			 		let gridData = _grid.getData();

			 		let gridCheckRow = _grid.getCheckedRowKeys();

			 		for(var i = 0 ; i < gridData.length ; i++){
			 			_grid.removeRowClassName(gridData[i].rowKey,"red");
			 		}

			 		if(gridCheckRow.length > 0){
			 			for(var j = 0 ; j < gridCheckRow.length ; j++){
			 				_grid.addRowClassName(gridCheckRow[j],"red");
			 			}
			 		}

			 		_grid.addRowClassName(ev.rowKey,"red");
				}
			}

		});*/

		// focus change event
		/*_grid.on('focusChange' , function(ev) {
			_grid.getData().forEach(function(row){
				if(row._attributes.checked)
					_grid.addRowClassName(row.rowKey,"red");
				else
					_grid.removeRowClassName(row.rowKey,"red");
			});
	 		_grid.addRowClassName(ev.rowKey,"red");

		});*/

		// drag start event
		_grid.on('dragStart' , function(ev) {

			// 컬럼이동
	 		if(ev.columnName){
				if (!_gridUtil.isDraggableColumn)
					ev.stop();
			// 순서변경
			}else{
				if (!_gridUtil.isDraggableRow)
					ev.stop();
			}

		});

	}

	// rowFlag 변경
	_getRowDataFlag(preValue, editValue){
		if (preValue == null || preValue == '' || preValue == 'U'){
			return editValue;
		}else if (preValue == 'I' || preValue == 'D'){
			return preValue;
		}
	}

	// 커스텀렌더러에서 값을 변경한 경우
	setCustomRendererRowFlag(rowKey){
		this.setValue(rowKey, 'rowFlag', this._getRowDataFlag(this.getValue(rowKey, 'rowFlag'), 'U'));
	}

	// row 변경시 공통 처리(rowFlag, rowNo 값)
	_setCommRowData(action, rowData, rowCount){
		let updateRowData;
		if (action == 'appendRow'){
			updateRowData = {'rowFlag': 'I', 'rowNo': rowCount + 1};
			if (this.isDefaultRowData)
				Object.assign(updateRowData, this.defaultRowData, rowData);
			else
				Object.assign(updateRowData, rowData);

		}else if (action == 'updateRow'){
			let _rowKey = (this.isRowCheck) ? this.get().getCheckedRowKeys()[0] : rowData.rowKey;
			updateRowData = this.get().getRow(_rowKey);
			Object.assign(updateRowData, rowData);
			updateRowData.rowFlag = this._getRowDataFlag(updateRowData.rowFlag, 'U');

		}else if (action == 'updateRowByRowKey'){
			let _rowKey = rowData.rowKey;
			updateRowData = this.get().getRow(_rowKey);
			Object.assign(updateRowData, rowData);
			updateRowData.rowFlag = this._getRowDataFlag(updateRowData.rowFlag, 'U');

		}else if (action == 'moveRow'){

			let idx = 0;
			while(idx < this.get().getRowCount()){
				let rowData = this.get().getRowAt(idx);
				if (rowData.rowNo != rowData._attributes.rowNum)
					this.setValue(rowData.rowKey, 'rowFlag', this._getRowDataFlag(rowData.rowFlag, 'U'));

				this.setValue(rowData.rowKey, 'rowNo', idx+1);
				idx++;
			}

		}else if (action == 'removeRow'){

			let idx = 0;
			while(idx < this.get().getRowCount()){
				let rowData = this.get().getRowAt(idx);
				this.setValue(rowData.rowKey, 'rowNo', idx+1);
				idx++;
			}

		}else if (action == 'removeRowByRowFlag'){

			updateRowData = {'removeRowKeys': [], 'disableRowKeys': []};
			let idx = 0;
			let rowNo = 1;
			while(idx < rowCount){
				let currentRowData = this.get().getRowAt(idx);
				if (rowData.includes(currentRowData.rowKey) && 'I' == this.getValue(currentRowData.rowKey, 'rowFlag')){
					updateRowData.removeRowKeys.push(currentRowData.rowKey);
				}else{
					if (rowData.includes(currentRowData.rowKey) && 'I' != this.getValue(currentRowData.rowKey, 'rowFlag')){
						this.setValue(currentRowData.rowKey, 'rowFlag', this._getRowDataFlag(currentRowData.rowFlag, 'D'));
						updateRowData.disableRowKeys.push(currentRowData.rowKey);
					}

					this.setValue(currentRowData.rowKey, 'rowNo', rowNo);
					rowNo++;
				}
				idx++;
			};
		}

		return updateRowData;
	}

	// 이벤트 발생시 공통 처리(rowFlag, rowNo 값)
	_setCommRowEvent(eventName, event){

		//readData, setData event
		if(eventName == 'onGridUpdated'){

			let idx = 0;
			while(idx < this.get().getRowCount()){
				let rowData = this.get().getRowAt(idx);
				if (rowData.rowFlag === undefined)
					rowData.rowFlag = '';
				rowData.rowNo = idx + 1;
				this.get().setRow(rowData.rowKey, rowData);
				idx++;
			}

		// drop event
		}else if(eventName == 'drop'){

			if (event.targetRowKey !== undefined)
				this._setCommRowData('moveRow');

		// cell update event
		}else if(eventName == 'afterChange'){

			let updateRowkeys = [];
			let _gridUtil = this;
			event.changes.forEach(function(changeData){
				if(changeData.columnName != 'rowFlag' && changeData.columnName != 'rowNo'){
					if (!updateRowkeys.includes(changeData.rowKey))
						updateRowkeys.push(changeData.rowKey);
				}
			});

			if (updateRowkeys.length > 0){
				updateRowkeys.forEach(function(rowKey){

					let rowData = _gridUtil.get().getRow(rowKey);
					rowData.rowFlag = (rowData.rowFlag == null && rowData.rowNo == null) ? 'I' : _gridUtil._getRowDataFlag(rowData.rowFlag, 'U');
					rowData.rowNo = rowData._attributes.rowNum;

					if (_gridUtil.isDefaultRowData){
						_gridUtil.columnList.forEach(function(columnName){
							if (columnName != 'rowNo' && columnName != 'rowFlag'){
								if (rowData[columnName] == null)
									rowData[columnName] = _gridUtil.defaultRowData[columnName];
							}
						});
					}

					_gridUtil.get().setRow(rowKey, rowData);


				});
			}

			if( typeof delFunction == 'function' ) {
				delFunction(this.gridOpt);
			}


		}
	}

    // respose 오류시 alert 처리
    _responseExceptAlert(isLogin, message){
		let isModal = true;

		if (typeof modalMessage == 'undefined')
			isModal = false;

		if(isModal){
			if(isLogin){
				(async () =>{
		    		await modalMessage('alert', message);
		    		window.onbeforeunload = null;
		    		location.href="/Login";
		    	})();
			}else{
				(async () =>{
		    		await modalMessage('alert', message);
		    	})();
			}
		}else{
			if(isLogin){
				alert(message);
                location.href="/Login";
			}else{
				alert(message);
			}
		}
	}

    // 체크박스 체크
    _isValidationCheckBox(){
        let isCheckOneRow = true;
        let checkMessage = '';
        if (this.get().getCheckedRows().length == 0){
            isCheckOneRow = false;
            checkMessage = '선택된 row가 없습니다.';
        } else if (this.get().getCheckedRows().length != 1){
            isCheckOneRow = false;
            checkMessage = '해당기능은 한개만 선택이 가능합니다.';
        }

        return [isCheckOneRow, checkMessage];
    }

    // 토스트 그리드 반환
    get(){
        return this.grid;
    }

    // 그리드 (전체) data set
    // data = [{name: '홍길동'}, {name: '홍길동1'}]
    setData(data){
        this.get().resetData(data);
    }

    // 그리드 컬럼 데이터 수정
    setValue(rowKey, columnName, value){
		this.get().setValue(rowKey, columnName, value, false);
	}

	// 그리드 rowKey index로 조회
	getRowKeyByIndex(index){
		return this.get().getRowAt(index).rowKey;
	}

    // 그리드 (전체, 체크된) data get
    // return 배열
    getData(rowKey){
        if (rowKey === undefined){
            if (this.isRowCheck)
                return this.get().getCheckedRows();
            else
                return this.get().getData();
        }else{
            return this.get().getRow(rowKey);
        }
    }

    // 그리드 (전체) data get
    getDatas(){
		return this.get().getData();
	}

	// 그리드 (전체) column명, column값로 분류해서 data get
	//filterArr = [{columnName : '', columnValue: ''}]
	findDataByColumnfilter(filterArr){
		let resultData = [];

		if(this.get().getRowCount() > 0 && filterArr !== undefined){
			this.get().getData().forEach(function(rowData){
				let checkIdx = 0;
				filterArr.forEach(function(filter){
					if(rowData[filter.columnName] == filter.columnValue)
						checkIdx += 1;
				});

				if(filterArr.length == checkIdx)
					resultData.push(rowData);
			});
		}

		return resultData;
	}

	// 그리드 목록 보내기전 값 체크 return boolean 후 false면 alert
	isValidationData(){
		let checkResult = true;
		let _gridUtil = this;
		this.get().getData().forEach(function(data, index){
			if (checkResult){
				_gridUtil.gridOpt.columns.forEach(function(column){
					if (checkResult && column.name != 'rowFlag' && column.name != 'rowNo'){
						if (_gridUtil._isEmpty(data[column.name])){
							checkResult = false;
							let message = column.header +'['+ data.rowNo +'번째 줄] 값을 입력해주세요.';
							_gridUtil._responseExceptAlert(false, message);
						}
					}
				});
			}
		});

		return checkResult;
	}

	_isEmpty(value){
		let checkResult = false;
		if (typeof(value) == 'string'){
			if(value == null || value.trim() == '')
				checkResult = true;
		}
		return checkResult;
	}

    // 그리드 컬럼 value 조회
    getValue(rowkey, columnName){
		return this.get().getValue(rowkey, columnName);
	}

    // 그리드 Datasource readData 호출
    // params = {searchTitle: '제목'} [size는 pageSize]
    readData(params){
		// 그리드 data 초기화는 true
		this.get().readData(1, params, false);
		if (this.isPagination){
			this.get().getPagination().setItemsPerPage(Number(params.size));
			this.get().getPagination().reset(this.get().getPaginationTotalCount());
		}
	}

    // row 추가
    // data = {name: '홍길동'}
    appendRow(rowData){
		let rowCount = this.get().getRowCount();
        this.get().appendRow(this._setCommRowData('appendRow', rowData, rowCount), {
            // 해당 컬럼 추가 위치
            at: rowCount,
            // 포커스 여부
            focus: false
        });
    }

    // row 수정
    // 체크박스가 아닐 경우 rowData에 rowKey가 포함되어있어야함
    updateRow(rowData, rowKey){
		if (rowKey === undefined){
			if (this.isRowCheck){
	            let [isCheckOneRow, checkMessage] = this._isValidationCheckBox();
	            if (isCheckOneRow)
	                this.get().setRow(this.get().getCheckedRowKeys()[0], this._setCommRowData('updateRow', rowData));
	            else
					this._responseExceptAlert(false, checkMessage);
	        }else{
				if (rowData.rowKey === undefined)
					this._responseExceptAlert(false, '필수값이 없습니다.');
				else
					this.get().setRow(rowData.rowKey, this._setCommRowData('updateRow', rowData));
			}
		}else{
			rowData.rowKey = rowKey;
			this.get().setRow(rowKey, this._setCommRowData('updateRowByRowKey', rowData));
		}
    }

    // row 삭제(체크박스가 있는 경우 체크된 row 삭제, 없으면 아래부터 삭제)
    removeRow(rowKey){
		let _grid = this.get();
        if (rowKey === undefined)
			// 그리드 로우 삭제
			this.isRowCheck ? _grid.removeCheckedRows(false) : _grid.removeRow(_grid.getRowAt(_grid.getRowCount()-1).rowKey);
		else
			_grid.removeRow(rowKey);

		this._setCommRowData('removeRow');

        // 그리드 레이아웃 리프레시
        _grid.refreshLayout();
    }

    // row 삭제 (rowFlag에 따라서 삭제또는 flag 변경)
    removeRowByRowFlag(rowKey){
		let _grid = this.get();
		let rowCount = _grid.getRowCount();
		let checkedRowKeys = [];

		if (rowKey === undefined){
			if (this.isRowCheck)
				checkedRowKeys = _grid.getCheckedRowKeys();
			else
				checkedRowKeys.push(_grid.getRowAt(_grid.getRowCount()-1).rowKey);
		}else{
			checkedRowKeys.push(rowKey);
		}

		if (checkedRowKeys.length > 0){
			let updateData = this._setCommRowData('removeRowByRowFlag', checkedRowKeys, rowCount);

			_grid.uncheckAll(true);

			if (updateData.removeRowKeys.length > 0)
				_grid.removeRows(updateData.removeRowKeys);


			if (updateData.disableRowKeys.length > 0){
				updateData.disableRowKeys.forEach(function(disableRowKey){
					_grid.disableRow(disableRowKey, true);
				});
			}

			_grid.refreshLayout();
		}
	}

    // row 이동
    // isUp[boolean] row이동이 Up인지 여부
    moveRow(isUp){
        if (this.isRowCheck){
            let [isCheckOneRow, checkMessage] = this._isValidationCheckBox();
            if (isCheckOneRow){
                let checkRowKey = this.get().getCheckedRowKeys()[0];
                let targetIndex = isUp ? this.get().getIndexOfRow(checkRowKey) - 1 : this.get().getIndexOfRow(checkRowKey) + 1;
                this.get().moveRow(checkRowKey, targetIndex);
                this._setCommRowData('moveRow');
            }else{
				this._responseExceptAlert(false, checkMessage);
            }
        }
    }

	//그리드 비활성 컬럼 활성화(활성화 대상 컬럼명)
    enableCell(columnName){
		let _rowCnt = this.get().getRowCount();
		let rowNumber = this.get().getRowAt(_rowCnt-1).rowKey
		this.get().enableCell(rowNumber, columnName);
	}

    // event init rowData

}

// 텍스트 editor
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

// 숫자 editor
class CustomIntEditor {
    constructor(props) {
        const el = document.createElement('input');
        const {maxLength, minValue, maxValue} = props.columnInfo.editor.options;
        el.type = 'text';
        el.maxLength = maxLength;
        el.value = String(props.value);

		el.addEventListener('keyup', function(){
            el.value = el.value.replace(/[^0-9]/g,'');
            if (minValue !== undefined){
				if (el.value == '' || Number(el.value) < minValue)
					el.value = minValue;
			}

			if (maxValue !== undefined){
				if (el.value != '' && Number(el.value) > maxValue)
					el.value = maxValue;
			}
        });

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

// 퍼센트 editor
class CustomRateEditor {
    constructor(props) {
        const el = document.createElement('input');
        const {maxLength} = props.columnInfo.editor.options;
        el.type = 'text';
        el.maxLength = maxLength;
        el.value = String(props.value);

		el.addEventListener('keyup', function(){
            el.value = el.value.replace(/[^-\.0-9]/g,'');
            let regExp = /^\d{0,2}(\.\d{0,2})?$/;
			if(!regExp.test(el.value))
				el.value = el.value.substring(0, el.value.length - 1);
        });

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

// input 에서 숫자만 들어갈 경우
class CustomNumberEditor {
    constructor(props) {
        const el = document.createElement('input');
        const { maxLength } = props.columnInfo.editor.options;
        el.type = 'text';
        el.maxLength = maxLength;

        if(props.value){
        	el.value = (props.value != '' ? props.value : '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        }else{
			el.value = 0;
		}
        this.el = el;
    }
    getElement() {
        return this.el;
    }
    getValue() {
		if(this.el.value){
			 return (this.el.value != '' ? this.el.value : '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
		}else{
			return 0;
		}

    }
    mounted() {
        this.el.select();
    }
}

// Fixme : 커스텀 렌더러 참조하여 하위에 렌더러 작성할것
// 커스텀렌더러
class TestRenderer {
    constructor(props) {
        this.el = document.createElement("div");
        this.render(props);
    }
    render(props) {
        let targetEl = this.el;
        let renderHtml = '<button type="button" class="btn">'+props.value.txt+'</button>';
        renderHtml += '<input type="radio" name="radioTest" value="radio1"><span>radio1</span>';
        renderHtml += '<input type="radio" name="radioTest" value="radio2"><span>radio2</span>';
        renderHtml += '<input type="text" id="textTest">';
        renderHtml += '<input type="checkbox" name="checkboxTest" value="checkbox1"><span>check1</span>';
        renderHtml += '<input type="checkbox" name="checkboxTest" value="checkbox2"><span>check2</span>';

        targetEl.style.cssText = "text-align;center";
        targetEl.innerHTML = renderHtml;

        // Fixme : selectbox의 본태그 속성을 사용할수 없어서 문제가 됨(작업발생시 기존 editor로 필드를 빼던가, style로 구현해야함)

        // 버튼 이벤트
        targetEl.querySelectorAll('.btn').forEach(function(node){
            node.addEventListener('click', function(){
                props.value.buttonValue = props.value.id;
                let fnCall = props.value.fnCallBack;
                fnCall(props.rowKey, props.value.id);
            });
        });

        // 라디오 이벤트
        targetEl.querySelectorAll('input[name="radioTest"]').forEach(function(node){
            node.addEventListener('change', function(){
                props.value.radioValue = this.value;
            });
        });

        // 텍스트 이벤트
        targetEl.querySelector('#textTest').addEventListener('click', function(){
            this.focus();
        });
        targetEl.querySelector('#textTest').addEventListener('keyup', function(){
            props.value.textValue = this.value;
        });

        // 체크박스 이벤트
        targetEl.querySelectorAll('input[name="checkboxTest"]').forEach(function(node){
            node.addEventListener('click', function(){
                let checkedValue = [];
                targetEl.querySelectorAll('input[name="checkboxTest"]:checked').forEach(el=>{
                    checkedValue.push(el.value);
                });
                props.value.checkBoxValue = checkedValue;
            });
        });
    }
    getElement() {
        return this.el;
    }
}

// iframe to iframe tab open
/*
	사용법 ex)
		{
			header: '브랜드코드',
			name: 'brandCd',
			renderer :{
		    	  //해당 커스텀 랜더러의 클래스명 호출
		    	  type : iframeOpenUrlRender,
		    	  options : {
					  // name값은 파라미터의 name값을 셋팅
		    		  url 	: "/D/DB/DB009/view",
		    		  name : ["brandCd"]
		    	  }
		      }
		}
*/

class IframeOpenUrlRender {

	constructor(props) {
		this.el   = document.createElement("div");
		this.url  = props.columnInfo.renderer.options.url;
		this.name = props.columnInfo.renderer.options.name;
		this.key  = props.rowKey;
		this.rowdata = props.grid.getData()[props.rowKey];
		this.render(props);
	}

	render(props) {
		this.el.style.cssText = "text-align;center";
		// 옵션 name 배열이 없는경우 url만 전달
		if(!this.name){
			this.el.innerHTML =  '<a style="cursor:pointer;" class="devRqv" href="javascript:window.parent.iframeOpenTab(\''+ this.url +'\')">'+ props.formattedValue +'</a>';
		}
		// 옵션 name 배열이 있는경우
		else{

			var itemUrl = this.url +'?';

			for(var i = 0 ; i < this.name.length ; i++){
				if(i == Number(this.name.length) -1){
					itemUrl += this.name[i] +'='+this.rowdata[this.name[i]];
				}else{
					itemUrl += this.name[i] +'='+this.rowdata[this.name[i]]+"&";
				}
			}
			this.el.innerHTML =  '<a style="cursor:pointer;" class="devRqv"  href="javascript:window.parent.iframeOpenTab(\''+ itemUrl +'\')">'+ props.formattedValue +'</a>';
		}
	}

	getElement() {
		return this.el;
	}

}

// 팝업 rowHeader 단일 선택용 (4.* 대에서 radio header가 사라짐)
class RadioRender {

	constructor(props) {
		this.el 		= document.createElement("div");
		this.name 		= props.columnInfo.renderer.options.name;
		this.key  		= props.rowKey;
		this.rowdata 	= props.grid.getData()[props.rowKey];
		this.render(props);
	}

	render(props) {
		this.el.className = 'tui-grid-row-header-radio';
		this.el.style.cssText = "text-align;center";
		this.el.innerHTML = '<input type="radio" value="' + this.rowdata[this.name] + '" name="grid_radio" />';
	}

	getElement() {
		return this.el;
	}

	// $('radio[name=grid_radio]:checked') 로 해당 row 선택
}

class CustomImageRenderer {

  constructor(props) {
    let el = document.createElement('img');
	el.height = '40';
	/*el.addEventListener('error', (ev) => {
      el.src = '/images/photos.png';
    });*/
	el.style = 'object-fit: cover;';
    this.el = el;
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
	this.el.className="tui-grid-cell-content";
    // you can change the image link as changes the `value`

    if(props.value == null || props.value == ''){
		this.el.setAttribute('alt', '미등록');
    }else{
		this.el.src = String(props.value);
	}
  }

}

class ModelPopUpBtnRenderer{
	   constructor(props) {
        this.el = document.createElement("div");
        this.render(props);
    }
    render(props) {
        let targetEl = this.el;
        let renderHtml = '';
        if(props.columnInfo.name == '선택'){
	        renderHtml = '<button type="button" class="comm_btn">'+props.columnInfo.name+'</button>';
		}else if(props.columnInfo.name == '삭제' || props.columnInfo.name == '취소'){
	        renderHtml = '<button type="button" class="comm_btn del">'+props.columnInfo.name+'</button>';
		}
        targetEl.style.cssText = "text-align;center";
        targetEl.innerHTML = renderHtml;

    }
    getElement() {
        return this.el;
    }
}

//체크박스 renderer
class checkboxRender {
	constructor(props) {
		//console.log("props="+JSON.stringify(props.columnInfo,null,2));
		this.el = document.createElement("div");
		this.render(props);
	}
	render(props) {
		this.el.style.cssText = "text-align;center";
		if(props.formattedValue=="1"){
			this.el.innerHTML = '<input type="checkbox" value="' + props.formattedValue + '" name="'+props.columnInfo.name+'" checked/>';
		}else{
			this.el.innerHTML = '<input type="checkbox" value="' + props.formattedValue + '" name="'+props.columnInfo.name+'" />';
		}
	}
	getElement() {
		return this.el;
	}
}
class noneButtonRender {
	constructor(props) {
		this.el = document.createElement("div");
		this.render(props);
	}
	render(props) {
		// 해당플래그에 따라 변동
		if(props.columnInfo.name=="selectButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn save">선택</button>';
			let rowdata = props.grid.getRow(props.rowKey);
			if(rowdata.selectButton == 'I'){
				this.el.innerHTML = '등록중';
			}
		}
		if(props.columnInfo.name=="releaseProcess"){
			this.el.innerHTML = '<button type="button" class="comm_btn save">출고요청</button>';
			let rowdata = props.grid.getRow(props.rowKey);
			if(rowdata.requestCncl == 'Y'){
				this.el.innerHTML = '불가';
			}
		}
		if(props.columnInfo.name=="bscadd"){
			this.el.innerHTML = '<button type="button" class="comm_btn add">기본구성품 추가</button>';
			let rowdata = props.grid.getRow(props.rowKey);
			if(rowdata != null){
				if(rowdata.selectButtonYn == 'N'){
					this.el.innerHTML = '';
				}
				if(rowdata.selectButtonYn == 'A'){
					this.el.innerHTML = '기본구성품(완료)';
				}
			}
		}



	}
	getElement() {
		return this.el;
	}
}

//버튼 renderer
class buttonRender {
	constructor(props) {
		this.el = document.createElement("div");
		this.render(props);
	}
	render(props) {
		this.el.style.cssText = "text-alig3n;center";
		if(props.columnInfo.name=="deleteButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn del">삭제</button>';
		}else if(props.columnInfo.name=="cancelButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn del">취소</button>';
		}else if(props.columnInfo.name=="selectButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn save">선택</button>';
		}else if(props.columnInfo.name=="addButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn">등록</button>';
		}else if(props.columnInfo.name=="changeButton"){
			this.el.innerHTML = '<button type="button" class="comm_btn">변경</button>';
		}else if(props.columnInfo.name=="thingUniqueNoBtn"){
			if(props.grid.getData()[props.rowKey].releaseType=="1" && (props.grid.getData()[props.rowKey].thingSe=="1" || props.grid.getData()[props.rowKey].thingSe=="3")){
				this.el.innerHTML = '<button type="button" class="comm_btn">find</button>';
			}
		}else if(props.columnInfo.name=="bscadd"){
			this.el.innerHTML = '<button type="button" class="comm_btn add">기본구성품 추가</button>';
		}else{
			if(props.columnInfo.header.trim()!=""){
				this.el.innerHTML = '<button type="button" class="comm_btn">'+props.columnInfo.header+'</button>';
			}else{
				this.el.innerHTML = '<button type="button" class="comm_btn">'+props.columnInfo.name+'</button>';
			}
		}
	}
	getElement() {
		return this.el;
	}
}

class CustomCursorRenderer {

  constructor(props) {
    const el = document.createElement('div');
    this.el = el;
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
		this.el.innerHTML = '<a style="cursor:pointer;" class="devRqv">'+ String(props.value) +'</a>';
  }

}

class CustomColumnHeader {
  constructor(props) {
    const columnInfo = props.columnInfo;
    const el = document.createElement("div");
    el.className = "girdTooltipTh";
    this.el = el;
  }

  getElement() {
    return this.el;
  }

  render(props) {
    this.el.innerHTML = `${props.columnInfo.header}<span class="gridTooltip__icon"></span>`;
  }
}

//23. 12. 06 jy
//회원 리스트 연동 계정 이미지를 위한 CustomRenderer
class CustomIdLogoRenderer {

	constructor(props) {
		this.el   = document.createElement("div");
		this.memberId = props.columnInfo.renderer.options.memberId;
		this.kakaoId = props.columnInfo.renderer.options.kakaoId;
		this.naverId = props.columnInfo.renderer.options.naverId;
		this.key  = props.rowKey;
		this.rowdata = props.grid.getData()[props.rowKey];
		this.render(props);
	}

	render(props) {
		
		let logoImage = '';

		if (this.rowdata[this.memberId] !== null) {
		    logoImage += '<img src="/images/admin/icon_id.png" alt="id이미지">';
		}
		
		if (this.rowdata[this.kakaoId] !== null) {
		    logoImage += '<img src="/images/admin/icon_kakao.png" alt="kakao이미지">';
		}
		
		if (this.rowdata[this.naverId] !== null) {
		    logoImage += '<img src="/images/admin/icon_naver.png" alt="naver이미지">';
		}

		this.el.style.textAlign = "center";
		this.el.innerHTML = logoImage;

	}

	getElement() {
		return this.el;
	}

}

//23. 12. 08 jy
//멈버십 리스트 관리 버튼을 위한 CustomRenderer
class CustomMngBtnRenderer {

	constructor(props) {
		this.el   = document.createElement("div");
		this.regularStatus = props.columnInfo.renderer.options.regularStatus;
		this.membershipStatus = props.columnInfo.renderer.options.membershipStatus;
		this.duesStatus = props.columnInfo.renderer.options.duesStatus;
		this.isPaymentCompleted = props.columnInfo.renderer.options.isPaymentCompleted;
		this.key  = props.rowKey;
		this.rowdata = props.grid.getData()[props.rowKey];
		this.render(props);
	}

	render(props) {

		let mngBtn = '';
		
		// (정회원 확인 여부 요청전이거나 확인요청 단계 일 때) and (멤버십신청상태가 대기 일 때) and (회비납부내역이 없을 때) '정회원확인요청' 버튼 생성 
		if ((this.rowdata[this.regularStatus] === '-' || this.rowdata[this.regularStatus] === '확인요청중') && this.rowdata[this.membershipStatus] === '대기' && this.rowdata[this.duesStatus] === '-' ) {
			
			mngBtn += '<button type="button" class="comm_btn" onclick="regularRequest('+ props.rowKey +');">'+'정회원확인요청'+'</button>';
		// 정회원 확인 여부가 거절이면
		} else if (this.rowdata[this.regularStatus] === '거절') {
			
			mngBtn += '<button type="button" class="comm_btn" onclick="regularRequest('+ props.rowKey +');">'+'정회원확인요청'+'</button>';
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipRejectRequest('+ props.rowKey +');">'+'거절'+'</button>';
		// 정회원 확인여부가 승인이고 멤버십신청상태가 대기이면
		} else if (this.rowdata[this.regularStatus] === '승인' && this.rowdata[this.membershipStatus] === '대기') {
			
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipPayRequest('+ props.rowKey +');">'+'결제요청'+'</button>';
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipRejectRequest('+ props.rowKey +');">'+'거절'+'</button>';
			
		} else if (this.isPaymentCompleted === 'N' && this.rowdata[this.regularStatus] === '승인' && this.rowdata[this.membershipStatus] === '심의 진행중' && this.rowdata[this.duesStatus] === '-') {
			
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipApproveRequest('+ props.rowKey +');">'+'최종승인'+'</button>';
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipRejectRequest('+ props.rowKey +');">'+'거절'+'</button>';
			
		} else if (this.isPaymentCompleted === 'Y' && this.rowdata[this.regularStatus] === '승인' && this.rowdata[this.membershipStatus] === '심의 진행중' && this.rowdata[this.duesStatus] === '결제완료') {
			
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipApproveRequest('+ props.rowKey +');">'+'최종승인'+'</button>';
			mngBtn += '<button type="button" class="comm_btn" onclick="membershipRejectRequest('+ props.rowKey +');">'+'거절'+'</button>';
			
		} else {

			mngBtn += '-';
		}
		this.el.style.textAlign = "center";
		this.el.innerHTML = mngBtn;

	}

	getElement() {
		return this.el;
	}

}