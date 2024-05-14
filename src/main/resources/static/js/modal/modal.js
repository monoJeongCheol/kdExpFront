/********************************/
/*	jquery.modal.js  			*/
/********************************/

// 전달용(iframe => index)
class ModalManager{

	constructor(){

		this.jobId 		= '';
		this.modalId	= '';
		this.opt 		= {}; // width , height
		this.param		= {};
		this.bodyFn 	= {};
		this.callback 	= {};

	}

	// 모달정보입력
	setModalInfo(jobId, modalId, opt, param, bodyFn, callback){

		this.jobId 		= jobId;
		this.modalId	= modalId;
		this.opt 		= opt;
		this.param		= param;
		this.bodyFn 	= bodyFn;
		this.callback 	= callback;

	}
	// 초기화
	init(){

		this.jobId 		= '';
		this.modalId	= '';
		this.opt 		= {};
		this.param		= {};
		this.bodyFn 	= {};
		this.callback 	= {};

	}

	// 모달을 그린다.
	modalGrid(){

		if(this.parentYn() == true){
			window.parent.modalController.init(this.jobId, this.modalId, this.opt, this.param, this.bodyFn, this.callback, this.parentYn());
			window.parent.modalController.grid();

		}else{

			//this.makeGrid(); // 내부에 팝업생성
			modalController.init(this.jobId, this.modalId, this.opt, this.param, this.bodyFn, this.callback, this.parentYn());
			modalController.grid();

		}
	}

	// 부모여부에 따라 내부외부로 변경
	parentYn(){
		// iframe 안 : true
		return (self !== top);
	}

	makeGrid(){

		$("#commModal").remove();
		$('footer').after('<div id="commModal" class="modal"><div id="modalgrid"></div></div>');

	}

}

// index.html => modal
var modalController = {

	jobId 		: '',
	modalId		: '',
	opt 		: {}, // width , height
	bodyFn 		: {},
	callback 	: '',
	param		: {},
	init :  function(a, b, c, d, e, f, g){

		this.jobId 		= a;
		this.modalId	= b;
		this.opt 		= c;
		this.param 		= d;
		this.bodyFn 	= e;
		this.callback 	= f;
		this.parentinfo = g;
	},

	grid : function(){

		// 기존에 있다면 삭제
		if($("#commModal").length > 0){
			$("#commModal").remove();
		}

		$('footer').after('<div id="commModal" class="modal"><div id="modalgrid"></div></div>');

		// opt
		$('.modal').css('max-width'			, this.opt.width);
		//$('.modal').css('overflow-y'		, 'auto	');
		$('#' + this.modalId).css('width' 	, this.opt.width);
		//$('#' + this.modalId).css('height' 	, this.opt.height);

		// 공백처리(초기화)
		$("#" + this.modalId).html('');

		// 모달 바디 생성
		var result = this.bodyFn();
		$('#' + this.modalId).html(result);

		// 모달호출
		$("#" + this.modalId).modal({
			fadeDuration	: 0,
			escapeClose		: this.opt.escapeClose,
  			clickClose		: false,
  			showClose		: this.opt.showClose,
  			closeExisting: false
		});

	},
	// 결과전달
	resultCallback : function( x ){

		//manager에서 판단한 부모여부에 따라
		if(this.parentinfo == true){
			try{
				eval('$("#frame_'+this.jobId +'").get(0).contentWindow.'+this.callback+'(x);');
			}catch{
				//alert('부모창이 없습니다.');
			}
		}else{
			try{
				eval(this.callback+'(x);');
			}catch{
				alert('해당 callback 함수가 없습니다.');
			}
		}

	},
	// 모달닫기
	close : function(){
		$('.close-modal').click();
	},
	parentYn : function(){
		return (self !== top);
	}
	// 모달오픈

}


// iframe 에서 호출용
var modalManager = new ModalManager();

