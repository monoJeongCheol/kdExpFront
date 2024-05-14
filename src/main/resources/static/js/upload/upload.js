// ajax 업로드 선업로드
function preUpload(id) {

	var formData = new FormData($('#fileForm')[0]);

	// 기본적인 upload 이미지파일만 가능

	$.ajax({
		type			: "POST",
		enctype			: 'multipart/form-data',	// 필수
		url				: '/sample/uploadApi',
		data			: formData,		// 필수
		processData		: false,	// 필수
		contentType		: false,
		cache			: false,
		async    		: false,
		success			: function (result) {
			console.log(result);
			alert(result.data.files);
		},
		error: function (e) {
		}
	});
}

// 파일 유효성 ( 확장자, 이미지 크기 )
function imgValidUpload(){


}

// 단순 미리보기 (base64)
function previewImg(){

}
