var earth = null;
var PIPELINELAYERS = [];  //记录所有管线图层
var CURRLAYERID = null; //当前选中的图层ID
var ROADLAYERS = []; //记录所有的道路中心线图层
var DISTRICTLAYERS = [];//记录所有行政区划图层
var PIPELINEOBJLIST = null; 
var wellPolygon = null;
var SYSTEMPARAMS = {}; //系统参数对象
var pipeFlowArr = []; //流向图层
var htmlBalloons = null;
var regExp = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/; //验证数字｛可以为小数｝

var excuteType = 27; //GetXml接口 返回类型
var bTerrain = true;
//-----------------------------------------------------------------------------
// 地下浏览功能 - 开始
//-----------------------------------------------------------------------------
var balloonsFunc = new ActiveXObject("Scripting.Dictionary");
var OnHtmlBalloonFinishedFunc = function(curBid, callback){
    balloonsFunc.item(curBid) = callback;
    earth.event.OnHtmlBalloonFinished = function(closeBid){
        if(balloonsFunc.Exists(closeBid)){
            balloonsFunc.item(closeBid)(closeBid);
            balloonsFunc.Remove(closeBid);
        }
    }
}
var localSearchDataType = {
    "xml": 1,
    "xmlWithMesh": 4,
    "json": 5,
    "jsonWithMesh": 6
};
function init() {
    earth.Environment.SetLogoWindowVisibility(false);
    //usearth.Environment.SetProviderWindowVisibility(false);
    SystemSetting.initSystemParam();
    LayerManagement.initLayerDataType(earth);
    LayerManagement.initPipelineTree(earth,$("#PipelineLayerTree", parent.document)); //初始管线图层树
    LayerManagement.initLayerTree(earth,$("#layerTree", parent.document)); //初始化图层树
//	top.showLargeDialog('html/accordionChart.html', '管线图层管理')
}

var showHtmlBalloon = function(vecCenterX, vecCenterY, vecCenterZ, htmlStr) {
    if (htmlBalloons) {
        htmlBalloons.DestroyObject();
        htmlBalloons = null;
    }
    var guid = earth.Factory.CreateGuid();
    htmlBalloons = earth.Factory.CreateHtmlBalloon(guid, "balloon");
    htmlBalloons.SetSphericalLocation(vecCenterX, vecCenterY, vecCenterZ);
    htmlBalloons.SetRectSize(280, 340);
    var color = parseInt("0xffffff00");
    htmlBalloons.SetTailColor(color);
    htmlBalloons.SetIsAddCloseButton(true);
    htmlBalloons.SetIsAddMargin(true);
    htmlBalloons.SetIsAddBackgroundImage(true);
    htmlBalloons.SetIsTransparence(true);
    htmlBalloons.SetBackgroundAlpha(0xcc);
    htmlBalloons.ShowHtml(htmlStr);

    //deleted by zhangd-2015-03-12-13:53--所有气泡关闭事件均修改为下面的回调方式
    // earth.Event.OnHtmlBalloonFinished = function() {
    //     if (htmlBalloons != null) {
    //         htmlBalloons.DestroyObject();
    //         htmlBalloons = null;
    //     }
    //     earth.Event.OnHtmlBalloonFinished = function() {};
    // }
    OnHtmlBalloonFinishedFunc(guid,function(closeBid){
        if (htmlBalloons != null) {
            htmlBalloons.DestroyObject();
            htmlBalloons = null;
        }
    })
};
var clearHtmlBalloons = function() {
    if (htmlBalloons != null) {
        htmlBalloons.DestroyObject();
        htmlBalloons = null;
    }
};
/**
 * 功能：地下浏览模式
 * 参数：无
 * 返回：无
 */
var undergroundModeCtrl = function(){
	earth.GlobeObserver.UndergroundMode = true;
	earth.Event.OnObserverChanged = function(){
		var targetPose = earth.GlobeObserver.TargetPose;
		var lon = parseFloat(targetPose.Longitude);
		var lat = parseFloat(targetPose.Latitude);
		var underRefAlt = 0;
		var propLayer = null;
		
		var layerList = earth.LayerManager.LayerList;
		var layerCount = layerList.GetChildCount();
		for(var i = 0; i < layerCount; i++){
			var layer = layerList.GetChildAt(i);
			if(layer.LayerType == "Project"){
				var name = layer.Name;
				var rect = layer.LonLatRect;
				if(lon > rect.West && lon < rect.East && lat > rect.South && lat < rect.North){
					if(propLayer == null){
						propLayer = layer;
					}else{
						var propRect = propLayer.LonLatRect;
						if(rect.West > propRect.West && rect.East < propRect.East && rect.South > propRect.South && rect.North < propRect.North){
							propLayer = layer;
						}
					}
				}
			}
		}
		if(propLayer != null){
			underRefAlt = propLayer.ProjectSetting.UnderRefAlt;
		}
		earth.Environment.AuxPlaneAltitude = underRefAlt;
	};	
};

/**
 * 功能：取消地下浏览模式
 * 参数：无
 * 返回：无
 */
var undergroundModeCancel = function(){
	earth.GlobeObserver.UndergroundMode = false;
	earth.Event.OnObserverChanged = function(){	};
};

/**
 * 功能：“地下浏览”菜单点击事件
 * 参数：无
 * 返回：无
 */
function ViewUndergroundModeClick(panel){
	var tag = document.getElementById(panel).tag;
	if(tag === "unselected"){
		undergroundModeCtrl();
		document.getElementById(panel).src="images/linkbutton2.png";
		document.getElementById(panel).tag="selected";

	}else if(tag === "selected"){
		undergroundModeCancel();
		document.getElementById(panel).src="images/linkbutton2_1.png";
		document.getElementById(panel).tag="unselected";
	}		
}
//-----------------------------------------------------------------------------
// 地下浏览功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//地面透明度功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“地面透明度”菜单点击事件
 * 参数：无
 * 返回：无
 */
var ViewTranSettingClick = function(panel,command) {	
    sliderMgr.init(earth);
/*
	//天气效果模拟
   if (command === "EffectRain") {
        if($('div[tag=EffectRain]').hasClass('selected')){
            $('div[tag=EffectRain]').removeClass('selected');
            setSlidersVisible(0);
        }else{
            $('div[tag=ViewTranSetting]').removeClass('selected');
            $('div[tag=EffectRain]').addClass('selected');
            $('div[tag=EffectSnow]').removeClass('selected');
            $('div[tag=EffectFog]').removeClass('selected');
            setSlidersVisible(2);
        }
    } else if (command === "EffectSnow") {
        if($('div[tag=EffectSnow]').hasClass('selected')){
            $('div[tag=EffectSnow]').removeClass('selected');
            setSlidersVisible(0);
        }else{
            $('div[tag=ViewTranSetting]').removeClass('selected');
            $('div[tag=EffectRain]').removeClass('selected');
            $('div[tag=EffectSnow]').addClass('selected');
            $('div[tag=EffectFog]').removeClass('selected');
            setSlidersVisible(4);
        }
    } else if (command === "EffectFog") {
        if($('div[tag=EffectFog]').hasClass('selected')){
            $('div[tag=EffectFog]').removeClass('selected');
            setSlidersVisible(0);
        }else{
            $('div[tag=ViewTranSetting]').removeClass('selected');
            $('div[tag=EffectRain]').removeClass('selected');
            $('div[tag=EffectSnow]').removeClass('selected');
            $('div[tag=EffectFog]').addClass('selected');
            setSlidersVisible(8);
        }
    }else{
        if($('div[tag=ViewTranSetting]').hasClass('selected')){
            $('div[tag=ViewTranSetting]').removeClass('selected');
            setSlidersVisible(0);
        }else{
            $('div[tag=ViewTranSetting]').addClass('selected');
            $('div[tag=EffectRain]').removeClass('selected');
            $('div[tag=EffectSnow]').removeClass('selected');
            $('div[tag=EffectFog]').removeClass('selected');
            setSlidersVisible(1);
        }
    }*/
	
	var tag = document.getElementById(panel).tag;
	if(tag === "unselected"){
		setSlidersVisible(0);
		document.getElementById(panel).src="images/linkbutton1.png";
		document.getElementById(panel).tag="selected";

	}else if(tag === "selected"){
		setSlidersVisible(1);
		document.getElementById(panel).src="images/linkbutton1_1.png";
		document.getElementById(panel).tag="unselected";
	}		


}
var setSlidersVisible = function(flag){
    var st = [{
        id:'ViewTranSetting',
        type:'transparency'
    },{
        id:'EffectRain',
        type:'rain'
    },{
        id:'EffectSnow',
        type:'snow'
    },{
        id:'EffectFog',
        type:'fog'
    }];
    sliderMgr.init(earth, false, function(type){
        for(var i in st){
            if(st[i].type == type){
                $('div[tag=' + st[i].id + ']').removeClass('selected');
            }
        }
    });
    for(var i = 0;i < st.length;i++){
        sliderMgr.setVisible(st[i].type,flag & Math.pow(2,i));
    }
}
//-----------------------------------------------------------------------------
//地面透明度功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//属性查询功能 - 开始
//-----------------------------------------------------------------------------
var GeneralQuery = {};
(function () {
    var onPickObjectEx = function (pObj){

        var parentLayerName = pObj.GetParentLayerName();//查找管线部件所在的图层guid
        if(parentLayerName==""||parentLayerName==null){
        	alert("获得父层名称失败！");
        	return false;
        }
		//若不是管线对象，则返回
		var m = parentLayerName.split("_")[1];
		if(m!="container" && m!="well" && m!="joint" && m!="equipment" && m!="plate" ){
			return false;
		}
        var key = pObj.GetKey();
        var pObjGUID = pObj.Guid;
        var pObjs = [];
        pObjs.push(pObj);
        var cArr=parentLayerName.split("=");
        var cArr = cArr[1].split("_");
        var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
		SYSTEMPARAMS.project = cArr[0];//对应的管线图层，赋值给系统参数SYSTEMPARAMS
        SystemSetting.getProjectConfig();//初始化系统配置文件配置

        var url = loaclUrl+ "/html/query/propertyQuery.html?guid=" + pObjGUID + "&parentLayerName=" + parentLayerName + "&key=" + key + "&objs=" + pObjs;
        showLargeDialog(url, "管线属性");
        pObj.Underground = true;
        pObj.ShowHighLight();
        //earth.Paint.ClearHighlightObject();
        //earth.Paint.HighlightObject(pObj, 5, 1.0, parseInt('0x77FF0000'));
        earth.Event.OnPickObjectEx = function (){};
        earth.Query.FinishPick();
        earth.Environment.SetCursorStyle(209);
    };
    var onPickObject =function(pObj){
        var llr=pObj.GetLonLatRect();
        var showObj = {
            'displayFields':['East','MaxHeight', 'MinHeight', 'North',"South","West"],
            'East':llr.East,
            'MaxHeight': llr.MaxHeight,
            'MinHeight': llr.MinHeight,
            'North': llr.North,
            'South':llr.South,
            'West':llr.West
        };
        pObj.Underground = true;
        pObj.ShowHighLight();
        earth.Event.OnPickObject = function () {};
        earth.Event.OnLBDown = function () {};
        earth.Event.OnLBUp = function () {};
        earth.Environment.SetCursorStyle(209);
        initObjNormal(pObj.GetLonLatRect(),showObj);
    }
    /**
     * 属性查询
     */
    var propertyQuery = function (){
        earth.Event.OnPickObjectEx = onPickObjectEx;
        earth.Event.OnPickObject = onPickObject;//用户数据（element）返回
        //将鼠标设置为箭头状

        earth.Event.OnLBDown = function(p2) {
            function _onlbd(p2) {
                earth.Event.OnLBUp = function(p2) {
                    earth.Event.OnLBDown = function(p2) {
                        _onlbd(p2);
                    };
                };
                //var p3 = earth.GlobeObserver.Pick(p2.X, p2.Y);
                earth.Query.PickObject(511, p2.x, p2.y);
                //earth.Environment.SetCursorStyle(209);

            }
            _onlbd(p2);
        };
        earth.Event.OnRBDown = function(p2) {
            earth.Event.OnLBDown = function(){};
            earth.Event.OnRBDown = function(){};
            earth.Environment.SetCursorStyle(209);
        };
        earth.Environment.SetCursorStyle(32512);

        //earth.Query.PickObjectEx(127);  // SEPickObjectType.PickAllObject
    };
    GeneralQuery.propertyQuery = propertyQuery;
})();

var queryHtmlBalloonHidden = false;
var queryHtmlBalloon =null;
//显示一般的数据气泡
function initObjNormal(rect,showObj,type){
    if (queryHtmlBalloonHidden == false && queryHtmlBalloon) {
        queryHtmlBalloon.DestroyObject();
        queryHtmlBalloon = null;
    }
    var displayFields = showObj.displayFields;
    //var rect = pObj.GetLonLatRect();
    if(type == 'point'){
        var centerX = rect.Longitude;
        var centerY = rect.Latitude;
        var centerZ = rect.Altitude;
    }else{
        var north = rect.North;
        var south = rect.South;
        var east = rect.East;
        var west = rect.West;
        var top = rect.MaxHeight;
        var bottom = rect.MinHeight;
        var centerX = (east + west) / 2;
        var centerY = (north + south) / 2;
        var centerZ = (top + bottom) / 2;
    }

    var showLineHtml = '<div style="word-break:keep-all;white-space:nowrap;overflow:auto;width:300px;height:300px;margin-top:25px;margin-bottom:25px;overflow:auto;">' + '<table style="font-size:16px;background-color: #ffffff; color: #fffffe">';
    for(var i=0; i<displayFields.length; i++){
        showLineHtml = showLineHtml + '<tr>';
        showLineHtml = showLineHtml + '<td class="font" >'+ displayFields[i] +':</td>';
        showLineHtml = showLineHtml + '<td class="font" >' + showObj[displayFields[i]] + '</td>';
        showLineHtml = showLineHtml + '</tr>';
    }
    if(type == 'point' && PS2_config.poiConfig && PS2_config.poiConfig.hasImg){
        var url = location.href;
        url = url.substring(0,url.lastIndexOf('/')) + '/' +
            PS2_config.poiConfig.imgPath + showObj[PS2_config.poiConfig.imgNameField] + '.jpg';
        showLineHtml += '<tr><td colSpan="2"><img src="' + url +'" width="270" height="270" alt="无图片" /></td></tr>';
    }
    showLineHtml = showLineHtml + '</table></div>';
    var guid = earth.Factory.CreateGuid();
    queryHtmlBalloon = earth.Factory.CreateHtmlBalloon(guid, "balloon");
    queryHtmlBalloon.SetSphericalLocation(centerX, centerY, centerZ);
    queryHtmlBalloon.SetRectSize(330, 340);
    var color = parseInt("0xffffff00"); //0xccc0c0c0
    queryHtmlBalloon.SetTailColor(color);
    queryHtmlBalloon.SetIsAddCloseButton(true);
    queryHtmlBalloon.SetIsAddMargin(true);
    queryHtmlBalloon.SetIsAddBackgroundImage(true);
    queryHtmlBalloon.SetIsTransparence(true);
    queryHtmlBalloon.SetBackgroundAlpha(0xcc);
    queryHtmlBalloon.ShowHtml(showLineHtml);

    //deleted by zhangd-2015-03-12-13:53--所有气泡关闭事件均修改为下面的回调方式
    // earth.Event.OnHtmlBalloonFinished = function() {
    //     if (queryHtmlBalloonHidden == false && queryHtmlBalloon != null) {
    //         queryHtmlBalloon.DestroyObject();
    //         queryHtmlBalloon = null;
    //         earth.Event.OnHtmlBalloonFinished = function() {};
    //     }
    // }
    OnHtmlBalloonFinishedFunc(guid,function(closeBid){
        if (queryHtmlBalloonHidden == false && queryHtmlBalloon != null) {
            queryHtmlBalloon.DestroyObject();
            queryHtmlBalloon = null;
            // earth.Event.OnHtmlBalloonFinished = function() {};
        }
    });
}

/**
 * 功能：“属性查询”菜单点击事件
 * 参数：无
 * 返回：无
 */
function QueryPropertyClick(){
	GeneralQuery.propertyQuery();
}
//-----------------------------------------------------------------------------
//属性查询功能 - 结束
//-----------------------------------------------------------------------------

/**
 * 功能：“数据隐藏”菜单点击事件
 * 参数：无
 * 返回：无
 */

function hiddenLayer(){
	var loadPath = earth.Environment.RootPath + "temp\\PipeData.xml";
	var PipeDataXml = earth.UserDocument.LoadXmlFile(loadPath);
	var PipeLineDataDoc =loadXMLStr(PipeDataXml);
	var pipeLIneNodes=PipeLineDataDoc.getElementsByTagName("PipeLineId");
	
	if(pipeLIneNodes==null||pipeLIneNodes.length==0){
		alert("请先导入数据");
		return;
	}else{
	var pipeLineGuid=pipeLIneNodes[0].text;
	var pipeId=pipeLineGuid;
	var layer=earth.LayerManager.LayerList;
	layer.Visibility=false;
	var layerObj = earth.LayerManager.GetLayerByGUID(pipeId);
	layerObj.Visibility=true;
	}
}
function showLayer(){
	var loadPath = earth.Environment.RootPath + "temp\\PipeData.xml";
	var PipeDataXml = earth.UserDocument.LoadXmlFile(loadPath);
	var PipeLineDataDoc =loadXMLStr(PipeDataXml);
	var ProjectNodes = PipeLineDataDoc.getElementsByTagName("ProjectId");
	var projectId=ProjectNodes[0].text;
	var layerId=projectId;
    var layer=earth.LayerManager.LayerList;
    layer.Visibility=true;
	var layerObj=earth.LayerManager.GetLayerByGUID(layerId);
    layerObj.Visibility=true;
}
function dataHiddenClick(){
	var eventObj = $("div[tag='dataHidden']");
	if(eventObj.hasClass("selected") === false){
		eventObj.addClass("selected");
		hiddenLayer();
	}else{
		eventObj.removeClass("selected");
		showLayer();
	}	
}	
//-----------------------------------------------------------------------------
//数据隐藏 功能- 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//道路查询功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“道路查询”菜单点击事件
 * 参数：无
 * 返回：无
 */
function QueryRoadClick(){
	showLargeDialog("html/query/roadQuery.html", "道路查询");
}
//-----------------------------------------------------------------------------
//道路查询功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//附属物查询功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“附属物查询”菜单点击事件
 * 参数：无
 * 返回：无
 */
function QueryAttachmentClick(){
	showLargeDialog("html/query/attachmentQuery.html", "附属物查询");
}
//-----------------------------------------------------------------------------
//附属物查询功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//管径统计功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“管径统计”菜单点击事件
 * 参数：无
 * 返回：无
 */
function StatisticsDiameterClassClick(){
	showLargeDialog("html/statistics/diameterClassification.html", "管径分类");
}
//-----------------------------------------------------------------------------
//管径统计功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//长度统计功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“长度统计”菜单点击事件
 * 参数：无
 * 返回：无
 */
function StatisticsLengthClick(){
	showLargeDialog("html/statistics/lengthClassification.html", "长度统计");
}
//-----------------------------------------------------------------------------
//长度统计功能 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//埋深统计功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“埋深统计”菜单点击事件
 * 参数：无
 * 返回：无
 */
function StatisticsCoveringDepthClick(){
	showLargeDialog("html/statistics/coveringDepthStatistics.html", "埋深分段");
}
//-----------------------------------------------------------------------------
//埋深统计 - 结束
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//材质统计功能 - 开始
//-----------------------------------------------------------------------------
/**
 * 功能：“材质统计”菜单点击事件
 * 参数：无
 * 返回：无
 */
function StatisticsMaterialClassClick(){

	showLargeDialog("html/statistics/materialClassification.html", "材质分类");
}
//-----------------------------------------------------------------------------
//材质统计功能 - 结束
//-----------------------------------------------------------------------------

/**
 * 功能：“导入XML”(审批)菜单点击事件
 * 参数：无
 * 返回：无
 */
function ApprovalImportXmlClick(){
	showLargeDialog("html/approval/approvalImportXml.html", "审批数据导入");	
}

/**
 * 功能：“平面位置对比”菜单点击事件
 * 参数：无
 * 返回：无
 */
function Approval2DCompareClick(){
	showLargeDialog("html/approval/approval2DCompare.html", "平面位置对比");
}

/**
 * 功能：“撞管分析”菜单点击事件
 * 参数：无
 * 返回：无
 */
function ApprovalCollisionAnalysisClick(){
	showLargeDialog("html/approval/collisionAnalysis.html", "撞管分析");	
}

/**
 * 功能：“净距分析”菜单点击事件
 * 参数：无
 * 返回：无
 */
function ApprovalDistanceAnalysisClick(){
	showLargeDialog("html/approval/distianceAnalysis.html", "净距分析");	
}

/**
 * 功能：“导入XML”(竣工验收)菜单点击事件
 * 参数：无
 * 返回：无
 */
function AcceptImportXmlClick(){
	showLargeDialog("html/approval/approvalImportXml.html", "数据导入");	
}

/**
 * 功能：“三维位置对比”菜单点击事件
 * 参数：无
 * 返回：无
 */
function Accept3DCompareClick(){
	showLargeDialog("html/accept/Accept3DCompare.html", "三维位置比对");
}

/**
 * 功能：“井室位置对比”菜单点击事件
 * 参数：无
 * 返回：无
 */
function AcceptWellPosCompareClick(){ 
	showLargeDialog("html/accept/AcceptWellPosCompare.html", "井室位置对比");
}

/**
 * 功能：“系统设置”菜单点击事件
 * 参数：无
 * 返回：无
 */
function ViewSystemSettingClick(){
    //var tree = parent.$.fn.zTree.getZTreeObj("pipelineLayerTree") ;
    systemSettingClick();
}

//-----------------------------------------------------------------
//--图层控制功能 - 开始
//-----------------------------------------------------------------
var LayerManagement = {
// JIA Rong start=========================================	
	/**
	 * 功能：初始化所有图层-图表
	 * 参数：无
	 * 返回值：无
	 */
	initLayerDataChart : function(EarthObj){
		var rootLayer = this.getRootLayer(EarthObj);
		this.initLayerData(rootLayer);
		var zNodes = this.getLayerData(rootLayer);

	},
	/**
	 * 功能：初始化管线图层-图表
	 * 参数：无
	 * 返回值：无
	 */
	initPipelineChart : function(EarthObj, container1,container2,container3){
		var allPipelineList =[];
		allPipelineList = StatisticsMgr.getProjectList();
		this.layoutChartList(allPipelineList,container1,container2,container3);
		this.visiLayer(allPipelineList);
	},

	layoutChartList : function(pipelinelist,container1,container2,container3){
		var prostr = container1.attr('id');
		var zonestr = container2.attr('id');
		var pipestr = container3.attr('id');

		var projectCount = pipelinelist.length;
		for (var i=0; i < projectCount;i++){
   			var projectName = pipelinelist[i].projectName;
     		var idCounti = i+1;
     		//工程列表
			container1.append('<button class="' +prostr + '1" id="' +prostr + idCounti + '" > ' + projectName + '</button>');
			var pipelist = pipelinelist[i].pipeList;
			var zonelist = null;
			zonelist = this.getZoneList(pipelist);
			var cls2 = zonestr + "1";
			var id2 = zonestr +idCounti;
			var cls3 = pipestr + "1";
			var id3 = pipestr +idCounti;
			//container2、container3中每个工程一个div
			if (zonelist.length > 0){
				container2.append('<div class="' +cls2 + '" id="' +id2 +'" > </div>');
				container3.append('<div class="' +cls3+ '" id="' +id3 +'" > </div>');
			}
		    var con2 = document.getElementById(id2);
		    var con3 = document.getElementById(id3);
			var zoneCount = zonelist.length;
			for (var j=0; j < zoneCount; j++ ){
				//区域列表
				if (zonelist[j].list.length > 0){
		   			var zoneName = zonelist[j].name;
		     		var idCountj = j+1;
				    $('<button class="'+zonestr + '11" id="' +zonestr +idCounti+ idCountj + '" > ' + zoneName + '</button>').appendTo(con2); 
				    // container3中每个工程下每个区域一个div
				    $('<div class="'+pipestr + '11" id="' +pipestr +idCounti+ idCountj + '" ></div>').appendTo(con3); 
				}
				var plist = zonelist[j].list;
				var pipeCount = plist.length;
				for (var k=0; k < pipeCount; k++ ){
		   			var pipeName = plist[k].name;
		   			var pipeId = plist[k].id;
		   			var pipeVisi = plist[k].visibility;
 		     		var idCountk = k+1;
					var cls = pipestr + "1";
					var id = pipestr +idCounti+idCountj;
				    var con = document.getElementById(id);
					$('<button class="'+pipestr + '111" id="' +pipeId+'" > ' + pipeName + '</button>').appendTo(con); 
				}
			}
		}
	},
	
	getZoneList: function(list){
		var zonelist =[];
		var innerPipelineList =[];
		var outerPipelineList =[];
		var THLPipelineList =[];
		innerPipelineList.name ="主题乐园";
		innerPipelineList.list =[];
		outerPipelineList.name ="核心区";
		outerPipelineList.list =[];
		THLPipelineList.name ="发展功能区";
		THLPipelineList.list =[];

		
		if(list == null){
			return;
		}
		for(var i = 0; i < list.length; i++){
			if (list[i].name.substring(0,4) == "主题乐园"){
				innerPipelineList.list.push(list[i]);
			}
			else if (list[i].name.substring(0,3) == "核心区"){
				outerPipelineList.list.push(list[i]);
			}
			else if (list[i].name.substring(0,5) == "发展功能区"){
				THLPipelineList.list.push(list[i]);
			}
		}
		if (innerPipelineList != null){
			zonelist.push(innerPipelineList);
		}
		if (outerPipelineList != null){
			zonelist.push(outerPipelineList);
		}
		if (THLPipelineList != null){
			zonelist.push(THLPipelineList);
		}
		return zonelist;
	},
	/**
	 * 功能：根据图层类型，获取图标样式
	 * 参数：layerType-图层类型
	 * 返回值：图标样式
	 */
	getLayerColor : function(layerName){
		var color = "";
		
		if(layerName.indexOf("电力") >= 0){
			color = "red";
		}else if(layerName.indexOf("电信") >= 0){
			color = "forestgreen";
		}else if(layerName.indexOf("燃气") >= 0 || layerName.indexOf("天然气") >= 0){
			color = "fuchsia";
		}else if(layerName.indexOf("给水") >= 0){
			color = "skyblue";
		}else if(layerName.indexOf("雨水") >= 0){
			color = "peru";
		}else if(layerName.indexOf("污水") >= 0){
			color = "maroon";
		}else if(layerName.indexOf("灌溉") >= 0){
			color = "cornflowerblue";
		}else if(layerName.indexOf("热力") >= 0 || layerName.indexOf("热水") >= 0 || layerName.indexOf("特种") >= 0 || layerName.indexOf("冷水") >= 0 || layerName.indexOf("压缩空气") >= 0){
			color = "darkorange";
		}else if(layerName.indexOf("室内消防") >= 0){
			color = "mediumblue";
		}else if(layerName.indexOf("室外消防") >= 0){
			color = "dodgerblue";
		}else if(layerName.indexOf("净化水") >= 0){
			color = "lightskyblue";
		}else if(layerName.indexOf("航道排水") >= 0){
			color = "navy";
		}else if(layerName.indexOf("紧急供电") >= 0){
			color = "crimson";
		}else if(layerName.indexOf("正常供电") >= 0){
			color = "crimson";
		}
		return color;
	},	

	visiLayer: function(list){
		var projectCount = list.length;
		for (var i=0; i < projectCount;i++){
			var plist = list[i].pipeList;
			for (var j=0; j < plist.length;j++){
				var id = plist[j].id;
				var visi = plist[j].visibility;
				var name = plist[j].name;
				var layerObj = earth.LayerManager.GetLayerByGUID(id);
				layerObj.Visibility = visi;
				var con = document.getElementById(id);
				if (con != null){
					if ( visi == true ){
						var color = this.getLayerColor(name);
						con.style.background=color;
					}else{
						var color ="black";
						con.style.color = color;
					}
				}
			}
		}
	},


// JIA Rong end=========================================	

	/**
	 * 功能：获取图层根节点
	 * 参数：无
	 * 返回值：图层根节点
	 */
	getRootLayer : function(earth){
		var rootLayer = earth.LayerManager.LayerList;
		return rootLayer;
	},

    initLayerDataType: function(earth, layer){
        if(layer == null){
            layer = this.getRootLayer(earth);
        }

        var childCount = layer.GetChildCount();
        for (var i = 0; i < childCount; i++){
            var childLayer = layer.GetChildAt(i);
            if(childLayer.LocalSearchParameter != null){
                if(childLayer.LayerType == 'POI'){
                    childLayer.LocalSearchParameter.ReturnDataType = 1;
                }else{
                    childLayer.LocalSearchParameter.ReturnDataType = 4;
                }
            }
            if (childLayer.GetChildCount() > 0) {
                this.initLayerDataType(earth, childLayer);
            }
        }
    },
	/**
	 * 功能：根据图层类型，获取图标样式
	 * 参数：layerType-图层类型
	 * 返回值：图标样式
	 */
	getLayerIcon : function(layerType){
		var icon = "";
		if(layerType === "POI"){
			icon = 'images/layer/layer_poi.gif';
		}else if(layerType === "Vector"){
			icon = 'images/layer/layer_vector.gif';
		}else if(layerType === "Model"){
			icon = 'images/layer/layer_model.gif';
		}else if(layerType === "Block"){
			icon = 'images/layer/layer_block.gif';
		}else if(layerType === "MatchModel"){
			icon = 'images/layer/layer_matchmodel.gif';
		}else if(layerType === "Billboard"){
			icon = 'images/layer/layer_billboard.gif';
		}else if(layerType === "Annotation"){
			icon = 'images/layer/layer_annotation.gif';
		}else if(layerType === "Equipment"){
			icon = 'images/layer/layer_equipment.gif';
		}else if(layerType === "Container"){
			icon = 'images/layer/layer_container.gif';
		}else if(layerType === "Well"){
			icon = 'images/layer/layer_well.gif';
		}else if(layerType === "Joint"){
			icon = 'images/layer/layer_joint.gif';
		}else if(layerType === "Plate"){
			icon = 'images/layer/layer_plate.gif';
		}else if(layerType === "Pipeline"){
			icon = 'images/layer/layer_pipeline.gif';
		}else if(layerType === "Project"){
			icon = 'images/layer/projectIcon.gif';
		}else if(layerType === "Powerline"){
	        icon = 'images/layer/layer_powerline.gif';
	    }else if(layerType === "Line"){
	        icon = 'images/layer/layer_line.gif';
	    }else if(layerType === "Tower"){
	        icon = 'images/layer/layer_tower.gif';
	    }
		return icon;
	},	

	
	/**
	 * 功能：初始化PIPELINELAYERS 和 POILAYERS ，为分析功能做基础
	 * 参数：layer-图层根节点
	 * 返回值：图层数据数组
	 */
	initLayerData : function (layer){
		var childCount = layer.GetChildCount();
		for(var i=0; i<childCount; i++){
			var childLayer = layer.GetChildAt(i);
			var id = childLayer.Guid;
			var name = childLayer.Name;
			var visibility = childLayer.Visibility; 
			var layerType = childLayer.LayerType;
			if(layerType === "Pipeline"){
				//初始化PIPELINELAYERS， Earth.html调用此函数初始化PIPELINELAYERS后，关闭页面会将PIPELINELAYERS清空。
				//故应初始化为main.html的PIPELINELAYERS对象，以作为全局变量。
				parent.PIPELINELAYERS.push({'id':id, 'name':name, 'server':childLayer.GISServer, 'pltype':childLayer.PipeLineType});
			}else if(layerType === "POI"){
				parent.POILAYERS.push({'id':id, 'name':name, 'server':childLayer.GISServer, 'pltype':childLayer.PipeLineType});
			}
		}
	},
	/**
	 * 功能：获取图层数据
	 * 参数：layer-图层根节点
	 * 返回值：图层数据数组
	 */
	getLayerData : function (layer){
		var layerData = [];
		var childCount = layer.GetChildCount();
        //alert(childCount);
		for(var i=0; i<childCount; i++){
			var childLayer = layer.GetChildAt(i);
			var id = childLayer.Guid;
			var name = childLayer.Name;
			var visibility = childLayer.Visibility;
			var layerType = childLayer.LayerType;
    		var dataType = childLayer.DataType;
			if(layerType === "Pipeline"){
				PIPELINELAYERS.push({'id':id, 'name':name, 'server':childLayer.GISServer, 'pltype':childLayer.PipeLineType});
			}else if(layerType === "Vector" && dataType === "Road"){
				ROADLAYERS.push({'id':id, 'name':name, 'server':childLayer.GISServer});
			}else if(layerType === "Vector" && dataType === "District"){
				DISTRICTLAYERS.push({'id':id, 'name':name, 'server':childLayer.GISServer});
			}
			if(name=="equipment"){
				name="附属";
			}else if(name=="container"){
				name="管线";
			}else if(name=="well"){
				name="井";
			}else if(name=="joint"){
				name="附属点";
			}else if(name=="plate"){
				name="井盖";
			}
			var data = {};
			data.id = id;
			data.name = name;
			data.checked = visibility;
			data.icon = this.getLayerIcon(layerType);
			var count = childLayer.GetChildCount();
			if(count > 0 ){
				data.children = this.getLayerData(childLayer);
			}
			layerData.push(data);
		}
		return layerData;    
	},
	
	/**
	 * 功能：获取管线图层数据
	 * 参数：layer-图层根节点
	 * 返回值：图层管线数据数组
	 */
	getPipelineLayerData : function (layer){
		var layerData = [];
		var childCount = layer.GetChildCount();
        //alert(childCount);
		for(var i=0; i<childCount; i++){
			var childLayer = layer.GetChildAt(i);
            var id = childLayer.Guid;
            var name = childLayer.Name;
            var visibility = childLayer.Visibility;
            var layerType = childLayer.LayerType;
            var count = childLayer.GetChildCount();
            if(count > 0 ){
                if(layerType === "Project"||layerType === "Folder"||layerType === "Pipeline"){
                    var children = this.getPipelineLayerData(childLayer);
                    if(children.length > 0){
                        var data = {};
                        data.id = id;
                        data.name = name;
                        data.checked = visibility;
                        data.icon = this.getLayerIcon(layerType);
                        data.children = children;
                        layerData.push(data);
                    }
                }
            }else{
                if((layerType === "Container")||(layerType === "Equipment")||(layerType === "Joint")||(layerType === "Well")||(layerType === "Plate") || layerType === "Block"){
                    if(layerType === "Equipment"){
                        name="附属设施";
                    }else if(layerType === "Container"){
                        name="管线";
                    }else if(layerType === "Well"){
                        name="井";
                    }else if(layerType === "Joint"){
                        name="附属点";
                    }else if(layerType === "Plate"){
                        name="井盖";
                    }
                    var data = {};
                    data.id = id;
                    data.name = name;
                    data.checked = visibility;
                    data.icon = this.getLayerIcon(layerType);
                    layerData.push(data);
                }
            }
	}
		return layerData;    
	},
	/**
	 * 功能：定位到选定的图层
	 * 参数：lonLatRect-图层范围对象
	 * 返回值：无
	 */
	flyToLayer : function(earth,lonLatRect){
		var rectNorth = lonLatRect.North;
		var rectSouth = lonLatRect.South;
		var rectEast = lonLatRect.East;
		var rectWest = lonLatRect.West;

		var centerX = (rectEast + rectWest) / 2;
		var centerY = (rectNorth + rectSouth) / 2;
		var width = (parseFloat(rectNorth) - parseFloat(rectSouth)) / 2;
		var range = width / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);
		earth.GlobeObserver.FlytoLookat(centerX, centerY, 0, 0, 90, 0, range,    5);
	},
	

	/**
	 * 功能: 图层树节点单击事件
	 * 参数: event-标准的 js event 对象；
	 *       treeId-对应图层树的Id；
	 *       node-被单击的节点
	 * 返回值: 无
	 */
	layerTreeClick : function(earth,node){
		if(node == null){
			return;
		}
		CURRLAYERID = node.id;
		//alert(treeId + "," + node.id+","+node.name);
	},

	/**
	 * 功能：图层树节点双击击事件
	 * 参数：event-标准的 js event 对象；
	 *       treeId-对应图层树的Id；
	 *       node-被双击击的节点
	 * 返回值：无
	 */
	layerTreeDbClick : function(earth,node){
		if(node == null){
			return;
		}
		var id = node.id;
		var layerObj = earth.LayerManager.GetLayerByGUID(id);
		if(layerObj.LayerType === ""){
			return;
		}
		var rect = layerObj.LonLatRect;
		this.flyToLayer(earth, rect); //定位图层
	},

	/**
	 * 功能：图层树节点 checkbox / radio 被勾选或取消勾选的事件
	 * 参数：event-标准的 js event 对象；
	 *       treeId-对应图层树的Id；
	 *       node-被勾选或取消的节点
	 * 返回值：无
	 */
	layerTreeCheck : function(earth,node){
		if(node == null){
			return;
		}
		var id = node.id;
		var layerObj = earth.LayerManager.GetLayerByGUID(id);
		layerObj.Visibility = node.checked;
	},

	/**
	 * 功能：图层控制
	 * 参数：无
	 * 返回值：无
	 */
	initLayerTree : function(earthObj,treeContainer){
		var setting = {
			check: {
				enable: true, //是否显示checkbox或radio
				chkStyle: "checkbox" //显示类型,可设置(checbox,radio)
			},
			view: {
				dblClickExpand: false, //双击节点时，是否自动展开父节点的标识
				expandSpeed: "", //节点展开、折叠时的动画速度, 可设置("","slow", "normal", or "fast")
				selectedMulti: false //设置是否允许同时选中多个节点
			},
			callback: {
				onClick: function(event,treeId,node){
					LayerManagement.layerTreeClick(earthObj,node);
				},
				onDblClick: function(event,treeId,node){
					LayerManagement.layerTreeDbClick(earthObj,node);
				},
				onCheck: function(event,treeId,node){
					LayerManagement.layerTreeCheck(earthObj,node);
				}
			}
		};
		var rootLayer = this.getRootLayer(earthObj);
		var zNodes = this.getLayerData(rootLayer);
		var tree = $.fn.zTree.init(treeContainer, setting, zNodes);
		return tree;
	},
	
	/**
	 * 功能：图层控制
	 * 参数：无
	 * 返回值：无
	*/
    initPipelineTree: function(earthObj, treeContainer) {
        var setting = {
            check: {
                enable: true, //是否显示checkbox或radio
                chkStyle: "checkbox" //显示类型,可设置(checbox,radio)
            },
            view: {
                dblClickExpand: false, //双击节点时，是否自动展开父节点的标识
                expandSpeed: "", //节点展开、折叠时的动画速度, 可设置("","slow", "normal", or "fast")
                selectedMulti: false //设置是否允许同时选中多个节点
            },
            callback: {
                onClick: function(event, treeId, node) {
                    LayerManagement.layerTreeClick(earthObj, node);
                },
                onDblClick: function(event, treeId, node) { //当双击定位的时候 针对重点管线进行特殊处理
                    var isNode = false;
                    //双击定位修改为判断图层的pipelineType
                    if (node && node.isParent) {
                        var layerID = node.id;
                        var dblLayer = earth.LayerManager.GetLayerByGUID(layerID);
                        if (dblLayer && dblLayer.pipelineType) {
                            var ppType = dblLayer.pipelineType;
                            if (Number(ppType) > 0) {
                                isNode = true;
                            }
                        } else {
                            return;
                        }
                    };
                    if (isNode) { //双击定位
                        LayerManagement.layerTreeDbClick(earthObj, node);
                    }
                },
                onCheck: function(event, treeId, node) {
                    LayerManagement.layerTreeCheck(earthObj, node);
                },
                onRightClick: function(event, treeId, node) {
                    //LayerManagement.rightClickuserdataTreeNode(event, treeId, node);
                }
            }
        };
        var rootLayer = this.getRootLayer(earthObj);
        var zNodes = this.getPipelineLayerData(rootLayer);

        var tree = $.fn.zTree.init(treeContainer, setting, zNodes);
        //默认展开level为1的节点 2013-12-18
        var nodes = tree.getNodes();
        if (nodes[0] && nodes[0].children) {
            var child = nodes[0].children;
            for (var i = 0; i < child.length; i++) {
                var nChild = child[i];
                tree.expandNode(nChild, true);
            }
        }
        return tree;
    }
};

/**控制图层 2014 JIA Rong Start*/

//关闭所有模型和管线图层
function hideAllLayers(){
	var EarthObj = top.earth;
	clearLayer(EarthObj,"上海基础");
	clearLayer(EarthObj,"规划管线");
	clearLayer(EarthObj,"设计管线");
	clearLayer(EarthObj,"跟测管线");
}

function hideBlockRoadLayersClick(){
	var EarthObj = top.earth;
	clearLayer(EarthObj,"道路")
}

//关闭所有规划白膜和道路
function clearBlocksClick(EarthObj){
	clearLayer(EarthObj,"地块规划白模");
	clearLayer(EarthObj,"道路");
	clearLayer(EarthObj,"地面");
	clearLayer(EarthObj,"树");
}


//关闭任意模型图层
function clearLayer(EarthObj,clrLayerName){
	var layer = EarthObj.LayerManager.LayerList;
	var iCount = layer.GetChildCount();
	for(var i=0; i<iCount; i++){
		var iLayer = layer.GetChildAt(i);
		var iname = iLayer.Name;
		if(iname === clrLayerName){
			iLayer.Visibility = false;
			break;
		}else{
			var jCount = iLayer.GetChildCount();
			for (var j=0; j<jCount; j++){
				var jLayer = iLayer.GetChildAt(j);
				var jname = jLayer.Name;
				if(jname === clrLayerName){
					jLayer.Visibility = false;
					break;
				}else{
					var kCount = jLayer.GetChildCount();
					for (var k=0; k<kCount; k++){
						var kLayer = jLayer.GetChildAt(k);
						var kname = kLayer.Name;
						if(kname === clrLayerName){
							kLayer.Visibility = false;
							break;
						}
					}
				}
			}
		}
	}
}

//打开任意模型图层
function addLayer(EarthObj,clrLayerName){
	var layer = EarthObj.LayerManager.LayerList;
	var iCount = layer.GetChildCount();
	for(var i=0; i<iCount; i++){
		var iLayer = layer.GetChildAt(i);
		var iname = iLayer.Name;
		if(iname === clrLayerName){
			iLayer.Visibility = true;
			break;
		}else{
			var jCount = iLayer.GetChildCount();
			for (var j=0; j<jCount; j++){
				var jLayer = iLayer.GetChildAt(j);
				var jname = jLayer.Name;
				if(jname === clrLayerName){
					jLayer.Visibility = true;
					break;
				}else{
					var kCount = jLayer.GetChildCount();
					for (var k=0; k<kCount; k++){
						var kLayer = jLayer.GetChildAt(k);
						var kname = kLayer.Name;
						if(kname === clrLayerName){
							kLayer.Visibility = true;
							break;
						}
					}
				}
			}
		}
	}
}

//打开所有模型图层
function addAllModelsClick(EarthObj){
	var EarthObj = top.earth;
	var layer = EarthObj.LayerManager.LayerList;
	var iCount = layer.GetChildCount();
	for(var i=0; i<iCount; i++){
		var iLayer = layer.GetChildAt(i);
		var iname = iLayer.Name;
		if(iname === "上海基础"){
			var jCount = iLayer.GetChildCount();
			for (var j=0; j<jCount; j++){
				var jLayer = iLayer.GetChildAt(j);
				var jname = jLayer.Name;
				if(jname === "地块规划" || jname === "PAB" || jname === "迪士尼地铁"){
					jLayer.Visibility = true;
				}
			}
		}
	}
}
//打开核心区跟测管线
function LoadAllGCpipesClick(){
	var layer = top.earth.LayerManager.LayerList;
	var iCount = layer.GetChildCount();
	for(var i=0; i<iCount; i++){
		var iLayer = layer.GetChildAt(i);
		var iname = iLayer.Name;
		if(iname === "跟测管线"){
			var jCount = iLayer.GetChildCount();
			for (var j=0; j<jCount; j++){
				var jLayer = iLayer.GetChildAt(j);
				var jname = jLayer.Name;
				if(jname.indexOf("核心区") >=0){
					jLayer.Visibility = true;
				}
			}
		}
	}
}

//JIA Rong End





//-----------------------------------------------------------------
//--图层控制功能 - 结束
//-----------------------------------------------------------------

//判断文件是否存在
var chkFile = function(fileURL) {

    return true;
}
/**
 * 功能：申请运动物体列表
 * 参数：无
 * 返回值：初始化的系统配置文件内容
 */
var applyDynamicList = function(){
	earth.Event.OnDynamicListLoaded = function(dynamicList){
		DYNAMICLIST = dynamicList;
	};
	earth.DynamicSystem.ApplyDynamicList();
};
var SystemSetting = {
    /**
     * 功能：初始化系统参数对象
     * 参数：无
     * 返回值：无
     */
    initSystemParam: function() {
        if (SYSTEMPARAMS) {
            SYSTEMPARAMS = this.getSystemConfig();
        }
		
        if (SYSTEMPARAMS.project) {
            if (SYSTEMPARAMS.Position != "" && SYSTEMPARAMS.Position) {
                var longitude = SYSTEMPARAMS.Position.split(",")[0];
                var latitude = SYSTEMPARAMS.Position.split(",")[1];
                var altitude = SYSTEMPARAMS.Position.split(",")[2];
                var tilt = SYSTEMPARAMS.Position.split(",")[3];
                var heading = SYSTEMPARAMS.Position.split(",")[4];
                var roll = SYSTEMPARAMS.Position.split(",")[5];
                var range = SYSTEMPARAMS.Position.split(",")[6];
                earth.GlobeObserver.GotoLookat(longitude, latitude, altitude, heading, tilt, roll, range);
            }
            var layer = earth.LayerManager.GetLayerByGUID(SYSTEMPARAMS.project);
            var pipelineArr = [];
            var pipelineArr = StatisticsMgr.getPipeListByLayer(layer); //初始化管线图层列表;

            if (pipelineArr == undefined || pipelineArr.length < 1 || pipelineArr.length == undefined) {
                return;
            }
            for (var i = 0; i < pipelineArr.length; i++) {
                if (pipelineArr[i].PipeLineType < 4000 || pipelineArr[i].PipeLineType >= 5000) {
                    pipeFlowArr.push(pipelineArr[i]);
                    $("div[tag=ViewFlowShowing]").customAttr("disabled", true);
                }
            }
		
            //===服务端属性配置开始！===
			this.ReadfieldMap(layer);
			this.ReadspatialRef(layer);
            //===服务端配置属性处理完毕！===
			
            if (layer) {
                var alt = layer.ProjectSetting.UnderRefAlt;
            }
        } else {
			//获取第一个project
            SYSTEMPARAMS.pipeConfigDoc = "";
            SYSTEMPARAMS.pipeDatum = "";
            SYSTEMPARAMS.pipeFieldMap = "";
        }
    },
    /**
     * 功能：配置工程的配置文件
     * 参数：无
     * 返回值：无
     */
    getProjectConfig: function() {
		if (SYSTEMPARAMS) {
			if (SYSTEMPARAMS.project) {
				var layer = earth.LayerManager.GetLayerByGUID(SYSTEMPARAMS.project);
				if (layer) {
					//===服务端属性配置开始！===
					this.ReadfieldMap(layer);
					this.ReadspatialRef(layer);
					//===服务端配置属性处理完毕！===
				
				}
			} 
        }			
	},
	
	
	ReadfieldMap:function(layer){
            var projectSetting = layer.ProjectSetting;
            var layerLink = projectSetting.PipeConfigFile; //管线配置文件
            var fieldMap = projectSetting.FieldMapFile; //字段映射配置文件
            var valueMap = projectSetting.ValueMapFile; //值域映射文件
			//====================字段映射配置文件读入=======================
            if (fieldMap != "") {
                var filedPath = "";
                if (fieldMap.indexOf("http") >= 0) {
                    filedPath = fieldMap;
                } else {
                    filedPath = "http://" + fieldMap.substr(2).replace("/", "/sde?/") + "_sde";
                }
                SYSTEMPARAMS.pipeFieldMapUrl = filedPath;

                if (chkFile(filedPath)) {
                    //管线字段映射
                    earth.Event.OnEditDatabaseFinished = function(pRes, pFeature) {
                        if (pRes.ExcuteType == excuteType) {
                            SYSTEMPARAMS.pipeFieldMap = loadXMLStr(pRes.AttributeName); //初始化编码映射文件对象
                        }
                        if (layerLink != "") {
                            var configUrl = "";
                            if (layerLink.indexOf("http") >= 0) {
                                configUrl = layerLink;
                            } else {
                                configUrl = "http://" + layerLink.substr(2).replace("/", "/sde?/") + "_sde";
                            }
                            SYSTEMPARAMS.pipeConfigLink = layerLink;
                            if (chkFile(configUrl)) {
                                //管线配置
                                earth.Event.OnEditDatabaseFinished = function(pRes, pFeature) {
                                    if (pRes.ExcuteType == excuteType) {
                                        SYSTEMPARAMS.pipeConfigDoc = loadXMLStr(pRes.AttributeName); //初始化管线字段映射文件
                                    }
                                    if (valueMap != "") {
                                        var vPath = "";
                                        if (valueMap.indexOf("http") >= 0) {
                                            vPath = valueMap;
                                        } else {
                                            vPath = "http://" + valueMap.substr(2).replace("/", "/sde?/") + "_sde";
                                        }

                                        if (chkFile(vPath)) {
                                            //valueMap配置
                                            earth.Event.OnEditDatabaseFinished = function(pRes, pFeature) {
                                                if (pRes.ExcuteType == excuteType) {
                                                    SYSTEMPARAMS.valueMap = loadXMLStr(pRes.AttributeName); //初始化编码映射文件对象
                                                }
                                                //自定义字段 fieldMap.config
                                                var pipeConfigLink = SYSTEMPARAMS.pipeConfigLink;
                                                if (pipeConfigLink) {
                                                    var configUrl = "";
                                                    if (pipeConfigLink.indexOf("http") >= 0) {
                                                        configUrl = pipeConfigLink;
                                                    } else {
                                                        configUrl = "http://" + pipeConfigLink.substr(2).replace("/", "/sde?/").replace("PipeConfig.config", "FieldMap.config") + "_sde";
                                                    }

                                                    earth.Event.OnEditDatabaseFinished = function(pRes, pFeature) {
                                                        if (pRes.ExcuteType == excuteType) {
                                                            var xmlStr = pRes.AttributeName;
                                                            var systemDoc = loadXMLStr(xmlStr);
                                                            if (systemDoc === null) {
                                                                return;
                                                            }
                                                            var jsonData = $.xml2json(systemDoc);
                                                            if (jsonData.LineFieldMap && jsonData.LineFieldMap.UserDefine) {
                                                                var fieldItem = jsonData.LineFieldMap.UserDefine.FieldMapItem;
                                                                var captionAry = [];
                                                                var aliasNameAry = [];
                                                                for (var i = 0; i < fieldItem.length; i++) {
                                                                    // var fidldCaption = fieldItem[i].FieldCaption;
                                                                    var fieldMapitem = fieldItem[i].FieldName;
                                                                    var fieldAliasName = fieldItem[i].FieldAliasName;
                                                                    captionAry.push(fieldMapitem);
                                                                    aliasNameAry.push(fieldAliasName);
                                                                }
                                                                customLineFields.push(captionAry, aliasNameAry);
                                                            }
                                                            if (jsonData.PointFieldMap && jsonData.PointFieldMap.UserDefine) {
                                                                var fieldItem = jsonData.PointFieldMap.UserDefine.FieldMapItem;
                                                                var captionAry = [];
                                                                var aliasNameAry = [];
                                                                for (var i = 0; i < fieldItem.length; i++) {
                                                                    // var fidldCaption = fieldItem[i].FieldCaption;
                                                                    var fieldMapitem = fieldItem[i].FieldName;
                                                                    var fieldAliasName = fieldItem[i].FieldAliasName;
                                                                    captionAry.push(fieldMapitem);
                                                                    aliasNameAry.push(fieldAliasName);
                                                                }
                                                                customPointFields.push(captionAry, aliasNameAry);
                                                            }
                                                        }
                                                        //setAreaQueryBtn();
                                                    }
                                                    earth.DatabaseManager.GetXml(configUrl);
                                                }
                                            }
                                            earth.DatabaseManager.GetXml(vPath);
                                        }
                                    } else {
                                        SYSTEMPARAMS.valueMap = "";
                                    }
                                }
                                earth.DatabaseManager.GetXml(configUrl);
                            }
                        } else {
                            alert("缺少管线配置文件,系统无法正常运行.");
                            //return;
                            SYSTEMPARAMS.pipeConfigDoc = "";
                        }
                    }
                    earth.DatabaseManager.GetXml(filedPath);
                }
            } else {
//                $("#northDiv").customAttr("disabled", true);
                alert("缺少管线字段映射文件,系统无法正常运行.");
                return;
            }
					
		
		
	},
//==================空间参考文件读入====================
	ReadspatialRef:function(layer){
            var projectSetting = layer.ProjectSetting;
            var spatialRef = projectSetting.SpatialRefFile; //空间参考文件

            if (spatialRef != "") {
                /*  var spatialUrl = "http://" + spatialRef.substr(2).replace("/", "/sde?/") +
                 "_sde";*/
                var spatialUrl = spatialRef.replace("http:", "").replace("/sde?", "");
                spatialUrl = spatialUrl.substr(0, spatialUrl.length - 4);
                while (spatialUrl.indexOf("/") > -1) {
                    spatialUrl = spatialUrl.replace("/", "\\");
                }
                if (chkFile(spatialUrl)) {
                    SYSTEMPARAMS.pipeDatum = CoordinateTransform.createDatum(spatialUrl);
                    earth.Event.OnDocumentUpdate = function(res) {
                        //修改坐标显示单位 如果当前工程范围内 就转坐标 否则显示经纬度
                        var earthPose = earth.GlobeObserver.TargetPose;
                        var lon = earthPose.Longitude;
                        var lat = earthPose.Latitude;
                        var alt = earth.GlobeObserver.Pose.Altitude;
                        var pXY = SYSTEMPARAMS.pipeDatum.des_BLH_to_src_xy(lon, lat, alt);
                        var layerBounds = layer.ProjectSetting.LonLatRect;
                        var layerMaxHeight = layerBounds.MaxHeight; //图层的最大可见高度
                        if (alt <= (layerMaxHeight + 10000) && lon >= layerBounds.West && lon <= layerBounds.east && lat >= layerBounds.South && lat <= layerBounds.North) {
                            earth.Environment.UseLocalCoord = true;
                            earth.Environment.SetLocalCoord(pXY.x, pXY.y);
                        } else {
                            earth.Environment.UseLocalCoord = false;
                        }
                    }
                }
            } else {
                SYSTEMPARAMS.pipeDatum = "";
            }		
		
	},
	

    /**
     * 功能：初始化系统配置文件内容
     * 参数：无
     * 返回值：初始化的系统配置文件内容
     */
    initSystemConfig: function(id) {
        var configXml = '<xml>';
        if (id) {
            configXml = configXml + '<Project>' + id + '</Project>'; //project
        } else {
            configXml = configXml + '<Project></Project>'; //project
        }
        configXml = configXml + '<ProfileAlt></ProfileAlt>'; //project
        configXml = configXml + '<Position></Position></xml>';
        return configXml;
    },

    /**
     * 功能：获取系统配置参数
     * 参数：无
     * 返回值：系统配置参数
     */
    getSystemConfig: function() {
		//读入配置文件SystemConfigPipe。xml
        var rootPath = earth.Environment.RootPath + "temp\\SystemConfigPipe";
        var configPath = rootPath + ".xml";
        var configXml = earth.UserDocument.LoadXmlFile(configPath);
        if (configXml === "" || configXml.indexOf("Position") < 0) {
            configXml = this.initSystemConfig();
            earth.UserDocument.SaveXmlFile(rootPath, configXml);
        }
        var systemDoc = loadXMLStr(configXml);
        var systemJson = $.xml2json(systemDoc);
        if (systemJson == null) {
            return false;
        }
		var obj=null;
		//设置project工程参数，默认为跟测管线工程
        var pipeProjArr = StatisticsMgr.getPipelineProjectList();
        if (pipeProjArr.length > 0) {
			for(var i=0; i<pipeProjArr.length; i++){
				var name = pipeProjArr[i].name;
				if (name =="设计管线"){
					obj = {
						ip: top.params.ip,
						project: pipeProjArr[i].id
					};	
					break;
				}
			}
        }
//       }
        //return systemJson.Project;
        var systemData = {};
        systemData.project = obj.project;//systemJson.Project;
        systemData.Position = systemJson.Position;
        systemData.profileAlt = systemJson.ProfileAlt;
        return systemData;
    },

    /**
     * 功能：设置系统配置参数
     * 参数：systemData-系统配置参数
     * 返回值：无
     */
    setSystemConfig: function(systemData) {
        var rootPath = earth.Environment.RootPath + "temp\\SystemConfigPipe";
        var configPath = rootPath + ".xml";
        var configXml = earth.UserDocument.LoadXmlFile(configPath);
        configXml = this.initSystemConfig();
        var systemDoc = loadXMLStr(configXml);
        var root = systemDoc.documentElement;
        (root.getElementsByTagName("Project")[0]).text = systemData.project;
        //(root.getElementsByTagName("Ip")[0]).text = params.ip;
        (root.getElementsByTagName("Position")[0]).text = systemData.Position;
        (root.getElementsByTagName("ProfileAlt")[0]).text = systemData.profileAlt == "0" ? "0" : "1";

        earth.UserDocument.SaveXmlFile(rootPath, systemDoc.xml);
    }

};

//-----------------------------------------------------------------
//--坐标转换对象创建 - 开始
//-----------------------------------------------------------------
var CoordinateTransform = {
    sysDatum: null, //系统内部的坐标转换对象

    /**
     * 功能：获取系统内部的坐标转换对象
     */
    getSystemDatum: function() {
        if (this.sysDatum == null) {
            this.sysDatum = this.createDatum();
        }
        return this.sysDatum;
    },
    getRootPath: function() {
        var pathName = window.document.location.pathname;
        var localhost = window.location.host;
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return (localhost + projectName);
    },
    /**
     * 功能：创建空间坐标转换对象
     */
    createDatum: function(spatialUrl) {
        if (spatialUrl) {
            var projectId = SYSTEMPARAMS.project;
            var projLayer = earth.LayerManager.GetLayerByGUID(projectId);
            spatialUrl = projLayer.ProjectSetting.SpatialRefFile;
            spatialUrl = spatialUrl.replace("http:", "").replace("/sde?", "");
            spatialUrl = spatialUrl.substr(0, spatialUrl.length - 4);
            this.datumConfigLink = spatialUrl;
            while (spatialUrl.indexOf("/") > -1) {
                spatialUrl = spatialUrl.replace("/", "\\");
            }
        }

        var dataProcess = document.getElementById("dataProcess");
        dataProcess.Load();
        var spatial = dataProcess.CoordFactory.CreateSpatialRef();
        spatialUrl = spatialUrl.replace(/\//g, "\\");
        spatial.InitFromFile(spatialUrl);
        var datum = dataProcess.CoordFactory.CreateDatum(); //earth.Factory.CreateDatum();
        datum.init(spatial);
        //datum.source.init();//修改椭球体参数
        this.sysDatum = datum;
        return datum;
    }
};
/**
 * 根据标准名称返回显示字段名称
 * @param  {[type]} standardName     标准字段名称
 * @param  {[type]} pipeType         管线类型 1 -- 管线 0 -- 管点
 * @param  {[type]} returnFiledName  true返回FiledName false返回CaptionName
 * @return {[type]}                  显示名称
 */
function getName(standardName, pipeType, returnFiledName) {
    if (standardName === "" || standardName === undefined) {
        return;
    }
    if (pipeType === "" || pipeType === undefined) {
        return;
    }
    var configXML = SYSTEMPARAMS.pipeFieldMap;
    if (configXML == null) {
        return;
    }
    var lineData;
    if (pipeType === 1 || pipeType === "1") {
        lineData = configXML.getElementsByTagName("LineFieldInfo")[0] ? configXML.getElementsByTagName("LineFieldInfo")[0].getElementsByTagName("SystemFieldList")[0] : null;
    } else if (pipeType === 0 || pipeType === "0") {
        lineData = configXML.getElementsByTagName("PointFieldInfo")[0] ? configXML.getElementsByTagName("PointFieldInfo")[0].getElementsByTagName("SystemFieldList")[0] : null;
    }
    if (lineData && lineData.childNodes.length) {
        for (var i = lineData.childNodes.length - 1; i >= 0; i--) {
            var item = lineData.childNodes[i];
            if (item.getAttribute("StandardName").toUpperCase() == standardName.toUpperCase()) {
                if (returnFiledName) {
                    return item.getAttribute("FieldName").toUpperCase();
                } else {
                    return item.getAttribute("CaptionName");
                }
            }
        };
    }
};

function getNameNoIgnoreCase(standardName, pipeType, returnFiledName) {
    if (standardName === "" || standardName === undefined) {
        return;
    }
    if (pipeType === "" || pipeType === undefined) {
        return;
    }
    var configXML = SYSTEMPARAMS.pipeFieldMap;
    var lineData;
    if (pipeType === 1 || pipeType === "1") {
        lineData = configXML.getElementsByTagName("LineFieldInfo")[0] ? configXML.getElementsByTagName("LineFieldInfo")[0].getElementsByTagName("SystemFieldList")[0] : null;
    } else if (pipeType === 0 || pipeType === "0") {
        lineData = configXML.getElementsByTagName("PointFieldInfo")[0] ? configXML.getElementsByTagName("PointFieldInfo")[0].getElementsByTagName("SystemFieldList")[0] : null;
    }
    if (lineData && lineData.childNodes.length) {
        for (var i = lineData.childNodes.length - 1; i >= 0; i--) {
            var item = lineData.childNodes[i];
            if (item.getAttribute("StandardName") == standardName) {
                if (returnFiledName) {
                    return item.getAttribute("FieldName");
                } else {
                    return item.getAttribute("CaptionName");
                }
            }
        };
    }
};
/**
 * 功能：系统设置
 * 参数：无
 * 返回值：无
 
var systemSettingClick = function() {
    var params = SYSTEMPARAMS;
    //params.projectList = PROJECTLIST;
    params.earth = earth;
    params.profileAlt = SYSTEMPARAMS.profileAlt;
    params.Alt = "";
    var url = "html/view/systemSettingDialog.html";
    var value = openDialog(url, params, 350, 200);
    if (value == null) {
        return;
    }
    SystemSetting.setSystemConfig(value);

    //重新初始化

    CURRLAYERID = null; //当前选中的图层ID
    PIPELINELAYERS = []; //记录所有管线图层
    //POILAYERS = []; //记录所有管线图层
    //PROJECTLIST = []; //工程列表
    pipeFlowArr = []; //流向图层
    //----------规划全局变量-------------
    //pipeLineObjList = null; //存放生成的管线对象【导入的管线数据】
    //pipeDataDoc = null;

    SYSTEMPARAMS.project = value.project;
    SYSTEMPARAMS.Position = value.Position;
    SystemSetting.initSystemParam(); //初始化系统参数对象
    LayerManagement.initLayerDataType(earth);
    LayerManagement.initPipelineTree(earth, $("#PipelineLayerTree", document)); //初始管线图层树
    LayerManagement.initLayerTree(earth, $("#layerTree", document)); //初始化图层树
};*/
//-----------------------------------------------------------------
//--坐标转换对象创建 - 结束
//-----------------------------------------------------------------

//-----------------------------------------------------------------
//--飞行路线 - 开始
//-----------------------------------------------------------------
/**
 * 功能：飞行路线
 * 参数：无
 * 返回值：无
 */
var ViewFlyModeClick = function() {
    showLargeDialog("html/view/track.html", "飞行浏览");
};

var disabledMenu = []; // free add 2014年7月24日17:27:01  
var hasDisabled = false;
var SaveMenuState = function(bool) {
    //hasDisabled = false;
    if (bool) {

        if (!hasDisabled) {
            hasDisabled = true;
            $("#systemMenu .toolbar-item").each(function(e, o) {

                if ($(o).attr("disabled") == "disabled") {
                    disabledMenu.push(o);
                }


            });
            //$("#systemMenu div[class='toolbar-item']").attr("disabled", true);
            $("#systemMenu .toolbar-item").attr("disabled", true);
        }
    } else {
        hasDisabled = false;
        // $("#systemMenu div[class='toolbar-item']").attr("disabled", false);
        $("#systemMenu .toolbar-item").attr("disabled", false);
        for (var i = 0; i < disabledMenu.length; i++) {
            $(disabledMenu[i]).customAttr("disabled", true);
        }
    }
}; // free add 2014年7月24日17:27:01  bool true 禁用 false 还原	
//-----------------------------------------------------------------
//--飞行路线 - 结束
//-----------------------------------------------------------------


//-----------------------------------------------------------------
//--开挖分析 - 开始
//-----------------------------------------------------------------
/**
 * 功能：开挖分析
 * 参数：无
 * 返回值：无
 */
var AnalysisExcavaClick = function() {
    showLargeDialog("html/analysis/AnalysisExcave.html","开挖分析");
};
//-----------------------------------------------------------------
//--开挖分析 - 结束
//-----------------------------------------------------------------


//-----------------------------------------------------------------
//--横断面查询 - 开始
//-----------------------------------------------------------------
/**
 * 功能：横断面查询
 * 参数：无
 * 返回值：无
 */
function AnalysisTranSectionClick(){
    pipeTranSectionAnalysisClick();//横断面
}
//-----------------------------------------------------------------
//--横断面查询 - 结束
//-----------------------------------------------------------------


//-----------------------------------------------------------------
//--距离量测 - 开始
//-----------------------------------------------------------------
/**
 * 功能：距离量测
 * 参数：无
 * 返回值：无
 */
function MeasureHorizontalDisClick(){
	clearLRBDownEvent();
	horizontalDisClick();
}
function MeasureVerticalDisClick(){
	clearLRBDownEvent();
	verticalDisClick();
}
function MeasureSpaceDisClick(){
	clearLRBDownEvent();
	spaceDisClick();
}

//-----------------------------------------------------------------
//--距离量测 - 结束
//-----------------------------------------------------------------

//-----------------------------------------------------------------
//--管间水平距离量测 - 开始
//-----------------------------------------------------------------
//直接选择其他功能中的选取模型功能，会导致OnPickObject..等事件重复调用两次
var clearLRBDownEvent = function(){
    earth.Event.OnPickObjectEx = function () {};
    earth.Event.OnPickObject = function () {};
    earth.Event.OnLBDown = function () {};
    earth.Event.OnLBUp = function () {};
    earth.Environment.SetCursorStyle(209);
}

/**
 * 功能：“管间水平距离”菜单点击事件
 * 参数：无
 * 返回：无
 */

function MeasurePipelineHorDisClick(){
    LayerManagement.initLayerDataType(earth);
    clearLRBDownEvent();
    pipelineHorDisClick();	
}
var pipelineHorDisClick = function() {
    hideBollon();
    PipelineMeasure.clearPipelineMeasure();
    PipelineMeasure.onPickObjectEvent(function() {

        var coordinate1 = PipelineMeasure.coordinate1;
        var coordinate2 = PipelineMeasure.coordinate2;
        setTimeout(function(){
            var horDis = earth.GeometryAlgorithm.CalculateLineLineDistance(coordinate1.centerLineVect3s, coordinate2.centerLineVect3s);
            var spaceDis = earth.GeometryAlgorithm.CalculateMeshDistance(coordinate1.lineMeshV3s, coordinate2.lineMeshV3s);
            if (horDis && spaceDis > 0) {
                var horDisLength = horDis.length - coordinate1.pipeWidth * 0.5 - coordinate2.pipeWidth * 0.5;
                if(horDisLength < 0){
                    horDisLength = horDis.length;
                }
                if(horDisLength > spaceDis){
                    horDisLength = spaceDis;
                }
                showMeasureResult(horDisLength, 301);
            } else {
                showMeasureResult(0, 301);
            }
        },100);
    });
};

/**
 * 功能：“管间垂直距离”菜单点击事件
 * 参数：无
 * 返回：无
 */
var pipelineVerDisClick = function() {
    hideBollon();
    PipelineMeasure.clearPipelineMeasure();
    PipelineMeasure.onPickObjectEvent(function() {
        var coordinate1 = PipelineMeasure.coordinate1;
        var coordinate2 = PipelineMeasure.coordinate2;

        setTimeout(function(){
            var horDis = earth.GeometryAlgorithm.CalculateLineLineDistance(coordinate1.centerLineVect3s, coordinate2.centerLineVect3s);
            var spaceDis = earth.GeometryAlgorithm.CalculateMeshDistance(coordinate1.lineMeshV3s, coordinate2.lineMeshV3s);
            if (horDis && spaceDis > 0) {
                var tempValue = Math.pow(spaceDis.Length, 2) - Math.pow(horDis.Length, 2);
                var verDis = 0;
                if (tempValue >= 0) {
                    verDis = Math.sqrt(tempValue);
                    verDis = verDis - coordinate1.pipeHeight - coordinate2.pipeHeight;
                    if(verDis < 0){
                        verDis = 0;
                    }
                }
                showMeasureResult(verDis, 302);
            } else {
                if(spaceDis <= 0){
                    showMeasureResult(0, 302);
                }else{
                    showMeasureResult(spaceDis, 302);
                }
                
            }    
        },100);
    });
};
function MeasurePipelineVerDisClick(){
	LayerManagement.initLayerDataType(earth);
    clearLRBDownEvent();
    pipelineVerDisClick();	
}
/**
 * 功能：“管间空间距离”菜单点击事件
 * 参数：无
 * 返回：无
 */
var pipelineSpaceDisClick = function() {
    hideBollon();
    PipelineMeasure.clearPipelineMeasure();
    PipelineMeasure.onPickObjectEvent(function() {
        var coordinate1 = PipelineMeasure.coordinate1;
        var coordinate2 = PipelineMeasure.coordinate2;
        coordinate2.lineMeshV3s.ShowHighLight();
        setTimeout(function(){
            var spaceDis = earth.GeometryAlgorithm.CalculateMeshDistance(coordinate1.lineMeshV3s, coordinate2.lineMeshV3s);
            if (spaceDis > 0) {
                showMeasureResult(spaceDis, 304);
            } else {
                showMeasureResult(0, 304);
            }
        },100);
    });
};

function MeasurePipelineSpaceDisClick(){
	LayerManagement.initLayerDataType(earth);
    clearLRBDownEvent();
    pipelineSpaceDisClick();	
}
//-----------------------------------------------------------------
//--管间水平距离量测 - 结束
//-----------------------------------------------------------------