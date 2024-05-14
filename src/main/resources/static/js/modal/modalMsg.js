/********************************/
/*	jquery.modal.js  			*/
/********************************/

const modalMessage = async function modalMessage(type, msg,yestext,notext,xhr) {

  	var result = false;

  	if ( self !== top ) {
  		result = await window.parent.modalconfirm(type, msg, yestext, notext, xhr , jobId);
  	}else{
		result = await modalconfirm(type, msg, yestext, notext, xhr,jobId);
	}

  	return result;


}

// 메뉴정보가지고 오기
function programNm(pid){

	var txt = '';

	if(menuData){

		$.each(menuData,function(e){

			if(menuData[e].programId == pid){
				 txt = menuData[e].menuNmPath;
			}
		});
	}

	return txt;
}

function modalconfirm(type, msg, yestext, notext,xhr, baseJobId ) {

    console.log('modalmsginfo',type, msg, yestext, notext,xhr, baseJobId);
	$("#msgModal").remove();

	$('footer').after('<div id="msgModal" class="modal"><div id="modalgrid"></div></div>');

	$("#msgModal").modal({
		fadeDuration	: 0,
		escapeClose		: true,
		clickClose		: false,
		showClose		: false,
		closeExisting: false
	});

	if(type == 'confirm'){
		$("#msgModal").html(msg +' <br/><div style="display:flex;width:100%; flex-direction:row-reverse"><a class="comm_btn modalNo del" style="width:80px" rel="modal:close" >'+ notext +'</a>&nbsp;<a class="comm_btn modalYes save" style="width:80px" >' + yestext + '</a></div>');	
	}else if (type == 'boConfirm') {
		$("#msgModal").html(msg +' <br/><div style="display:flex;width:100%; flex-direction:row-reverse"><a class="comm_btn modalNo save" style="width:80px" rel="modal:close" >'+ notext +'</a>&nbsp;<a class="comm_btn modalYes del" style="width:80px" >' + yestext + '</a></div>');
	}else if(type == 'errorSave'){

		$("#msgModal").html(msg + ''+'<br/><br/><div style="display:flex; gap: 3px; width:100%; flex-direction:row-reverse"><a class="comm_btn modalYes save" style="width:80px" >확인</a><a class="comm_btn bg_theme" style="width:150px" onclick="openpop(\''+ msg +'\')">오류상세보기</a></div>');

		var divsaveError = '<div id="errReg" style="display:none; width:100%;border : 1px solid #ebebeb;padding:10px;margin-top:10px;>';
			divsaveError += '<br/>오류처리요청<br/>';
			divsaveError += '<div style="width:100%; height: 200px; margin : 10px; border :1px solid black">';

		if(xhr){
			divsaveError += '<br/>[ 메뉴 ] '+ programNm(baseJobId) +'<br/>';
			divsaveError += '<br/>[ URL ] '+ baseJobId +'<br/>';

			divsaveError += '<input type="hidden" id="errorJobId" value="'+baseJobId+'" />';
			divsaveError += '<input type="hidden" id="errorProgramNm" value="'+programNm(baseJobId)+'" />';

			divsaveError += '<br/><input id="errUrl" class="comm_enter" type="text" style="width:100%" value="'+xhr.responseURL+ '" readonly="readonly"/><br/>';
			divsaveError += '<br/>[PARAM]  <br/>';
			divsaveError += '<textarea id="errParam" class="comm_textarea" style="width:100%;height:150px;margin-top:5px;" readonly="readonly">'+JSON.stringify(xhr.formdata)+'</textarea>';
			divsaveError += '<br/><br/>[오류내용]  <br/>';
			divsaveError += '<textarea id="errDesc" class="comm_textarea" style="width:100%;height:150px;margin-top:5px;" readonly="readonly">'+xhr.responseJSON.meta.systemMessage+'</textarea>';
			divsaveError += '<br/><br/>[요청내용]  <br/>';
			divsaveError += '<textarea  id="errReq" class="comm_textarea"  style="width:100%;height:150px;margin-top:5px;"></textarea>';
		}else{
			divsaveError += '<textarea class="comm_textarea"  style="width:100%;height:200px;margin-top:5px;" readonly="readonly">오류가 발생하였습니다.</textarea>';
		}
			divsaveError += '<button type="button" class="comm_btn bg_theme" onclick="errorRequest()">오류처리요청</button><br/>';
			divsaveError += '</div>';
			divsaveError += '</div>';

		$('#msgModal').html($('#msgModal').html() + divsaveError);

	}else{
		$("#msgModal").html(msg +' <br/><div style="display:flex;width:100%; flex-direction:row-reverse"><a class="comm_btn modalYes save" style="width:80px" >확인</a></div>');
	}

	return new Promise(resolve => {

		$('.modalYes').on('click',function(e){
			$('#msgModal').remove();
			$('.jquery-modal.blocker.current').remove();
			$('.jquery-modal.blocker').removeClass('behind');
			$('.jquery-modal.blocker').addClass('current');
			resolve(true);
		});
		$('.modalNo').on('click',function(){
			$('#msgModal').remove();
			$('.jquery-modal.blocker.current').remove();
			$('.jquery-modal.blocker').removeClass('behind');
			$('.jquery-modal.blocker').addClass('current');
			resolve(false);
		});

  	});
}

// 오류등록폼을 넣어준다.
function openpop(msg){

	// var win = window.open("", "PopupWin", "width=500,height=600");
	// win.document.write("<p>새창에 표시될 내용 입니다.</p>");
	$('#errReg').show();
	$('#msgModal').css('height','800px');

}

// 오류를 요청한다. 메뉴명 에러내용 에러참고내용등으로 구성한다.
function errorRequest(){

	var pid 	= $('#errorJobId').val();
	var pNm 	= $('#errorProgramNm').val();
	var url 	= $('#errUrl').val();
	var param 	= $('#errParam').val();
	var eDsc  	= $('#errDesc').val();
	var eReq  	= $('#errReq').val();

	$.ajax({
         url 		: '/comm/api/saveErrorRequest',
         dataType 	: 'json',
         type 		: 'POST',
         data	  	: {
			menuNm 		: pNm,
			url			: url,
			programId 	: pid,
			parameter 	: param,
			errorCn	  	: eDsc,
			requestCn	: eReq
		 },
         async    	: false,
         success 	: function(result) {
        	modalMsg.messageToast('success','저장 되었습니다.');
        	$('.modalYes').click();
         },
         error : function(e){
			modalMsg.messageToast('error','저장에 실패하였습니다.');
			return false;
		}
     });

}

function iframeMessage(msgGbn,msg){

	 toastr.options = {
              "closeButton": true,
              "debug": false,
              "newestOnTop": true,
              "progressBar": true,
              "positionClass": "toast-bottom-right",
              "preventDuplicates": false,
              "onclick": null,
              "showDuration": "100",
              "hideDuration": "2000",
              "timeOut": "2500",
              "extendedTimeOut": "2000",
              "showEasing": "swing",
              "hideEasing": "linear",
              "showMethod": "fadeIn",
              "hideMethod": "fadeOut"
            }


	switch(msgGbn){
		case 'info':
			toastr.info(msg);
	    	break;
	  	case 'success':
		  	toastr.success(msg);
	    	break;
	  	case 'warning':
	  		toastr.warning(msg);
	    	break;
	  	case 'error':
	  		toastr.error(msg);
	    	break;
	  	default:
	  		toastr.error(msg);
	}

}

// 전달용(iframe => index)
class ModalMsg{

	constructor(){

		this.jobId 		= '';
		this.modalId	= '';
		this.type 		= '';
		this.gbn		= '';
		this.msg		= '';
		this.yestext	= '';
		this.notext	= '';
		this.callback 	= function(){};

	}

	// 모달정보입력
	setMsgInfo(jobId, modalId){

		this.jobId 		= jobId;
		this.modalId	= modalId;

	}
	// 초기화
	init(){

		this.jobId 		= '';
		this.modalId	= '';
		this.type 		= '';
		this.gbn		= '';
		this.msg		= '';
		this.yestext	= '';
		this.notext	= '';
		this.callback 	= function(){};
		//modalGrid();

	}

	// 모달을 그린다.
	message( type,msg,callback,ytxt,ntxt){

		this.msg 	  = msg;
		this.type 	  = type;
		this.callback = callback;
		this.yestext	= ytxt;
		this.notext	= ntxt;

		if(this.parentYn() == true){
			window.parent.modalMsgController.init(this.jobId, this.modalId, this.type, this.gbn, this.callback, this.parentYn(), this.msg,this.yestext,this.notext );
			window.parent.modalMsgController.grid();

		}else{
			//this.makeGrid(); // 내부에 팝업생성
			modalMsgController.init(this.jobId, this.modalId, this.type, this.gbn, this.callback, this.parentYn(), this.msg,this.yestext,this.notext );
			modalMsgController.grid();

		}
	}

	messageToast(msgGbn, msg){

		if(this.parentYn() == true){
			window.parent.iframeMessage(msgGbn, msg);
		}else{
			iframeMessage(msgGbn, msg);
		}
	}

	// 부모여부에 따라 내부외부로 변경
	parentYn(){
		// iframe 안 : true
		return (self !== top);
	}

	makeGrid(){

		$("#msgModal").remove();
		$('footer').after('<div id="msgModal" class="modal"><div id="modalgrid"></div></div>');

	}

}

// index.html => modal
var modalMsgController = {

	jobId 		: '',
	modalId		: '',
	opt 		: {}, // width , height
	bodyFn 		: {},
	callback 	: '',
	param		: {},
	msg			: '',
	yestext		: '',
	notext	    : '',

	target      : null,

	init :  function(a, b, c, d, e, f,g, h, i){

		this.jobId 		= a;
		this.modalId	= b;
		this.type 		= c;
		this.gbn 		= d;
		this.callback 	= e;
		this.parentinfo = f;
		this.msg		= g;
		this.yestext	= h;
		this.notext		= i;
	},

	grid : function(){

		// 기존에 있다면 삭제
		if($("#msgModal").length > 0){
			$("#msgModal").remove();
		}

		$('footer').after('<div id="msgModal" class="modal"><div id="modalgrid"></div></div>');

		// opt
		//$('.modal').css('max-width'			, this.opt.width);
		//$('.modal').css('overflow-y'		, 'auto	');
		//$('#' + this.modalId).css('width' 	, this.opt.width);
		//$('#' + this.modalId).css('height' 	, this.opt.height);

		// 공백처리(초기화)
		$("#" + this.modalId).html(this.msg +' <br/><div style="display:flex;width:100%; flex-direction:row-reverse"><a class="comm_btn" style="width:80px" rel="modal:close" >'+ this.notext +'</a>&nbsp;<a class="comm_btn" style="width:80px" href="javascript:modalMsgController.resultCallback()">' + this.yestext + '</a></div>');

		// 모달호출
		this.target = $("#" + this.modalId).modal({
			fadeDuration	: 0,
			escapeClose		: true,
  			clickClose		: false,
  			showClose		: false
		});

	},
	// 결과전달
	resultCallback : function(){

		//manager에서 판단한 부모여부에 따라
		if(this.parentinfo == true){
			eval('$("#frame_"+this.jobId).get(0).contentWindow.'+this.callback+'(0);');
		}else{
			eval(this.callback+'(0);');
		}
		$('#msgModal').remove();
		$('.jquery-modal').remove();
	},
	// 모달닫기
	close : function(){
		$('#msgModal').find('.close-modal').click();
	},
	parentYn : function(){
		return (self !== top);
	}
	// 모달오픈

}


// iframe 에서 호출용
var modalMsg = new ModalMsg();


