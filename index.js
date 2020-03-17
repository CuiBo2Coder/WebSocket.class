//*************************************  使用vue和页面数据进行双向绑定   ***********************************************
var cont = new Vue({
    el: "#cont",
    data: {
        amount: [],
        appnt: {
            appId: "",
            name: "",
            sex: "",
            birthday: "",
            age: "",
            riskLevels: ""
        },
        cont: {
            agentCode: "",
            busiNum: "",
            isEld: false,
            isFirst: false,
            isOndo: false,
            officeCode: "",
            bankCode: "",
            agentName: ""
        },
        businessType: [],
        productList: [],
        currencyType: [],
        riskLevelType: []
    }
});
//获取通过CRMS自动唤醒的客户经理账号
var agentCode = sino.getUrlParam('agentCode');
var crmsType;//crms唤醒类型
var time = 0;
var productSize = 1;
/**
 * Created by whd on 2018/7/26.
 */
//屏幕适应
window.onresize = function () {
    if ($(document).width() <= 800) {
        $(".headerLeft").css({
            "width": "18rem",
            "background-size": "18rem"
        });
        $(".leftInformation").hide();
        $(".rightInformation").css("width", "100%");
        $("#confirm").css({"width": "80%"});
        $("#confirm button").css({"width": "40%"});
    } else {
        $(".leftInformation").show();
        $(".rightInformation").css("width", "58%");
        $("#confirm").css({"width": "48%"});
        $("#confirm button").css({"width": "45%"});
    }
}
$(function () {
    var offCode = sino.getUrlParam("officeCode");
    if (!G.officeCode && offCode != "") {
        G.officeCode = offCode;
    }
    $(document).bind("contextmenu", function (e) {
        return false;
    });
    // $("#startAudio").click(function () {
    //     var video=document.getElementById("myaudio");
    //     video.pause();
    //     video.src="mp3/test.mp3";
    // });
    init();
    updateVideo();
    $(".img25").click(function () {
        $(".leftInformation").hide();
        $(".rightInformation").css("width", "100%");
        $(".rightVideo").before("<div class='rightVideoDiv'></div>");
        $(".rightVideo").css({"width": "50%", "display": "inline-block"});
        // $(this).css("box-shadow","rgb(23, 135, 255) 1px 1px 6px 2px");
        $(this).hide();
        $(".img26").show();
    });
    $(".img26").click(function () {
        $(".leftInformation").show();
        $(".rightInformation").css("width", "57%");
        $(".rightVideoDiv").hide();
        $(".rightVideo").css({"width": "100%", "display": "block"});
        $(this).hide();
        $(".img25").show();
    });

    if (G.localIp == undefined) {
        G.localIp = "127.0.0.1:15962";
    }
    //勾选高龄，高额自动勾选
    $("#radio1").change(function () {
        if (this.checked) {
            cont.cont.isOndo = true;
        }
    });
    $("#myModal").load("modal.html");
    //放弃购买
    $("#return").click(function () {
        sino.confirm("是否决定放弃购买?", "return");
    });
    //更换产品
    $(".replace").click(function () {
        sino.confirm("客户是否决定放弃本产品?", "replace");
    });
    //校验表单数据是否完成然后决定保存按钮是否可用
    $("input").keyup(function () {
        checkCount();
    });
    $("[name='sex']").change(function () {
        checkCount();
    });
    $("#level").change(function () {
        checkCount();
    });
    $(".money").change(function () {
        checkCount();
    });
    //点击添加事件
    $(".add").on("click", function () {
        productSize++;
        $(".preservation").attr("disabled", "disabled");
        var addDetail = '<div class="details productDetails">'
            + '<p class="borderP borderPTop">'
            + '<span class="spanColor">产品/业务信息</span>'
            + '<span onclick="isDelete(this)" class="times">&times;</span>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="paddingLeft col-xs-6">业务类型</span>'
            + '<select name="business"  onchange="getProduct(this)" class="right col-xs-6 ">'
            + $("[name='business']:eq(0)").html()
            + '</select>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="paddingLeft col-xs-6 ">产品名称</span>'
            + '<select name="product" onchange="getProductInfo(this)" class="right col-xs-6 ">'
            + '<option value="0">请选择</option>'
            + '</select>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="left paddingLeft col-xs-6">产品类型</span>'
            + '<span class="right paddingRight col-xs-6 productTypeName">默认匹配</span>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="left paddingLeft col-xs-6 ">产品编号</span>'
            + '<span class="right paddingRight col-xs-6 productCode">默认匹配</span>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="left paddingLeft col-xs-6">产品风险等级</span>'
            + '<span class="right paddingRight col-xs-6 productTriskLevels">默认匹配</span>'
            + '</p>'
            + '<p class="borderP row">'
            + '<span class="left paddingLeft col-xs-6">产品公司名称</span>'
            + ' <input type="text" readonly class="right paddingRight col-xs-6 companyName" value="默认匹配"/>'
            + ' </p>'
            + '<p class="borderP row">'
            + '<span class="left paddingLeft col-xs-6">投资货币/金额</span>'
            + ' <select class="money col-xs-2" onchange="checkCount()" style="border:solid #ccc 1px;padding-left:0px; position: relative;top:-3px">'
            + $("#money").html()
            + '</select>'
            + '<input type="text" name="amount" maxlength="10" onblur="sino.formatCurrency(this)" onfocus="rmoney(this)" onkeyup="checkCount()" class="right paddingRight col-xs-4"/>'
            + ' <input type="hidden"  class="greatnumberlimit" />'
            + '<input type="hidden" class="oldAgeLimit"/>'
            + '</p>'
            + '</div>';
        $(".productInformationOut").append(addDetail);
    });
    //保存保单信息
    $(".preservation").click(function () {
        if (!DeviceAssist) {
            sino.alert("请连接高拍仪设备再进行操作");
            return;
        }
        isSave = true;
        $(".times").hide();
        var flag = checkForm();
        if (!flag) {
            return;
        }
        checkMax();
        checkOld();
        cont.appnt.sex = $("[type='radio']:checked").val();
        var $amount = $("[name='amount']");
        var $money = $(".money");
        var $productCode = $("[name='product']");
        var amountArr = new Array();//投资金额数组
        var productCodeArr = new Array();//产品编号集合
        var currencyArr = new Array();//币种类型集合
        for (var i = 0; i < productSize; i++) {
            amountArr.push($amount[i].value);
            productCodeArr.push($productCode[i].value);
            currencyArr.push($money[i].value)
        }
        cont.cont.productCode = productCodeArr;
        cont.cont.officeCode = G.officeCode;
        cont.cont.bankCode = G.bankCode;
        var data = {
            cont: cont.cont,
            appnt: cont.appnt,
            amount: amountArr,
            currency: currencyArr
        }
        $(this).attr("disabled", "disabled");
        $.ajax({
            url: "/easyRecordHS/policy/savePolicy",
            data: JSON.stringify(data),
            contentType: "application/json;",
            type: "post",
            timeout: 30000,
            success: function (datas) {
                if (datas.success) {
                    sino.alert("保存成功!")
                    video.talks = datas.data.task;
                    cont.cont.contNo = datas.data.contNo;
                    video.video.contNo = datas.data.contNo;
                    video.picture.contNo = datas.data.contNo;
                    $("#level").attr("disabled", "disabled");
                    $(".taskCheck:gt(0)").attr("disabled", "disabled");
                    $(".speechImg14 .img14").removeClass("hidden");
                    $("select").attr("disabled", "disabled");
                    $(".borderP >input").css("background-color", "#e4e4e4");
                    $(".paddingRight").css("background-color", "#e4e4e4");
                    $(".preservation").attr("disabled", "disabled");
                    $(".add").attr("disabled", "disabled");
                    $(".borderP input").attr("disabled", "disabled");
                    $(".isCheck [type='checkbox']").attr("disabled", "disabled");
                    $("#stopVideo").removeAttr("disabled");
                    $(".img25").removeClass("hidden");
                    $(".img26").removeClass("hidden");
                    $(".money").attr("disabled", "disabled");
                } else {
                    $(".preservation").removeAttr("disabled");
                    var message = "";
                    if (datas.message) {
                        message = datas.message;
                    } else {
                        message = datas.messages;
                    }
                    sino.alert("messages:" + message);
                    console.log("保存失败!" + JSON.stringify(datas));
                }
            }, complete: function (XMLHttpRequest, status) { //请求完成后最终执行参数
                if (status == 'timeout') {//超时,status还有success,error等值的情况
                    $(".preservation").removeAttr("disabled");
                    sino.alert("请求超时,请重试!");
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".preservation").removeAttr("disabled");
                sino.alert("请求超时,请重试!");
            }
        })
    });

    $("#stopVideo").click(function () {
        if (!DeviceAssist) {
            sino.alert("请连接高拍仪设备再进行操作");
            return;
        }
        var flag = true;
        var $checks = $(".taskCheck");
        for (var i = 0; i < $checks.length; i++) {
            if (!$checks[i].checked) {
                flag = false;
            }
        }
        if (!flag) {
            sino.alert("您还没有完成话术勾选");
            return;
        }
        sino.confirm("是否已经完成录制?", "video");
    });

    $("#test").change(function () {
        $.post("policy/getAgeByBirthday", {"birthday": $("#test").val()}, function (age) {
            cont.appnt.age = age;
        })
    });
});

//**************************javascript函数开始*************************************************

function init() {
    sino.setCuccrentUser();//存放当前登录的用户
    $.post("/easyRecordHS/business/initSelect", function (re) {
        cont.currencyType = re.data.currencyType;
        cont.riskLevelType = re.data.riskLevelType;
        cont.$nextTick(function () {
            if (agentCode != "" && crmsType == "RPQ") {
                $(".money").html("<option value='无'>无</option>")
            }
        });
    });
    //初始化加载日历控价
    laydate.render({
        elem: '#test', //指定元素
        max: sino.getDate(),
        done: function (value) {//控件选择完毕后的回调---点击日期、清空、现在、确定均会触发。
            cont.appnt.birthday = value;
            if (value.trim() != "") {
                $.post("policy/getAgeByBirthday", {"birthday": value}, function (age) {
                    console.log(value + "生日转换成年龄=" + age);
                    cont.appnt.age = age;
                })
            }
        }
    })
    $("#layui-laydate1").css("width", "140px");
    getCurrentUser();
    //当前登录的客户经理账号
    if (!sino.checkIsNull(agentCode)) {
        video.video.agentCode = agentCode;
        cont.cont.agentCode = agentCode;
        $.ajax({
            url: "/easyRecordHS/echo/echoCont",
            data: JSON.stringify({agentCode: agentCode}),
            contentType: "application/json;",
            type: "post",
            success: function (result) {
                if (result.success) {
                    cont.cont.agentName = result.data.cont.agentName;
                    cont.cont.busiNum = result.data.cont.busiNum;
                    cont.cont.isFirst = result.data.cont.isFirst;
                    cont.cont.contNo = result.data.cont.contNo;
                    cont.appnt = result.data.appnt;
                    video.video.contNo = result.data.cont.contNo
                    if (cont.appnt.sex == "0") {
                        $("#man").attr("checked", "checked");
                    } else if (cont.appnt.sex == "1") {
                        $("#woman").attr("checked", "checked");
                    }
                    crmsType = result.data.type;
                    initBusinessList();
                    if (result.data.type == "RPQ") {
                        $("[name='amount']").val("无").attr("disabled", "disabled");
                        $(".productTriskLevels").html("无");
                        $(".productTypeName").html("无");
                        $(".productCode").html("无");
                        $(".companyName").val("无");
                    }
                }
            }
        })
    } else {
        initBusinessList();
    }
}

//是否删除产品？
function isDelete(obj) {
    if (productSize == 1) {
        sino.alert("当前只有一个产品信息,无法删除");
        return;
    }
    sino.confirm("您是否删除本产品?", "delete", obj);
}

//删除产品
function deleteProduct(obj) {
    productSize--;
    $(obj).parents(".productDetails").remove();
    checkCount();
    sino.alert("删除产品成功")
}

//更换产品
function replace() {
    $(".preservation").removeAttr("disabled");
    $(".add").removeAttr("disabled");
    $(".times").show();
    $('#mymodal').modal('hide');
    $("#stopVideo").attr("disabled", "disabled");
    $("select").removeAttr("disabled");
    $(".borderP >input").css("background-color", "#fff");
    $(".paddingRight").css("background-color", "#fff");
    $(".preservation").removeAttr("disabled");
    $(".add").removeAttr("disabled");
    $(".borderP input").removeAttr("disabled");
    $(".disa").css("background", "#e4e4e4").attr("disabled", "disabled");
    $("[type='checkbox']").removeAttr("disabled");
    $(".taskCheck").attr("checked", false).removeAttr("disabled");
    $(".money").removeAttr("disabled");
    //更换产品时，判断业务类型如果是RPQ的话，把金额框禁用掉
    var $product = $(".productDetails");
    for (var i = 0; i < $product.length; i++) {
        if ($($product[i]).find("[name='business']").val() == "RPQ") {
            $($product[i]).find("[name='amount']").attr("disabled", "disabled");
        }
    }
}

//保存视频信息和话术信息
function saveVideo() {
    $('#myModal').css('display', "none");
    var data = {
        video: video.video,
        picture: video.picture,
        type: video.type
    }
    //alert(video.video.beginDate)
    var $talk = $(".taskCheck");
    if ($talk.length == 0) {
        sino.alert("请选择有话术的产品进行录制");
        return;
    }
    $("#stopVideo").attr("disabled", "disabled");
    var $qualityZn = $(".openTop");
    for (var i = 0; i < $talk.length; i++) {
        video.picture.pkId.push($talk[i].value);
        video.picture.timeNode.push($($talk[i]).attr("name"));
        video.picture.qualityZn.push($($qualityZn[i]).html());
    }
    if (videoCapAssist && videoCapAssist.VideoCapStop()) {
        videoCapAssist.Destroy();
        videoCapAssist = null;
        video.video.endDate = sino.getDateTime('1');
        console.log(typeof video.video.endDate);
        video.video.timeLength = time;
        //video.video.beginDate = video.video.endDate - video.video.timeLength;
        if (!sino.checkIsNull(AudioObject)) {
            EloamGlobal.StopAudioVolume(AudioObject);
            AudioObject.Destroy();
        }
    }
    $.ajax({
        url: "/easyRecordHS/policy/saveVideo",
        data: JSON.stringify(data),
        contentType: "application/json;",
        type: "post",
        success: function (result) {
            if (result.success) {
                cont.cont=null;
                sino.alert("保存成功", "videoSearch.html", 400);
            } else {
                isSave = true;
                sino.alert("保存失败");
                console.log("保存失败{" + JSON.stringify(result) + "}");
                $("#stopVideo").removeAttr("disabled");
            }
        }
    });
}

//根据业务类型编号和风险等级级别获取产品类型
function getProduct(obj) {
    var parent = $(obj).parents(".productDetails")
    $(".preservation").attr("disabled", "disabled");
    parent.find("[name='product']").html("<option value='0'>请选择</option>");
    parent.find(".productTypeName").html("");
    parent.find(".productCode").html("");
    parent.find(".productTriskLevels").html("");
    parent.find(".companyName").val("");
    parent.find("[name='amount']").val("");
    var $money = parent.find(".money");
    if ($money.val() == "无") {
        $money.html($("#money").html());
    }
    if (obj.value == "0") {//业务类型为请选择，清空产品信息
        return;
    }
    if (cont.appnt.riskLevels == "" && obj.value != "RPQ") {
        sino.alert("请填写完风险等级再选择产品");
        obj.value = "0";
        return;
    }
    $.ajax({
        url: "/easyRecordHS/business/findProductListByBusinessId",
        data: JSON.stringify({
            "businessTypeCode": obj.value,
            "productRiskLevels": cont.appnt.riskLevels
        }),
        contentType: "application/json;",
        type: "post",
        success: function (datas) {
            if (datas.success) {
                var productList = datas.result;
                var productOption = '<option>请选择</option>'
                for (var i = 0; i < productList.length; i++) {
                    productOption += "<option value='" + productList[i].productCode + "'>" + productList[i].productName + "</option>";
                }
                console.log("业务类型编码:" + obj.value + "客户风险等级编码:" + cont.appnt.riskLevels + ";产品信息:[" + productOption + "]");
                $(obj).parents(".productDetails").find("[name='product']").html(productOption);
            }
        }
    });
}

//根据产品编号获取产品信息
function getProductInfo(obj) {
    var parent = $(obj).parents(".productDetails")
    var business = parent.find("[name='business']").val();
    if (obj.value == "请选择") {
        parent.find(".productTypeName").html("");
        parent.find(".productCode").html("");
        parent.find(".productTriskLevels").html("");
        parent.find(".companyName").val("");
        parent.find("[name='amount']").val("");
        $(".preservation").attr("disabled", "disabled");
        return;
    }
    $.ajax({
        url: "/easyRecordHS/business/findProductById",
        data: JSON.stringify({
            "productId": obj.value,
        }),
        contentType: "application/json;",
        type: "post",
        success: function (result) {
            if (result.success) {
                var product = result.data;
                console.log("返回的数据" + product);
                //判断是否是RPQ产品,如果是不显示多余
                if (business != "RPQ") {
                    parent.find(".productTypeName").html(product.productTypeName);
                    parent.find(".productCode").html(product.productCode);
                    parent.find(".productTriskLevels").html(product.levelName);
                    parent.find(".companyName").val(product.companyName);
                    parent.find("[name='amount']").removeAttr("disabled");
                    var $money = parent.find(".money");
                    if ($money.val() == "无") {
                        $money.html($("#money").html());
                    }
                } else {
                    parent.find("[name='amount']").val("无").attr("disabled", "disabled");
                    parent.find(".productTriskLevels").html("无");
                    parent.find(".productTypeName").html("无");
                    parent.find(".productCode").html("无");
                    parent.find(".companyName").val("无");
                    parent.find(".money").html("<option value='无'>无</option>");
                    checkCount();
                }
                parent.find(".greatnumberlimit").val(product.greatnumberlimit);
                parent.find(".oldAgeLimit").val(product.oldAgeLimit);
            }
        }
    })
}

//如果选择的产品中有1个投资金额比高额限制金额高 自动勾选引入指定人员销售流程
function checkMax() {
    var falg = false;
    var $amount = $("[name='amount']");
    for (var i = 0; i < $amount.length; i++) {
        if ($amount[i].value == "无") {
            continue;
        }
        var money = parseFloat(sino.rmoney($amount[i].value));
        var maxMoney = parseFloat($($amount[i]).next().val());
        if (money > maxMoney) {
            falg = true;
            break;
        }
    }
    console.log("是否勾选高额限制>" + falg);
    if (falg) {
        cont.cont.isOndo = falg;

    }
}

//是否是保存失败表示，默认不是,如果是删除对应的业务记录
var isSave = false;

//放弃购买
function notBuy() {
        Unload();
    if (!isSave) {
        var data = {};
        data.contNo = cont.cont.contNo;
        data.agentCode = G.agentCode;
        data.appntCode = cont.appnt.appId;
        data.agentName = G.agentName;
        data.bankCode = G.bankCode;
        data.officeCode = G.officeCode;
        data.beginTime = video.video.beginDate;
        data.endTime = sino.getDateTime('1');
        $.ajax({
            url: "/easyRecordHS/delCont",
            data: JSON.stringify(data),
            contentType: "application/json;",
            type: "post",
            async: false,
            success: function (result) {
              console.log(result);
            }
        });
    }
    if(cont.cont.contNo==undefined){
        $.getJSON("http://" + G.localIp + "/easyrecordHS/deleteVideo?callback=?", {path: video.video.oldUrl});
    }
    window.location = "home.html";
}

//保单提交前根据业务类型和客户年龄自动勾选是否高龄，和对应的条件 保险60以上 基金和理财产品是65以上
function checkOld() {
    var flag = false;
    var age = parseInt(cont.appnt.age);
    var $oldAgeLimit = $(".oldAgeLimit");
    for (var i = 0; i < $oldAgeLimit.length; i++) {
        console.log("年龄:" + age + ",产品高龄限制" + $oldAgeLimit[i].value)
        if (age >= parseInt($oldAgeLimit[i].value)) {
            flag = true;
            break;
        }
    }
    if (flag) {
        cont.cont.isEld = flag;
        // cont.cont.isOndo = true;
    }
}

//验证保单信息是否添写完，添写完成保存按钮可用
function checkCount() {
    //性别为单选框，特殊验证
    var $radius = $("[ name='sex']");
    if ($radius[0].checked == $radius[1].checked) {
        return;
    }

    var contFlag = $.trim(cont.appnt.name) == "" || $.trim(cont.appnt.appId) == "" || $.trim(cont.appnt.age) == "" || $.trim(cont.appnt.birthday) == "";
    console.log("基本数据验证结果:" + !contFlag);
    if (!contFlag) {
        var $amount = $("[name='amount']");
        var $productCode = $("[name='product']");
        var $money = $(".money")
        for (var i = 0; i < productSize; i++) {
            console.log("i=" + i + ",amount=" + $amount[i].value + ",productCode=" + $productCode[i].value);
            if ($amount[i].value == "" || $.trim($productCode[i].value) == "请选择" || $money[i].value == "") {
                $(".preservation").attr("disabled", "disabled");
                contFlag = true;
                return;
            }

        }
    } else {
        $(".preservation").attr("disabled", "disabled");
    }
    console.log("最终数据验证结果:" + !contFlag);
    if (!contFlag) {
        $(".preservation").removeAttr("disabled")
    }
}

/**
 * 判断参数长度是否为9位
 * @param 参数
 */
function checkLength(obj) {
    //添加校验 客户号必须是 正整数 数字
    var customId = obj.value;
    if (!isUnsignedInteger(customId)) {
        sino.alert("客户号必须是9位数字！");
    }
}

function isUnsignedInteger(a) {
    var reg = /^\d{9}$/
    return reg.test(a);
}

/**
 * 判断参数是否是中文、英文
 * @param 参数
 */
function checkMath(obj) {
    var reg = /^([\u4e00-\u9fa5]+)|(.?)$/;
    if (!reg.test(obj.value)) {
        sino.alert("客户姓名只能是中文或英文");
    }
    ;
}


/**
 * 重录视频
 */
function updateVideo() {
    var contNo = sino.getUrlParam('contNo');
    if (contNo != "") {
        video.video.contNo = base64.decode(contNo);
        video.picture.contNo = video.video.contN
        $.ajax({
            url: "/easyRecordHS/echo/echoInfo",
            data: JSON.stringify({contNo: video.video.contNo}),
            contentType: "application/json;",
            type: "post",
            success: function (result) {
                if (result.success) {
                    cont.appnt = result.data.appnt;
                    cont.cont.agentCode = cont.appnt.agentCode;
                    cont.cont.agentName = cont.appnt.username;
                    cont.cont.isEld = cont.appnt.isEld;
                    cont.cont.isFirst = cont.appnt.isFirst;
                    cont.cont.isOndo = cont.appnt.isOndo;
                    if (cont.appnt.sex == 0) {
                        $("#man").attr("checked", "checked");
                    } else {
                        $("#woman").attr("checked", "checked");
                    }
                    video.talks = result.data.talks;
                    $(".speechImg14 .img14").removeClass("hidden");
                    $("select").attr("disabled", "disabled");
                    $(".borderP >input").css("background-color", "#e4e4e4");
                    $(".paddingRight").css("background-color", "#e4e4e4");
                    $(".preservation").attr("disabled", "disabled");
                    $(".replace").attr("disabled", "disabled");
                    $(".add").attr("disabled", "disabled");
                    $(".borderP input").attr("disabled", "disabled");
                    $(".isCheck [type='checkbox']").attr("disabled", "disabled");
                    $("#return").attr("disabled", "disabled");
                    $(".times").hide();
                    $(".leftTopB").removeClass("hidden");
                    $("#proInfo").hide();
                    $("#stopVideo").removeAttr("disabled");
                    cont.productList = result.data.productInfo;
                }
            }
        })
    }
}

//校验表单数据是否合法
function checkForm() {
    var msg = "";
    var flag = true;
    if (!isUnsignedInteger(cont.appnt.appId)) {
        msg = "客户号必须是9位数字<br/>";
        flag = false;
    }
    var reg = /^([\u4e00-\u9fa5]+)|(.?)$/;
    if (!reg.test(cont.appnt.name)) {
        msg += "客户姓名只能是中文或英文<br/>";
        flag = false;
    }
    if (!flag) {
        sino.alert(msg);
    }
    return flag;
}

//回显当前登录的员工信息
function getCurrentUser() {
    cont.cont.agentName = G.agentName;
    cont.cont.agentCode = G.agentCode;
    video.video.agentCode = G.agentCode;
}

//加載业务类型
function initBusinessList() {
    //初始化加载业务类型
    $.ajax({
        url: "/easyRecordHS/business/findBusinessList",
        contentType: "application/json;",
        type: "post",
        success: function (result) {
            if (result.success == true) {
                cont.businessType = result.result;
                cont.$nextTick(function () {
                    if (agentCode != "") {
                        if (crmsType == "RPQ") {
                            $("[name='business']").val("RPQ").attr("disabled", "disabled");
                        }
                        getProduct(document.getElementById("businessType"));
                    }
                });
            }
        }
    });
}

//金额获取焦点时候，去掉格式化
function rmoney(obj) {
    if (sino.checkIsNull(obj.value)) {
        return;
    }
    obj.value = sino.rmoney(obj.value);
}

var audioI = 0;
var audioSum = 0;
var audioAvg = 0;
var img = "";
//根据实时音频获取音量大小
setInterval(function () {
    if (audioSum == 0) {
        return;
    }
    var audioAvg = Math.round(audioSum / audioI / 100);
    // console.log(sino.getDateTime(1) + "-" + audioSum + "-----" + audioI + "---------" + audioAvg);
    switch (audioAvg) {
        case 0:
            img = "img/audio/audio0.png";
        case 1:
            img = "img/audio/audio1.png";
            break;
        case 2:
            img = "img/audio/audio2.png";
            break;
        case 3:
            img = "img/audio/audio3.png";
            break;
        case 4:
            img = "img/audio/audio4.png";
            break;
        case 5:
            img = "img/audio/audio5.png";
            break;
        case 6:
            img = "img/audio/audio6.png";
            break;
        case 7:
            img = "img/audio/audio7.png";
            break;
        case 8:
            img = "img/audio/audio8.png";
            break;
        case 9:
            img = "img/audio/audio9.png";
            break;
        default:
            img = "img/audio/audio10.png";
            break;
    }
    $("#audioImg").attr("src", img);
    audioI = 0;
    audioSum = 0;
}, 1000);