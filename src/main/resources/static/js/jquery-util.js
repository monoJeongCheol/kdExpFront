class JqueryUtil {
	// json 객체하위 값 여부확인
    static isNotEmptyJsonByKey(json, str){
        let result = false;
        if (!$.isEmptyObject(json) && str.trim().length != 0){
            const str_arr = str.split(".");
            let json_data = json;
            str_arr.forEach(function(key, idx){
                if (json_data.hasOwnProperty(key)){
                    json_data = json_data[key];
                    if(idx === str_arr.length-1){
                        if (typeof json_data === "string" && json_data.length != 0)
                            result = true;
                        else if(typeof json_data === "number" && json_data != 0)
                            result = true;
                        else if(typeof json_data === "object" && !$.isEmptyObject(json_data))
                            result = true;
                    }
                }
            })
        }
        return result;
    }
    // 모달 alert
    static alert(message){
		(async () =>{
			await modalMessage('alert', message);
		})();
	}
	// 에러 저장용 alert
	static errorSaveAlert(message,xhr){
		(async () =>{
			await modalMessage('errorSave', message,'','', xhr);
		})();
	}

	// 모달 팝업 호출
	static viewModal(jobId, url, param, fnCallBackName, modalOption, modalParam){
		let defaultParam = {};
		let defaultModalOption = {
			width 		: 	'80%',
			height		:	'80%',
			type		: 	'single',
			escapeClose :	true,
			showClose	:   true
		};
		Object.assign(defaultParam, param);
		Object.assign(defaultParam, modalParam);
		Object.assign(defaultModalOption, modalOption);
		let submitMethod = (modalOption !== undefined && modalOption.hasOwnProperty('method')) ? modalOption.method : 'GET';

		modalManager.setModalInfo(jobId, 'commModal', defaultModalOption, defaultParam, (x) => {
				let html = '';
				$.ajax({
					 type 		: submitMethod,
		             url 		: url,
		             dataType 	: 'html',
		             data	  	: param,
		             async    	: false,
		             success 	: function(result) {
		            	 html = result;
		             },
					error : function(xhr) {
						if (xhr.status == 401) {
							//alert('로그인 후 다시 이용해주세요.');
							location.href = "/Login";
						} else {
							if (JqueryUtil.isNotEmptyJsonByKey(xhr,
									"xhr.responseJSON.meta.userMessage"))
								alert(xhr.responseJSON.meta.userMessage);
							else
								alert("오류가 발생했습니다. 관리자에게 문의하세요.");
						}
					}
		         });
				return html;
			},
			fnCallBackName
		);

		modalManager.modalGrid();
	}
	// formData를 json으로 변환
	static serializeObject(formId){
		let result = {};
		let formArr = $('#'+formId).serializeArray();
		let extend = function(index, element) {
		    let node = result[element.name]
		    if ("undefined" !== typeof node && node !== null) {
		      if ($.isArray(node)) {
		        node.push(element.value)
		      } else {
		        result[element.name] = [node, element.value]
		      }
		    } else {
		      result[element.name] = element.value
		    }
		}

		$.each(formArr, extend);

		return result;
	}
	// response.data.contents 바인딩
	static bindJsonById(data){
		let typeArray = ['INPUT', 'SELECT', 'TEXTAREA'];
		if (data != null){
			$.each(data,function(key, value) {
				let target = '#'+ key;
				if($(target).length > 0){
					if (typeArray.includes($(target).prop("tagName"))){
						$(target).val(value);
					}
				}
				if($("input:radio[name='"+key+"']").length > 0){
					$("input:radio[name='"+key+"']:radio[value='"+value+"']").prop('checked', true);
				}
			});
		}
	}
	// datepicker date set
	// datePicker = ref,
	// targetValue = $('#date').val() YYYY-MM-DD
	static setDateToDatepicker(datePicker, targetValue){
		try{
			datePicker.setDate(new Date(moment(targetValue)), true);
		}catch (err){
			console.log(err);
		}
	}
	// 날짜 계산(기준일 더하기 또는 빼기)
	// unit(계산할 단위) = 'Y': 년, 'M': 월, 'W': 주, 'D': 일
	// baseDateValue(기준일) = $('#date').val() YYYY-MM-DD
	// calcValue(계산할 숫자)
	// calcType(계산타입) = '+', '-'
	// return YYYY-MM-DD
	static calcDate(dateType, baseDateValue, calcValue, calcType){
		let calcDate = null;

		try{
			if ('NOW' == dateType){
				calcDate = moment().format('YYYY-MM-DD');
			}else{
				let type = this.momentCalcType(dateType, 'calc');

				if ('+' == calcType)
					calcDate = moment(baseDateValue).add(calcValue,	type).format('YYYY-MM-DD');
				else if ('-' == calcType)
					calcDate = moment(baseDateValue).subtract(calcValue, type).format('YYYY-MM-DD');
			}

		}catch (err){
			console.log(err);
		}
		return calcDate;
	}
	static momentCalcType(unit, calcType){
		let momentType = null;
		try{
			if (calcType == 'calc'){
				switch (unit) {
				  case 'Y': momentType = 'y'; break; // 년
				  case '년': momentType = 'y'; break; // 년
				  case 'M': momentType = 'M'; break; // 월
				  case '월': momentType = 'M'; break; // 월
				  case 'W': momentType = 'w'; break; // 주
				  case '주': momentType = 'w'; break; // 주
				  case 'D': momentType = 'd'; break; // 일
				  case '일': momentType = 'd'; break; // 일
				  case 'H': momentType = 'h'; break; // 시간
				  case '시간': momentType = 'h'; break; // 시간
				  default:
				    throw "정의되지 않은 unitType입니다.";
				}
			}
			else if (calcType == 'diff'){
				switch (unit) {
				  case 'Y': momentType = 'years'; break;
				  case 'M': momentType = 'months'; break;
				  case 'W': momentType = 'weeks'; break;
				  case 'D': momentType = 'days'; break;
				  case 'H': momentType = 'minutes'; break;
				  default:
				    throw "정의되지 않은 unitType입니다.";
				}
			}
			else if (calcType == 'downDiff'){
				switch (unit) {
				  case '월': momentType = 'days'; break;
				  case '일': momentType = 'hours'; break;
				  case '시간': momentType = 'minutes'; break;
				  default:
				    throw "정의되지 않은 unitType입니다.";
				}
			}

		}catch (err){
			console.log(err);
		}

		return momentType;
	}
}