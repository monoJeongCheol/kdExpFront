/*********************************/
/*	페이징  						 */
/*********************************/
// 페이징 그리드
class PbGridJS{

	// option으로 정리한다.
	constructor(opt){

		this.target 		= '';
		this.countTarget	= '';
		this.el				= null;
		this.tbody			= '';
		this.grid			= function(){}
		this.totalcount		= 0;
		this.viewRows		= 0;
		this.perPage		= 0;
	}

	setViewRows(t){
		this.viewRows = t;
	}

	setPerPage(t){
		this.perPage = t;
	}

	gridDo(){
		this.grid();
	}
	setEl(el){
		this.el = el;
	}

	setGridData(grid){
		this.grid = grid;
	}

	setTarget(t){
		this.target = t;
	}

	setCountTarget(t){
		this.countTarget = t;
	}

	setTotalcount(t){
		this.totalcount		= t;
	}

	renderPagination(currentPage){

		var viewRows = this.viewRows;
		var perPage  = this.perPage;

		var totalcount = this.totalcount;

		// 한페이지 전체보다 작으면 그리지 않는다.
		if (totalcount <= viewRows)
			return;

		var totalPage = Math.ceil(totalcount / viewRows);

		var pageGroup = Math.ceil(currentPage / perPage);

		var last = pageGroup * perPage;

		if (last > totalPage)
			last = totalPage;

		var first = last - (perPage - 1) <= 0 ? 1 : last - (perPage - 1);

		var next = last + 1;

		var prev = first - 1;

		// 페이징 내용 초기화
		this.el.html('');

		// 이전페이지가 있다면
		if(prev > 0){
			this.el.append('<a href="javascript:void('+ this.target+'.renderPagination('+ prev +'));" class="prev" title="이전페이지"><img src="/images/admin/icon_arrow_paging_prev.svg"></a>');
		}

		var paginghtml = '<ul>';

		for (var i = first; i <= last; i++) {

			// 동일페이지인경우
			if(i == currentPage){
				paginghtml += '<li><a href="javascript:'+ this.target+'.renderPagination('+ i +')" class="active">' + i + '</a></li>';
			}else{
				paginghtml += '<li><a href="javascript:'+ this.target+'.renderPagination('+ i +')">' + i + '</a></li>';
			}

		}
		paginghtml += '</ul>';

		this.el.append(paginghtml);

		if (last < totalPage) {
			this.el.append('<a href="javascript:void('+ this.target+'.renderPagination('+ next +'));" class="prev" title="다음페이지"><img src="/images/admin/icon_arrow_paging_next.svg"></a>');
		}
		$('#'+this.countTarget).html(totalcount);

	}
}