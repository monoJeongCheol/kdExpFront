function loadAdminBsc(){
	//Header(User)
    function userInitials(){
        var initialsText = $('header .user_select .view .name').text()
        var firstText = initialsText.charAt(0);
        $('header .user_select .view .initials').text(firstText);
    }
    userInitials();
    //NAV
    /*$('header nav .depth1 > li > span').click(function(){
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            $(this).next('.depth2').slideUp(0);
        }else {
            $('header nav .depth1 > li > span').removeClass('active');
            $('header nav .depth2 > li > a').removeClass('on');
            $('header nav .depth2').slideUp(0);
            $('header nav .depth3').slideUp(0);
            $(this).addClass('active');
            $(this).next('.depth2').slideDown(0);
        }
        return false;
    });
    $('header nav .depth2 > li > a').click(function(){
        if($(this).hasClass('on')){
            $(this).removeClass('on');
            $(this).next('.depth3').slideUp(0);
        }else {
            $('header nav .depth2 > li > a').removeClass('on');
            $('header nav .depth3').slideUp(0);
            $(this).addClass('on');
            $(this).next('.depth3').slideDown(0);
        }
        return false;
    });*/
    //Header(User Select)
    $('header .user_select .view').click(function(){
        $(this).toggleClass('active');
        $(this).next('.menus').slideToggle(0);
    });
    $('header .user_select .menus').mouseleave(function(){
        $(this).slideUp();
        $('header .user_select .view').removeClass('active');
    });
    //Section Title(Folding)

    $('.section_card > .tit_wrap .folding').off('click').click(function(){

        if($(this).hasClass('close')){
            $(this).removeClass('close');
            $(this).attr('title','접기');
            $(this).parents('.tit_wrap').find('button, input, label, span').css('visibility','visible');
            $(this).parents('.tit_wrap').next('.data_wrap').stop().slideDown(0);
            $(this).css('visibility','visible');
        }else{
            $(this).parents('.tit_wrap').find('button, input, label, span').css('visibility','hidden');
            $(this).addClass('close');
            $(this).attr('title','펼치기');
            $(this).parents('.tit_wrap').next('.data_wrap').stop().slideUp(0);
			$(this).css('visibility','visible');
        }
        hasScrollAction();
    });

    //Title Line

    $('.section_card > .tit_wrap .folding').each(function(){
		$(this).parents('.tit_wrap').next('.data_wrap').addClass('has_line');
	})

    //Go Top
    $('.comm_go_top').click(function(){
        $('html, body, .content_wrap').animate({scrollTop: 0});
    });
    //첨부파일
    $('.comm_attachment .file_hidd').change(function(){
        var addFileRoot = $(this).val();
        $(this).parents('.comm_attachment').find('.file_root').val(addFileRoot);
    });
    //Content Layout
    // function contentLayout(){
	// 	var windowHT = $(window).height();
	// 	var historyMenuHT = $('.history_menu').outerHeight() + 15;
	// 	var titleHT = $('.comm_title').outerHeight();
	// 	$('#body-container').css('height',windowHT - historyMenuHT);
	// 	$('.content_wrap').css('height',windowHT - titleHT);
	// 	$('.tree_grid_wrap').css({'height': windowHT - titleHT});
	// }
	// contentLayout();

	$(window).resize(function(){
		// contentLayout();

		if(typeof resizeGrid == 'function'){
			resizeGrid();
		}
	});
	function hasScrollAction(){
		setTimeout(function(){
			$.fn.hasScrollBar = function() {
                return (this.prop("scrollHeight") == 0 && this.prop("clientHeight") == 0) || (this.prop("scrollHeight") > this.prop("clientHeight"));
            };
			if($(".content_wrap").hasScrollBar()){
                $('.comm_title').stop().animate({'padding-right': 17});
			}else {
				$('.comm_title').stop().animate({'padding-right': 10});
			}
		},1000);
	}
	hasScrollAction();
    //입력창 글자수(공통)
    $('.enter_limit .comm_textarea, .enter_limit .comm_enter').keyup(function () {
        var textLength = $(this).val().length;
        var maxLenth = parseInt($(this).next('.length').find('.max').text());
        $(this).next('.length').find('.now').html(textLength);
        $(this).attr('maxlength' , maxLenth);
        if (textLength > maxLenth) {
            alert('글자수는 '+maxLenth+'자까지 입력 가능합니다.');
            $(this).next('.length').find('.now').html(maxLenth);
            $(this).val($(this).val().substring(0, maxLenth));
        };
    });
    //입력창 글자수(input)
    $('.enter_limit.input .comm_enter').keyup(function () {
        var textViewSize = $(this).next('.length').outerWidth();
        $(this).css('padding-right' , textViewSize + 20);
    });
}

$(document).ready(function(){
    loadAdminBsc();
});
