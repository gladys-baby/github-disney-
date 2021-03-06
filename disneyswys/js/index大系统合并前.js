/**
 * User: wyh
 * Date: 12-11-22
 * Time: 下午12:00
 * Desc:
 */
var earth = null;    // 全局球体对象

var earthArray = [];
var analysis = null, projManager = null, projImport = null,layerManager = null, searchAnaly = null,attachment=null;
var editTool = null;
var timmerRoadName;
var currentLayerDatas = [];
var databaseLayers = {};
var databaseLayersArr=[];
var editLayers = {};//记录数据库中所有图层
var ploygonLayersVcts3 = {};//规划用地
var ParceLayer = []; //用地图层
var ctrPlanLayer = [];//控规图层
var currentLayerIdList = [];//记录现状图层ID列表
var currentLayerIdListTemp = {};//记录现状图层ID列表(便于判断在方案比选功能中)
var projectLayerIdList = [];//记录项目图层ID列表
var otherLayerIdList = [];//记录其他图层ID列表
var currentLayerChecked = false;//记录选中现状图层显示、隐藏状态
var currentLayerObjList = {};//项目现状图层Obj列表
var checkedStatusList = [];//记录复选框状态
var surroundingLayer = [];//周边查询图层
var approveCurrentLayerId = null;//审批中的现状图层ID
var currentSelectedNode = null;//当前选中的审批树节点ID
var indicatorAccountingLayer = [];//指标查看图层
var removeAnalysisLayer = [];//拆迁分析图层



var WMSLayerArray=[];//cy:wms图层
var greenbeltAnalysisLayer = [];//绿地分析图层
var highLimitAnalysisLayer = [];//限高分析图层
var currentPlanLayers;
var currentLayerObjs = [];
var lastPlanHeight = 0;//高度调整功能 记录上一次的高度值
var SYSTEMPARAMS = null; //系统参数对象
var PROJECTLIST = [];//工程列表
var currentPrjGuid = null;//当前工程的guid
var currentApproveProjectGuid = null;       //当前审批项目的的guid（初始化时从approve.xml读取）
var parceLayerObj = null;//记录现状图层中的对象集合
var currentPrjDepth = 10;//当前项目的默认开挖深度 默认值是10 该值不保存到本地
var parcelLayerGuid = null;//用地图层的guid
var isImportLoop = 0;
var planLayerIDs = {};
var passedPlanObj = {};

var bolonArr =[];
var AnalineObj = null;

//五个分析功能的气泡
var htmlBalloonMove=null;
//雨雪雾功能气泡
var transparencyBalloons = null;
var transparencyBalloonsHidden = false;
//截屏气泡
var picturesBalloons = null;
//量算气泡
var htmlBal = null;
//现状图层的guid
var parcelLayerGuid2 = null;
var demObj = null;
var vectLayers = [];
var prjTreeData;
var isInit = false;
var isLoadCurrentLayers = false;//是否获取到现状数据
var isInit = false;

var lgttag=0;   //cy0918:拉杆条类型

var seHistorySliderMgr = null;

var partTypeDatalist=[];//cy加 网格部件 全局变量（index.js定义）
var isgetpartcountFlag=false;//cy 标记是否获取过部件个数
var partlayerGuidArr=[];  // cy加网格部件图层guid 全局变量（index.js定义）

var PoiIconControllerArr=[];   //标绘字典   key:图层guid value：该图层的icon标绘对象数组
var PoilayerDataArr=[]; //图层字典   key:图层guid value：该图层的对象数组



var _GlobalBIMeditLayerList = [];//cy 加
var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
var xmlpath = loaclUrl +"/partlist.xml"; //ShowNavigate只能用绝对路径
var partmanager=  PART.PartManager(xmlpath);
var clearHtmlBallon = function(htmlBall){
    if (htmlBall != null){
        htmlBall.DestroyObject();
    }
};

//var showMoveHtml = function(anaLysisChk){
//  var eventObj = $("div[id='shiyefenxi']");//$("div[tag='shiyefenxi']")
//    if(eventObj.attr("disabled") == "disabled"){
//        return;
//    }
//    //alert(eventObj.attr("disabled")); //undefined or disabled
//    earth.Event.OnHtmlNavigateCompleted = function (){};
//    var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
//    var url = "";
//    var width =260,height = 200;
//    if(anaLysisChk === "mLineSight"){
//        url = loaclUrl + "/html/analysis/linesight.html"; //通视分析
//    } else if(anaLysisChk === "mShinning"){
//        url = loaclUrl + "/html/analysis/shinning.html";//阴影分析
//    } else if(anaLysisChk === "mViewshed"){
//        url = loaclUrl + "/html/analysis/viewshed.html";//视域分析
//    } else if(anaLysisChk === "mSkyline"){
//        url = loaclUrl + "/html/analysis/skyline.html";//天际线分析
//    } else if(anaLysisChk === "mFixedObserver"){
//        url = loaclUrl + "/html/analysis/pointview.html";//视野分析
//        height=160;
//    } else if(anaLysisChk === "mExcavationAndFill"){//填挖方分析
//        url = loaclUrl + "/html/analysis/excavationAndFill.html";
//    }
//    if(url===""){
//        return;
//    }
//    if (picturesBalloons != null){
//        picturesBalloons.DestroyObject();
//        picturesBalloons = null;
//    }
//    if (transparencyBalloons != null){
//        transparencyBalloons.DestroyObject();
//        transparencyBalloons = null;
//    }
//    if (htmlBalloonMove != null){
//        htmlBalloonMove.DestroyObject();
//        htmlBalloonMove = null;
//    }
//    htmlBalloonMove = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "屏幕坐标窗体");
//    htmlBalloonMove.SetScreenLocation(0,0);//earth.offsetHeight
//    htmlBalloonMove.SetRectSize(width,height);
//    htmlBalloonMove.SetIsAddBackgroundImage(false);
//    htmlBalloonMove.ShowNavigate(url);
//    earth.Event.OnDocumentReadyCompleted = function (guid){
//        earth.htmlBallon =htmlBalloonMove;
//        earth.ifEarth = window.frames.ifEarth;
//        earth.alysis = CITYPLAN.Analysis(earth);
//        // earth.evtTarget = $("evtTarget");
//        earth.userdataTree=parent.$.fn.zTree.getZTreeObj("userdataTree");
//        if(htmlBalloonMove === null){
//            return;
//        }
//        earth.currentLayer = currentLayerObjs;
//        if(htmlBalloonMove.Guid == guid){
//            htmlBalloonMove.InvokeScript("getEarth", earth);
//        }
//    };
//    earth.Event.OnHtmlBalloonFinished = function(id){
//        if (htmlBalloonMove != null&&id===htmlBalloonMove.Guid){
//            htmlBalloonMove.DestroyObject();
//            htmlBalloonMove = null;
//            earth.Event.OnHtmlBalloonFinished = function(){};
//        }
//    };
//};

// region 初始化图层树、项目树和初始位置，由3D窗口在地球加载完成后调用
function init() {
   earth.Environment.Mode2DEnable = false; //初始显示为三维地图
    //analysis = CITYPLAN.Analysis(earth);
    projManager = CITYPLAN.ProjectManager(earth, document.getElementById("dataProcess"));
    projImport = CITYPLAN.ProjImport(earth, document.getElementById("dataProcess"), document.getElementById("generateEdit"));
    layerManager = CITYPLAN.LayerManager(earth);
    editTool = CITYPLAN.EditTool(earth,document.getElementById("generateEdit"));
    searchAnaly = CITYPLAN.searchAnalysis(earth);
    attachment =   CITYPLAN.Attachment(earth);

    seHistorySliderMgr = new STAMP.SeHistorySliderMgr({
        onAllClose:function(){
//            $('#historyData').removeClass('selected');
        }
    });

    initMapMgr(true);   //字段映射初始化

    //cy 20150508
    //加载现状图层 给editLayers填充数组(程序启动时候执行)
    setTimeout(loadCurrentLayers,200);
 //   getEditLayerListLoaded();//首先去数据库拿图层，cy：但并不加载，只放入相应的数组
  
   setTimeout(initLayerTree, 200);//延迟加载，等待加载现状数据
    initPosition();

//    initCurrentProject();
    initProjectTree();        //cy:初始化应用图层树
    initpartTypeDatalist(CITYPLAN_config.disney.PartProjectId);  //初始化的时候获得网格对象全局变量 ，与三维图层的guid挂接
//    parent.partTypeDatalist=partmanager.SetLayerCount(partTypeDatalist);
//      GetApproveProGuid();

    //加载现状图层 给editLayers填充数组(程序启动时候执行)

  // setTimeout(initLayerTree, 200);//延迟加载，等待加载现状数据     cy:初始化基础图层树
  //  initPosition();         //cy:设置初始化视点
    setTimeout(projManager.getAllPassedPlan, 300);//延迟加载，等待加载数据库数据  //cy：已审批通过的项目数据加载到地球上
    projManager.cancelApproveProject();//cy:检查　如果审批中的已通过审批，则清空approval.xml








     //设置功能可用性 按钮可见性控制
    setFunEnabled();
//    document.getElementById("fixediframe").src   ="html/investigate/projectManagement.html"  ;
}




function initpartTypeDatalist (PartProjectId)
{
    layerManager=CITYPLAN.LayerManager (earth);
   var PartProjectlayer = earth.LayerManager.GetLayerByGUID(PartProjectId);//获取
   var   PartProjectlayerdata= layerManager.getCurrentProjectLayerData2( PartProjectlayer);

    partTypeDatalist=   partmanager.gettypelist(PartProjectlayerdata);
    partlayerGuidArr=partmanager.getpartlayerGuidArr();

}

function initMapMgr(reloadEditLayer){
    try{
        //var fXmlUrl = "C:\\Users\\Administrator\\Desktop\\FieldMapCityPlan.config";
        //fXmlUrl = earth.UserDocument.LoadXmlFile(fXmlUrl);

        var fXmlUrl = earth.LayerManager.GetLayerByGuid(currentPrjGuid).ProjectSetting.PlanFieldMapFile;
        //fXmlUrl = 'http://' + fXmlUrl.substr(2).replace("/", "/sde?/") + "_sde";
        earth.Event.OnEditDatabaseFinished = function(response){
            earth.Event.OnEditDatabaseFinished = function(){};

            var fieldXml = response.AttributeName;

            mapMgr.init(undefined,fieldXml);

            if(reloadEditLayer){
                getEditLayerListLoaded();
            }
        }

        earth.DatabaseManager.GetXml(fXmlUrl);
        //var fieldXml = loadXMLStr(fXmlUrl);

        //mapMgr.init(undefined,fieldXml);
    }catch(e){

    }
}

function setFunEnabled(){
//    if(ParceLayer && ParceLayer.length){
//        //用地查询
//        setBtnDisabled(true,"#parcelQuery");
//    //    $("#parcelQuery").removeAttr("disabled");
//    }else{
//        setBtnDisabled(false,"#parcelQuery");
//      //  $("#parcelQuery").attr("disabled", "disabled");
//    }
    if(WMSLayerArray && WMSLayerArray.length){
        //wms

        setBtnDisabled(false,"#ctrPlanInfo");
    }
   else{
    setBtnDisabled(true,"#ctrPlanInfo");

    }


//    if(CITYPLAN_config.disney.SEVIEWsxt_layerid!="")  {

        if(  earth.LayerManager.GetLayerByGUID(CITYPLAN_config.disney.SEVIEWsxt_layerid)!=null){

        //视频监控
        setBtnDisabled(false,"#shipinjiankong");
        setBtnDisabled(false,"#shipinjiankong2");
    }
    else{
        setBtnDisabled(true,"#shipinjiankong");
        setBtnDisabled(true,"#shipinjiankong2");

    }





    if(ctrPlanLayer && ctrPlanLayer.length){
        //控规查询

        setBtnDisabled(false,"#ctrPlanQuery");
//        $("#ctrPlanQuery").removeAttr("disabled");
    }else{
        setBtnDisabled(true,"#ctrPlanQuery");
//        $("#ctrPlanQuery").attr("disabled", "disabled");
    }
    if(greenbeltAnalysisLayer && greenbeltAnalysisLayer.length){
//        绿地分析
        setBtnDisabled(false,"#greenLandAly");
//         $("#greenLandAly").removeAttr("disabled");
    }else{
        setBtnDisabled(true,"#greenLandAly");
//        $("#greenLandAly").removeAttr("disabled"
//        $("#greenLandAly").attr("disabled", "disabled");
    }
//    if(indicatorAccountingLayer && indicatorAccountingLayer.length){
//        //指标核算 拆迁分析
//        $("#indicatorsAly").removeAttr("disabled");
//        $("#removeAly").removeAttr("disabled");
//    }else{
//        $("#indicatorsAly").attr("disabled", "disabled");
//        $("#removeAly").attr("disabled", "disabled");
//    }
//    if(ctrPlanLayer && indicatorAccountingLayer && ctrPlanLayer.length && indicatorAccountingLayer.length){
//        //限高分析
//        $("#ctrHeightAly").removeAttr("disabled");
//    }else{
//        $("#ctrHeightAly").attr("disabled", "disabled");
//    }

    //cy:加
    if(ploygonLayersVcts3[parcelLayerGuid2]!=null)
    {

        setBtnDisabled(false,"#fillAlt");   //cy:加 平整开挖 不可见
//        $("#btn_fillAlt").removeAttr("disabled", "disabled");
    }
    else
    {
        setBtnDisabled(true,"#fillAlt");   //cy:加 平整开挖 不可见
//        $("#btn_fillAlt").attr("disabled", "disabled");
    }
    if(currentApproveProjectGuid!=null){
        //指标查看
        setBtnDisabled(false,"#PlanindexInfoDIV");   //cy:加 规划指标查看 不可见
    }else{
        setBtnDisabled(true,"#PlanindexInfoDIV");   //cy:加 规划指标查看 可见
    }
    setBtnDisabled(true,"#planCheckTag");//cy:加 总平图查看 不可见
};
/**
 * 初始化基础图层树
 */
function initLayerTree() {
    var setting = {
        check: {
            enable: true, //是否显示checkbox或radio
            chkStyle: "checkbox" //显示类型,可设置(checbox,radio)
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        view: {
            dblClickExpand: false, //双击节点时，是否自动展开父节点的标识
            expandSpeed: "", //节点展开、折叠时的动画速度, 可设置("","slow", "normal", or "fast")
            selectedMulti: false //设置是否允许同时选中多个节点
        },
        callback: {
            onCheck: onCheckClick,
            onDblClick: function (event, treeId, node) {
                if (node && node.id) {
                    if (node.type.indexOf("BASE") !== -1) {
                        var layer = earth.LayerManager.GetLayerByGUID(node.id);
                        if (layer && layer.LayerType) {
                            layerManager.flyToLayer(layer); //定位图层
                        }
                    } else if (node.type.indexOf("OLD") !== -1) {
                        if (editLayers[node.id]) {
                            layerManager.flyToLayer(editLayers[node.id]); //定位图层
                        }
                    }
                }
            }
        }
    };

    var zNodes = [];
    zNodes.push({id: 1, pId: 0, name: "基础数据", open: true, nocheck: false, type: "DATA"});
    zNodes.push({id: 2, pId: 1, name: "现状数据", open: false, nocheck: false, type: "OLD", checked: true});
    zNodes = zNodes.concat(currentLayerDatas);
    zNodes.push({id: 3, pId: 1, name: "浏览数据", open: false, nocheck: false, type: "BASE"});
    var baseLayerDatas = layerManager.getLayerData(null);
    zNodes = zNodes.concat(baseLayerDatas);
 return zNodes;
  //  $.fn.zTree.init($("#layerTree"), setting, zNodes);



}
/**
 * 基础数据控制按钮
 * @param node
 * @param type
 */
function showDatas(node, type) {
    if (type === "OLD") {
        if (editLayers && currentLayerDatas) {
            for (var i = 0; i < currentLayerDatas.length; i++) {
                var currLayerDataId=currentLayerDatas[i].id;
                if(editLayers[currLayerDataId]){
                    editLayers[currLayerDataId].LayerIsPrior = false;
                    editLayers[currLayerDataId].Visibility = node.checked;
                }else{
                    applyDataBaseRecords(node.checked,currLayerDataId);
                }
            }
           controlCarveCurrentLayer();
        }
    } else if (type === "BASE") {
        var layer = earth.LayerManager.LayerList;
        var childCount = layer.GetChildCount();
        for (var i = 0; i < childCount; i++) {
            var childLayer = layer.GetChildAt(i);
            childLayer.Visibility = node.checked;
        }
    } else if (type === "OLD01") {
        if (editLayers[node.id]) {
            editLayers[node.id].Visibility = node.checked;
           controlCarveCurrentLayer();
        }
    }
}
function controlCarveCurrentLayer() {
    if (approveCurrentLayerId) {
        var eList = currentLayerObjList[approveCurrentLayerId];
        if (eList) {
            var count = eList.Count;
            for (var j = 0; j < count; j++) {
                var obj = eList.Items(j);
                obj.Visibility = currentLayerChecked;
            }
        }
    }
}
/**
* 复选框 控制图层的隐藏和显示
* @param event
* @param treeId
* @param node
*/
function onCheckClick(event, treeId, node) {
    if (node.type === "OLD01") {
        showDatas(node, node.type);
    } else if (node.type === "OLD") {
        showDatas(node, node.type);
    } else if (node.type === "BASEO1") {
        var layer = earth.LayerManager.GetLayerByGUID(node.id);
        if (layer) {
            layer.Visibility = node.checked;
        }
    } else if (node.type === "BASE") {
        showDatas(node, node.type);
    } else if (node.type === "DATA") {
        showDatas(node, "OLD");
        showDatas(node, "BASE");
    }
}



function hideLayers(){
//    //如果当前项目已经加载 则取消加载
//    if(parent.currentApproveProjectGuid){
//        //关闭所有方案的显示
//        projManager.showAll(parent.currentApproveProjectGuid, "all", false, true, true, true,true);
//        //关闭现状图层的显示 后期可以把这两种合并处理...
//        if(parent.parcelLayerGuid2 && parent.parceLayerObj){
//            //parent.parceLayerObj;
//            var eList = currentLayerObjList[currentApproveProjectGuid];
//            if(eList){
//                var count=eList.Count;
//                for (var j = 0; j < count; j++){
//                    var obj = eList.Items(j);
//                    obj.Visibility = false;
//                }
//            }
//        }
//    }

    //cy:10.10
    //如果当前项目已经加载 则取消加载
        if(parent.currentApproveProjectGuid){
            //关闭所有方案的显示
            projManager.showAll(parent.currentApproveProjectGuid, "all", false, true, true, true,true);
            //关闭现状图层的显示 后期可以把这两种合并处理...
            if(parent.parcelLayerGuid2 && parent.parceLayerObj){


                var elistarray1= parent.currentLayerObjList[currentApproveProjectGuid];
                if(elistarray1){

                    var count=elistarray1.length;
                    for (var j = 0; j < count; j++){
                        var elist=  elistarray1[j];
                        var elistcount=   elist.Count;

                        for (var jj = 0; jj < elistcount; jj++){

                            var obj =elist.Items(jj);
                            if(obj)
                            {
                                obj.Visibility = false;

                            }
                        }
                    }

                }
            }



        }
    //cy:10.10
    //派发事件修改项目管理树里的节点勾选状态
    $("#fixediframe").trigger("chkStatusChange");
    //交互优化:这里要对审批树里勾选状态都置空 todo...
    //zTree.checkAllNodes(false);
};

//cy:writer
var hidedlayers=[];
function setalllayersvisibility(isshow)
{

    hidedlayers=[];

    setDatabaselayersVisible(isshow); //数据库图层 （包括现状、方案涉及的所有东西）
    setLLSJlayersVisible(isshow);//非数据库数据，即浏览数据


}







//cy:writer

function setDatabaselayersVisible(isshow)
{
    //1.现状 2.方案    3.otherLayerIdList


    for (var i = 0; i < currentLayerDatas.length; i++) {
        var currLayerDataId=currentLayerIdList[i];
        if(!currLayerDataId){continue;}
        if(editLayers[currLayerDataId]==null){continue;}
        if(editLayers[currLayerDataId]){
            if( editLayers[currLayerDataId].Visibility&!isshow)
            {
                editLayers[currLayerDataId].Visibility = false;
                hidedlayers.push(editLayers[currLayerDataId]);
            }
            if( !editLayers[currLayerDataId].Visibility&isshow)
            {
            editLayers[currLayerDataId].Visibility = true;
            }

        }
    }
        for (var i = 0; i < projectLayerIdList.length; i++) {

            var currLayerDataId=projectLayerIdList[i];

            if(!currLayerDataId){continue;}
            if(editLayers[currLayerDataId]==null){continue;}

            if( editLayers[currLayerDataId].Visibility&!isshow)
            {
                editLayers[currLayerDataId].Visibility = false;
                hidedlayers.push(editLayers[currLayerDataId]);
            }
            if(!editLayers[currLayerDataId].Visibility&isshow)
            {
            editLayers[currLayerDataId].Visibility = true;
            }
        }

            for (var i = 0; i < otherLayerIdList.length; i++) {
                var currLayerDataId=otherLayerIdList[i];

                if(!currLayerDataId){continue;}
                if(editLayers[currLayerDataId]==null){continue;}
                if( editLayers[currLayerDataId].Visibility&!isshow)
                {
                     editLayers[currLayerDataId].Visibility = false;
                    hidedlayers.push(editLayers[currLayerDataId]);
                }
                if(!editLayers[currLayerDataId].Visibility&isshow)
                {

                editLayers[currLayerDataId].Visibility = true;
                }

           }

}
//cy:writer
function  setLLSJlayersVisible(isshow,layer) {




        if (!layer) {
            layer = earth.LayerManager.LayerList;
        }
        var layerData = [];
        var childCount = layer.GetChildCount();
        if(childCount>0)
        {
        for (var i = 0; i < childCount; i++) {
                var childLayer = layer.GetChildAt(i);

            setLLSJlayersVisible(isshow , childLayer  );

        }
        }
        else
        {      if(layer.Visibility&!isshow)
        {

            layer.Visibility  =isshow;
            hidedlayers.push(layer);

        }
            if(!layer.Visibility&isshow)
            {
            layer.Visibility = isshow;
            }
        }

    }
//cy:writer
function hideXZ()
{
    if(parent.currentApproveProjectGuid){
        if( parent.currentLayerObjList[parent.currentApproveProjectGuid])
        {


           // var eList = parent.currentLayerObjList[parent.currentApproveProjectGuid];

            //cy:10.10
            var elistarray1= parent.currentLayerObjList[parent.currentApproveProjectGuid];
            if(elistarray1){

                var count=elistarray1.length;
                for (var j = 0; j < count; j++){
                    var elist=  elistarray1[j];
                    var elistcount=   elist.Count;

                    for (var jj = 0; jj < elistcount; jj++){

                        var obj =elist.Items(jj);
                        if(obj)
                        {

//                           var oldisshow= obj.Visibility;
//                            obj.Visibility = oldisshow;
                            obj.Visibility =false;

                        }
                    }
                }



//
//            if(eList){
//                var count=eList.Count;
//                for (var j = 0; j < count; j++){
//                    var obj = eList.Items(j);
//
//                    if(obj)
//                    {
//                        obj.Visibility = false;
//
//                    }
//
//
//                }
            }
        }



    }
}

/**
 * 隐藏现状图层
 * @return {[type]} [description]
 */
function hideXZLayers(earthCopy, parId, bShow){
    var elistarray=[]; //cy:10.10
    //所有的现状图层id
    var ids=earthCopy.XZLayerGuids;//获取现状图层的guids
    for(var i=0;i<ids.length;i++){
        var cid=ids[i];
        //从数据库图层中取出现状图层
        var currentlayer=earthCopy.editLayers[cid];
        if(currentlayer){

            //规划用地的范围即使现状图层的范围，抠出现状图层的范围
            var ploygonVects3=parent.ploygonLayersVcts3[parId];
            if(ploygonVects3){
                currentlayer.LayerIsPrior=false;
                //裁剪掉现状图层
                //cy:2015.12.25
                var eList=currentlayer.ClipByRegion(ploygonVects3,false);
            //    var eList=currentlayer.ClipByRegion(ploygonVects3);
                    if(eList!==null&&eList.Count>0){
                        elistarray.push(eList);
                    }

                if(eList && eList.Count){
                    var count=eList.Count;
                    for (var j = 0; j < count; j++){
                        var obj = eList.Items(j);
                        obj.Visibility = bShow;
                    }
                }

                if(elistarray!=null&elistarray.length>0)  {
                    parent.currentLayerObjList[currentApproveProjectGuid]=elistarray;//存现状图层的obj对象，防止对此重复抠图

                }






//                parent.currentLayerObjList[currentApproveProjectGuid]=eList;
//                if(eList && eList.Count){
//                    var count=eList.Count;
//                    for (var j = 0; j < count; j++){
//                        var obj = eList.Items(j);
//                        obj.Visibility = bShow;
//                    }
//                }
            }
        }
    }
};
  //cy 2015.12.25
//function hideEarthCurrentLayer(earthCopy, isHideXZ){
//    debugger;
//    if(!isHideXZ){//隐藏现状图层
//        if(parent.parcelLayerGuid2){//现状图层  bShow, layerIds, earthCopy
//            var ids=earthCopy.XZLayerGuids;//获取现状图层的guids
//            for(var i=0;i<ids.length;i++){
//                var cid=ids[i];
//                var currentlayer=earthCopy.editLayers[cid];
//                if(currentlayer){
//                    var ploygonVects3=ploygonLayersVcts3[parcelLayerGuid2];
//                    if(ploygonVects3){
//                        currentlayer.LayerIsPrior=false;
//                        //cy 2015.12.25
//                        var eList=currentlayer.ClipByRegion(ploygonVects3,false);
//                     //   var eList=currentlayer.ClipByRegion(ploygonVects3);
//                        earthCopy.XZObjs = eList;
//                        if(eList && eList.Count){
//                            var count=eList.Count;
//                            for (var j = 0; j < count; j++){
//                                var obj = eList.Items(j);
//                                obj.Visibility = false;
//                            }
//                        }
//
//                        }
//                }
//            }
//        }
//    }
//};




//cy 2015.12.25 改
function hideEarthCurrentLayer(earthCopy, isHideXZ){

    if(!isHideXZ){//隐藏现状图层
        if(parent.parcelLayerGuid2){//现状图层  bShow, layerIds, earthCopy
            var ids=earthCopy.XZLayerGuids;//获取现状图层的guids


            for(var i=0;i<ids.length;i++){
                var cid=ids[i];
                var currentlayer=earthCopy.editLayers[cid];
                if(currentlayer){
                    var ploygonVects3=ploygonLayersVcts3[parcelLayerGuid2];
                    if(ploygonVects3){
                        currentlayer.LayerIsPrior=false;
                        //cy 2015.12.25
                        var eList=currentlayer.ClipByRegion(ploygonVects3,false);
                                if(eList != null && eList.Count > 0){
                                     for(var j = 0, l = eList.Count;j < l;j++){
                                        var model = eList.Items(j);
                                        var r = earth.GeometryAlgorithm.GetModelPolygonRelationship(model.Guid, ploygonVects3);
                                        if(r < 3){
                                           model.Visibility = false;

                                          }
                                      }
                             }
                    }
                }
            }
        }
    }
};


/**
 * 单独处理方案比选中地球加载方案数据
 */
function getLayerLoaded(bShow, layerIds, earthCopy, databaseLayersArr, XZLayerGuid, isHideXZ) {
    var ids =  earthCopy.databaseLayersArr;
    if (ids.length) {
        for (var i = 0; i < ids.length; i++) {
            var layer = ids[i];
            var layerId = layer.Guid;
            if($.isArray(layerIds)){
                if ($.inArray(layerId, layerIds) === -1) {   // 不在数组中才返回-1
                    earth.event.OnEditDatabaseFinished = function(pRes,pFeat){
                        var pLayerGuid = result.LayerGuid;
                        if(result.ExcuteType == 43){
                            onDatabaseListLoaded2(pLayerGuid,feature,bShow, earthCopy, XZLayerGuid, isHideXZ);
                        }else if(result.ExcuteType == 47){
                            onElementListLoaded2(pLayerGuid,feature,bShow, earthCopy, XZLayerGuid, isHideXZ);
                        }
                    };
                    if (layer.LayerType == 1 || layer.LayerType == 2 || layer.LayerType == 3 || layer.LayerType == 11 || layer.LayerType == 9) { // ModelObject,BillBoardObject,MatchModelObject
                   // OnDatabaseListLoaded
                        /*
                        earthCopy.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onDatabaseListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ);
                       }
                        */
			 // layer.ApplyDataBaseRecords();
			 earthCopy.DatabaseManager.GetDataBaseRecords(CITYPLAN_config.server.dataServerIP,layer.Guid);
                    } else {
                      // OnElementListLoaded
                        /*
                        earthCopy.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onElementListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ);
                        }
                        */
                         // layer.ApplyElementRecords(layer.LayerType);
                        earthCopy.DatabaseManager.GetElements(CITYPLAN_config.server.dataServerIP,layer.Guid,layer.LayerType);
                    }
                }
            }else{
                if(layerId==layerIds){
                      earthCopy.event.OnEditDatabaseFinished = function(pRes,pFeat){
                        var pLayerGuid = pRes.LayerGuid;
                        if(pRes.ExcuteType == 43){
                            onDatabaseListLoaded2(pLayerGuid,pFeat,bShow, earthCopy, XZLayerGuid, isHideXZ);
                        }else if(pRes.ExcuteType == 47){
                            onElementListLoaded2(pLayerGuid,pFeat,bShow, earthCopy, XZLayerGuid, isHideXZ);
                        }

                        if(isHideXZ !== undefined){
                            hideEarthCurrentLayer(earthCopy, isHideXZ);
                        }else{
                            hideEarthCurrentLayer(earthCopy, bShow);
                        }
                    };
                    if (layer.LayerType == 1 || layer.LayerType == 2 || layer.LayerType == 3 || layer.LayerType == 11 || layer.LayerType == 9 ) { // ModelObject,BillBoardObject,MatchModelObject
  /*
                        earthCopy.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onDatabaseListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ);
                            if(isHideXZ !== undefined){
                                hideEarthCurrentLayer(earthCopy, isHideXZ);
                            }else{
                                hideEarthCurrentLayer(earthCopy, bShow);
                            }
                        }
                        */
                        // layer.ApplyDataBaseRecords();
                        earthCopy.DatabaseManager.GetDataBaseRecords(CITYPLAN_config.server.dataServerIP,layer.Guid);
                    } else {
                        /*
                        earthCopy.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onElementListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ);
                            if(isHideXZ !== undefined){
                                hideEarthCurrentLayer(earthCopy, isHideXZ);
                            }else{
                                hideEarthCurrentLayer(earthCopy, bShow);
                            }
                        }
                        */
			  // layer.ApplyElementRecords(layer.LayerType);
                        earthCopy.DatabaseManager.GetElements(CITYPLAN_config.server.dataServerIP,layer.Guid,layer.LayerType);
                    }
                }
            }
        }
    }
};

/**
 * 第二个方案加载入口
 * @param  {[type]}  bShow       [description]
 * @param  {[type]}  layerIds    [description]
 * @param  {[type]}  earthCopy   [description]
 * @param  {[type]}  XZLayerGuid [description]
 * @param  {Boolean} isHideXZ    [description]
 * @return {[type]}              [description]
 */
function applyRecords(bShow, layerIds, earthCopy, XZLayerGuid, isHideXZ) {
    var databaseLayersArr=[];
    var XZLayerGuids = [];
   earthCopy.Event.OnEditDatabaseFinished = function (pRes,pFeature) {
        earthCopy.Event.OnEditDatabaseFinished = function () {};
        var layer = null;
        for (var i = 0; i < pFeature.GetChildCount(); i++) {
            layer = pFeature.GetChildAt(i);
            databaseLayersArr.push(layer);
            if(layer.GroupID == -3){
                XZLayerGuids.push(layer.Guid);
            }
        }
        var editLayers2 = {};
        earthCopy.XZLayerGuids = XZLayerGuids;
        earthCopy.editLayers = editLayers2;
        earthCopy.databaseLayersArr = databaseLayersArr;
        //加载editLayers图层 后面的现状图层隐藏需要用到
        if(XZLayerGuids.length){
            for(var i=0;i<XZLayerGuids.length;i++){
                var currLayer=XZLayerGuids[i];
                getLayerLoaded(true,currLayer,earthCopy, databaseLayersArr, XZLayerGuid, false);
            }
        }

        setTimeout(function(){
            //加载方案图层
            $.each(layerIds, function (i, layerId) {
                getLayerLoaded(bShow, layerId, earthCopy, databaseLayersArr, XZLayerGuid, isHideXZ);
            });
        },500);

        // setTimeout(function(){
            // //隐藏现状图层
            // if(parent.parcelLayerGuid2){//现状图层  bShow, layerIds, earthCopy
            //     var ids=earthCopy.XZLayerGuids;//获取现状图层的guids
            //     for(var i=0;i<ids.length;i++){
            //         var cid=ids[i];
            //         var currentlayer=earthCopy.editLayers[cid];
            //         if(currentlayer){
            //             var ploygonVects3=parent.ploygonLayersVcts3[parcelLayerGuid2];
            //             if(ploygonVects3){
            //                 currentlayer.LayerIsPrior=false;
            //                 var eList=currentlayer.ClipByRegion(ploygonVects3);
            //                 earthCopy.XZObjs = eList;
            //                 if(eList && eList.Count){
            //                     var count=eList.Count;
            //                     for (var j = 0; j < count; j++){
            //                         var obj = eList.Items(j);
            //                         obj.Visibility = false;
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
        // },500);
    }
    // earthCopy.LayerManager.ApplyEditLayerList();
       earthCopy.DatabaseManager.GetAllLayer(CITYPLAN_config.server.dataServerIP);
};

//只加载现状数据库图层
function loadXZLayers(bShow, earthCopy){
    var databaseLayersArr=[];
    var XZLayerGuids = [];
    earthCopy.Event.OnEditDatabaseFinished = function (pRes,pFeature) {
        earthCopy.Event.OnEditDatabaseFinished = function () {};
        var layer = null;
        for (var i = 0; i < pFeature.GetChildCount(); i++) {
            layer = pFeature.GetChildAt(i);
            databaseLayersArr.push(layer);
            if(layer.GroupID == -3){
                XZLayerGuids.push(layer.Guid);
            }
        }
        earthCopy.XZLayerGuids = XZLayerGuids;
        earthCopy.editLayers = {};
        earthCopy.databaseLayersArr = databaseLayersArr;
        //加载editLayers图层 后面的现状图层隐藏需要用到
        if(XZLayerGuids.length){
            for(var i=0;i<XZLayerGuids.length;i++){
                var currLayer=XZLayerGuids[i];
                getLayerLoaded(bShow,currLayer,earthCopy);
            }
        }
    }
     // earthCopy.LayerManager.ApplyEditLayerList();
    earthCopy.DatabaseManager.GetAllLayer(CITYPLAN_config.server.dataServerIP);
    };

//加载现状模型
function loadCurrentLayers2(layerIdList){
    if(layerIdList.length){
        for(var i=0;i<layerIdList.length;i++){
            var currLayer=layerIdList[i];
            applyDataBaseRecords(true,currLayer);
        }
    }
}

function onDatabaseListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ) {
    var databaseLayer = databaseLayers[pLayerGuid];
    if (!databaseLayer || null == pFeat) {
        return;
    }
   // var m_editLayer = earthCopy.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5);    // m_databaseLayer.MaxVisibleHeight);
    var m_editLayer = earthCopy.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5, CITYPLAN_config.server.dataServerIP);
    earthCopy.editLayers[databaseLayer.Guid] = m_editLayer;
    m_editLayer.DataLayerType = databaseLayer.LayerType;
    m_editLayer.Visibility = bShow;
    m_editLayer.Editable = true;
    earthCopy.AttachObject(m_editLayer);
    m_editLayer.BeginUpdate();
    for (var i = 0; i < pFeat.Count; i++) {
        var obj = pFeat.Items(i);
        if (!obj) {
            continue;
        }
        var editmodel = earthCopy.Factory.CreateEditModelByDatabase(obj.Guid, obj.Name, obj.MeshID, databaseLayer.LayerType);
        editmodel.BeginUpdate();
        editmodel.SetBBox(obj.BBox.MinVec, obj.BBox.MaxVec);
        editmodel.SphericalTransform.SetLocation(obj.SphericalTransform.GetLocation());
        editmodel.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
        editmodel.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
        editmodel.Editable = true;
        editmodel.Selectable = true;
        editmodel.EndUpdate();
        m_editLayer.AttachObject(editmodel);
    }
    m_editLayer.EndUpdate();
    m_editLayer.Editable = true;
    m_editLayer.Selectable = true;
     // earthCopy.DatabaseManager.UpdateLayerLonLatRect(CITYPLAN_config.server.dataServerIP,pLayerGuid, m_editLayer.LonLatRect);
    earthCopy.DatabaseManager.UpdateLayerLonLatRect(CITYPLAN_config.server.dataServerIP,pLayerGuid, m_editLayer.LonLatRect, m_editLayer.MaxHeight);

    //隐藏现状图层
    if(databaseLayer.Guid == XZLayerGuid){
        // alert("大概大概");
    }
};

function onElementListLoaded2(pLayerGuid, pFeat, bShow, earthCopy, XZLayerGuid, isHideXZ) {
    var databaseLayer = databaseLayers[pLayerGuid];
    if (!databaseLayer || null == pFeat) {
        return;
    }
    // var m_editLayer = earthCopy.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5);    // m_databaseLayer.MaxVisibleHeight);
    var m_editLayer = earthCopy.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5, CITYPLAN_config.server.dataServerIP);    m_editLayer.DataLayerType = databaseLayer.LayerType;
    m_editLayer.DataLayerType = databaseLayer.LayerType;
    earthCopy.editLayers[databaseLayer.Guid] = m_editLayer;
    m_editLayer.Visibility = bShow;
    m_editLayer.Editable = true;
    earthCopy.AttachObject(m_editLayer);
    m_editLayer.BeginUpdate();
    var vect3 = null, newPolygon = null;
    for (var i = 0; i < pFeat.Count; i++) {
        var obj = pFeat.Items(i);
        if (null == obj || obj.SphericalVectors.Count <= 0) {
            continue;
        }
        switch (databaseLayer.LayerType) {
            case 6:   // SEObjectType.ElementBoxObject
                break;
            case 7:   // SEObjectType.ElementVolumeObject
                var volume = earthCopy.Factory.CreateElementVolume(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();
                volume.BeginUpdate();
                newPolygon = earthCopy.Factory.CreatePolygon();
                newPolygon.AddRing(obj.SphericalVectors.Items(0));
                volume.SetPolygon(1, newPolygon);   // SECoordinateUnit.Degree
                volume.height = obj.Height;
                if (pLayerGuid == CITYPLAN_config.constant.g_boxLayerGuid) {
                    volume.height = obj.height;
                    volume.FillColor = obj.StyleInfoList.Item(0).FillColor;
                }
                volume.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    volume.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                volume.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                volume.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(volume);
                break;
            case 5:   // SEObjectType.PolygonObject
                var polygon = earthCopy.Factory.CreateElementPolygon(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();
                polygon.BeginUpdate();
                polygon.SetExteriorRing(obj.SphericalVectors.Items(0));
                polygon.AltitudeType = 1;   // SEAltitudeType.ClampToTerrain
                polygon.FillStyle.FillColor = obj.StyleInfoList.Items(0).SecondColor;
                polygon.LineStyle.LineColor = obj.StyleInfoList.Items(0).FirstColor;
                polygon.LineStyle.LineWidth = obj.StyleInfoList.Items(0).LineWidth;
                polygon.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    polygon.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                polygon.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                polygon.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(polygon);
                break;
            case 4:   // SEObjectType.PolylineObject
                var line = earthCopy.Factory.CreateElementLine(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();

                line.BeginUpdate();
                line.SetPointArray(obj.SphericalVectors.Items(0));
                line.AltitudeType = 1;   // SEAltitudeType.ClampToTerrain
                line.LineStyle.LineColor = obj.StyleInfoList.Items(0).FirstColor;// 道路红线默认为红色
                line.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    line.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                line.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                line.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(line);
                break;
            case 8:    // SEObjectType.SimpleBuildingObject
                var building = earthCopy.Factory.CreateSimpleBuilding(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();

                building.BeginUpdate();
                newPolygon = earthCopy.Factory.CreatePolygon();
                newPolygon.AddRing(obj.SphericalVectors.Items(0));
                building.SetPolygon(1, newPolygon); 
                building.SetFloorsHeight(obj.height);
                building.SetFloorHeight(2.8);
                building.SetRoofType(1);
                var BuildingMaterial = building.GetFloorsMaterialStyles();
                BuildingMaterial.Items(0).DiffuseTexture = "";
                BuildingMaterial.Items(1).DiffuseTexture = "";

                for (var j = 2; j < BuildingMaterial.Count; ++j) {
                    BuildingMaterial.Items(j).DiffuseTexture = "";
                }
                building.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    building.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                building.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                building.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(building);
                break;
            default:
                break;
        }
    }
    m_editLayer.EndUpdate();
    m_editLayer.Editable = false;
    earthCopy.DatabaseManager.UpdateLayerLonLatRect(CITYPLAN_config.server.dataServerIP,pLayerGuid, m_editLayer.LonLatRect, m_editLayer.MaxHeight);

    //隐藏现状图层
    if(databaseLayer.Guid == XZLayerGuid){
        // alert("大概大概");
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 加载数据库图层
 */
function getEditLayerListLoaded() {
    currentLayerDatas = [];
    currentLayerIdList=[];
    currentLayerIdListTemp = {};
    projectLayerIdList=[];
    otherLayerIdList=[];
    databaseLayersArr=[];
    databaseLayers={};
    currentLayerObjs = [];
    // editLayers = {};
  earth.Event.OnEditDatabaseFinished = function (pRes,pFeature) {   // pFeature的类型为ISEDatabaseLayer
    
        isLoadCurrentLayers = true;
	var layer = null;
         earth.Event.OnEditDatabaseFinished = function () {
        };
        for (var i = 0; i < pFeature.GetChildCount(); i++) {
            layer = pFeature.GetChildAt(i);   // ISEDatabaseLayer


            if (layer.GroupID == -3) {//现状相关的图层
                var data = {
                    "id": layer.Guid,
                    "pId": 2,
                    "name": layer.Name,
                    "checked": true,
                    "type": "OLD01"
                };
                //currentLayerObjs.push(layer);
                currentLayerDatas.push(data);
                currentLayerIdList.push(layer.Guid);
                currentLayerIdListTemp[layer.Guid] = layer;
            } else if (layer.GroupID == -2) {//项目相关的图层
                projectLayerIdList.push(layer.Guid);
            } else {
                otherLayerIdList.push(layer.Guid);
            }
            databaseLayers[layer.Guid] = layer;
            databaseLayersArr.push(layer);
        }
	 if(isLoadCurrentLayers){
            loadCurrentLayers();  //cy:加载现状数据 ，放到地球上
        }
         
    };
   // earth.LayerManager.ApplyEditLayerList();
      earth.DatabaseManager.GetAllLayer(CITYPLAN_config.server.dataServerIP);

}
function applyDataBaseRecords(bShow, layerIds, isCreated) {

    var ids = databaseLayersArr;

    if (ids.length) {
        for (var i = 0; i < ids.length; i++) {
            var layer = ids[i];
            var layerId = layer.Guid;
            if($.isArray(layerIds)){

                if ($.inArray(layerId, layerIds) === -1) {   //layer.LayerType == 9 表示数据库水面图层类型
                  earth.event.OnEditDatabaseFinished = function(pRes,pFeat){
                        var pLayerGuid = pRes.LayerGuid;
                        if(pRes.ExcuteType == 43){
                            onDatabaseListLoaded(pLayerGuid,pFeat,bShow);
                        }else if(pRes.ExcuteType == 47){
                            onElementListLoaded(pLayerGuid,pFeat,bShow);
                        }
                    };
                    if (layer.LayerType == 1 || layer.LayerType == 2 || layer.LayerType == 3 || layer.LayerType == 11 || layer.LayerType == 9) { // ModelObject,BillBoardObject,MatchModelObject
                        /*
                        earth.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onDatabaseListLoaded(pLayerGuid, pFeat, bShow);
                        }
                        */
                        // layer.ApplyDataBaseRecords();
                        earth.DatabaseManager.GetDataBaseRecords(CITYPLAN_config.server.dataServerIP,layer.Guid);
                    } else {
                        /*
                        earth.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onElementListLoaded(pLayerGuid, pFeat, bShow);
                        }
                        */
                        // layer.ApplyElementRecords(layer.LayerType);
                        earth.DatabaseManager.GetElements(CITYPLAN_config.server.dataServerIP,layer.Guid,layer.LayerType);
                    }
                }
            }else{
                if(layerId==layerIds){
                       earth.event.OnEditDatabaseFinished = function(pRes,pFeat){
                        var pLayerGuid = pRes.LayerGuid;
                        if(pRes.ExcuteType == 43){
                            onDatabaseListLoaded(pLayerGuid,pFeat,bShow);
                        }else if(pRes.ExcuteType == 47){
                            onElementListLoaded(pLayerGuid,pFeat,bShow);
                            if(parcelLayerGuid2 == pLayerGuid || isCreated){
                                //抠掉现状图层
                                projManager.showCurrentLayers(false, currentPrjGuid, pLayerGuid);
                                //alert(currentPrjGuid + " " + pLayerGuid);
                            }
                        }
                    };
                    if (layer.LayerType == 1 || layer.LayerType == 2 || layer.LayerType == 3 || layer.LayerType == 11 || layer.LayerType == 9) { // ModelObject,BillBoardObject,MatchModelObject
                        /*
                        earth.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onDatabaseListLoaded(pLayerGuid, pFeat, bShow);
                        }
                        */
                        // layer.ApplyDataBaseRecords();
                        earth.DatabaseManager.GetDataBaseRecords(CITYPLAN_config.server.dataServerIP,layer.Guid);
                    } else {
                        /*
                        earth.Event.OnEditDatabaseFinished = function (pRes, pFeat) {
                            var pLayerGuid = pRes.LayerGuid;
                            onElementListLoaded(pLayerGuid, pFeat, bShow);
                            if(parcelLayerGuid2 == pLayerGuid || isCreated){
                                //抠掉现状图层
                                projManager.showCurrentLayers(false, currentPrjGuid, pLayerGuid);
                                //alert(currentPrjGuid + " " + pLayerGuid);
                            }
                        }
                        */
                        // layer.ApplyElementRecords(layer.LayerType);
                        earth.DatabaseManager.GetElements(CITYPLAN_config.server.dataServerIP,layer.Guid,layer.LayerType);
                                       }
                }
            }
        }
    }
}
function onDatabaseListLoaded(pLayerGuid, pFeat, bShow) {
    var databaseLayer = databaseLayers[pLayerGuid];
    if (!databaseLayer || null == pFeat) {
        return;
    }
    // var m_editLayer = earth.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5);    // m_databaseLayer.MaxVisibleHeight);
    var m_editLayer = earth.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5, CITYPLAN_config.server.dataServerIP);
    editLayers[databaseLayer.Guid] = m_editLayer;
    //m_editLayer.IsIllumination = databaseLayer.IsIllumination;
    m_editLayer.DataLayerType = databaseLayer.LayerType;
    m_editLayer.Visibility = bShow;
    m_editLayer.Editable = true;
    earth.AttachObject(m_editLayer);
    //现状图层 在分析中使用(通视,视域与阴影分析)
    if(databaseLayer.GroupID == -3){
        currentLayerObjs.push(m_editLayer);
    }

    m_editLayer.BeginUpdate();
    // 只有建筑模型参与分析（LineSight、ViewShed和Shinning），其他类型不参与
    if (databaseLayer.LayerType == 1){
        m_editLayer.Analyzable = true;
    }else{
        m_editLayer.Analyzable = false;
    }
    for (var i = 0; i < pFeat.Count; i++) {
        var obj = pFeat.Items(i);
        if (!obj) {
            continue;
        }

        //var editmodel = earth.Factory.CreateEditModel(obj.Guid, obj.Name);
        //var editmodel = earth.Factory.CreateEditModelByDatabase(obj.Guid, obj.Name, obj.MeshID, 1);
        //注意这里的图层类型(最后一个参数) 否则树模型就不跟着视点选择了 ModelObject = 1,BillBoardObject = 2,，，，等类型 2014-06-12
        var editmodel = earth.Factory.CreateEditModelByDatabase(obj.Guid, obj.Name, obj.MeshID, databaseLayer.LayerType);
        editmodel.BeginUpdate();
//            editmodel.MeshID = obj.MeshID;
//            editmodel.BlockID = obj.BlockID;
        editmodel.SetBBox(obj.BBox.MinVec, obj.BBox.MaxVec);
        editmodel.SphericalTransform.SetLocation(obj.SphericalTransform.GetLocation());
        editmodel.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
        editmodel.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
        editmodel.Editable = true;
        editmodel.Selectable = true;
        editmodel.EndUpdate();

        m_editLayer.AttachObject(editmodel);
    }
    m_editLayer.EndUpdate();
    m_editLayer.Editable = false;
    // m_editLayer.Editable = true;
    m_editLayer.Selectable = true;

    earth.DatabaseManager.UpdateLayerLonLatRect(CITYPLAN_config.server.dataServerIP,pLayerGuid, m_editLayer.LonLatRect, m_editLayer.MaxHeight);

    //当现状图层加载完毕 并且规划用地图层也加载完毕 再派发事件到项目管理页面 进行是否扣除现状图层的逻辑
    var isAll = true;
    // if(parcelLayerGuid2 && parcelLayerGuid2 == databaseLayer.Guid){
    //     isAll = true;
    // }else{
    //     isAll = false;
    //     return;
    // }
    for(var j = 0; j < currentLayerIdList.length; j++){
        if(!editLayers[currentLayerIdList[j]]){
            isAll = false;
        }
    }


    if(isAll && !isInit){
        // alert("dsag");
        //派发事件 或 直接在此处启动项目管理界面
        setFunEnabled();
        $("#fixediframe").attr("src", "html/investigate/projectManagement2.html");
        isInit = true;
    }

};
function onElementListLoaded(pLayerGuid, pFeat, bShow) {
    var databaseLayer = databaseLayers[pLayerGuid];
    if (!databaseLayer || null == pFeat) {
        return;
    }
    // var m_editLayer = earth.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5);    // m_databaseLayer.MaxVisibleHeight);
    var m_editLayer = earth.Factory.CreateEditLayer(databaseLayer.Guid, databaseLayer.Name, databaseLayer.LonLatRect, 0, 4.5, CITYPLAN_config.server.dataServerIP);
    editLayers[databaseLayer.Guid] = m_editLayer;

    m_editLayer.DataLayerType = databaseLayer.LayerType;
    m_editLayer.Visibility = bShow;
    m_editLayer.Editable = true;
    //m_editLayer.LayerIsPrior = false;
    earth.AttachObject(m_editLayer);

    m_editLayer.BeginUpdate();
    var vect3 = null, newPolygon = null;
    for (var i = 0; i < pFeat.Count; i++) {
        var obj = pFeat.Items(i);
        if (null == obj || obj.SphericalVectors.Count <= 0) {
            continue;
        }

        switch (databaseLayer.LayerType) {
            case 6:   // SEObjectType.ElementBoxObject
                break;
            case 7:   // SEObjectType.ElementVolumeObject
                var volume = earth.Factory.CreateElementVolume(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();

                volume.BeginUpdate();
                newPolygon = earth.Factory.CreatePolygon();
                newPolygon.AddRing(obj.SphericalVectors.Items(0));
                volume.SetPolygon(1, newPolygon);   // SECoordinateUnit.Degree
                volume.height = obj.Height;
                //volume.height = 0.2;
                if (pLayerGuid == CITYPLAN_config.constant.g_boxLayerGuid) {
                    volume.height = obj.height;
                    volume.FillColor = obj.StyleInfoList.Item(0).FillColor;
                }
                volume.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    volume.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                volume.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                volume.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(volume);
                break;
            case 5:   // SEObjectType.PolygonObject
                var polygon = earth.Factory.CreateElementPolygon(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();
                polygon.BeginUpdate();
                polygon.SetExteriorRing(obj.SphericalVectors.Items(0));
                polygon.AltitudeType = 1;   // SEAltitudeType.ClampToTerrain
                polygon.FillStyle.FillColor = obj.StyleInfoList.Items(0).SecondColor;
                polygon.LineStyle.LineColor = obj.StyleInfoList.Items(0).FirstColor;
                polygon.LineStyle.LineWidth = obj.StyleInfoList.Items(0).LineWidth;
                polygon.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    polygon.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);

                }
                polygon.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                polygon.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(polygon);
                ploygonLayersVcts3[databaseLayer.Guid] = polygon.GetExteriorRing();//保存规划用的的范围，控制现状的显示。隐藏
                //if(pLayerGuid==parcelId){
                //    parcelPloygonVcts3 =
                //  }
//                    polygon.SetParentNode(m_editLayer);
                break;
            case 4:   // SEObjectType.PolylineObject
                var line = earth.Factory.CreateElementLine(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();

                line.BeginUpdate();
                line.SetPointArray(obj.SphericalVectors.Items(0));
                line.AltitudeType = 1;   // SEAltitudeType.ClampToTerrain
                line.LineStyle.LineColor = obj.StyleInfoList.Items(0).FirstColor;// 道路红线默认为红色
                line.EndUpdate();
                if (projManager.IsValid(vect3)) {
                    line.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                line.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                line.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(line);
//                    line.SetParentNode(m_editLayer);
                break;
            case 8:    // SEObjectType.SimpleBuildingObject
                var building = earth.Factory.CreateSimpleBuilding(obj.Guid, obj.Name);
                vect3 = obj.SphericalTransform.GetLocation();

                building.BeginUpdate();
                newPolygon = earth.Factory.CreatePolygon();
                newPolygon.AddRing(obj.SphericalVectors.Items(0));
                //newPolygon.AddRing(obj.SphericalVectors);
                building.SetPolygon(1, newPolygon);   // SECoordinateUnit.Degree
                building.SetFloorsHeight(obj.height);
                building.SetFloorHeight(2.8);
//                    building.SetParentNode(m_editLayer);
                // todo 屋顶设置有问题
                //building.SetRoofType(obj.RoofType);// 屋顶
                building.SetRoofType(1);
                // 贴材质
                var BuildingMaterial = building.GetFloorsMaterialStyles();
                BuildingMaterial.Items(0).DiffuseTexture = "";
                BuildingMaterial.Items(1).DiffuseTexture = "";

                for (var j = 2; j < BuildingMaterial.Count; ++j) {
                    BuildingMaterial.Items(j).DiffuseTexture = "";
                }
                building.EndUpdate();
                // SetLocationEx方法调用必须放在EndUpdate函数之后
                if (projManager.IsValid(vect3)) {
                    building.SphericalTransform.SetLocationEx(vect3.X, vect3.Y, vect3.Z);
                }
                building.SphericalTransform.SetRotation(obj.SphericalTransform.GetRotation());
                building.SphericalTransform.SetScale(obj.SphericalTransform.GetScale());
                m_editLayer.AttachObject(building);
                break;
            default:
                break;
        }
    }

    m_editLayer.EndUpdate();
    m_editLayer.Editable = false;
     earth.DatabaseManager.UpdateLayerLonLatRect(CITYPLAN_config.server.dataServerIP,pLayerGuid, m_editLayer.LonLatRect, m_editLayer.MaxHeight);

  //当现状图层加载完毕 并且规划用地图层也加载完毕 再派发事件到项目管理页面 进行是否扣除现状图层的逻辑
    var isAll = true;
    // if(parcelLayerGuid2 && parcelLayerGuid2 == databaseLayer.Guid){
    //     isAll = true;
    // }else{
    //     isAll = false;
    //     return;
    // }
    for(var j = 0; j < currentLayerIdList.length; j++){
        if(!editLayers[currentLayerIdList[j]]){
            isAll = false;
        }
    }
    if(isAll){
         //派发事件 或 直接在此处启动项目管理界面
        // setFunEnabled();                                                       
        // $("#prjIframe").attr("src", "html/investigate/projectManagement.html?earth="+earth);
    }
}
//加载现状模型
function loadCurrentLayers(){
 if(isLoadCurrentLayers){
    if(currentLayerIdList.length){
        for(var i=0;i<currentLayerIdList.length;i++){
            var currLayer=currentLayerIdList[i];

            applyDataBaseRecords(true,currLayer);
        }
  }
        isLoadCurrentLayers = false;
    }
}
/**
 * @param bShow
 * @param id
 */
var setBtnDisabled=function(bShow,id){


    $(id).attr("disabled", bShow);
    var imagepath=  $(id).find("img").attr("src")   ;
    if(!imagepath)  {return;}
    var pos=imagepath.lastIndexOf('/');
    var imagename= imagepath.substring(pos+1);
    var imagepath1=imagepath.substring(0,pos+1);

    if(bShow)
    {
        if(imagename.substring(0,5)=="undo_")
        {return;}
        $(id).find("img").attr("src",imagepath1+"undo_"+imagename);//控高分析不可见
    }
    else
    {     if(imagename.substring(0,5)=="undo_")
       {
           $(id).find("img").attr("src",imagepath1+imagename.substring(5));//控高分析可见
       }

    }
}
setBtnDisabled(true,"#SchemeindexInfoDIV");//指标查看不可见
setBtnDisabled(true,"#indexInvestigateDIV");//指标比对不可见
setBtnDisabled(true,"#heightControlDIV");//控高分析不可见
setBtnDisabled(true,"#roadDistanceDIV");//红线分析不可见
setBtnDisabled(true,"#planCompare");//方案比对不可见
setBtnDisabled(true,"#buildingAttributeDIV");//建筑属性不可见
setBtnDisabled(true,"#attachmentTag");//附件查看不可见



//setBtnDisabled(true,"#selectDIV");//选择不可见
//setBtnDisabled(true,"#moveDIV");//移动不可见
//setBtnDisabled(true,"#rotateDIV");//旋转不可见
//setBtnDisabled(true,"#scaleDIV");//缩放不可见
//setBtnDisabled(true,"#alignGoruntDIV");//贴地不可见
//setBtnDisabled(true,"#removeDIV");//删除不可见
//setBtnDisabled(true,"#textureDIV");//纹理替换不可见
/**
 * 清除所有已经创建的editlayer
 */
var removeEditLayers = function () {
    /*var id, editLayer, i, count, obj;
     for (id in editLayers) {
     if (editLayers.hasOwnProperty(id)) {
     editLayer = editLayers[id];
     if (editLayer != null) {
     earth.DetachObject(editLayer);
     }
     }
     }
     editLayers = {};   // 清空editLayers*/
};
/**
 * 控制图层的显示隐藏
 */
function showHideEditLayer(bShow, layerIds) {
    if (projectLayerIdList && projectLayerIdList.length > 0) {
        for (var i = 0; i < projectLayerIdList.length; i++) {
            var layerId = projectLayerIdList[i];
            if ($.inArray(layerId, layerIds) === -1) {   // 不在数组中才返回-1
                if (editLayers[layerId]) {
                    editLayers[layerId].Visibility = bShow;
                }
            }
        }
    }
}
/**
 *图层可见性控制
 * @param bShow
 */
function initEditLayerEditable(bShow) {
    if (projectLayerIdList && projectLayerIdList.length > 0) {
        for (var i = 0; i < projectLayerIdList.length; i++) {
            var layerId = projectLayerIdList[i];
            if (editLayers[layerId]) {
                editLayers[layerId].Editable = bShow;
            }
        }
    }
}
/**
// * 初始化审批项目树  // cy:初始化应用图层树
 */
function initProjectTree() {
    var currentProjectGuid;
    SYSTEMPARAMS =  getSystemConfig();
    if(SYSTEMPARAMS.project != ""){
        currentProjectGuid = SYSTEMPARAMS.project;
        currentPrjGuid = currentProjectGuid;
        initTree(SYSTEMPARAMS.project);
        initMapMgr(true);
        hideXZLLSJLayers();//隐藏当前工程的浏览数据
    }
}
//function initCurrentProject() {
  //  var currentProjectGuid;
  //  SYSTEMPARAMS =  getSystemConfig();
  //  if(SYSTEMPARAMS.project != ""){
 //       currentProjectGuid = SYSTEMPARAMS.project;
 //       currentPrjGuid = currentProjectGuid;

//    }
//}


//function GetApproveProGuid() {
//         debugger;
//  var   approveProIdList = [];
//    var projectIds = projManager.loadApproveXML();
//    if (!projectIds) {
//        return;
//    }
//    if (typeof(projectIds) == "string") {
//        approveProIdList.push(projectIds);
//        currentApproveProjectGuid = projectIds;
//    }
//
//
//
//
//
//}



function initTree(prjGuid){
    var setting = {
        check: {
            enable: true, //是否显示checkbox或radio
            chkStyle: "checkbox" //显示类型,可设置(checbox,radio)
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        view: {
            dblClickExpand: false, //双击节点时，是否自动展开父节点的标识
            expandSpeed: "", //节点展开、折叠时的动画速度, 可设置("","slow", "normal", or "fast")
            selectedMulti: false //设置是否允许同时选中多个节点
        },
        callback: {
            onDblClick: function (event, treeId, node) {
                if (node && node.id) {
                    var layer = earth.LayerManager.GetLayerByGUID(node.id);
                    if (layer && layer.LayerType) {
                        layerManager.flyToLayer(layer); //定位图层
                    }
                }
            },
            onCheck: function (event, treeId, node) {
                var layer = earth.LayerManager.GetLayerByGUID(node.id);
                layer.Visibility = node.checked;
            }
        }
    };
    var layer = earth.LayerManager.GetLayerByGUID(prjGuid);
    link2D = layer.ProjectSetting.MapServer;
    //alert(link2D);
    if(link2D){
        $("#ViewScreen2D").removeAttr("disabled");
        $("#ViewScreen2DLink").removeAttr("disabled");
    } else{
        $("#ViewScreen2D").attr("disabled","disabled");
        $("#ViewScreen2DLink").attr("disabled","disabled");
    }
 //cy20150508
     vectLayers = [];
    ctrPlanLayer = [];
    ParceLayer = [];
    indicatorAccountingLayer = [];
    removeAnalysisLayer = [];
    greenbeltAnalysisLayer = [];
    surroundingLayer =[];
    var treeData = [];
    treeData.push({id: layer.Guid, pId: 0, name: layer.Name, open: true, nocheck: false, type: "currentproject"});

    layerManager.getCurrentProjectLayerData(treeData, layer, layer.Guid);
     return treeData;
  //  $.fn.zTree.init($("#planTree"), setting, treeData);
};

function initSystemConfig(id){
    var configXml = '<xml>';
    if(id){
        configXml = configXml + '<Ip>'+CITYPLAN_config.server.ip+'</Ip>'; //ip
        configXml = configXml + '<Project>'+id+'</Project>'; //project
        configXml = configXml + '<Position></Position>';
    }else{
        configXml = configXml + '<Ip></Ip>'; //ip
        configXml = configXml + '<Project></Project>'; //project
        configXml = configXml + '<Position></Position>';
    }
    configXml = configXml + '</xml>';
    return configXml;
};
function setSystemConfig(systemData){
    var rootPath = earth.Environment.RootPath + "temp\\SystemConfig";
    var configPath = rootPath + ".xml";
    var configXml = earth.UserDocument.LoadXmlFile(configPath);
    var systemDoc = loadXMLStr(configXml);
    var root = systemDoc.documentElement;
    (root.getElementsByTagName("Project")[0]).text = systemData.project;
    (root.getElementsByTagName("Ip")[0]).text = CITYPLAN_config.server.ip;
    earth.UserDocument.SaveXmlFile(rootPath,systemDoc.xml);
};
function getSystemConfig(){
    var rootPath = earth.Environment.RootPath + "temp\\SystemConfig";
    var configPath = rootPath + ".xml";
    var configXml = earth.UserDocument.LoadXmlFile(configPath);
    if(configXml === ""){
        configXml = this.initSystemConfig();
        earth.UserDocument.SaveXmlFile(rootPath,configXml);
    }else{
        PROJECTLIST = initPipePjoList();
    }
    var systemDoc = loadXMLStr(configXml);
    var systemJson=$.xml2json(systemDoc);
    if(systemJson==null){
        return false;
    }
    for(var key in systemJson){ //如果不是最新格式xml，删掉  写入最新格式xml
        if(key != "Ip" && key != "Project" && key != "Position" ){
            earth.UserDocument.DeleteXmlFile(configPath);
            configXml = this.initSystemConfig();
            earth.UserDocument.SaveXmlFile(rootPath,configXml);
            systemDoc = loadXMLStr(configXml);
            systemJson=$.xml2json(systemDoc);
        }else if(systemJson.Ip != CITYPLAN_config.server.ip){
            earth.UserDocument.DeleteXmlFile(configPath);
            configXml = this.initSystemConfig();
            earth.UserDocument.SaveXmlFile(rootPath,configXml);
            systemDoc = loadXMLStr(configXml);
            systemJson=$.xml2json(systemDoc);
        }
    }
    var tempLayer;
    if(systemJson.Project){
        tempLayer = earth.LayerManager.GetLayerByGUID(systemJson.Project);
    }
    if(!tempLayer || systemJson.Project===""||systemJson.Project===null||systemJson.Project==="undefined"){ //如果工程不存在，默认选第一个
        var pipeProjArr = initPipePjoList();
        PROJECTLIST = pipeProjArr;
       if(pipeProjArr.length>0){
           var obj = {
                ip:CITYPLAN_config.server.ip,
                project:pipeProjArr[0].id
            };
           earth.UserDocument.DeleteXmlFile(configPath);
           var newXml=this.initSystemConfig(pipeProjArr[0].id) ;
           earth.UserDocument.SaveXmlFile(rootPath,newXml);

           systemDoc = loadXMLStr(newXml);
           systemJson=$.xml2json(systemDoc);
        }
    }
    //////////////////////////////////////////////////////////
    //IE9 不支持selectSingleNode
    //////////////////////////////////////////////////////////
    /*var root = systemDoc.documentElement;*/
    var systemData = {};
    systemData.project =systemJson.Project;
    currentPrjGuid = systemJson.Project;
    return systemData;
};

function initPipePjoList(){
    //PROJECTLIST = [];
    var pipeProjectList = [];
    var rootLayerList = earth.LayerManager.LayerList;
    var projectCount = rootLayerList.GetChildCount();
    for (var i = 0; i < projectCount; i++) {
        var childLayer = rootLayerList.GetChildAt(i);
        var layerType = childLayer.LayerType;
        if (layerType === "Project") {  //17
            var projectId = childLayer.Guid;
            var projectName = childLayer.Name;
            //PROJECTLIST.push({'id':projectId, 'name':projectName, 'server':childLayer.GISServer, 'pltype':childLayer.PipeLineType}) ;
            var chlildrenCount = childLayer.GetChildCount();
            var pipeTag = false;
            for (var x = 0; x < chlildrenCount; x++) {
                var pipechildLayer = childLayer.GetChildAt(x);
                var pipelayerType = pipechildLayer.LayerType;
                if (pipelayerType === "Pipeline") {
                    pipeTag = true;
                }
                if (pipelayerType === "Folder") {
                    var threeLayerCount = pipechildLayer.GetChildCount();
                    for (var s = 0; s < threeLayerCount; s++) {
                        var threechildLayer = pipechildLayer.GetChildAt(s);
                        var threepipelayerType = threechildLayer.LayerType;
                        if (threepipelayerType === "Pipeline") {
                            pipeTag = true;
                        }
                    }
                }
            }
            if (pipeTag) {
                pipeProjectList.push({id: projectId, name: projectName});
            }
        }
    }
    return pipeProjectList;
};

/**
 * 定位到保存的默认视点位置
 */
function initPosition() {
    var xml = earth.UserDocument.LoadXmlFile(earth.Environment.RootPath + CITYPLAN_config.constant.StartupPositionPath + ".xml");
    if (xml) {
        var pos = $.xml2json(xml);
        if (pos && pos["position"]) {
            pos = eval('(' + pos["position"] + ')');
            earth.GlobeObserver.GotoLookat(pos.Lon, pos.Lat, pos.Lat, pos.Heading, pos.Pitch, pos.Roll, pos.Range);
        }
    }
//    var centerX = 121.66447902272362;
//    var centerY = 31.14292053030718;
//    var width = 0.011943260715634451;
//    var range = width / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);
//    earth.GlobeObserver.GotoLookat(centerX, centerY, 0, 0, 70, 0, range);
//

}
/**
 * 保存当前位置到XML文件
 */
function savePosition() {
    // <xml><position>{"Lon":124.35859262113378,"Lat":43.15853161377651,"Alt":444.017236779473,
    // "Heading":340.81310029546904,"Pitch":47.89326780699343,"Roll":0,"Range":368.2009209488024}</position></xml>
  if(earth && earth.GlobeObserver){
    var targetPose = earth.GlobeObserver.TargetPose;
    var pose = earth.GlobeObserver.Pose;
    var xml = '<xml><position>{"Lon":' + targetPose.Longitude + ',"Lat":' + targetPose.Latitude + ',"Alt":' + targetPose.Altitude + ',';
    xml += '"Heading":' + pose.Heading + ',"Pitch":' + pose.Tilt + ',"Roll":0,"Range":' + pose.Range + '}</position></xml>';
    var xmlPath = earth.Environment.RootPath + CITYPLAN_config.constant.StartupPositionPath;

    earth.UserDocument.SaveXmlFile(xmlPath, xml);
}
}

$(window).unload(function () {
    savePosition();
    //projManager.cancelApproveProject();
});
// endregion

// region 书签控制
/**
 * 获取基础图层树中所有被选中的叶子节点的ID数组
 * @return {Array}
 */
function getVisibleLeafLayerIds() {
    var res = [];
    var tree = $.fn.zTree.getZTreeObj("layerTree");
    var nodes = tree.getCheckedNodes(true);
    $.each(nodes, function (i, node) {
        if (!node.children) {
            res.push(node.id);
        }
    });
    return res;
}
/**
 * 仅显示传入的图层ID数组对应的图层
 * 方法：先关闭所有图层，然后去显示指定的图层
 * 图层树表现：先将所有的节点全都不勾选，然后去勾选显示图层的节点
 * @param layerIds 图层ID数组
 */
function checkLayerByIds(layerIds) {
    var node = null;
    var tree = $.fn.zTree.getZTreeObj("layerTree");
    tree.checkAllNodes(false);
    earth.LayerManager.LayerList.Visibility = false;
    for (var i = 0; i < layerIds.length; i++) {
        node = tree.getNodeByParam("id", layerIds[i]);
        if (node) {
            tree.checkNode(node, true, true, true);
        }
    }
}
// endregion

// region 场景
/**
 * 显示模式切换
 * @param n
 */
function setMode(n) {
    switch (n) {
        case 1:  // 现状模式
            checkLayer(CITYPLAN_config.constant.PlanId, false);
            checkLayer(CITYPLAN_config.constant.MixedId, false);
            checkLayer(CITYPLAN_config.constant.PresentId, true);
            break;
        case 2:  // 规划模式
            checkLayer(CITYPLAN_config.constant.PresentId, false);
            checkLayer(CITYPLAN_config.constant.MixedId, false);
            checkLayer(CITYPLAN_config.constant.PlanId, true);
            break;
        case 3:  // 混合模式
            checkLayer(CITYPLAN_config.constant.PresentId, false);
            checkLayer(CITYPLAN_config.constant.PlanId, false);
            checkLayer(CITYPLAN_config.constant.MixedId, true);
            break;
    }
}
function checkLayer(id, bCheck) {
    var layer = earth.LayerManager.GetLayerByGUID(id);
    var tree = $.fn.zTree.getZTreeObj("layerTree");
    var treeNode = tree.getNodeByParam("id", id);
    if (layer) {
        layer.Visibility = bCheck;
        if (treeNode) {
            tree.checkNode(treeNode, bCheck, true, true);
        }
    }
}
// // 热点定位
//$("#heatViewPoint").click(function (){
//    showLargeDialog('html/scene/viewpoint.html', '热点定位');
//});
//// 方案视点
//$("#planViewPoint").click(function (){
 // var eventObj = $("div[id='planViewPoint']");
 //   if(eventObj.attr("disabled") == "disabled"){
 //       return;
 //   }
//    showLargeDialog('html/investigate/viewpoint.html', '方案视点');
//});
// // 路径
//$("#mTrack").click(function (){
//    showLargeDialog('html/scene/track.html', '路径');
//});
//// 漫游
//$("#roam").click(function (){
//    showLargeDialog('html/scene/dynamicObj.html', '漫游');
//});
//// 环绕
//$("#surround").click(function (){
//    earth.GlobeObserver.SurroundControlEx(1);
//});
//// 动画录制
//$("#mAnimation").click(function (){
//    showLargeDialog('html/scene/animation.html', '动画录制');
//});
//

//
//$("#ViewScreen2D").click(function(){
//    screen2DClick();//二维鹰眼
//});
//$("#ViewScreen2DLink").click(function(){
//    screen2DLinkClick();
//});
//// 太阳
//$("#sun").click(function (){
//    tranSettingClick("sun");
//});
//// 雨
//$("#mRain").click(function (){
//    tranSettingClick("rain");
//});
//// 雪
//$("#snow").click(function (){
//    tranSettingClick("snow");
//});
// 雾  export
$("#fog").click(function (){
    tranSettingClick("fog");
});
//
//// 雾  export
//$("#ViewSystemSetting").click(function (){
//     systemSettingClick();
//});
//  //导入bim
//function importUSB4(){
//
//    var analysis = CITYPLAN.Analysis(earth);
// //   analysis.showMoveHtml($(this).attr("id"));
//
//    analysis.showMoveHtml("importUSB4" );
//}
//
//function BimQueryPropertyClick (){
//
//      GeneralQuery.propertyQuery_BIM();
//
//
//}   ;

// 控高分析
function     heightControlDIV_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#heightControlDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/analysis/heightControl.html', '控高分析');
};
// 红线分析
function     roadDistanceDIV_Click(){
    var eventObj = $("#roadDistanceDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/analysis/roadDistance.html', '红线分析');
};
// 方案比选
function   planCompare_click(){
    var eventObj = $("#planCompare");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/investigate/comparison.html', '方案比选');
};

  //建筑属性查看
function     buildingAttributeDIV_Click(){
    var eventObj = $("#buildingAttributeDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    searchAnaly.buildingData('s');
};



// 方案指标查看
  function    SchemeindexInfoDIV_Click(){

    var eventObj = $("#SchemeindexInfoDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
      var node=currentSelectedNode;       //当前选中的审批树中的节点
      if(node){
//          var param=null,url=null,sFeatures='dialogWidth=600px;dialogHeight=350px;status=no';
          if(node.type=="PLAN"){
             var planId  =node.id;
              searchAnaly.IndexplanData(planId);
          }
          }
//              param={earth:earth,nodeId:node.id};
//              url='html/investigate/indexPlan.html';
//          }else if(node.type == "PARCEL") {//规划用地
//              param={earth:earth,nodeId:node.projectId,type:"PARCEL"};
//              url='html/investigate/indexSubject.html';
//          }else if (node.type == "ROADLINE") {//道路红线
//              param={earth:earth,nodeId:node.projectId,type:"ROADLINE"};
//              url='html/investigate/indexSubject.html';
//          }


};


// 规划指标查
function     PlanindexInfoDIV_Click(){

    var eventObj = $("#PlanindexInfoDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
   var prjid= parent.currentApproveProjectGuid ;  //当前审批项目

    if(prjid){


            searchAnaly.ProjectIndexData(prjid);

    }

};



// 总评图查看
function planCheckTag_Click(){
    var eventObj = $("#planCheckTag");

    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    attachment.planCheck();
};

// 附件查看
function attachmentTag_Click(){
    var eventObj = $("#attachmentTag");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    attachment.attachmentLook();
};
// 指标比对
function indexInvestigateDIV_Click(){
    var eventObj = $("#indexInvestigateDIV");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    var node=currentSelectedNode;
    if(node){
        if(node.type=="PLAN"){
            var planId  =node.id;
           var prjid=node.projectId
            searchAnaly.indexInvestigate(prjid,planId);
        }
    }
};

function   PartQueryPropertyClick () {

    GeneralQuery.propertyQuery_Part();
}  ;




// 视域分析
function     mViewshed_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#mViewshed");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/analysis/viewshed.html', '视域分析');
};

// 视野分析
function     shiyefenxi_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#shiyefenxi");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/analysis/pointview.html', '视野分析');
};

  //阴影分析
function     yinyingfenxi_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#yinyingfenxi");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/analysis/shinning.html', '阴影分析');
};

//视频监控   (弹出视频网页)
function     shipinjiankong_Click(){
    var eventObj = $("#shipinjiankong");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/search/shexiangtouSearch_pt.html', '视频监控');
};
//视频监控2     (视频放入三维场景)
function     shipinjiankong2_Click(){
    var eventObj = $("#shipinjiankong2");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/search/shexiangtouSearch3_pt.html', '视频监控');
};

//规划信息图
function     ctrPlanInfo_Click(){
    var eventObj = $("#ctrPlanInfo");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/investigate/ctrPlanInfo.html', '规划信息');
};


//规划用地信息
function     ctrPlanQuery_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#ctrPlanQuery");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/investigate/ctrPlan.html', '规划用地信息');
};

// 规划绿地信息
function     greenLandAly_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#greenLandAly");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/investigate/ctrGreen.html', '规划绿地信息');
};

//规划要素信息
function     ctrPlanElement_Click(){
//$("#heightControlDIV").click(function (){


    var eventObj = $("#ctrPlanElement");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }
    showLargeDialog('html/investigate/ctrPlanElement.html', '规划要素信息');
};



































///**已看
// * 功能：“水平距离”菜单点击事件
// * 参数：无
// * 返回：无
// */
//var HorDisClick = function(){
//    parent.earth.Event.OnMeasureFinish = showMeasureResult;
//    parent.earth.Measure.MeasureHorizontalDistance();
//    measureOperCancel();
//};
//
//
//
//
//
///**已看
// * 功能：“垂直距离”菜单点击事件
// * 参数：无
// * 返回：无
// */
//var VerDisClick = function(){
//    earth.Event.OnMeasureFinish = showMeasureResult;
//    earth.Measure.MeasureHeight();
//    measureOperCancel();
//};
//
//
///**已看
// * 功能：“空间距离”菜单点击事件
// * 参数：无
// * 返回：无
// */
//var SpaceDisClick = function(){
//    earth.Event.OnMeasureFinish = showMeasureResult;
//    earth.Measure.MeasureLineLength();
//    measureOperCancel();
//};
//
//










// 功能: 1)去除字符串前后所有空格
// 2)去除字符串中所有空格(包括中间空格,需要设置第2个参数为:g)
var  is_global = "";
function  Trim  (str,g){
    var result;
    result = str.replace(/(^\s+)|(\s+$)/g,"");
    if(is_global.toLowerCase()=="g")
        result = result.replace(/\s+/g,"");
    return result;
}




//开挖
function fillAlt(){
    var eventObj = $("#fillAlt");
    if(eventObj.attr("disabled") == "disabled"){
        return;
    }

    //按钮状态
    var eventObj =   $("#fillAlt").find("img");//控高分析不可见;
//    var eventObj_btn =   $("#btn_fillAlt").find("img");//控高分析不可见;
    if(eventObj.attr("alt") ==="平整开挖"){

       var height =window.showModalDialog('html/view/fitAll.html',"","dialogWidth:300px;dialogHeight:150px;status:no;help:no");

        if(!Number(height))  {return;}
        //开挖

        beginDigLayer(height);
        eventObj.attr("alt","取消开挖");
        eventObj.attr("title","取消开挖");
        eventObj.attr("src","css/images/toolbar/cancel_tiedi.png");
//        eventObj_btn.attr("src","css/images/toolbar/cancelbtn_fillAll.png");
    }else{

        //取消开挖
        clearDigLayer();
        eventObj.attr("alt","平整开挖");
        eventObj.attr("title","平整开挖");
        eventObj.attr("src","css/images/toolbar/tiedi.png");
//        eventObj_btn.attr("src","css/images/toolbar/btn_fillAll.png");
    }
}
var m_currTempLayer;
function clearDigLayer(){
    if (m_currTempLayer != null){
        earth.DetachObject(m_currTempLayer);
    }
    earth.TerrainManager.ClearTempLayer();
};

function beginDigLayer(height){
    var vects = ploygonLayersVcts3[parcelLayerGuid2];
    //alert(vects.length + " " + currentPrjDepth);
    //先获取用地图层的点集合 然后根据 高度来重新计算 点集合  最后开挖即可 todo......
//    if(currentPrjDepth != 0){
//        initFillAlt(vects, Number(currentPrjDepth));
        if(height != 0){
            initFillAlt(vects, Number(height));
demObj = [];
        var guid = earth.Factory.CreateGuid();
     //这里最后必须要添加两个反斜杠 否则不出现效果 因为底层调用CreateDEMLayer方法追加字符并没有判断
        var tempDemPath = earth.RootPath + "temp\\terr\\terrain\\";

        var rect = earth.TerrainManager.GetTempLayerRect();
        var levelMin = earth.TerrainManager.GetTempLayerMinLevel();
        var levelMax = earth.TerrainManager.GetTempLayerMaxLevel();
 //存储键值对数据
        demObj[0] = rect;
        demObj[1] = levelMin;
        demObj[2] = levelMax;
        m_currTempLayer = earth.Factory.CreateDEMLayer(guid,
                                                    "TempTerrainLayer",
                                                    tempDemPath,
                                                    rect,
                                                    levelMin,
                                                    levelMax, 1000);
        m_currTempLayer.Visibility = true;
        earth.AttachObject(m_currTempLayer);




    }
};

function initFillAlt(m_souVet3s, currentPrjDepth){
    var vetBottom = earth.Factory.CreateVector3s();
    for (var ni = 0; ni < m_souVet3s.Count; ni++){
        var x = m_souVet3s.Items(ni).X;
        var y = m_souVet3s.Items(ni).Y;
        var z = m_souVet3s.Items(ni).Z;
        var zB = z - currentPrjDepth;
        vetBottom.Add(x, y, zB);
    }
   earth.TerrainManager.SetMinClipLevel(10);
    earth.TerrainManager.SetTargetFolder(earth.RootPath + "temp\\terr");
    earth.TerrainManager.ClipTerrainByPolygon(vetBottom, true);
    var alt = m_souVet3s.Items(0).Z - currentPrjDepth;
    earth.Analysis.SurfaceExcavationAndFill(alt, m_souVet3s);
};

/**
 * 弹出"系统设置"界面
 * @return {[type]} [description]
 */
function systemSettingClick(){
    // window.showModelessDialog("html/view/systemSettingDialog.html","a","center:no;dialogLeft:100px;dialogTop:100px;scroll:0;status:0;help:0;resizable:0;dialogWidth:500px;dialogHeight:300px"); 
    // return;
    var params = SYSTEMPARAMS;
    if(params){
        params.projectList = PROJECTLIST;
        params.earth=earth;
        params.Alt="";
        params.currentPrjGuid = currentPrjGuid;
        var url = "html/view/systemSettingDialog.html";
        var value = openDialog(url,params,300,180);
        if(value == null){
            return;
        }
        
        setSystemConfig(value);
        SYSTEMPARAMS.Alt = value.Alt;
        if(value.Alt != ""){
            //earth.Environment.AuxPlaneAltitude= value.Alt;
        }
        if(value.project != ""){
            //修改当前项目 
            var currentProjectGuid = value.project;
            currentPrjGuid = currentProjectGuid;
            currentPrjDepth = value.Alt;
            initTree(currentProjectGuid);
        }
        //alert(value.prePrjGuid + " " + currentPrjGuid);
        //同时移除基础图层树中的相关图层 并把该项目在基础图层中的数据默认不显示（勾选去掉）
    //    var tree = $.fn.zTree.getZTreeObj("layerTree");
     //   var treeNode = tree.getNodeByParam("id", currentProjectGuid);
     //   tree.checkNode(treeNode, false, true);
    //    var preTreeNode = tree.getNodeByParam("id", value.prePrjGuid);
   //     tree.checkNode(preTreeNode, true, true);
        //图层隐藏
  //      var currentLayerRoot = earth.LayerManager.GetLayerByGUID(currentPrjGuid);
  //      if(currentLayerRoot){
   //         currentLayerRoot.Visibility = false;
  //      }
    }
};
//
//function tranSettingClick(tag){
//    earth.Event.OnHtmlNavigateCompleted = function (){};
//    var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
//    var url="";
//    var dval;
//    if(tag === "sun"){
//        url = loaclUrl + "/html/scene2/sun.html";
//        dval = earth;
//    }else if(tag === "rain"){//雨
//        url = loaclUrl + "/html/scene2/rain.html";
//        dval = earth;
//    }else if(tag === "fog"){//雪
//        url = loaclUrl + "/html/scene2/fog.html";
//        dval = earth;
//    }else if(tag === "snow"){//雾
//        url = loaclUrl + "/html/scene2/snow.html";
//        dval = earth;
//    }
//    if (picturesBalloons != null){
//        picturesBalloons.DestroyObject();
//        picturesBalloons = null;
//    }
//    if (transparencyBalloons != null){
//        transparencyBalloons.DestroyObject();
//        transparencyBalloons = null;
//    }
//    // if(htmlBalloonXY!=null){
//    //     htmlBalloonXY.DestroyObject();
//    //     htmlBalloonXY=null;
//    // }
//    //如果有其他正在打开的窗口 就直接关闭
//    hideBollon();
//    if(earth.ShapeCreator){
//        earth.ShapeCreator.Clear();
//    }
//    earth.Measure.Clear();
//    earth.TerrainManager.ClearTempLayer();
//
//    transparencyBalloons = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "屏幕坐标窗体URL");
//    transparencyBalloons.SetScreenLocation(0,0);
//    transparencyBalloons.SetRectSize(320,140);
//    var color = parseInt("0xccc0c0c0");//0xccc0c0c0 //e4e4e4 //0xcc4d514a
//    transparencyBalloons.SetTailColor(color);
//    transparencyBalloons.SetIsAddCloseButton(true);
//    transparencyBalloons.SetIsAddMargin(true);
//    transparencyBalloons.SetIsAddBackgroundImage(true);
//    transparencyBalloons.SetIsTransparence(true);
//    transparencyBalloons.SetBackgroundAlpha(0);
//
//
//    transparencyBalloons.ShowNavigate(url);
//    earth.Event.OnHtmlNavigateCompleted = function (){
//        setTimeout(function(){
//            if(transparencyBalloons){
//                 transparencyBalloons.InvokeScript("setTranScroll", dval);
//            }
//        },100);
//        //earth.Event.OnHtmlNavigateCompleted = function (){};
//    };
//    earth.Event.OnHtmlBalloonFinished = function (id){
//        if (transparencyBalloons != null&&id===transparencyBalloons.Guid){
//            transparencyBalloons.DestroyObject();
//            transparencyBalloons = null;
//        }
//        earth.Event.OnHtmlBalloonFinished = function (){};
//    };
//} ;




// // 屏幕截图 pictures

var ScreenShot = function(){
    pictureHtml("mScreenShot");
};

var  showHistoryData=function(){
    showHistorySlider(true);
};


function showHistorySlider(isShow, destroy, exceptFirst){
    var i = exceptFirst ? 1 : 0;
    if(isShow){
        if(parent.earthArray && parent.earthArray.length > 0){
            for(;i < parent.earthArray.length;i++){
                seHistorySliderMgr.showSlider({
                    earth:parent.earthArray[i],
                    title:'历史',
                    visible:true
                });
            }
        }
    }else{
        if(parent.earthArray && parent.earthArray.length > 0){
            for(;i < parent.earthArray.length;i++){
                seHistorySliderMgr.showSlider({
                    earth:parent.earthArray[i],
                    visible:false,
                    destroy:destroy
                });
            }
        }
    }
}
/**
 * 功能：“二维鹰眼”菜单点击事件
 * 参数：无
 * 返回：无
 */
var screen2DClick = function(){
    var eventObj = $("div.toolbar-item[tag='ViewScreen2D']");
    if(eventObj.hasClass("selected") === false){
        eventObj.addClass("selected");
        screen2DCtrl();
    }else{
        eventObj.removeClass("selected");
        screen2DCancel();
    }
};



//slider气泡   加:20150917

function tranSettingClick(tag) {
    earth.Event.OnDocumentReadyCompleted = function() {};

    if (tag === "transparency") {
        if(lgttag==1){
            setSlidersVisible(0);
        }else{
            setSlidersVisible(1);
        }
    }
    else if (tag === "rain") {
     if (lgttag==2) {
            setSlidersVisible(0);
        }else{
            setSlidersVisible(2);
        }
    }

    else if (tag === "fog") {
     if (lgttag==8) {
            setSlidersVisible(0);
        }else{
            setSlidersVisible(8);
        }
    }
    else if (tag === "snow"){
    if(    lgttag==4) {
            setSlidersVisible(0);
        }else{

            setSlidersVisible(4);
        }
    }

};


//function tranSettingClick(tag) {
//    earth.Event.OnDocumentReadyCompleted = function() {};
//    var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
//    var url = "";
//    var dval;
//    if (tag === "transparency") {
//        if($('#TerrainTransparency').hasClass('selected')){
//            $('#TerrainTransparency').removeClass('selected');
//            setSlidersVisible(0);
//        }else{
//            $('#TerrainTransparency').addClass('selected');
//            $('#mRain').removeClass('selected');
//            $('#snow').removeClass('selected');
//            $('#fog').removeClass('selected');
//            setSlidersVisible(1);
//        }
//    } else if (tag === "sun") {
//        url = loaclUrl + "/html/scene/sun.html";
//        dval = earth;
//    } else if (tag === "rain") {
//        /*url = loaclUrl + "/html/scene/rain.html";*/
//        /*dval = earth;*/
//        if($('#mRain').hasClass('selected')){
//            $('#mRain').removeClass('selected');
//            setSlidersVisible(0);
//        }else{
//            $('#TerrainTransparency').removeClass('selected');
//            $('#mRain').addClass('selected');
//            $('#snow').removeClass('selected');
//            $('#fog').removeClass('selected');
//            setSlidersVisible(2);
//        }
//    } else if (tag === "fog") {
//        /*url = loaclUrl + "/html/scene/fog.html";*/
//        /*dval = earth;*/
//        if($('#fog').hasClass('selected')){
//            $('#fog').removeClass('selected');
//            setSlidersVisible(0);
//        }else{
//            $('#TerrainTransparency').removeClass('selected');
//            $('#mRain').removeClass('selected');
//            $('#snow').removeClass('selected');
//            $('#fog').addClass('selected');
//            setSlidersVisible(8);
//        }
//    } else if (tag === "snow") {
//        /*url = loaclUrl + "/html/scene/snow.html";*/
//        /*dval = earth;*/
//        if($('#snow').hasClass('selected')){
//            $('#snow').removeClass('selected');
//            setSlidersVisible(0);
//        }else{
//            $('#TerrainTransparency').removeClass('selected');
//            $('#mRain').removeClass('selected');
//            $('#snow').addClass('selected');
//            $('#fog').removeClass('selected');
//            setSlidersVisible(4);
//        }
//    }
//    /*if (picturesBalloons != null) {
//     picturesBalloons.DestroyObject();
//     picturesBalloonsHidden = false;
//     picturesBalloons = null;
//     }
//     if (transparencyBalloons != null) {
//     transparencyBalloons.DestroyObject();
//     transparencyBalloonsHidden = false;
//     transparencyBalloons = null;
//     }
//     if (htmlBalloonXY != null) {
//     htmlBalloonXY.DestroyObject();
//     htmlBalloonXYHidden = false;
//     htmlBalloonXY = null;
//     }
//     transparencyBalloons = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), tag);
//     transparencyBalloons.SetScreenLocation(0, 0);
//     transparencyBalloons.SetRectSize(290, 140);
//     transparencyBalloons.SetIsAddCloseButton(true);
//     transparencyBalloons.SetIsAddMargin(true);
//     transparencyBalloons.SetIsAddBackgroundImage(true);
//     transparencyBalloons.SetIsTransparence(true);
//     transparencyBalloons.SetBackgroundAlpha(0);
//
//     transparencyBalloons.ShowNavigate(url);
//     earth.Event.OnDocumentReadyCompleted = function(guid) {
//     //setTimeout(function(){
//     if (transparencyBalloons.Guid == guid) {
//     transparencyBalloons.InvokeScript("setTranScroll", dval);
//     }
//     //},100);
//     //earth.Event.OnHtmlNavigateCompleted = function (){};
//     };
//     earth.Event.OnHtmlBalloonFinished = function(id) {
//     if (!transparencyBalloonsHidden && transparencyBalloons != null && id === transparencyBalloons.Guid) {
//     transparencyBalloons.DestroyObject();
//     transparencyBalloons = null;
//     earth.Event.OnHtmlBalloonFinished = function() {};
//     }
//     };*/
//};



var setSlidersVisible = function(flag){
    var st = [{
        id:'terrainTransparency',
        type:'transparency'
    },{
        id:'mRain',
        type:'rain'
    },{
        id:'snow',
        type:'snow'
    },{
        id:'fog',
        type:'fog'
    }];
    sliderMgr.init(earth, false, function(type){
        for(var i in st){
            if(st[i].type == type){
                $('#' + st[i].id).removeClass('selected');
            }
        }
    });
    for(var i = 0;i < st.length;i++){
        sliderMgr.setVisible(st[i].type,flag & Math.pow(2,i));
    }
}

function pictureHtml(tag){
    earth.Event.OnHtmlNavigateCompleted = function (){};
    var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
    var url="";
    var dval;
    var ztree =  $.fn.zTree.getZTreeObj("userdataTree");
    var width =270,height = 240;
    if(tag === "mScreenShot"){
        url = loaclUrl + "/html/scene2/screenShot.html";//截屏气泡
        dval = earth;
    }
    if (picturesBalloons != null){
        picturesBalloons.DestroyObject();
        picturesBalloons = null;
    }
    if (transparencyBalloons != null){
        transparencyBalloons.DestroyObject();
        transparencyBalloons = null;
    }
    picturesBalloons = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "屏幕坐标窗体URL");
    picturesBalloons.SetScreenLocation(0,0);
    picturesBalloons.SetRectSize(width,height);
    picturesBalloons.SetIsAddBackgroundImage(false);
    picturesBalloons.ShowNavigate(url);
    earth.Event.OnHtmlNavigateCompleted = function (){
        dval.htmlBallon = picturesBalloons;
        setTimeout(function(){
            picturesBalloons.InvokeScript("setTranScroll", dval);
        },100);
    };
    earth.Event.OnHtmlBalloonFinished = function (id){
        if (picturesBalloons != null&&id===picturesBalloons.Guid){
            picturesBalloons.DestroyObject();
            picturesBalloons = null;
        }
        earth.Event.OnHtmlBalloonFinished = function (){};
    };
};

/**
 * 数据调度
 */
function toggleDataLoading(self) {
    if (self.innerText.indexOf("停止") != -1) {
        self.getElementsByTagName("div")[0].innerText = "开始调度";
        // todo 完成调度功能
    } else if (self.innerText.indexOf("开始") != -1) {
        self.getElementsByTagName("div")[0].innerText = "停止调度";
    }
}
function showRoadName() {   // todo 完成获取路名功能
    if (earth.GlobeObserver.Pose.Altitude > 1500) {
        earth.Environment.ClearInformationText();
    } else {
        earth.Environment.SetScreenInformationText($("#ifEarth").width() / 2, $("#ifEarth").height() / 2, "道路名", 0x7F0000FF, 7, 18);
    }
}
/**
 * 道路名显示
 */
function toggleRoadName(self) {
    if (self.innerText.indexOf("隐藏") != -1) {
        self.getElementsByTagName("div")[0].innerText = "显示道路名";
        $(self).removeClass("selected");
        earth.Environment.ClearInformationText();
        clearTimeout(timmerRoadName);
    } else if (self.innerText.indexOf("显示") != -1) {
        self.getElementsByTagName("div")[0].innerText = "隐藏道路名";
        $(self).addClass("selected");
        timmerRoadName = setTimeout(function () {
            showRoadName();
        }, 1000);
    }
}
// endregion
//指标查看
//function indexInfo(){
//    var node=currentSelectedNode;
//    if(node){
//        var param=null,url=null,sFeatures='dialogWidth=600px;dialogHeight=350px;status=no';
//        if(node.type=="PLAN"){
//            param={earth:earth,nodeId:node.id};
//            url='html/investigate/indexPlan.html';
//        }else if(node.type == "PARCEL") {//规划用地
//            param={earth:earth,nodeId:node.projectId,type:"PARCEL"};
//            url='html/investigate/indexSubject.html';
//        }else if (node.type == "ROADLINE") {//道路红线
//            param={earth:earth,nodeId:node.projectId,type:"ROADLINE"};
//            url='html/investigate/indexSubject.html';
//        }
//      //  window.showModelessDialog(url,param,sFeatures);
//  showModalDialog(url,param,sFeatures);
//    }
//}


// region 方案审批
function showIndexPage() {
    var tree = $.fn.zTree.getZTreeObj("planTree");
    var selNode = tree.getSelectedNodes()[0];
    if (selNode) {
        showModalDialog('html/investigate/planIndex.html?id=' + selNode.id, '技术指标');
    }
}
// endregion

/**
 * 控规盒显示
 */
function togglePlanBox(self) {
    var $self = $(self);
    if ($self.hasClass("selected")) {
        $self.removeClass("selected");
        projManager.showPlanData(false);
    } else {
        $self.addClass("selected");
        projManager.showPlanData(true);
    }
}

// region 搜索

$(function () {
    $("#search").click(function () {
        showLargeDialog('html/search/search.html', '搜索');
    });
    $("#Searchpoint").click(function () {
        showLargeDialog('html/search/searchPolygon.html?id=point', '点搜索');
    });
    $("#Searchpolygon").click(function () {
        showLargeDialog('html/search/searchPolygon.html?id=polygon', '多边形搜索');
    });
    $("#Searchcircle").click(function () {
        showLargeDialog('html/search/searchPolygon.html?id=circle', '圆域搜索');
    });

    //tabs按钮切换处理函数
    $('#systemMenu').tabs({
        border:false,
        onSelect:function(title){
            //var result = Trim(title);
            var result = title.replace(/\ /g,"");
            if(result == "场景"){
                //关闭量算与规划分析的气泡
                if(htmlBalloonMove){
                    htmlBalloonMove.DestroyObject();
                }
                if(htmlBal){
                    htmlBal.DestroyObject();
                    clearMeasureResult();
                     hideBollon();
                }
     if(editTool){
                    editTool.clearHtmlBallon();
                }
            }else if(result == "方案审批"){
                if(htmlBalloonMove){
                    htmlBalloonMove.DestroyObject();
                }
                if(transparencyBalloons){
                    transparencyBalloons.DestroyObject();
                }
                if(picturesBalloons){
                    picturesBalloons.DestroyObject();
                }
                if(htmlBal){
                    htmlBal.DestroyObject();
                    clearMeasureResult();
                     hideBollon();
                }
   if(editTool){
                    editTool.clearHtmlBallon();
                }
                //如果当前窗口是 飞行或者动画 则设置分析功能都不可用
                // var currentPanelTitle = $('#dlgResult').panel('options').title;
                // if(currentPanelTitle == "动画录制"){
                //     $("div[tag='shiyefenxi']").attr("disabled", true);
                //     $("div[tag='tongshifenxi']").attr("disabled", true);
                //     $("div[tag='shiyufenxi']").attr("disabled", true);
                //     $("div[tag='yinyingfenxi']").attr("disabled", true);
                //     $("div[tag='tianjixianfenxi']").attr("disabled", true);
                // }
            }
            else if(result == "规划分析"){
                if(transparencyBalloons){
                    transparencyBalloons.DestroyObject();
                }
                if(picturesBalloons){
                    picturesBalloons.DestroyObject();
                }
                if(htmlBal){
                    htmlBal.DestroyObject();
                    clearMeasureResult();
                    hideBollon();
                }
  if(editTool){
                    editTool.clearHtmlBallon();
                }
            }
            else if(result == "量算"){
                if(htmlBalloonMove){
                    htmlBalloonMove.DestroyObject();
                }
                if(transparencyBalloons){
                    transparencyBalloons.DestroyObject();
                }
                if(picturesBalloons){
                    picturesBalloons.DestroyObject();
     }
                if(editTool){
                    editTool.clearHtmlBallon();
                }
            }
            else if(result == "辅助规划"){
                if(htmlBalloonMove){
                    htmlBalloonMove.DestroyObject();
                }
                if(transparencyBalloons){
                    transparencyBalloons.DestroyObject();
                }
                if(picturesBalloons){
                    picturesBalloons.DestroyObject();
                }
                if(htmlBal){
                    htmlBal.DestroyObject();
                    clearMeasureResult();
                     hideBollon();
                }
            }
        }
    });
});

// endregion

// region 方案树右键
$(function () {
    var editingPlanNode = null;   // 当前正在编辑的方案节点
    var _locateToViewPoint = function (planId, type) {
        var xmlQuery = "<QUERY>" +
            '<CONDITION><AND>' +
            '<PLANID tablename = "VIEWPOINT">=\'' + planId + '\'</PLANID>' +
            '<TYPE tablename = "VIEWPOINT">=\'VIEWPOINT' + type + '\'</TYPE>' +
            '</AND></CONDITION>' +
            '<RESULT><VIEWPOINT><FIELD>POSITION</FIELD></VIEWPOINT></RESULT>' +
            "</QUERY>";
        $.post(CITYPLAN_config.service.query, xmlQuery, function (data) {
            var res = $.xml2json(data).record;
            var vp, pos;
            if (res) {
                if ($.isArray(res)) {
                    vp = res[0];
                } else {
                    vp = res;
                }
                pos = eval('(' + vp["VIEWPOINT.POSITION"] + ')');
                earth.GlobeObserver.FlytoLookat(pos.Lon, pos.Lat, pos.Alt, pos.Heading, pos.Pitch, pos.Roll, pos.Range, 4);
            } else {
                alert("没有定义该视点！");
            }
        });
    };

    $("#contextMenuPlan").menu({
        onShow: function () {       // 控制右键菜单中显示菜单前面的勾选状态
            var tree = $.fn.zTree.getZTreeObj("planTree");
            var selNode = tree.getSelectedNodes()[0];
            if (selNode) {
                if (selNode.Edited) {
                    $(this).menu("setIcon", {target: $("#contextMenuPlanEdit"), iconCls: 'icon-ok'});
                } else {
                    $(this).menu("setIcon", {target: $("#contextMenuPlanEdit"), iconCls: 'icon-blank'});
                    if (!selNode.checked) {
                        $("#contextMenuPlanEdit").attr("disabled", "disabled");
                    } else {
                        $("#contextMenuPlanEdit").removeAttr("disabled");
                    }
                }
            }
        }
    });

    $("#contextMenuPlanLocate").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            projManager.locateToLayer(selNode.id);
        }
    });
    $("#contextMenuPlanRotate").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            projManager.locateToLayerAndRotate(selNode.id);
        }
    });
    $("#contextMenuPlanVPFar,#contextMenuPlanVPNear,#contextMenuPlanVPPerson,#contextMenuPlanVPTop").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            _locateToViewPoint(selNode.id, $(this).attr("tag"));
        }
    });
    $("#contextMenuProjectAttr").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            window.showModalDialog("html/investigate/projectProperty.html", {'projId': selNode.id}, "dialogWidth=360px;dialogHeight=485px;status=no");
        }
    });
    $("#contextMenuPlanAttr").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            window.showModalDialog("html/investigate/planProperty.html", {'planId': selNode.id}, "dialogWidth=360px;dialogHeight=374px;status=no");
        }
    });
    $("#contextMenuInvestigateResult").click(function () {
        var planTree = $.fn.zTree.getZTreeObj("planTree");
        var selNode = planTree.getSelectedNodes()[0];
        if (selNode) {
            window.showModalDialog("html/investigate/investigateResult.html",
                {
                    'projName': selNode.getParentNode().name,
                    'projId': selNode.getParentNode().id,
                    'stage': selNode.id[selNode.id.length - 1],
                    'plans': selNode.children
                },
                "dialogWidth=360px;dialogHeight=350px;status=no");
        }
    });
});
// endregion

// region 多屏对比中间接口，调用3DMain.html中定义的方法
function setScreen(n, planIdArr, projManager, currentApproveProjectGuid, currentLayerObjList) {
    parent.ifEarth.setScreen(n, planIdArr, projManager, currentApproveProjectGuid, currentLayerObjList);
}
function showIndexes(bShowIndex, planDataArr) {
    parent.ifEarth.showIndex(bShowIndex, planDataArr);
}
function setSync(bSync) {
    parent.ifEarth.setSync(bSync);
}
// endregion

// region UI控制

$(function () {


    // region 界面控制
//    var panelMenu = $("#container").layout("panel", "west"),
//        headerHeight = panelMenu.panel("header").outerHeight(), //panel面板头的高度
//        funcPanel = $("#divMenu").layout("panel", "south");



    var panelMenu = $("#container").layout("panel", "west");//左侧面板
//    var funcPanel = $("#divWest").layout("panel", "south");//左侧下面面板
    var headerHeight = panelMenu.panel("header").outerHeight(); //panel面板头的高度
    var winWidth=window.document.body.offsetWidth;
    var winHeight=window.document.body.offsetHeight;


    //窗口变化后，尺寸调整
    window.onresize = function(){
//        var StandardTblWidth = 1250;  //600(左侧文字)+650（右侧tab）
        var StandardTblWidth = 1480;  //580(左侧文字)+900（右侧tab）  <!--cy:10.31   改右侧tab宽度为700px-->

        var TblTop=document.getElementById ("TopMenuTbl");
        var TopLeft=document.getElementById ("topTblLeft");

        winWidth=window.document.body.offsetWidth;
        winHeight=window.document.body.offsetHeight;


        //cy:如果浏览器>1200,   左侧最大不超过800px;如果<1200,左侧600px；右侧出现滚动条

        if (winWidth > StandardTblWidth){
            TblTop.width = (winWidth).toString() + "px";
           var width_temp= winWidth-StandardTblWidth;
            if(width_temp>=200){TopLeft.width="780px;"}
            else
            {
                TopLeft.width=580+width_temp+"px";

            }
        }
        else
        {
            TblTop.width= StandardTblWidth.toString() + "px";
            TopLeft.width="580px";
        }

//        var TopRight=document.getElementById ("topTblRight");
//        TopRight.width="200px";
//        winWidth=window.document.body.offsetWidth;
//        winHeight=window.document.body.offsetHeight;

    };

    $(window).trigger("resize");











    /**
     * 显示系统左侧菜单面板
     */
    var openMenuPanel = function () {

        if (panelMenu.panel("options").collapsed) {

            $("#container").layout("expand", "west");
        }
    };

    // 浏览器大小（主要指高度）变化时，动态改变弹出面板的高度
//    panelMenu.panel({
//        onResize: function (w, h) {
//            debugger;
//
//            if (!$("#dlgResult").panel("options").closed) {
//                $("#dlgResult").panel("resize", {height: h});
//
//            }
//        }
//    });

    // 必须提前初始化对话框面板窗口，不然layout收缩会报错
    // 延迟1秒等待3D插件加载
    // dialog打开后需要关闭（仅针对IE 6）
    setTimeout(function () {
        $("#dlgResult").dialog({}).dialog("close");
        $("#dlgScreen2D").dialog({}).dialog("close");
    }, 1000);

    /**
     * 显示菜单面板下半部分的小面板
     * @param src 面板加载网页的地址
     * @param title 面板的标题
     */
    window.showLittleDialog = function (src, title) {
        hideLargeDialog();
        funcPanel.panel("setTitle", title);    //动态改变panel的标题
        var origSrc = $("#ifFunc").attr("src");
        if (origSrc != src) {
            $("#ifFunc").attr("src", src);
        }

        openMenuPanel();
        if (funcPanel.panel("options").collapsed) {
            $("#divMenu").layout("expand", "south");
        }
    };

    /**
     * 页面刷新或者关闭的时候执行 关闭当前的窗体
     * @return {[type]} [description]
     */
    window.onunload=function(){
        if(htmlBalloonMove){
            htmlBalloonMove.DestroyObject();
        }
        if(transparencyBalloons){
            transparencyBalloons.DestroyObject();
        }
        if(picturesBalloons){
            picturesBalloons.DestroyObject();
        }
        if(htmlBal){
            htmlBal.DestroyObject();
            clearMeasureResult();
             hideBollon();
        }
   if(editTool){
            editTool.clearHtmlBallon();
        }
    };

    /**
     * 隐藏菜单面板下半部分的小面板
     */
    window.hideLittleDialog = function () {
        $("#divMenu").layout("collapse", "south");
    };

    /**
     * 显示左侧面板，覆盖在左侧菜单面板之上
     * @param src 面板加载网页的地址
     * @param title 面板的标题
     */
    window.showLargeDialog = function (src, title) {
        earth.currentLayer = currentLayerObjs;//cy     2015_02_28加     阴影分析会用到
        openMenuPanel();

        $("#dlgResult").dialog({
            shadow: false,
            draggable: false,
            title: title,
            onClose: function () {  // 对话框窗口关闭时清除临时图形
                earth.ShapeCreator.Clear();
                //earth.Paint.ClearHighlightObject();
                // 对话框关闭时卸载页面，页面自身按需要清除临时数据
                $("#ifResult").attr("src", "");
            }
        }).panel({height: panelMenu.height() + headerHeight})
            .panel("move", {top: "100px", left: "0px"});
        $("#ifResult").attr("src", src);
    };

    /**
     * 隐藏左侧大面板
     */
    window.hideLargeDialog = function () {
        $("#dlgResult").dialog({}).dialog("close");
    };
    // endregion
    if ($.browser.msie) {
        window.setInterval("CollectGarbage();", 1000);
    }
    jQuery.support.cors = true; //开启jQuery跨域支持
    $("#ifEarth").attr("src", "3DMain.html");
});

// endregion



//window.TerrainTransparency_Click=function(){
//
//    if($("#TerrainTransparency").attr("disabled")=="disabled"){
//        return;
//    }
//    var loaclUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
//    url = loaclUrl + "/html/scene/transparencySetting.html"; //ShowNavigate只能用绝对路径
//    dval = earth;//.Environment.TerrainTransparency * 100 / 255;
//
//    if (transparencyBalloons != null){
//        transparencyBalloons.DestroyObject();
//        transparencyBalloonsHidden = false;
//        transparencyBalloons = null;
//    }
//    transparencyBalloons = earth.Factory.CreateHtmlBalloon(earth.Factory.CreateGuid(), "地面透明度设置URL");
//    transparencyBalloons.SetScreenLocation(0,0);
//    transparencyBalloons.SetRectSize(320,140);
//    var color = parseInt("0xccc0c0c0");//0xccc0c0c0 //e4e4e4 //0xcc4d514a
//    transparencyBalloons.SetTailColor(color);
//    transparencyBalloons.SetIsAddCloseButton(true);
//    transparencyBalloons.SetIsAddMargin(true);
//    transparencyBalloons.SetIsAddBackgroundImage(true);
//    transparencyBalloons.SetIsTransparence(true);
//    transparencyBalloons.SetBackgroundAlpha(0);
//
//
//
//
//
//
//    transparencyBalloons.ShowNavigate(url);
//    earth.Event.OnDocumentReadyCompleted = function (guid){
//        //setTimeout(function(){
//        if(transparencyBalloons==null){return;}
//        if(transparencyBalloons.Guid == guid){
//            transparencyBalloons.InvokeScript("setTranScroll", dval);
//        }
//        //},100);
//        //earth.Event.OnHtmlNavigateCompleted = function (){};
//    };
//    earth.Event.OnHtmlBalloonFinished = function (id){
//        if (!transparencyBalloonsHidden && transparencyBalloons != null&&id===transparencyBalloons.Guid){
//            transparencyBalloons.DestroyObject();
//            transparencyBalloons = null;
//            earth.Event.OnHtmlBalloonFinished = function (){};
//        }
//    };
//
//
//}
//定位到迪士尼区域
function flytodisneyClick ()
{

    earth.GlobeObserver.GotoLookat(121.664479, 31.142907 ,5, 359, 60, 0.0, 4000);

};
//地面透明度
window.TerrainTransparency_Click=function(){
    if($("#TerrainTransparency").attr("disabled")=="disabled"){
        return;
    }
    tranSettingClick("transparency");
}
  //开启碰撞
window.ViewOpenCollision_Click   =function(){


    var eventObj =$("#ViewOpenCollision").find("img");
    if(eventObj.attr("alt") ==="开启碰撞"){
        openCollisionCtrl();
        eventObj.attr("alt","关闭碰撞");
        eventObj.attr("title","关闭碰撞");
        eventObj.attr("src","css/images/toolbar/cancel_ViewOpenCollision.png");
    } else {
        openCollisionCancel();
        eventObj.attr("alt","开启碰撞");
        eventObj.attr("title","开启碰撞");
        eventObj.attr("src","css/images/toolbar/ViewOpenCollision.png");
    }
}


/**
 * 功能：开启碰撞模式
 * 参数：无
 * 返回：无
 */
var openCollisionCtrl = function() {
    earth.GlobeObserver.IntersectModel = true;
};

/**
 * 功能：关闭碰撞模式
 * 参数：无
 * 返回：无
 */
var openCollisionCancel = function() {
    earth.GlobeObserver.IntersectModel = false;
};


window.surround_Click=  function(){

    // 环绕

        earth.GlobeObserver.SurroundControlEx(1);


}

//地下浏览

window.ViewUndergroundMode_Click=function()
{

    var eventObj =$("#ViewUndergroundMode").find("img");
    if(eventObj.attr("alt") ==="开启地下浏览"){

        undergroundModeCtrl();
        eventObj.attr("alt","关闭地形浏览");
        eventObj.attr("title","关闭地形浏览");
        eventObj.attr("src","css/images/toolbar/cancel_tab_pro_pipe.png");
    } else {

        undergroundModeCancel();
        eventObj.attr("alt","开启地下浏览");
        eventObj.attr("title","开启地下浏览");
        eventObj.attr("src","css/images/toolbar/tab_pro_pipe.png");
    }
}




window.modelAlt=function(){

    var eventObj =   $("#modelAlt").find("img");//控高分析不可见;
    if(eventObj.attr("alt") ==="关闭所有模型"){
        setalllayersvisibility(false);
        eventObj.attr("alt","还原已关闭模型");
        eventObj.attr("title","还原已关闭模型");
        eventObj.attr("src","css/images/toolbar/cancel_tab_pro_building.png");
    }else{


        for(var i=0;i<hidedlayers.length;i++)
        {
            var layer=  hidedlayers[i];
            layer.Visibility=true;

        }

        //cy:10.10

        var elistarray1= currentLayerObjList[currentApproveProjectGuid];
        if(elistarray1!=null&&elistarray1.length>0){
            hideXZ(); //抠现状
        }
        //cy:10.10

        eventObj.attr("alt","关闭所有模型");
        eventObj.attr("title","关闭所有模型");
        eventObj.attr("src","css/images/toolbar/tab_pro_building.png");
    }


}

window.recoverclosemodel=function(){

    for(var i=0;i<hidedlayers.length;i++)
    {
        var layer=  hidedlayers[i];
        layer.Visibility=true;

    }
    //抠现状
  //cy:10.10  hideXZ();


}

function hideXZLLSJLayers()//隐藏当前工程的浏览数据
//图层隐藏
{

var currentLayerRoot = earth.LayerManager.GetLayerByGUID(parent.currentPrjGuid);
if(currentLayerRoot){
    currentLayerRoot.Visibility = false;

}
}



  //cy 建筑属性查询
function QueryProperty()
{

    GeneralQuery.propertyQuery();



}

    /**
     * 功能：地下浏览模式
     * 参数：无
     * 返回：无
     */
    var undergroundModeCtrl = function() {
        earth.GlobeObserver.UndergroundMode = true;
    }

    /**
     * 功能：取消地下浏览模式
     * 参数：无
     * 返回：无
     */
    var undergroundModeCancel = function() {
        earth.GlobeObserver.UndergroundMode = false;
        earth.Event.OnObserverChanged = function() {};
    }

function jump2Login(){

    try{
        var url = top.location.href;
        url = url.substring(0,url.lastIndexOf('/')) + '/login.html';
        top.location.assign(url);
    }catch(e){

    }
}
function  logout(){
    try{
        authMgr.delCookie('userName');
        authMgr.delCookie('password');
      //  if(earth && earth.UserLog.NeedSecurity(CITYPLAN_config.server.ip)){
        //cy：20160304 关闭satamp的权限控制
        //  earth.UserLog.Logout();

        //   }

        authMgr.clearAll(); //清理缓存的权限信息 add by zc 2014-08-18 13:51:37
     //   authMgr.setMenuEnable(null, true);
        jump2Login();
    }catch(e){

    }
}

function _addEditLayer(layer){
   // _currentLayer = layer;
    editLayerList.push(layer);

    showLargeDialog('html/Bim/BIMLayerList.html',"BIM图层列表")
}


