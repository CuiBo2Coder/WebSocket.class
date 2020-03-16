$(function () {
    $(document).bind("contextmenu",function(e) {
        return false;
    });
    $("#myModal").load("modal.html");
    //屏幕适应
    window.onresize = function(){
        if($(document).width() <= 800){
            $("#confirm").css({"width":"80%"});
            $("#confirm button").css({"width":"40%"});
        }else {
            $("#confirm").css({"width":"48%"});
            $("#confirm button").css({"width":"45%"});
        }
    }
    $("tr").eq(0).css("background","#98D9DB");
    $(".backPrev").click(function () {
        window.location.href = "home.html";
    });
    $(".backSearch").click(function () {
        info.search("1");
    });
    $("#beginDate").keyup(function () {
        this.value=this.value.replace(/\s+/g,'');
    });
    $("#endDate").keyup(function () {
        this.value=this.value.replace(/\s+/g,'');
    });
    //业务类型改变，刷新对应产品列表
    $("#business").change(function () {
        $.ajax({
            url: "/easyRecordHS/business/findProductListByBusinessId",
            data: JSON.stringify({
                "businessTypeCode": this.value,
            }),
            contentType: "application/json;",
            type: "post",
            success: function (datas) {
                if (datas.success) {
                    condition.productType = datas.result;
                }
            }
        })
    });
    init();
})

//日历控件清除按钮调用事件
function clearDate() {
    if($("#endDate").val()==""){
        startDate.config.max.year = '2099';
        startDate.config.max.month = '12';
        startDate.config.max.date = '31';
    }else{
        endDate.config.min.year = '';
        endDate.config.min.month = '';
        endDate.config.min.date = '';
    }
}
var startDate;
var endDate;
function init() {
    //日期范围限制,控制开始时间和结束时间不能有冲突
     startDate = laydate.render({
        elem: '#beginDate',
        done: function (value, date) {
            if (value !== '') {
                startDate.config.min.year = date.year;
                startDate.config.min.month = date.month - 1;
                startDate.config.min.date = date.date;
            } else {
                startDate.config.min.year = '';
                startDate.config.min.month = '';
                startDate.config.min.date = '';
            }
        }
    });
     endDate = laydate.render({
        elem: '#endDate',
        done: function (value, date) {
            if (value !== '') {
                endDate.config.max.year = date.year;
                endDate.config.max.month = date.month - 1;
                endDate.config.max.date = date.date;
            } else {
                endDate.config.max.year = '';
                endDate.config.max.month = '';
                endDate.config.max.date = '';
            }
        }
    })
    //初始化加载业务类型
    $.ajax({
        url: "/easyRecordHS/business/findBusinessList",
        contentType: "application/json;",
        type: "post",
        success: function (result) {
            if (result.success == true) {
                condition.businessType = result.result;
            }
        }
    });
    //初始化加载状态类型
    $.ajax({
        url: "/easyRecordHS/business/findCodeType",
        contentType: "application/json;",
        type: "post",
        success: function (result) {
            if (result.success) {
                console.log(JSON.stringify(result.result));
                condition.interactiveType = result.result;

            }
        }
    });
    //页面加载时默认获取最近的5条记录
    info.search();
}

var condition = new Vue({
    el: ".videoSearchTop",
    data: {
        condition: {
            appId: "",
            agentCode: "",
            interactive: "",
            businessTypeCode: "",
            productName: "",
            productCode: "",
            beginDate: "",
            endDate: "",
            busiNum: "",
            page: "1"
        },
        businessType: [],
        productType: [],
        interactiveType: []
    }, methods: {
        checkAppId:function (e) {
            var obj = e.currentTarget;
            obj.value=obj.value.replace(/[^u4e00-u9fa5]/g,'');
            condition.condition.appId=obj.value;
        },checkAgentCode:function (e) {
            var obj = e.currentTarget;
            obj.value=obj.value.replace(/[^u4e00-u9fa5]/g,'');
            condition.condition.agentCode=obj.value;
        },checkProductCode:function (e) {
            var obj = e.currentTarget;
            obj.value=obj.value.replace(/[^u4e00-u9fa5]/g,'');
            condition.condition.productCode=obj.value;
        },checkBusiNum:function (e) {
            var obj = e.currentTarget;
            obj.value=obj.value.replace(/[^u4e00-u9fa5]/g,'');
            condition.condition.busiNum=obj.value;
        }
    }
});

var info = new Vue({
    el: ".tableBox",
    data: {
        currentPage:"1",
        videoList: []
    },
    methods: {
        contInfo: function (e) {
            var obj = e.currentTarget;
            var interactive=$(obj).find(".interactive").html();
            if(interactive!="S" && interactive!="L" ){
                return;
            }
            //查询保单创建人是否和登录是否一致,不一致不能进详情页面
            sino.setCuccrentUser();
            var agentCode = $(obj).find(".agentCode").html();
            console.log(G.agentCode+","+agentCode);
            if(G.agentCode!=agentCode){
                return;
            }
            var contNo = $(obj).find(".contNo").html();
            window.location = "detail.html?contNo=" + base64.encode(contNo);
        }, search: function (currPage) {
            condition.condition.beginDate = $("#beginDate").val();
            condition.condition.endDate = $("#endDate").val();
            if(currPage=="1"){
                this.currentPage ="1";
                condition.condition.page="1";
            }
            //根据条件获取数据
            $.ajax({
                url: "/easyRecordHS/video/findVideView",
                contentType: "application/json;",
                type: "post",
                data: JSON.stringify(condition.condition),
                async:false,
                success: function (datas) {
                    if (datas.success) {
                        info.videoList = datas.data.contInfo;
                        // info.$nextTick(function () {
                        //      $("tr:odd").css("background","#D0A791");
                        //      $("tr:even").gt(0).css("background","#197DF6");
                        // })
                        if (datas.data.pages > 0) {
                            var numberOfPages=10;
                            if(datas.data.pages<10){
                                numberOfPages=datas.data.pages;
                            }
                            $('#page').show();
                            //初始化分页
                            var element = $('#page');
                            var options = {
                                bootstrapMajorVersion: 3, //bootstrap的版本要求
                                alignment: "right",
                                currentPage: info.currentPage,          //设置当前页
                                numberOfPages: numberOfPages,		 //设置可以点击到的页数范围
                                totalPages: datas.data.pages,            //设置总页数
                                itemTexts: function (type, page, current) {
                                    switch (type) {
                                        case "first":
                                            return "首页";
                                        case "prev":
                                            return "上一页";
                                        case "next":
                                            return "下一页";
                                        case "last":
                                            return "末页";
                                        case "page":
                                            return page;
                                    }
                                },//点击事件，用于通过Ajax来刷新整个list列表
                                onPageClicked: function (event, originalEvent, type, page) {
                                    condition.condition.page = page + "";
                                    info.search("n");
                                    info.currentPage=page;
                                }
                            }
                            element.bootstrapPaginator(options);
                        }else{
                            $('#page').hide();
                        }
                    }
                }
            })
        }
    }
});
