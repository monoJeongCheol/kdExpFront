
// 탭의 페이지 체크여부 활용 탭닫을때 이벤트 확인용 변수
var updateTabFlag = 0;

// 개발중인 내용 필요한 내용 정리 보여주기
let devInfo = {

		init : (x, y, z) => {

			let inHtml = $('#'+y).html();

			let html = '<div id="devWrap">';
				html += '<span onclick="$(\'#devDetail\').toggle();" style="cursor:pointer">' + z + ' [ '+ x +' ]['+ new Date().toLocaleString() +']</span>';
				html += '<div style="display:none;" id="devDetail">';
				html += '<pre>'+inHtml+'</pre>';
				html += '</div>';
				html += '</div>';
			 $('#'+y).replaceWith(html);
		}

}

// input 형태의 값을 체크한다.
// 해당값이 변경시 해당내용을 적용한다.
let inputValid = {
	// chkNum chklen chkReq chkOnly
	init : function(){

		// 숫자만 입력
		$('.chkNum').on('input propertychange',function(e){

			if($.trim(e.target.value) != ''){
				e.target.value = $.trim(e.target.value);
				e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
			}else{
				e.target.value = '';
			}

		});

		$('.chkDeci').on('input propertychange',function(e){

			if( $.trim(e.target.value) != ''){

				e.target.value = $.trim(e.target.value).replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

				var part = $.trim(e.target.value).split('.');

				if(part[1]){
					if(part[1].length > 2){
						e.target.value = part[0] + '.' + part[1].substring(0,2);
					}
				}
			}
		});

		// 길이체크(최대길이를 설정한다.)
		$('.chklen').each(function(e){

			if($(this).data('maxlen')){
				$(this).val($(this).val().substr(0,$(this).data('maxlen')));
				$(this).prop('maxlength',$(this).data('maxlen'));
			}
		});

		// readonly
		$('.chkOnly').prop('readOnly', true);

		// 글자수 나오기
		$('.textLen').each(function(){
			let maxlen   = $(this).data('maxlen');
			let textType = $(this).prop('tagname');
			let nwTextLen    = $(this).text().length;
			let nwInpuLen    = $(this).val().length;
			let id = $(this).prop('id');
			// 현재값으로 입력
			$(this).css('width','100%');
			$('#mx_'+id).parent().remove();
			$(this).after('<div class="textlen">[ &nbsp;<span id="mx_'+ id +'">'+ (textType == 'textarea' ? nwTextLen : nwInpuLen) +' </span> / '+ maxlen + ' ] </div>');

		});

		$('.textLen').on('keyup',function(e){

			let content = $(this).val();
			let maxlength = $(this).data('maxlen');
			let dataTarget = 'mx_'+$(this).prop('id');

		    // 글자수 세기
		    if (content.length == 0 || content == '') {
		    	$('#'+dataTarget).text('0');
		    } else {
		    	$('#'+dataTarget).text((content.length) + '');
		    }

		    // 글자수 제한
		    if (content.length > (maxlength - 1)) {
		    	// 200자 부터는 타이핑 되지 않도록
		        $(this).val($(this).val().substring(0, maxlength));
		        $('#'+dataTarget).text(($(this).val().length) + '');
		        // 200자 넘으면 알림창 뜨도록
		        alert('글자수는 '+ maxlength +'자까지 입력 가능합니다.');
		    };

		});

	}

}

// input의 view모드
let viewmodeInput = {

	baseload : function(){

		$('html').on('mousedown','body',function(e){

			if(!$(e.target).hasClass("devviewmode") && !$(e.target).hasClass("devview")) {
				$('.devviewmode').each(function(){
					if($(this).css('display') == 'inline-block'){

						/*$('.chkNum').each(function(e){
							e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
						});*/


						$(this).blur();
					}
				});
			}else{
				$(e.target).focus();
			}
		});

	},
	regx : {
		tel 		: /^(\d{2,3})(\d{3,4})(\d{4})$/
		, bizreg	: /(\d{3})(\d{2})(\d{5})/
		, raw		: /(\d{6})(\d{7})/
	},
	init : function(){

		var regx = this.regx;

		$('.devviewmode').each(function(e){

			let viewid   = 'view_mode_' + $(this).prop('id');

			//if($('#'+viewid).length == 0){
			if(true){

				// 기존모드 삭제
				if($('#'+viewid).length > 0){$('#'+viewid).remove();}

				let viewClone = $(this).clone();

				let targetid = $(this).prop('id');

				viewClone.prop('id', viewid);
				viewClone.prop('name', viewid);
				viewClone.css('display','block');

				if($(this).val() !== ''){

					if($(this).data('view-type') =='won'){

						viewClone.val(parseInt($.trim($(this).val()),10).toLocaleString() + ' 원');

					}else if($(this).data('view-type') =='per'){

						var parts = $.trim($(this).val()).toString().split(".");
						viewClone.val(parseInt($.trim($(this).val()),10).toLocaleString() + (parts[1] ? "." + parts[1].substring(0.2) : "") +' %');

					}else if($(this).data('view-type') =='comTel' || $(this).data('view-type') =='tel' || $(this).data('view-type') =='fax' || $(this).data('view-type') =='hp'){

						viewClone.val($(this).val().replace(regx.tel, `$1-$2-$3`));

					}else if($(this).data('view-type') =='bizreg'){

						viewClone.val($(this).val().replace(regx.bizreg, '$1-$2-$3'));

					}else if($(this).data('view-type') =='raw'){

						viewClone.val($(this).val().replace(regx.raw, '$1-$2'));
					}

				}else{
					viewClone.val('');
				}

				viewClone.removeClass('devviewmode');
				viewClone.addClass('devview');
				viewClone.removeClass('chklen');
				viewClone.removeClass('chkNum');
				viewClone.css('display',true);

				$(this).before(viewClone);

				$(this).hide();

				// 해당 dd도 걸어준다.

				$(this).off('blur').on('blur', function(f){

					if($.trim($(this).val()) !== ''){

						if($(this).data('view-type') =='won'){

							if($.trim($(this).val()) != ''){
								$(this).val($.trim($(this).val()));
								$(this).val($.trim($(this).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')));
							}else{
								$(this).val('');
							}

							$('#'+viewid).val( parseInt($.trim($(this).val()),10).toLocaleString() + ' 원');

						}else if($(this).data('view-type') =='per'){


							if($.trim($(this).val()) != ''){
								$(this).val($.trim($(this).val()));
								$(this).val($.trim($(this).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')));
							}else{
								$(this).val('');
							}

							$('#'+viewid).val( parseInt($.trim($(this).val()),10).toLocaleString() + ' %');
							var parts = $.trim($(this).val()).toString().split(".");
							viewClone.val(parseInt($.trim($(this).val()),10).toLocaleString() + (parts[1] ? "." + parts[1].substring(0.2) : "") +' %');

						}else if($(this).data('view-type') =='comTel' || $(this).data('view-type') =='tel' || $(this).data('view-type') =='hp' || $(this).data('view-type') =='fax'){
							$('#'+viewid).val($(this).val().replace(regx.tel, `$1-$2-$3`));
						}else if($(this).data('view-type') =='bizreg'){
							$('#'+viewid).val($(this).val().replace(regx.bizreg, '$1-$2-$3'));
						}else if($(this).data('view-type') =='raw'){
							$('#'+viewid).val($(this).val().replace(regx.raw, '$1-$2'));
						}else{
						}

					}else{
						$('#'+viewid).val('');
					}

					$(this).toggle();

					$('#'+viewid).toggle();
				});


				viewClone.off('focus').on('focus', function(c){

					$('#'+viewid).toggle();
					$('#'+targetid).toggle();

					setTimeout( function(){ $('#'+ targetid ).focus(); }, 50 );
				});
			}
		});

	}
}


// 유효성체크 (저장시 필수값체크한다.)
let validation =
{
	proceed : function(){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let rslt = {};

		$('.vrslti').removeClass('vrslti');
		$('.vrslt').remove();

		$('[class^=comm_]').each(function(e){

			if(valid){

				let rsltOne	= validation.oneProceed(this,false);

				valid = rsltOne.valid;
				rslt = rsltOne;

				if(rslt.valid == false){

					let id = $(this).prop('id');

					$(this).parent().find('input').addClass('vrslti');
					//$(this).parent().find('input').eq(0).dbclick();

					$('#view_mode_'+ id).hide();

					// has_editor


					//#frm1 > div > section:nth-child(1) > article.data_wrap.has_line > div > dl:nth-child(11) > dd > div > div.ck.ck-editor__main > div
					if($('#' + id).hasClass('has_editor')){

					}else{
						$('#' + id).not('.has_editor').show();
						setTimeout( function(){ $('#'+ id ).not('.has_editor').focus(); }, 50 );
					}


				}

			}else{

				 return false;        //break

			}


		});


		return rslt;

	},
	
	proceedChk : function(){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let rslt = {};

		$('.vrslti').removeClass('vrslti');
		$('.vrslt').remove();

		$('[class^=comm_]').each(function(e){

			if(valid){

				let rsltOne	= validation.oneProceedChk(this,false);

				valid = rsltOne.valid;
				rslt = rsltOne;

				if(rslt.valid == false){

					let id = $(this).prop('id');

					$(this).parent().find('input').addClass('vrslti');
					//$(this).parent().find('input').eq(0).dbclick();

					$('#view_mode_'+ id).hide();

					// has_editor


					//#frm1 > div > section:nth-child(1) > article.data_wrap.has_line > div > dl:nth-child(11) > dd > div > div.ck.ck-editor__main > div
					if($('#' + id).hasClass('has_editor')){

					}else{
						$('#' + id).not('.has_editor').show();
						setTimeout( function(){ $('#'+ id ).not('.has_editor').focus(); }, 50 );
					}


				}

			}else{

				 return false;        //break

			}


		});


		return rslt;

	},
	proceedFormChk : function(formid){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let rslt = {};

		$('.vrslti').removeClass('vrslti');
		$('.vrslt').remove();

		$('#'+formid+' [class^=comm_]').each(function(e){

			if(valid){

				let rsltOne	= validation.oneProceedChk(this,false);

				valid = rsltOne.valid;
				rslt = rsltOne;

				if(rslt.valid == false){

					let id = $(this).prop('id');

					$(this).parent().find('input').addClass('vrslti');
					//$(this).parent().find('input').eq(0).dbclick();

					$('#view_mode_'+ id).hide();

					// has_editor


					//#frm1 > div > section:nth-child(1) > article.data_wrap.has_line > div > dl:nth-child(11) > dd > div > div.ck.ck-editor__main > div
					if($('#' + id).hasClass('has_editor')){

					}else{
						$('#' + id).not('.has_editor').show();
						setTimeout( function(){ $('#'+ id ).not('.has_editor').focus(); }, 50 );
					}


				}

			}else{

				 return false;        //break

			}


		});


		return rslt;

	},
	totalProceed : function(){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let nameArr = []; // indexof로 확인
		let totaltext = '';

		$('.vrslti').removeClass('vrslti');
		$('.vrslt').remove();

		$('[class^=comm_]').each(function(e){

			let rslt = validation.oneProceed(this,true);

			if(valid){
				valid = rslt.valid;
			}
			totaltext += (rslt.totaltext == '' ? '' : '<br/>'+ rslt.totaltext);
			nameArr.concat(rslt.nameArr);

		});

		let returnArr = {
			'nameArr' : nameArr,
			'totaltext' : totaltext,
			'valid'		: valid
		}


		return returnArr;
	},
	oneError : function(obj, alertyn, msg){

		if(alertyn){

			$(obj).parent().find('input').addClass('vrslti');

			if($(obj).closest('td, dd').find('.vrslt').length == 0){

			//	$(obj).closest('td, dd').prepend('<div style="" class="vrslt">[！] ' + msg + '</div>');
				$(obj).closest('td, dd').append('<div style="" class="vrslt"> ' + msg + '</div>');
			}else{

				$(obj).closest('td, dd').find('.vrslt:last-child').after('<div style="" class="vrslt">[!] ' + msg + '</div>');

			}
		}

		return false;
	},

	oneProceed : function(obj, alertyn){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let nameArr = []; // indexof로 확인
		let totaltext = '';

		if($(obj).prop('tagName') == 'INPUT' || $(obj).prop('tagName') == 'SELECT'  || $(obj).prop('tagName') == 'TEXTAREA' ){
				// 해당의 이름으로 검색한다.
				let name = $(obj).prop('name');

				if(nameArr.indexOf(name) < 0){

					nameArr.push(name);

					// 검사진행
					// type 별 진행
					if($(obj).prop('type') == 'text' || $(obj).prop('type') == 'password' || $(obj).prop('tagName') == 'SELECT' || $(obj).prop('tagName') == 'TEXTAREA' ){

						// 필수값인지 확인
						if($(obj).hasClass('chkReq') && !$(obj).hasClass('devview')){

							if(StrUtil.isEmpty($(obj).val())){

								if($(obj).prop('tagName') == 'SELECT'){
									$(obj).addClass('vrslti');
								}
								totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).attr('placeholder') +'\' 이(가) '+' 없습니다.';
							//	valid = this.oneError(obj, alertyn,'필수입력항목입니다.');
								valid = this.oneError(obj, alertyn, totaltext);

							}

						}

						// 연관데이터가 있을경우
						if($(obj).data('relate'))
						{

							if($(obj).data('relate')){

								let tItem = $(obj).data('relate');

								if($(obj).data('relate-v')){

									let relv = $('#'+tItem).val();

									if($('#'+tItem).prop('type') == 'checkbox'){

										if($('#'+tItem).is(':checked') == false){
											relv = '';
										}

									}

									// 동일값	을 가지고 있다면
									if(relv == $(obj).data('relate-v')){
										if(StrUtil.isEmpty($(obj).val())){

											totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).prop('placeholder') +'\' 이(가) '+' 없습니다.';
											valid = this.oneError(obj, alertyn, '필수입력항목입니다.');

										}
									}

								}else{

									if(StrUtil.isEmpty($('#'+tItem).val()) == false){
										if(StrUtil.isEmpty($(obj).val())){

											totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).prop('placeholder') +'\' 이(가) '+' 없습니다.';
											valid = this.oneError(obj, alertyn, '필수입력항목입니다.');

										}
									}
								}

							}
						}

						// 최소길이인지 확인
						if(!$(obj).hasClass('devview') && !StrUtil.isEmpty($(obj).val())){
							if($(obj).val().length < $(obj).data('minlen')){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'는 최소 '+$(obj).data('minlen')+' 자리 입니다.';
								valid = this.oneError(obj, alertyn,"최소 "+ $(obj).data('minlen') +' 자리로 작성해야합니다.');
							}
							if($(obj).val().length > $(obj).data('maxlen')){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'는 최대 '+$(obj).data('minlen')+' 자리 입니다.';
								valid = this.oneError(obj, alertyn,"최대 "+ $(obj).data('maxlen') +' 자리로 작성해야합니다.');
							}
						}

						let phoneRule = /^(070|02|0[3-9]{1}[0-9]{1})[0-9]{3,4}[0-9]{4}$/;
						let hpRule = /^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/;
						let comTel = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;
						let emailRule = reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
						let passwordRule =  /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{10,}$/;

						// 패턴정규식
						if( ($(obj).data('view-type') == 'tel') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!comTel.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'전화번호 양식에 맞지않습니다.');
							}
						}
						if( ($(obj).data('view-type') == 'password') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!passwordRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'비밀번호 양식에 맞지않습니다.');
							}
						}
						if( ($(obj).data('view-type') == 'fax') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!phoneRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'팩스번호 양식에 맞지않습니다.');

							}
						}
						if( ($(obj).data('view-type') == 'hp' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!hpRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '휴대폰 양식에 맞지않습니다.');

							}
						}
						if( ($(obj).data('view-type') == 'comTel' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!phoneRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '전화번호 양식에 맞지않습니다');

							}
						}
						if( ($(obj).data('view-type') == 'email' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!emailRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '이메일 양식에 맞지않습니다.');

							}
						}
					}


				}


			}

		let returnArr = {
			'nameArr' 	: nameArr,
			'totaltext' : totaltext,
			'valid'		: valid
		}


		return returnArr;

	},
	
	oneProceedChk : function(obj, alertyn){

		// 필수값이 체크되었는지 확인한다.
		let valid = true;
		let nameArr = []; // indexof로 확인
		let totaltext = '';
		console.log(obj);
		if($(obj).prop('tagName') == 'INPUT' || $(obj).prop('tagName') == 'SELECT'  || $(obj).prop('tagName') == 'TEXTAREA' ){
				// 해당의 이름으로 검색한다.
				let name = $(obj).prop('name');

				if(nameArr.indexOf(name) < 0){

					nameArr.push(name);

					// 검사진행
					// type 별 진행
					if($(obj).prop('type') == 'text' || $(obj).prop('type') == 'password' || $(obj).prop('tagName') == 'SELECT' || $(obj).prop('tagName') == 'TEXTAREA' ){

						// 필수값인지 확인
						if($(obj).hasClass('chkReq') && !$(obj).hasClass('devview')){

							if(StrUtil.isEmpty($(obj).val())){

								if($(obj).prop('tagName') == 'SELECT'){
									$(obj).addClass('vrslti');
								}
								totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).data('view-name') +'\' 을 작성해주세요';
								valid = this.oneError(obj, alertyn,'필수 입력 항목을 확인해주세요.');

							}

						}

						// 연관데이터가 있을경우
						if($(obj).data('relate'))
						{

							if($(obj).data('relate')){

								let tItem = $(obj).data('relate');

								if($(obj).data('relate-v')){

									let relv = $('#'+tItem).val();

									if($('#'+tItem).prop('type') == 'checkbox'){

										if($('#'+tItem).is(':checked') == false){
											relv = '';
										}

									}

									// 동일값	을 가지고 있다면
									if(relv == $(obj).data('relate-v')){
										if(StrUtil.isEmpty($(obj).val())){

											totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).prop('placeholder') +'\' 이(가) '+' 없습니다.';
											valid = this.oneError(obj, alertyn, '필수입력항목입니다.');

										}
									}

								}else{

									if(StrUtil.isEmpty($('#'+tItem).val()) == false){
										if(StrUtil.isEmpty($(obj).val())){

											totaltext += (totaltext == '' ? '':'<br/>') + '\''+$(obj).prop('placeholder') +'\' 이(가) '+' 없습니다.';
											valid = this.oneError(obj, alertyn, '필수입력항목입니다.');

										}
									}
								}

							}
						}

						// 최소길이인지 확인
						if(!$(obj).hasClass('devview') && !StrUtil.isEmpty($(obj).val())){
							if($(obj).val().length < $(obj).data('minlen')){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'는 최소 '+$(obj).data('minlen')+' 자리 입니다.';
								valid = this.oneError(obj, alertyn,"최소 "+ $(obj).data('minlen') +' 자리로 작성해야합니다.');

							}
						}

						let phoneRule = /^(070|02|0[3-9]{1}[0-9]{1})-[0-9]{3,4}-[0-9]{4}$/;
						let hpRule = /^(01[016789]{1})-[0-9]{3,4}-[0-9]{4}$/;
						let comTel = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;
						let emailRule = reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
						// 비밀번호 정규식 영문, 숫자, 특수문자 2가지 이상 조합 / 10자 이상
						let passwordRule =  /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{8,15}$/;
						// 생년월일 정규식 YYYY-MM-DD
						let brithDayRule = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
						let urlRule = /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/gi;
						// 패턴정규식
						if( ($(obj).data('view-type') == 'tel') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!phoneRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'전화번호 양식에 맞지않습니다.');
							}
						}
						if( (($(obj).data('view-type') == 'password') || ($(obj).data('view-type') == 'passwordChk')) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!passwordRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'비밀번호 양식에 맞지않습니다.');
							}
						}
						if ( ($(obj).data('view-type') == 'passwordChk') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							
							if(document.getElementById('password').value !== document.getElementById('passwordChk').value) {
									
								totaltext += (totaltext == '' ? '':'<br/>') + '비밀번호가 틀립니다.';
								valid = this.oneError(obj, alertyn,'비밀번호가 틀립니다.');
									
							}
							
						}
						if( ($(obj).data('view-type') == 'brithDay') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!brithDayRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'생년월일 양식에 맞지않습니다.');
							}
						}
						if( ($(obj).data('view-type') == 'fax') && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!phoneRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn,'팩스번호 양식에 맞지않습니다.');

							}
						}
						if( ($(obj).data('view-type') == 'hp' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!hpRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '휴대폰 양식에 맞지않습니다.');

							}
						}
						if( ($(obj).data('view-type') == 'comTel' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!phoneRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '전화번호 양식에 맞지않습니다');

							}
						}
						if( ($(obj).data('view-type') == 'email' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!emailRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, '이메일 양식에 맞지않습니다.');

							}
						}
						
						if( ($(obj).data('view-type') == 'url' ) && !$(obj).hasClass('devview') && $(obj).val() != ''){
							if(!urlRule.test($(obj).val())){

								totaltext += (totaltext == '' ? '':'<br/>') + $(obj).prop('placeholder') +'이(가) '+'잘못된 양식입니다.';
								valid = this.oneError(obj, alertyn, 'Url 양식에 맞지않습니다.');

							}
						}
					}


				}


			}

		let returnArr = {
			'nameArr' 	: nameArr,
			'totaltext' : totaltext,
			'valid'		: valid
		}


		return returnArr;

	},
	
	oneRsltProceed : function (id , msg){
			let obj = document.getElementById('demoUseYn');
			$(obj).closest('td, dd').prepend('<div style="" class="vrslt">[!] '+ msg +'</div>');

	}
}


// innerOpenTab 과 연결용
function openTab(x) {
	// 관련탭아이디
	parent.iframeOpenTab(x);
}

function execDaumPostcode(postNoId, roadAddrId, addressDtl) {
    new daum.Postcode({
        oncomplete: function(data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

            // 도로명 주소의 노출 규칙에 따라 주소를 표시한다.
            // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
            let roadAddr = data.roadAddress; // 도로명 주소 변수
            let extraRoadAddr = ''; // 참고 항목 변수

            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraRoadAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
               extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraRoadAddr !== ''){
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            document.getElementById(postNoId).value = data.zonecode;
            document.getElementById(roadAddrId).value = roadAddr;

            $("input[name='"+ addressDtl+ "']").prop('readOnly',false);
            $("input[name='"+ addressDtl+ "']").focus();
        }
    }).open();
}

// 로딩시 존재하면 실행
$(document).ready(function(){

	if($('#devDesc').length > 0){
		if($('h4').length > 0){
			$('h4').eq(0).html($('h4').eq(0).html() + '<i class="gridTooltip__icon imgSelect " data-target="devDesc"></i>');
		}
		// 페이지
		//devInfo.init($('#devDesc').data('ing'),'devDesc',$('#devDesc').data('id'));


	}

	$('#closeFoldBtn').off('click').click(function(i,o){
		if($(this).data('gbn') == 'open'){
			$(this).data('gbn','close');
			$(this).html('열기');
			foldingAll(true,[]);
		}else{
			$(this).data('gbn','open');
			$(this).html('닫기');
			foldingAll(false,[]);
		}
	});


	//$('#devWrap').hide();

	inputValid.init();
	viewmodeInput.baseload();
	//viewmodeInput.init();

	// th필수처리
	$('th:contains("*")').addClass('devRqv');
	$('dt:contains("*")').addClass('devRqv');
	$('h5:contains("*")').addClass('devRqv');

	$('body').on('keypress', '.vc-switch-input',function(ev){
		if (window.event.keyCode == 13) {
			if($(this).attr('readonly') == false){
				$(this).click();
			}
		}
	});
	$('body').on('keypress', '#postNo',function(ev){
		if (window.event.keyCode == 13) {
			$(this).next().click();
		}
	});
	/*
	$('body').on('keypress', '.srch',function(ev){
		if (window.event.keyCode == 13) {
			console.log($(this).closest('#searchBtn'));
			$(this).closest('.content_wrap').parent().find('.find').eq(0).click();
		}
	});
	*/
	setTooltip();
});

//값여부
function defaultCheckString (checkStr, defaultStr)
{
    if(checkStr == undefined || checkStr == null)
    {
        return defaultStr;
    }
    return checkStr;
}

// 공백여부
let StrUtil = {

	isEmpty : (s) => {
		 if(s == undefined || s == null || s == '')
    {
        return true;
    }
    return false;
	}
}

// 기본값 세팅
let InfosetUtil = {
	setInfo : function(info, infoOpt, gbn){

		let keys = Object.getOwnPropertyNames(info);

		for(let i = 0; i< keys.length ;i++){

			let key = keys[i];

			// 아이디는 없고 네임은 있을때 네임으로 판단하여 작성한다.
			if($('#'+key).length == 0 && $('[name='+key+ ']').length > 0 ){

				//라디오 타입일 경우
				if($('[name='+key+ ']').prop('type') == 'radio'){
					$("input:radio[name ='"+key+"']:input[value='"+info[key]+"']").attr("checked", true);
				}else{
					$('[name='+key+ ']').val(info[key]);
					$('[name='+key+ ']').prop('name', gbn + $('[name='+key+ ']').prop('name'));
				}

			}

			if($('#'+key).length > 0){

				// input : text radio checkbox hidden
				if($('#'+key).prop('tagName') == 'INPUT'){

					if($('#'+key).prop('type') == 'text' || $('#'+key).prop('type') == 'hidden'){
						$('#'+key).val(info[key]);
						$('#'+key).prop('name', gbn + $('#'+key).prop('name'))
					}

					if($('#'+key).prop('type') == 'checkbox'){

						// 동일값이 있으면 체크한다.
						$("input:checkbox[name ='"+ $('#'+key).prop('name') +"']:input[value='"+info[key]+"']").attr("checked", true);
					}
					if($('#'+key).prop('type') == 'radio'){

						$("input:radio[name ='"+ $('#'+key).prop('name') +"']:input[value='"+info[key]+"']").attr("checked", true);
					}

				}
				else if($('#'+key).prop('tagName') == 'SELECT' ){
					$('#'+key).val(info[key]);
					$('#'+key).prop('name', gbn + $('#'+key).prop('name'))
				}else if($('#'+key).prop('tagName') == 'TEXTAREA' ){
					$('#'+key).val(info[key]);
					$('#'+key).prop('name', gbn + $('#'+key).prop('name'))
				}

			}

		}

	},
	uuidv4 : function(){
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    	(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  		);
	},
	setGriFlag : function(jsonArr){

	},
	noimage : function (){
		$( "img" ).each( function( index ) {
	        if( !this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
	            this.src = "/images/photos.png";
	        }
    	});
	},
	setFormJsonArray : function (jsonArr, nm, fm){

		for(let i=0;i<jsonArr.length;i++){
			let t = jsonArr[i];
			keys = Object.keys(t);
			for (let c in keys){
				fm.append( nm + '['+i+'].' + keys[c], jsonArr[i][keys[c]]);
			}
		}
		return fm;
	}
}

// 좌측메뉴 열고 접기 버튼
function menufold(){
	// 좌측메뉴 축소
	if($('header').css('left') == '0px'){
		$('header').css('left','-280px')
		$('#container').css('width', '100%');
		$('#menufold').css('left','0px');
		$('#menufold').html('&gt;&gt;');
	}else{
		$('header').css('left','0px')
		$('#container').css('width', 'calc(100% - 275px)');
		$('#menufold').css('left','275px');
		$('#menufold').html('&lt;&lt;');
	}
}

// 부분 부여
function partActive(id,gbn){

	let t = $('#'+id);

	if(t.find('.part_dim').length == 0){
		t.append('<div class="part_dim"></div>')
	}
	if(gbn == 'on'){
		$('#'+id).addClass('partActive');
		$('#'+id).find('input').prop('disabled',true);
	}else{
		$('#'+id).removeClass('partActive');
		$('#'+id).find('input').prop('disabled',false);
	}
}

// 해당그리드의 높이에서 100%찾기
function gridHeightCalc(id){

	let body = document.body,
	html = document.documentElement;

	let height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

	let calcHeight = (height - document.getElementById(id).getBoundingClientRect().top);

	calcHeight = calcHeight - 120;

	if(calcHeight < 420){
		calcHeight = 420;
	}


	return calcHeight;

}

// row아이디를 부여한다.
function setRowId(){

	//uuid 클래스 대상으로 아이디가 부여되지 않았다면 부여
	$('.uuid').each(function(e){

		if($(this).prop('id').length
				== 0){
			$(this).prop('id', 'v'+ InfosetUtil.uuidv4());
		}
	});

}

// rowname생성(목록형만가능)
function setRowName(clnm) {

	$('.' + clnm).each(function (e) {
		$(this).find('tr').each(function (d) {
			$(this).find('[data-name]').each(function (f) {
				if(!$(this).hasClass('devview')){
					$(this).prop('name', clnm + '[' + d + '].' + $(this).data('name'));
				}else{
					$(this).prop('name','');
				}

			});
		});
	});
}

//그리드 툴팁
var tooltipGrid = () => {

  //툴팁 마우스
  //툴팁에 마우스 오버하면 오버한 툴팁이 보이게 해주고 마우스 떠나면 사라지게 ,,

	let gridTh = document.querySelectorAll("th[data-column-name]");
  	gridTh.forEach(function (th) {
    th.addEventListener("mouseenter", function (e) {

      let attr = e.target.dataset.columnName;
      let tooltipAll = document.querySelectorAll(".gridToolTip__cont[data-tooltip]");
      if (tooltipAll) {
    	  $(tooltipAll).hide();
      }
      let tooltip = document.querySelector(".gridToolTip__cont[data-tooltip='"+attr+"']");
      if (tooltip) {
        $(tooltip).show();
      }
    });
  });
};

// 스캔 qr코드
var scanQrcode = (even, callback) => {

	if(event.keyCode=="13"){

		callback(event.target);
 	}

}

/*$(document).ready(function(e){

	console.log('solution : ', $('#solutionUserTotalCount').html());

	$('span.info > i').on('DOMSubtreeModified',function(event){
		console.log(event.target.id);
		console.log('object',$('#'+event.target.id));
		console.log('html',$('#'+event.target.id).html());
		console.log(parseInt($('#'+event.target.id).html(),10));


		$('#'+event.target.id).off('DOMSubtreeModified');
		//$(this).html( parseInt($(this).html(),10).toLocaleString() );
		$('#'+event.target.id).on('DOMSubtreeModified');
	});

});*/
function setTooltip(){
		// 기존제거
		$('.tooltipLayer').remove();
		$('footer').append(
			'<div class="tooltipLayer" style="display: none;" >'+
			'<div style="float:left" class="lf">' +
		    '<span style="cursor:pointer;font-size:1.5em;" id="tooltipTitle"></span>'+
		    '</div>' +
			'<div style="float:right">' +
		    '<span onClick="closeLayer(this)" style="cursor:pointer;font-size:1.5em;" title="닫기">X</span>'+
		    '</div>' +
		    '<div id="tooltipbody" style="position:relative">' +
			'</div>'+
	 		'</div>'
		);
	/* 클릭 클릭시 클릭을 클릭한 위치 근처에 레이어가 나타난다. */
		$('.imgSelect').click(function(e)
		{

			var sWidth = window.innerWidth;
			var sHeight = window.innerHeight;

			var oWidth = $('.tooltipLayer').width();
			var oHeight = $('.tooltipLayer').height();

			// 레이어가 나타날 위치를 셋팅한다.
			var divLeft = e.clientX + 10;
			var divTop = e.clientY + 5;

			// 레이어가 화면 크기를 벗어나면 위치를 바꾸어 배치한다.
			if( divLeft + oWidth > sWidth ) divLeft -= oWidth;
			if( divTop + oHeight > sHeight ) divTop -= oHeight;

			// 레이어 위치를 바꾸었더니 상단기준점(0,0) 밖으로 벗어난다면 상단기준점(0,0)에 배치하자.
			if( divLeft < 0 ) divLeft = 0;
			if( divTop < 0 ) divTop = 0;

			var t = $(this).data('target');
			var ting = $('#'+t ).data('ing');

			var tds = $('#'+t ).clone();
			tds.css('display','block');

			$('#tooltipTitle').html($('#'+t ).data('id') + '-' +ting);

			$('#tooltipbody').html('');
			$('#tooltipbody').append(tds);

			$('.tooltipLayer').css({
				"top": divTop,
				"left": divLeft,
				"position": "absolute"
			}).fadeIn('slow');
		});
}

function closeLayer( obj ) {
	$(obj).parent().parent().hide();
}


function foldingAll(foldingYn, foldingYnSnArr){

	// foldingYnSnArr 순서대로 열기닫기 옵션
	//foldingYnSnArr = [0,1];
	foldingYnSnArr = [];
	// 닫힘시 버튼안보이게
	if(foldingYn){
		// 전체닫힘
		$('.section_card > .tit_wrap .folding').each(function(e, item){

			if(foldingYnSnArr.length == 0 || foldingYnSnArr.includes(e)){
				$(item).addClass('close');
            	$(item).attr('title','펼치기');
            	$(item).parents('.tit_wrap').next('.data_wrap').slideUp(0);
				$(item).parents('.tit_wrap').find('button, input, label, span').css('visibility','hidden');
            	$(item).css('visibility','visible');
            }
		});

	}else{
		// 전체열림
		$('.section_card > .tit_wrap .folding').each(function(e, item){
			if(foldingYnSnArr.length == 0 || foldingYnSnArr.includes(e)){
				$(item).removeClass('close');
            	$(item).attr('title','접기');
            	$(item).parents('.tit_wrap').next('.data_wrap').slideDown(0);
            	$(item).parents('.tit_wrap').find('button, input, label, span').css('visibility','visible');
            	$(item).css('visibility','visible');
            }
		});
	}


}

function checkBirthDay(val){
	let brithDayRule = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
    return brithDayRule.test(val);    
}

/**
 * 좌측문자열채우기
 * @params
 *  - str : 원 문자열
 *  - padLen : 최대 채우고자 하는 길이
 *  - padStr : 채우고자하는 문자(char)
 */
function lpad(str, padLen, padStr) {
    if (padStr.length > padLen) {
        console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
        return str;
    }
    str += ""; // 문자로
    padStr += ""; // 문자로
    while (str.length < padLen)
        str = padStr + str;
    str = str.length >= padLen ? str.substring(0, padLen) : str;
    return str;
}

/**
 * 우측문자열채우기
 * @params
 *  - str : 원 문자열
 *  - padLen : 최대 채우고자 하는 길이
 *  - padStr : 채우고자하는 문자(char)
 */
function rpad(str, padLen, padStr) {
    if (padStr.length > padLen) {
        console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
        return str + "";
    }
    str += ""; // 문자로
    padStr += ""; // 문자로
    while (str.length < padLen)
        str += padStr;
    str = str.length >= padLen ? str.substring(0, padLen) : str;
    return str;
}

function phoneFomatter(num,type){

    var formatNum = '';
    if(num.length==11){
        if(type==0){
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
        }else{
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
    }else if(num.length==8){
        formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
    }else{
        if(num.indexOf('02')==0){
            if(type==0){
                formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
            }else{
                formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        }else{
            if(type==0){
                formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
            }else{
                formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            }
        }
    }

    return formatNum;
}

function selectbox_insert(obj, s_text, s_val, isSel) {
	obj.options[obj.length] = new Option(s_text, s_val, false, isSel);
}

function selectbox_deletelist(targetid) {
	var targetObj = document.getElementById(targetid);
	for (i = targetObj.length; i > 0; i--) {
		targetObj.remove(i);
	}
}