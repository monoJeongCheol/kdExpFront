function DndUploadModule(varNm, dzId, inputId, mx, wd, he, typ,ronly) {
	/*
		varNm 	: grid시 key
		dzId	: drag and drop
		inputId	: input file
		mx		: max file
		wd		: width
		he		: height
	*/

	let fileIndex 		= 0;
	let totalFileSize 	= 0;
	let fileList 		= new Array();
	let fileSizeList 	= new Array();
	let uploadSize 		= 50;
	let maxUploadSize 	= mx;
	let uwd 			= wd;
	let uhe 			= he;
	let uVarNm 			= varNm;
	let uDzId 			= dzId;
	let uInputId 		= inputId;
	let type			= typ; // file형태와 이미지 형태의 두가지로 나뉜다 img / file
	let readonly		= ronly;

	var fakeTest 		= false;

	var deleteSaveKeyList = new Array();

	this.getDeleteKey = function(){
		return deleteSaveKeyList;
	}

	this.setDeleteSaveKeyList =function(a){
		deleteSaveKeyList.push(a);
	}


	// update 시에는 그릴수 없다.
	this.grid = function() {
		var ihtml    = '<div class="drop_zone">';
		ihtml       += '<div class="upload-btn-wrapper" style="display:none">';
		ihtml  	 	+= '<input type="file" id="upload_' + uInputId + '"  multiple="multiple" style="do"/>';
		ihtml  	 	+= '</div><div class="textlen">[ <span id="file_mx_'+ uInputId +'">0</span> / '+ mx+' ]</div>';

		if(type == 'file' ){
			if(readonly != true){
				ihtml  		+= '<div class="info_text" id="fileDragDesc_' + uVarNm + '">마우스로 <i>드래그해서</i> 문서를 추가해주세요.</div>';
			}else{
				ihtml  		+= '<div class="info_text" id="fileDragDesc_' + uVarNm + '">파일이 없습니다.</div>';
			}
			ihtml 		+= '<div class="file_list" id="fileListTable_' + uVarNm + '" style="height:100px; overflow-y:auto;display:none">'
			ihtml 		+= '	<div id="fileTableTbody_' + uVarNm + '">';
		}else{
			ihtml  		+= '<div class="info_text" id="fileDragDesc_' + uVarNm + '">마우스로 <i>드래그해서</i> 이미지를 추가해주세요.</div>';
			ihtml 		+= '<div class="file_list" id="fileListTable_' + uVarNm + '" >'
			ihtml 		+= '	<div id="fileTableTbody_' + uVarNm + '" >';
		}
		ihtml 		+= '	</div>';
		ihtml 		+= '</div>';
		ihtml    	+= '<div class="btns"><button class="comm_btn dndUpBtn" type="button" id="btn_' + uInputId + '">UPLOAD</button></div>';
		ihtml 		+= '</div>';
		$('#' + uDzId).html(ihtml);


	}
	
	this.gridImage = function() {
		var ihtml    = '<div class="drop_zone">';
		ihtml       += '<div class="upload-btn-wrapper" style="display:none">';
		ihtml  	 	+= '<input type="file" id="upload_' + uInputId + '"  multiple="multiple" style="do"/>';
		ihtml  	 	+= '</div>';
		ihtml 		+= '<div class="file_list" id="fileListTable_' + uVarNm + '" >'
		ihtml 		+= '	<div id="fileTableTbody_' + uVarNm + '" >';
		ihtml 		+= '	</div>';
		ihtml 		+= '</div>';
		ihtml    	+= '<div class="btns"><button class="comm_btn dndUpBtn" type="button" id="btn_' + uInputId + '">저장버튼</button></div>';
		ihtml 		+= '</div>';
		$('#' + uDzId).html(ihtml);
	}

	// update시 ajax json 을 통하여 해당화면을 그린다. 해당의 이미지정보s
	this.fakeGrid = function(orgJsonArr){

			if(fakeTest){
				jsonArr = [{
					'url' : 'https://d2qgx4jylglh9c.cloudfront.net/kr/wp-content/uploads/2022/08/%ED%8F%AC%EC%8A%A4%EC%BD%94_9%EC%9B%94%EB%B0%B0%EA%B2%BD%ED%99%94%EB%A9%B4_1-3.jpg',
					'key' : 'a11',
					'fileName' : 'test1',
					'fileSizeStr' : 'testsize'
				},{
					'url' : 'https://d2qgx4jylglh9c.cloudfront.net/kr/wp-content/uploads/2022/08/%ED%8F%AC%EC%8A%A4%EC%BD%94_9%EC%9B%94%EB%B0%B0%EA%B2%BD%ED%99%94%EB%A9%B4_1-3.jpg',
					'key' : 'a12',
					'fileName' : 'test1',
					'fileSizeStr' : 'testsize'
				}]
			}

			var jsonArr = JSON.parse(JSON.stringify(orgJsonArr));

			$('#fileTableTbody_' + uVarNm).html('');

			for(var i=0;i<jsonArr.length;i++){
				jsonArr[i].key = 'a'+i;
				//jsonArr[i].url = 'https://d2qgx4jylglh9c.cloudfront.net/kr/wp-content/uploads/2022/08/%ED%8F%AC%EC%8A%A4%EC%BD%94_9%EC%9B%94%EB%B0%B0%EA%B2%BD%ED%99%94%EB%A9%B4_1-3.jpg';
				type=jsonArr[i].fileExtension;
				var html = "";
				if(type == null || type == 'jpg'|| type == 'jpeg'|| type == 'gif'|| type == 'png'|| type == 'svg'){

					html += "<ul class=\"dndUl \" id='fileTr_fake_" + uVarNm + "_" + jsonArr[i].key + "' >";
					html += "    <li id='chk_"+ uVarNm +"' class='left chk_" + uVarNm + "' >";
					html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src="'+ jsonArr[i].fileUrlPath +'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" onerror="this.src=\'/images/photos.png\'" />';
					html += "    </li>";
					html += "    <li class='del_btn'>";
					html += '<input value="삭제" type="button" title="삭제" href="javascript:void()"';
					html += " onclick=\"" + uVarNm + ".fakeDeletes(\'" + jsonArr[i].key + "\',\'"+ jsonArr[i].fileSn +"\',"+uVarNm+"); return false; \" />";
					html += "    </li>";
					html += "</ul>";

					$('#fileTableTbody_' + uVarNm).append(html);

					//수를 다시세팅한다.
					$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);

				}else if(type == 'ai' || type == 'pdf'|| type =='xls'|| type == 'xlsx'|| type == 'hwp'|| type == 'doc'|| type == 'docm'|| type == 'docx'|| type =='ppt'|| type =='pptx'|| type =='zip'){

					html += "<ul class=\"dndUl \" id='fileTr_fake_" + uVarNm + "_" + jsonArr[i].key + "' >";
					html += "    <li id='chk_"+ uVarNm +"' class='left chk_" + uVarNm + "' >";
					if(type == 'pdf'|| type =='ppt'|| type =='pptx'){
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/pdf.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}else if(type =='xls'|| type == 'xlsx'){
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/xls.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}else if(type =='hwp'){
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/hwp.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}else if(type =='zip'){
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/zip.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}else if(type == 'doc' || type == 'docm'|| type == 'docx'){
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/doc.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}else{
						html += '<img class="zimg" id="pre_fake_' + uVarNm + '_' + jsonArr[i].key + '" src=\'/images/photos.png\'"  style="max-width:' + uwd + 'px;height:' + uhe + 'px;" />';
					}
					html += "    </li>";
					html += '<a target="_blank" href="/Download?fileSn=' + jsonArr[i].fileSn + '" download="'+jsonArr[i].fileOriginalName+'">'+ jsonArr[i].fileOriginalName+'</a>';
					html += "    <li class='del_btn'>";
					if(readonly != true){
					html += '<input value="삭제" type="button" class="fakeFileView" title="삭제" style="margin-left:9px; font-size : unset; padding-bottom : 0px; padding-top : 0px; margin-bottom : 3px;" href="#"';
					html += " onclick=\"" + uVarNm + ".fakeDeletes(\'" + jsonArr[i].key + "\',\'"+ jsonArr[i].fileSn +"\',"+uVarNm+"); return false; \" />";
					}
					html += "    </li>";
					html += "</ul>";

					$('#fileTableTbody_' + uVarNm).append(html);

					//수를 다시세팅한다.
					$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);
				}
			}
			if(jsonArr.length > 0){
				$("#fileDragDesc_"+ uVarNm).hide();
				$('[id^="fileListTable_' + uVarNm + '"]').show();
			}

	}

	this.deleteUnit = function(i) {
		return deleteFile(i);
	}
	this.fakeDeletes = function(k,ok,v) {
		return fakeDelete(k, ok,v);
	}
	this.onlyView = function(){
		$('.dndUpBtn').hide();
		$('.comm_drop_file').css('min-height', 167);
		$('.fakeFileView').hide();
	}

	this.fileDropDown = function() {

		var dropZone = $("#" + uDzId);

		// 버튼
		$('#btn_'+uInputId).on('click',function(e){
			$('#upload_'+uInputId).click();
		});

		$('#upload_'+uInputId).on('change',function(e){

			// 값이 비어있으면
			// 현재 사이즈를 확인하고 리턴한다.
			var chksize = $('.chk_' + uVarNm).length;
			var files = document.getElementById('upload_'+uInputId).files;
			let fileArr = document.getElementById(uInputId).files;

			if(files.length == 0){

			}else{
				// 비어있지 않다면 추가한다.
				// 업로드에 추가
				// 종료후 삭제
				const dataTransfer = new DataTransfer();
				// 1차 사이즈체크
				if ( (chksize + files.length ) > mx) {
					modalMsg.messageToast('alert','업로드 가능 수를 초과하였습니다.');
					return false;
				}

				// 유효성체크
				if(extValid(files)){

					if (fileArr != null && fileArr.length > 0) {
						// =====DataTransfer 파일 관리========
						for (var i = 0; i < fileArr.length; i++) {
							dataTransfer.items.add(fileArr[i])
						}
					}

					// 추가된 파일
					for (var i = 0; i < files.length; i++) {
						dataTransfer.items.add(files[i]);
					}

					document.getElementById(uInputId).files = dataTransfer.files;

					selectFile(files);

					e.target.value = '';
				}

			}


		});


		//Drag기능
		dropZone.on('dragenter', function(e) {
			e.stopPropagation();
			e.preventDefault();
			dropZone.css('background-color', '#E3F2FC');
		});
		dropZone.on('dragleave', function(e) {
			e.stopPropagation();
			e.preventDefault();
			dropZone.css('background-color', '#FFFFFF');
		});
		dropZone.on('dragover', function(e) {
			e.stopPropagation();
			e.preventDefault();
			dropZone.css('background-color', '#E3F2FC');
		});
		dropZone.on('drop', function(e) {

			e.preventDefault();
			dropZone.css('background-color', '#FFFFFF');

			// 현재 사이즈를 확인하고 리턴한다.
			var chksize = $('.chk_' + uVarNm).length;

			if (chksize >= mx) {
				modalMsg.messageToast('alert','업로드 가능 수를 초과하였습니다.');
				return false;
			}

			const dataTransfer = new DataTransfer();

			let files = e.originalEvent.dataTransfer.files;

			let fileArr = document.getElementById(uInputId).files;

			// 2차 사이즈체크
			if ( (chksize + files.length ) > mx) {
				modalMsg.messageToast('alert','업로드 가능 수를 초과하였습니다.');
				return false;
			}

			if(extValid(files)){

				if (fileArr != null && fileArr.length > 0) {
					// =====DataTransfer 파일 관리========
					for (let i = 0; i < fileArr.length; i++) {
						dataTransfer.items.add(fileArr[i])
					}
				}
				// 추가된 파일
				for (let i = 0; i < files.length; i++) {
					dataTransfer.items.add(files[i]);
				}

				document.getElementById(uInputId).files = dataTransfer.files;


				if (files != null) {
					if (files.length < 1) {
						return;
					} else {
						selectFile(files);
						//alert(this.fileIndex);
					}
				} else {
					modalMsg.messageToast('alert',"ERROR");
				}
			}
		});
		if(readonly == true){
			this.onlyView();
		}

	}

	function extValid(fileArr){

		let result = true;

		if (fileArr != null && fileArr.length > 0) {

				const fileVaildArr = [];
				if (typ === 'img') {
				    fileVaildArr.push('jpg', 'jpeg', 'gif', 'png'); 
				} else {
				    fileVaildArr.push('ai', 'pdf', 'jpg', 'jpeg', 'gif', 'png', 'svg', 'xls', 'xlsx', 'hwp', 'ppt', 'pptx', 'zip', 'doc', 'docm', 'docx');
				}
				// 유효성검사
				for (let i = 0; i < fileArr.length; i++) {

					let fileName = fileArr[i].name;
					let fileSize = fileArr[i].size;
					let fileNameArr = fileName.split("\.");
					let ext = fileNameArr[fileNameArr.length - 1];
					
					if(fileSize > 26214400) {
						modalMsg.messageToast('alert','200MB를 초과하였습니다.');
						result = false;
						break;
					}

					if(fileVaildArr.indexOf(ext.toLowerCase()) < 0)  {
					 modalMsg.messageToast('alert','지원하지 않는 파일 형식입니다.');
						result = false;
						break;
					}
				}
		}

		return result;

	}

	// 파일선택
	function selectFile(fileObject) {

		let files = null;

		if (fileObject != null) {
			files = fileObject;
		} else {
			files = $('#multipaartFileList_' + uVarNm + '_' + fileIndex)[0].files;
		}
		if (files != null) {

			if (files != null && files.length > 0) {
				$("#fileDragDesc_" + uVarNm).hide();
				$("#fileListTable_" + uVarNm).show();
			} else {
				$("#fileDragDesc_" + uVarNm).show();
				$("#fileListTable_" + uVarNm).hide();
			}

			for (let i = 0; i < files.length; i++) {

				let fileName = files[i].name;

				let fileNameArr = fileName.split("\.");

				let ext = fileNameArr[fileNameArr.length - 1];

				let fileSize = files[i].size;
				if (fileSize <= 0) {
					return;
				}
				let fileSizeKb = fileSize / 1024;
				let fileSizeMb = fileSizeKb / 1024;

				let fileSizeStr = "";
				if ((1024 * 1024) <= fileSize) {
					fileSizeStr = fileSizeMb.toFixed(2) + " Mb";
				} else if ((1024) <= fileSize) {
					fileSizeStr = parseInt(fileSizeKb) + " kb";
				} else {
					fileSizeStr = parseInt(fileSize) + " byte";
				}
				
  				const fileVaildArr = ['ai', 'pdf', 'jpg', 'jpeg', 'gif', 'png', 'svg', 'xls', 'xlsx', 'hwp', 'ppt', 'pptx', 'zip', 'doc', 'docm', 'docx' ];
				
				if(fileVaildArr.indexOf(ext.toLowerCase()) < 0)  {
				 modalMsg.messageToast('alert','지원하지 않는 파일 형식입니다.');
					return;
				}else if (fileSizeMb > uploadSize) {

				modalMsg.messageToast('alert',"파일사이즈초과 : " + uploadSize + " MB");
				return;
				} else {
					totalFileSize += fileSizeMb;

					fileList[fileIndex] = files[i];

					fileSizeList[fileIndex] = fileSizeMb;

					addFileList(fileIndex, fileName, fileSizeStr, files[i]);

					fileIndex++;
				}
			}
		} else {
			modalMsg.messageToast('alert', "ERROR");
		}
	}

	// file to base64
	function fileToBase64(target, file) {
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			$('#' + target).attr('src', reader.result);	// base64
		}
	}
	
	function getFileExtension(filename) {
    const parts = filename.split('.');
    if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
        return '';
    }
	return parts.pop();
	}

	// file grid
	function addFileList(fIndex, fileName, fileSizeStr, file) {
		let html = "";

		$("#fileListTable_" + uVarNm).show();
		
		type = getFileExtension(file.name);

		if(type == null || type == 'jpg'|| type == 'jpeg'|| type == 'gif'|| type == 'png'|| type == 'svg'){
			html += "<ul class=\"dndUl\" id='fileTr_" + uVarNm + "_" + fIndex + "' >";
			html += "    <li id='chk_"+ uVarNm +"' class='left chk_" + uVarNm + "' >";
			html += '<img class="zimg" id="pre_' + uVarNm + '_' + fIndex + '" src=""  style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			html += "    </li>";
			html += "    <li class='del_btn'>";
			html += "<input value='삭제' type='button' title='삭제' href='#' onclick='" + uVarNm + ".deleteUnit(" + fIndex + "); return false;'>"
			html += "    </li>"
			html += "</ul>";

			$('#fileTableTbody_' + uVarNm).append(html);

			$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);

			fileToBase64('pre_' + uVarNm + '_' + fIndex, file);

		}else if(type == 'ai' || type == 'pdf'|| type =='xls'|| type == 'xlsx'|| type == 'hwp'|| type =='ppt'|| type =='pptx'|| type =='zip'||type == 'doc'||type == 'docm'||type == 'docx'){

			html += "<ul class=\"dndUl\" id='fileTr_" + uVarNm + "_" + fIndex + "'>";
			html += "    <li id='chk_"+ uVarNm +"' class='left chk_"+ uVarNm +"'>";
			if(type == 'pdf'|| type =='ppt'|| type =='pptx'){
				html += '<img class="zimg" src=\'/images/pdf.png\'"  style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}else if(type =='xls'|| type == 'xlsx'){
				html += '<img class="zimg" src=\'/images/xls.png\'"  style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}else if(type =='hwp'){
				html += '<img class="zimg" src=\'/images/hwp.png\'"  style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}else if(type =='zip'){
				html += '<img class="zimg" src=\'/images/zip.png\'"  style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}else if(type == 'doc' || type == 'docm'|| type == 'docx'){
				html += '<img class="zimg" src=\'/images/doc.png\'" style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}else{
				html += '<img class="zimg" src=\'/images/photos.png\'" style="width:' + uwd + 'px;height:' + uhe + 'px;"/>';
			}
			html += "    </li>";
			html += fileName + " (" + fileSizeStr + ") "
			html += "    <li class='del_btn'>";
			html += "<input value='삭제' type='button' title='삭제' href='#' onclick='" + uVarNm + ".deleteUnit(" + fIndex + "); return false;'>"
			html += "    </li>"
			html += "</ul>";

			$('#fileTableTbody_' + uVarNm).append(html);

			$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);

		}
	}

	// file delete
	function deleteFile(fIndex) {

		totalFileSize -= fileSizeList[fIndex];

		delete fileList[fIndex];

		delete fileSizeList[fIndex];

		console.log(fileList);

		$("#fileTr_" + uVarNm + "_" + fIndex).remove();

		const dataTransfer = new DataTransfer();

		let fileArr = document.getElementById(uInputId).files;


		if (fileList != null && fileList.length > 0) {

			// =====DataTransfer 파일 관리========
			for (var i = 0; i < fileList.length; i++) {
				if(fileList[i]){
					dataTransfer.items.add(fileList[i]);
				}

			}
		}

		document.getElementById(uInputId).files = dataTransfer.files;

		if (totalFileSize > 0) {
			$("#fileDragDesc_"+ uVarNm).hide();
			$("#fileListTable_"+ uVarNm).show();
		} else {
			$("#fileDragDesc_"+ uVarNm).show();
			$("#fileListTable_"+ uVarNm).hide();
		}
		// 단 fake가 있다면 숨기지 않는다.
		if($('[id^=pre_fake_' + uVarNm + '_]').length > 0){
			$("#fileDragDesc_"+ uVarNm).hide();
			$("#fileListTable_"+ uVarNm).show();
		}

		$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);
	}
	// update 재현용 삭제 실제키 저장
	function fakeDelete(key, orgkey, v){

		console.log(uVarNm);

		v.setDeleteSaveKeyList(orgkey);

		$("#fileTr_fake_" + uVarNm + "_" + key).remove();
		if(type == null || type == 'jpg'|| type == 'jpeg'|| type == 'gif'|| type == 'png'|| type == 'svg'){
			if($('[id^=pre_fake_' + uVarNm + '_]').length > 0){
				$("#fileDragDesc_"+ uVarNm).hide();
				$("#fileListTable_"+ uVarNm).show();
			}else{
				$("#fileDragDesc_"+ uVarNm).show();
				$("#fileListTable_"+ uVarNm).hide();
				$("#fileDragDesc_"+ uVarNm).show();
			}
			// 단 일반이 있다면 숨기지 않는다.
			if($('[id^=pre_' + uVarNm + '_]').length > 0){
				$("#fileDragDesc_"+ uVarNm).hide();
				$("#fileListTable_"+ uVarNm).show();
			}

			$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);
		}else if(type == 'ai' || type == 'pdf'|| type =='xls'|| type == 'xlsx'|| type == 'hwp'|| type == 'doc'|| type == 'docm'|| type == 'docx'|| type =='ppt'|| type =='pptx'|| type =='mp4'|| type =='zip'){

			if($('[id^=fileTr_fake_' + uVarNm + '_]').length > 0){
				$("#fileDragDesc_"+ uVarNm).hide();
				$("#fileListTable_"+ uVarNm).show();
			}else{
				$("#fileDragDesc_"+ uVarNm).show();
				$("#fileListTable_"+ uVarNm).hide();
				$("#fileDragDesc_"+ uVarNm).show();
			}

			$('#file_mx_'+ uInputId).html($('#fileTableTbody_'+ uVarNm).find('ul').length);
		}
	}

}