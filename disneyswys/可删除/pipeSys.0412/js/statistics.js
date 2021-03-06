/**
 * 统计功能对象
 */
var elementSphere = null;
var htmlBalloons = null;
var earth = parent.earth;
var id_timeout;
var StatisticsMgr = {
	projectList : null,
    pipeConfigLink : null, //字段映射文件的地址
    pipeConfigDoc : null, //字段映射文件的dom对象
    pipeDatum : null, //空间坐标转换对象

    /**
     * 功能：初始化项目列表
     * 参数：无 
     * 返回：项目列表
     */
    getProjectList: function(){
    	this.projectList = [];
    	var rootLayerList = earth.LayerManager.LayerList;
    	var projectCount = rootLayerList.GetChildCount();
    	for(var i = 0; i < projectCount; i++){
    		var childLayer = rootLayerList.GetChildAt(i);
    		var layerType = childLayer.LayerType;
    		if(layerType === "Project"){    			
    			var projectId = childLayer.Guid;
    			var projectName = childLayer.Name;
    			var pipeList = this.getPipeListByLayer(childLayer);
    			if(pipeList.length > 0){
    				this.projectList.push({projectId: projectId, projectName: projectName, pipeList: pipeList});
    			}
    		}    		
    	}
    	return this.projectList;
    },
    
    /**
     * 功能：初始化项目列表
     * 参数：container-显示项目列表的jquery容器对象; 
     * 返回：无
     */
    initProjectList : function(container){
    	this.getProjectList();
    	for(var i = 0; i < this.projectList.length; i++){
    		var projectId = this.projectList[i].projectId;
    		var projectName = this.projectList[i].projectName;
			container.append('<option value="' + projectId + '">' + projectName + '</option>');
    	}
    },
	    getPipelineProjectList: function() {
        var pipeProjectList = [];
        var rootLayerList = earth.LayerManager.LayerList;
        var projectCount = rootLayerList.GetChildCount();
        for (var i = 0; i < projectCount; i++) {
            var childLayer = rootLayerList.GetChildAt(i);
            var layerType = childLayer.LayerType;
            var pipeTag = false;
            if (layerType === "Project" && !pipeTag) { //17
                var projectId = childLayer.Guid;
                var projectName = childLayer.Name;
                var chlildrenCount = childLayer.GetChildCount();

                for (var x = 0; x < chlildrenCount; x++) {
                    var pipechildLayer = childLayer.GetChildAt(x);
                    var pipelayerType = pipechildLayer.LayerType;
                    if (pipelayerType === "Pipeline") {
                        pipeTag = true;
                        break;
                    }
                    if (pipelayerType === "Folder") {
                        var threeLayerCount = pipechildLayer.GetChildCount();
                        for (var s = 0; s < threeLayerCount; s++) {
                            var threechildLayer = pipechildLayer.GetChildAt(s);
                            var threepipelayerType = threechildLayer.LayerType;
                            if (threepipelayerType === "Pipeline") {
                                pipeTag = true;
                                break;
                            }
                        }
                    }
                }
                if (pipeTag) {
                    pipeProjectList.push({
                        id: projectId,
                        name: projectName
                    });
                }
            }
        }
        return pipeProjectList;
    },
    /**
     * 功能：初始化导入项目列表
     * 参数：container-显示项目列表的jquery容器对象; 
     * 返回：无
     */
    initPipelineListimport : function(container){
    	 if(!container){
    	        return;
    	    }
    	this.getProjectList();
    	for(var i = 0; i < this.projectList.length; i++){
    		var projectId = this.projectList[i].projectId;
    		var projectName = this.projectList[i].projectName;
    		if(projectName==="规划管线"){
			container.append('<option value="' + projectId + '"'  + '>' + projectName + '</option>');

    		}
    		if(projectName==="设计管线"){
			container.append('<option value="' + projectId + '"' + '>' + projectName + '</option>');
    		}
    		
    	}
    	var loadPath1 = earth.Environment.RootPath + "temp\\PipeData.xml";
		var PipeDataXml1 = earth.UserDocument.LoadXmlFile(loadPath1);
		var PipeDataDoc1 =loadXMLStr(PipeDataXml1);
		var polygonNodes = PipeDataDoc1.getElementsByTagName("PipePolygonElement");
		if(polygonNodes.length!=0){
			parent.document.getElementById("AcceptWellCompare").disabled=false;
		}else{
			parent.document.getElementById("AcceptWellCompare").disabled=true;
		}
    },   
    buttonChange:function(){

    		var layer = earth.LayerManager.GetLayerByGUID(parent.projectListVal);
    		if(layer.Name==="设计管线"){
    	    	parent.document.getElementById("Approval2DCompare").disabled=false;
    			parent.document.getElementById("ApprovalCollisionAnalysis").disabled=false;
    			parent.document.getElementById("ApprovalDisionAnalysis").disabled=false;
    			parent.document.getElementById("AcceptCompare").disabled=false;
    			parent.document.getElementById("AcceptWellCompare").disabled=false;
    		}else{
    	    	parent.document.getElementById("Approval2DCompare").disabled=false;
    			parent.document.getElementById("ApprovalCollisionAnalysis").disabled=false;
    			parent.document.getElementById("ApprovalDisionAnalysis").disabled=false;
    			parent.document.getElementById("AcceptCompare").disabled=true;
    			parent.document.getElementById("AcceptWellCompare").disabled=true;
    		}

	},
	buttonChangeReturn:function(){
		
		parent.document.getElementById("AcceptCompare").disabled=true;
    	parent.document.getElementById("Approval2DCompare").disabled=false;
		parent.document.getElementById("ApprovalCollisionAnalysis").disabled=false;
		parent.document.getElementById("ApprovalDisionAnalysis").disabled=false;
	},
    /**
     * 功能：初始化导入项目列表,判断比对阶段
     * 参数：比对图层guid; 
     * 返回：无
     */
    approveOrAccept : function(guid){
    	this.getProjectList();
    	for(var i = 0; i < this.projectList.length; i++){
    		var projectId = this.projectList[i].projectId;
    		var projectName = this.projectList[i].projectName;
    		var loadPath = earth.Environment.RootPath + "temp\\PipeData.xml";
    		var PipeDataXml = earth.UserDocument.LoadXmlFile(loadPath);
    		var PipeLineDataDoc =loadXMLStr(PipeDataXml);
    		var pipeLIneNodes=PipeLineDataDoc.getElementsByTagName("PipeLineId");
    		if(pipeLIneNodes == null || pipeLIneNodes.length == 0){
    			parent.document.getElementById("Approval2DCompare").disabled=true;
    			parent.document.getElementById("ApprovalCollisionAnalysis").disabled=true;
    			parent.document.getElementById("ApprovalDisionAnalysis").disabled=true;
    			parent.document.getElementById("AcceptCompare").disabled=true;
    		}else
	    		if(projectName==="规划管线" && guid===projectId){
	    			parent.document.getElementById("Approval2DCompare").disabled=false;
	    			parent.document.getElementById("ApprovalCollisionAnalysis").disabled=false;
	    			parent.document.getElementById("ApprovalDisionAnalysis").disabled=false;
	    			parent.document.getElementById("AcceptCompare").disabled=true;
	    			//parent.document.getElementById("AcceptWellCompare").disabled=true;*/	   
	    			//$("div[tag='Accept3DCompare']").attr("disabled",true);
	    		}else
	    		if(projectName==="设计管线" && guid===projectId){
	    			parent.document.getElementById("Approval2DCompare").disabled=true;
	    			parent.document.getElementById("ApprovalCollisionAnalysis").disabled=true;
	    			parent.document.getElementById("ApprovalDisionAnalysis").disabled=true;
	    			parent.document.getElementById("AcceptCompare").disabled=false;
	    			//parent.document.getElementById("AcceptWellCompare").disabled=true;*/	   
	    			//$("div[tag='Accept3DCompare']").attr("disabled",true);
	    		}
    	 }
    },
    /**
     * 功能：初始化项目列表
     * 参数：container-显示项目列表的jquery容器对象; 
     * 返回：无
     */
    initProjectCheckboxs : function(container){
    	this.getProjectList();
    	for(var i = 0; i < this.projectList.length; i++){
    		var projectId = this.projectList[i].projectId;
    		var projectName = this.projectList[i].projectName;
			container.append('<div>' + 
	 		 		         '<input type="checkbox" id="' + projectId + '" value="' + projectId + '" />' +
	 		 		         '<label for="' + projectId + '">' +  projectName + '</label>' + 
	 		 		         '</div>');
    	}
    },
    
    /**
     * 功能：获取指定图层下的所有道路中心线图层列表
     * 参数：layer-指定图层
     * 返回：指定图层下的所有道路中心线图层列表
     */
    getPipeListByLayer : function(layer){
    	var pipelineArr = [];
		var count = layer.GetChildCount();
    	for(var i = 0; i < count; i++){
    		var childLayer = layer.GetChildAt(i);
    		var layerType = childLayer.LayerType;
    		if(layerType === "Pipeline"){
    			var pipelineId = childLayer.Guid;
    			var pipelineName = childLayer.Name;
    			var pipelineServer=childLayer.GISServer;
    			pipelineArr.push({id:pipelineId, name:pipelineName, server:pipelineServer});
    		}else{
        		var childCount = childLayer.GetChildCount();
        		if(childCount > 0){
        			var childPipelineArr =  this.getPipeListByLayer(childLayer); 
        			for(var k = 0; k < childPipelineArr.length; k++){
        				pipelineArr.push(childPipelineArr[k]);
        			}
        		}
    		}
    	}
    	return pipelineArr;
    },

    /**
     * 功能：初始化行政区划名称列表
     * 参数：container-存放道路中心线名称列表的JQuery对象；callback-回调函数
     * 返回：无
     */
    initDistrictNameList : function(container,id, callback){
		container.html("");		
		var districtNameList = [];
        var layer = earth.LayerManager.GetLayerByGUID(id);
        var distrrticLayer = [];
        var childCount = layer.GetChildCount();
        for(var i=0; i<childCount; i++){
            var childLayer = layer.GetChildAt(i);
            var id = childLayer.Guid;
            var name = childLayer.Name;
            var visibility = childLayer.Visibility;
            var layerType = childLayer.LayerType;
            var dataType = childLayer.DataType;
            if(layerType === "Vector" && dataType === "District"){
                distrrticLayer.push({'id':id, 'name':name, 'server':childLayer.GISServer});
            }
        }


		var districtList = distrrticLayer;
		for(var m = 0; districtList != null && m < districtList.length; m++){
			var districtGuid = districtList[m].id;
			var districtResult = this.getPipelineInfo(districtGuid, null, 17, null, null);
			if(districtResult == null || districtResult.RecordCount == 0){
				continue;
			}

			var pageNum = districtResult.RecordCount/100;				
		    for(var p = 0; p < pageNum; p++){
				var districtXml = districtResult.GotoPage(p);
				var districtDoc = loadXMLStr(districtXml);
				if(districtDoc != null && districtDoc.xml != ""){
					var districtNodeList = districtDoc.documentElement.firstChild.childNodes;
					for(var n = 0; n < districtNodeList.length; n++){
						var districtNode = districtNodeList[n];
						var districtId = districtNode.selectSingleNode("OBJECTID").text;
						var districtName = districtNode.selectSingleNode("NAME").text;
						var buffer = this.getDistrictBufferByNode(districtNode);
						districtNameList.push({districtId: districtId, districtName: districtName, districtBuffer: buffer});
					}
				}
		    }
		}
		if(districtNameList == null || districtNameList.length == 0){
			return;
		}
		
		for(var i = 0; i < districtNameList.length; i++){
			var districtItemObj = districtNameList[i];
			container.append('<option value="' + districtItemObj.districtId + '">' + districtItemObj.districtName + '</option>');
		}
		
		if(callback != null){
			callback();
		}
		return districtNameList;
    },

    /**
     * 功能：初始化道路中心线名称列表
     * 参数：container-存放道路中心线名称列表的JQuery对象；callback-回调函数
     * 返回：无
     */
    initRoadNameList : function(container,id, callback){
		container.html("");		
		var roadNameList = [];
        var layer = earth.LayerManager.GetLayerByGUID(id);
        var distrrticLayer = [];
        var childCount = layer.GetChildCount();
        for(var i=0; i<childCount; i++){
            var childLayer = layer.GetChildAt(i);
            var id = childLayer.Guid;
            var name = childLayer.Name;
            var visibility = childLayer.Visibility;
            var layerType = childLayer.LayerType;
            var dataType = childLayer.DataType;
            if(layerType === "Vector" && dataType === "Road"){
                distrrticLayer.push({'id':id, 'name':name, 'server':childLayer.GISServer});
            }
        }
		var roadList = distrrticLayer;
		for(var m = 0; roadList != null && m < roadList.length; m++){
			var roadGuid = roadList[m].id;
			var roadResult = this.getPipelineInfo(roadGuid, null, 17, null, null);
			if(roadResult == null || roadResult.RecordCount == 0){
				continue;
			}

			var pageNum = roadResult.RecordCount/100;				
		    for(var p = 0; p < pageNum; p++){	
				var roadXml = roadResult.GotoPage(p);
				var roadDoc = loadXMLStr(roadXml);
				if(roadDoc != null && roadDoc.xml != ""){
					var roadNodeList = roadDoc.documentElement.firstChild.childNodes;
					for(var n = 0; n < roadNodeList.length; n++){
						var roadNode = roadNodeList[n];
						var roadName = roadNode.selectSingleNode("US_NAME").text;
						var buffer = this.getRoadBufferByNode(roadNode);
						if(buffer == null){
							continue;
						}
						var roadItemObj = null;
						for(var k = 0; roadNameList != null && k < roadNameList.length; k++){
							if(roadNameList[k].roadName == roadName){
								roadItemObj = roadNameList[k];
								break;
							}
						}
						if(roadItemObj != null){
							roadItemObj.roadBufferList.push(buffer);
						}else{
							roadNameList.push({roadName: roadName, roadBufferList: [buffer]});
						}							
					}
				}
		    }
		}
		if(roadNameList == null || roadNameList.length == 0){
			return;
		}
		
		for(var i = 0; i < roadNameList.length; i++){
			var roadItemObj = roadNameList[i];
			container.append('<option value="' + roadItemObj.roadName + '">' + roadItemObj.roadName + '</option>');
		}
		
		if(callback != null){
			callback();
		}
		return roadNameList;
    },
    
    getPipelineListByProjId: function(projectId){
		var pipelineList = null;
		this.getProjectList();
		for(var k = 0; k < this.projectList.length; k++){
			if(this.projectList[k].projectId === projectId){
				pipelineList = this.projectList[k].pipeList;
				break;
			}
		}		
		return pipelineList;
    },
    
    /**
     * 功能：初始化管线图层列表
     * 参数：projectId-指定项目的id编号; container-显示管线图层列表的jquery容器对象; callback-管线初始化完成之后的回调函数
     * 返回：无
     */
	initPipelinePointLineList : function(projectId, container, callback){
		container.html("");
		
		var pipelineList = null;
		for(var k = 0; k < this.projectList.length; k++){
			if(this.projectList[k].projectId === projectId){
				pipelineList = this.projectList[k].pipeList;
				break;
			}
		}		
		if(pipelineList == null){
			return;
		}
		
		for(var i = 0; i < pipelineList.length; i++){
			var pipeLineLayer = pipelineList[i];
			container.append('<option value="' +
					pipeLineLayer.id + '" server="' + pipeLineLayer.server + '">' +
					pipeLineLayer.name + '线</option>');
			container.append('<option value="' +
					pipeLineLayer.id + '" server="' + pipeLineLayer.server + '">' +
					pipeLineLayer.name + '点</option>');
		}
		
		if(callback != null){
			callback();
		}
	},
    sphereGotoLookat: function(key, subLayer, layerID, pointKey, bShow, originCoord, htmlStr) {
        var deep = 0; //管点埋深
        var pointHeight = 0; //管线半径&高度;
        var US_SPT_KEY = top.getName("US_SPT_KEY", 1, true);
        var filterStartKey = "(and,eq," + US_SPT_KEY + "," + pointKey + ")";

        var US_EPT_KEY = parent.getName("US_EPT_KEY", 1, true);
        var filterEndKey = "(and,eq," + US_EPT_KEY + "," + pointKey + ")";

        var lineResult = this.paramQuery(null, layerID, filterStartKey, 16, 1);
        var lintGotoPage = lineResult.GotoPage(0);
        if (lintGotoPage == "error" || (lineResult!=null && lineResult.RecordCount < 1)) { //用终点key再次查询
            lineResult = this.paramQuery(null, layerID, filterEndKey, 16, 1);
            lintGotoPage = lineResult.GotoPage(0);
        }
        if (lintGotoPage != "error") {
            var lineJson = $.xml2json(lintGotoPage);
            var lineRecords = lineJson.Result.Record;
            if (typeof(lineRecords) == "object") {
                var lineStartKey = lineRecords[top.getName("US_SPT_KEY", 1, true)];
                var lineEndKey = lineRecords[top.getName("US_EPT_KEY", 1, true)];
                var startDeep = lineRecords[top.getName("US_SDEEP", 1, true)];
                var endDeep = lineRecords[top.getName("US_EDEEP", 1, true)];
                pointHeight = parseInt(lineRecords[top.getName("US_SIZE", 1, true)]);

                if (lineStartKey == pointKey) {
                    deep = startDeep;
                } else if (lineEndKey == pointKey) {
                    deep = endDeep;
                }
            } else if (lineRecords instanceof Array) {
                for (var l = 0; l < lineRecords.length; l++) {
                    var red = lineRecords[l];
                    var lineStartKey = red[top.getName("US_SPT_KEY", 1, true)];
                    var lineEndKey = red[top.getName("US_EPT_KEY", 1, true)];
                    var startDeep = red[top.getName("US_SDEEP", 1, true)];
                    var endDeep = red[top.getName("US_EDEEP", 1, true)];
                    pointHeight = parseInt(lineRecords[top.getName("US_SIZE", 1, true)]);
                    if (lineStartKey == pointKey) {
                        deep = startDeep;
                        break;
                    } else if (lineEndKey == pointKey) {
                        deep = endDeep;
                        break;
                    }
                }
            }
        }

        var uskey = top.getName("US_KEY", 0, true);
        var strPara = "";

        strPara += "(or,equal," + uskey + "," + pointKey + ")";

        var param = subLayer.QueryParameter;
        param.Filter = strPara;
        param.QueryType = 17; // SE_AttributeData
        // 0：SE_Table_Point，1：SE_Table_Line
        param.QueryTableType = 0;
        var result = subLayer.SearchFromGISServer();
        var PointResult = result.GotoPage(0);
        var object = result.GetLocalObject(0);
        var json = $.xml2json(PointResult);
        var records = json.Result.Record;
        if (records) {
            if(bShow&&htmlStr==null){
                StatisticsMgr.showNotLineSphere(layerID, records, htmlStr, deep, pointHeight, bShow);
            }else{
                StatisticsMgr.showNotLineBalloon(layerID, records, htmlStr, deep, pointHeight, bShow);
            }
        }
    },
    showNotLineSphere: function(layerID, record, htmlStr, deep, pointHeight, bShow){
        htmlStr = '<div style="word-break:keep-all;white-space:nowrap;overflow:auto;width:265px;height:310px;margin-top:25px;margin-bottom:25px"><table style="font-size:16px;background-color: #ffffff; color: #fffffe">';
        var strKey=record[top.getName("US_KEY",0,true)];
        var road=record[top.getName("US_ROAD",0,true)];
        var isScra=record[top.getName("US_IS_SCRA",0,true)];
        var bdTime=record[top.getName("US_BD_TIME",0,true)];
        var fxYear=record[top.getName("US_FX_YEAR",0,true)];
        var owner=record[top.getName("US_OWNER",0,true)];
        var state=record[top.getName("US_UPDATE",0,true)];
        var update=record[top.getName("US_UPDATE",0,true)];
        var altitude=(parseFloat(record[top.getName("US_PT_ALT",0,true)])).toFixed(3);
        var attachment = record[top.getName("US_ATTACHMENT",0,true)];
        var pointType = record[top.getName("US_PT_TYPE",0,true)];

        var str_caption=top.getNameNoIgnoreCase("US_KEY",0,false);
        var road_caption=top.getNameNoIgnoreCase("US_ROAD",0,false);
        var isScra_caption=top.getNameNoIgnoreCase("US_IS_SCRA",0,false);
        var bdTime_caption=top.getNameNoIgnoreCase("US_BD_TIME",0,false);
        var fxYear_caption=top.getNameNoIgnoreCase("US_FX_YEAR",0,false);
        var owner_caption=top.getNameNoIgnoreCase("US_OWNER",0,false);
        var state_caption=top.getNameNoIgnoreCase("US_UPDATE",0,false);
        var update_caption=top.getNameNoIgnoreCase("US_UPDATE",0,false);
        var altitude_caption=top.getNameNoIgnoreCase("US_PT_ALT",0,false);
        var attachment_caption = top.getNameNoIgnoreCase("US_ATTACHMENT",0,false);
        var pointType_caption = top.getNameNoIgnoreCase("US_PT_TYPE",0,false);

        //井类型 井直径 井脖深 井底深 井盖类型  井盖规格 井盖材质  井材质  旋转角度  偏心井点号
        var us_well=record[top.getName("US_WELL",0,true)];
        var us_wdia=record[top.getName("US_WDIA",0,true)];
        var us_ndeep=(parseFloat(record[top.getName("US_NDEEP",0,true)])).toFixed(3);
        var us_wdeep=(parseFloat(record[top.getName("US_WDEEP",0,true)])).toFixed(3);
        var us_plate=record[top.getName("US_PLATE",0,true)];
        var us_psize=(parseFloat(record[top.getName("US_PSIZE",0,true)])).toFixed(3);
        var us_pmater=record[top.getName("US_PMATER",0,true)];
        var us_wmater=record[top.getName("US_WMATER",0,true)];
        var us_angle=record[top.getName("US_ANGLE",0,true)];
        var us_offset=record[top.getName("US_OFFSET",0,true)];

        var us_well_caption=top.getNameNoIgnoreCase("US_WELL",0,false);
        var us_wdia_caption=top.getNameNoIgnoreCase("US_WDIA",0,false);
        var us_ndeep_caption=top.getNameNoIgnoreCase("US_NDEEP",0,false);
        var us_wdeep_caption=top.getNameNoIgnoreCase("US_WDEEP",0,false);
        var us_plate_caption=top.getNameNoIgnoreCase("US_PLATE",0,false);
        var us_psize_caption=top.getNameNoIgnoreCase("US_PSIZE",0,false);
        var us_pmater_caption=top.getNameNoIgnoreCase("US_PMATER",0,false);
        var us_wmater_caption=top.getNameNoIgnoreCase("US_WMATER",0,false);
        var us_angle_caption=top.getNameNoIgnoreCase("US_ANGLE",0,false);
        var us_offset_caption=top.getNameNoIgnoreCase("US_OFFSET",0,false);

        if(road==undefined){
            road="";
        }
        if(isScra==undefined){
            isScra="";
        }
        if(bdTime==undefined){
            bdTime="";
        }
        if(fxYear==undefined){
            fxYear="";
        }
        if(owner==undefined){
            owner="";
        }
        if(state==undefined){
            state="";
        }
        if(update==undefined){
            update="";
        }
        var v3s=null;
        var us_key = top.getName("US_KEY",0,true);
        var strPara2 = "(and,equal," +us_key+",";
        strPara2 += strKey;
        strPara2 += ")";
        var layer = earth.LayerManager.GetLayerByGUID(layerID);
        var strConn=layer.GISServer + "dataquery?service=" + layerID + "&qt=17&dt=point&pc="+strPara2+"&pg=0,100";
        earth.Event.OnEditDatabaseFinished = function(pRes, pFeature){
            if (pRes.ExcuteType == parent.excuteType){
                var xmlStr = pRes.AttributeName;
                var xmlDoc=loadXMLStr(xmlStr);
                v3s=getPlaneCoordinates(layerID,xmlDoc,strKey);
                var tv3s = v3s["datumCoord"];
                originCoord = v3s["originCoord"];
                var X="";
                var Y="";
                if(tv3s){
                    X=(parseFloat(tv3s.X)).toFixed(3);
                    Y=(parseFloat(tv3s.Y)).toFixed(3);
                }
                var str = "";
                str += '<tr><td style="word-wrap:break-word;" width="100">&nbsp;&nbsp;&nbsp;&nbsp;'+str_caption+'</td><td style="word-wrap:break-word;" width="150">&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +record[top.getName("US_KEY",0,true)]+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;X坐标</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +X+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Y坐标</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +Y+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+altitude_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+altitude+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+pointType_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+(pointType==undefined?"":pointType)+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+attachment_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+(attachment==undefined?"":attachment)+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+road_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+road+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+owner_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+owner+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+bdTime_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+bdTime+'</td></tr>';
                str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+state_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+state+'</td></tr>';
                //alert("大概");
                //井相关字段处理
                if(us_well){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_well_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_well+'</td></tr>';
                }
                if(us_wdia && Number(us_wdia)){
                    us_wdia = Number(us_wdia).toFixed(3);
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_wdia_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_wdia+'</td></tr>';
                }
                if(us_ndeep && Number(us_ndeep)){
                    us_ndeep = Number(us_ndeep).toFixed(3);
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_ndeep_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_ndeep+'</td></tr>';
                }
                if(us_wdeep && Number(us_wdeep)){
                    us_wdeep = Number(us_wdeep).toFixed(3);
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_wdeep_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_wdeep+'</td></tr>';
                }
                if(us_plate){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_plate_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_plate+'</td></tr>';
                }
                if(us_psize){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_psize_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_psize+'</td></tr>';
                }
                if(us_pmater){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_pmater_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_pmater+'</td></tr>';
                }
                if(us_wmater){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_wmater_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_wmater+'</td></tr>';
                }
                if(us_angle && Number(us_angle)){
                    us_angle = Number(us_angle).toFixed(3);
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_angle_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_angle+'</td></tr>';
                }
                if(us_offset){
                    str += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;'+us_offset_caption+'</td><td>&nbsp;&nbsp;&nbsp;&nbsp;'+ "   " +us_offset+'</td></tr>';
                }
                htmlStr = htmlStr + str + '</table></div>';
                StatisticsMgr.showNotLineBalloon(layerID, record, htmlStr, deep, pointHeight, bShow);
            }
        }
        earth.DatabaseManager.GetXml(strConn);
    },
    showNotLineBalloon: function(layerID, record, htmlStr, deep, pointHeight, bShow){
        var pointShape = record.SHAPE.Point.Coordinates;
        var x = null;
        var y = null;
        for (var i = 0; i < pointShape.split(",").length; i += 3) {
            x = pointShape.split(",")[i];
            y = pointShape.split(",")[i + 1];
        }
        var layer = earth.LayerManager.GetLayerByGUID(layerID);
        var intLayerCode = layer.PipeLineType;

        earth.Event.OnGetAltitudeFinished = function(geopoint) {
            if (geopoint) {
                var h = geopoint.Altitude;
                pointHeight = (parseFloat(pointHeight) / 1000) / 2; //半径
                var z = Number(h) - Number(deep) - Number(pointHeight);
                if (intLayerCode >= 4000 && intLayerCode < 5000) {
                    z = Number(h) - Number(deep) + Number(pointHeight); //排水
                }
                if (bShow) {
                    top.showHtmlBalloon(x, y, z, htmlStr);
                }
                StatisticsMgr.createElementSphere(x, y, z); //创建球
                earth.GlobeObserver.GotoLookat(x, y, z, 0.0, 89.0, 0, 6);
            }
        }
        earth.GlobeObserver.GetAltitudeFromNet(x, y);
    },
    createElementSphere: function(x, y, h) {
        var radius = 0.3;
        h = h - parseFloat(radius);
        if (elementSphere != null) {
            earth.DetachObject(elementSphere);
            elementSphere = null;
        }
        //获取工厂对象
        var factory = earth.Factory;
        //创建GUID
        var sphereGuid = factory.CreateGUID();
        //创建模型对象
        elementSphere = factory.CreateElementSphere(sphereGuid, "sphere");
        elementSphere.BeginUpdate();
        var lon = x;
        var lat = y;
        var alt = h;
        elementSphere.SphericalTransform.SetLocationEx(lon, lat, alt);
        elementSphere.FillColor = parseInt("0x77ff0000");
        elementSphere.Radius = radius;
        elementSphere.Underground = true;
        elementSphere.EndUpdate();
        earth.ShapeCreator.Clear();
        earth.AttachObject(elementSphere);
        elementSphere.ShowHighLight();
        bFlagIndex = true;
        clearTimeout(id_timeout);
        id_timeout = setTimeout(function(){
            if(elementSphere != null){
                earth.DetachObject(elementSphere);
                elementSphere = null;
            }
        },7000);
    },	
    /**
     * 功能：初始化管线图层列表
     * 参数：projectId-指定项目的id编号; container-显示管线图层列表的jquery容器对象; callback-管线初始化完成之后的回调函数
     * 返回：无
     */
	initPipelineSelectList : function(projectId, container, callback){
		container.html("");
        if (projectId == null) return;
        var layer = earth.LayerManager.GetLayerByGUID(projectId);
        var pipelineList = this.getPipeListByLayer(layer);

        if (pipelineList == null) {
            return;
        }
		//alert(pipelineList);
		for(var i = 0; i < pipelineList.length; i++){
			var pipeLineLayer = pipelineList[i];
			container.append('<option value="' +
					pipeLineLayer.id + '" server="' + pipeLineLayer.server + '">' +
					pipeLineLayer.name + '</option>');
		}
		
		if(callback != null){
			callback();
		}
	},
    /**
     * 功能：初始化管线图层列表
     * 参数：projectId-指定项目的id编号; container-显示管线图层列表的jquery容器对象; callback-管线初始化完成之后的回调函数
     * 返回：无
     */
	initPipelineList : function(projectId, container, callback){
		container.html("");

        var layer = earth.LayerManager.GetLayerByGUID(projectId);
        var pipelineList = this.getPipeListByLayer(layer);
		if(pipelineList == null){
			return;
		}
		
		for(var i = 0; i < pipelineList.length; i++){
			var pipeLineLayer = pipelineList[i];
			container.append('<div>' + 
			 		 		 '<input type="checkbox" id="' + pipeLineLayer.id + '" value="' + pipeLineLayer.id + '" />' +
			 		 		 '<label for="' + pipeLineLayer.id + '">' +  pipeLineLayer.name + '</label>' + 
			 		 		 '</div>');
		}
		
		if(callback != null){
			callback();
		}
	},
	
	/**
     * 功能：为【全选】按钮添加onclick功能事件
     * 参数：btnObj-【全选】按钮的的jquery对象; callback-全选之后的回调函数
     * 返回：无
     */
    addSelectAllEvent : function(btnObj, callback){
    	btnObj.click(function(){
			$(":checkbox").attr("checked",true);
			
			if(callback != null){
				callback();
			}
		});
    },
    
    /**
     * 功能：为【反选】按钮添加onclick功能事件
     * 参数：btnObj-【反选】按钮的的jquery对象; callback-反选之后的回调函数
     * 返回：无
     */
    addInvSelectEvent : function(btnObj, callback){
    	btnObj.click(function(){
			$(":checkbox").each(function(){
				$(this).attr("checked",!$(this).attr("checked"));
			});
			
			if(callback != null){
				callback();
			}
		});
    },
    
    /**
     * 功能：为【清空】按钮添加onclick功能事件
     * 参数：btnObj-【清空】按钮的的jquery对象; callback-清空之后的回调函数
     * 返回：无
     */
    addClearSelectEvent : function(btnObj, callback){
    	btnObj.click(function(){
			$(":checkbox:").attr("checked",false);
			
			if(callback != null){
				callback();
			}
		});
    },
        
    /**
     * 功能：从GISServer端获取值域数据。
     * 参数：pipelineId-图层ID；spatial-空间搜索参数；queryType-查询类型；queryTableType-查询表类型；fieldName-值域字段名称
     * 返回：搜索结果
     */
    getValueRangeInfo : function(pipelineId,spatial,queryType,queryTableType,fieldName){
		var pipeLayer = earth.LayerManager.GetLayerByGUID(pipelineId);
		if(pipeLayer == null){
			return null;
		}
		var params = pipeLayer.QueryParameter;
		if(params == null){
			return null;
		}
		if(spatial != null){
			params.SetSpatialFilter(spatial);
		}
		if(queryType != null){
			params.QueryType = queryType;
		}
		if(queryTableType != null){
			params.QueryTableType = queryTableType; //0为点表搜索；1为线表搜索
		}
		var result = pipeLayer.SearchValueRangeFromGISServer(fieldName);
		return result;
    },
    
    /**
     *功能：排序函数
     */
     sortNumber : function(a,b){
     	return a - b;
     },
    
    /**
     * 功能：根据搜索结果获取值域列表。
     * 参数：result - 搜索结果
     * 返回：值域列表。
     */
    getValueRangeList : function(result){
    	if(result == null || result == ""){
    		return null;
    	}
    	var resultDoc = loadXMLStr(result);
    	var resultRoot = resultDoc.documentElement;
    	if(resultRoot == null){
    		return null;
    	}
    	
    	var valueRoot = resultRoot.firstChild;    	
    	var valueRangeNode = valueRoot.selectSingleNode("ValueRange");
    	if(valueRangeNode == null || valueRangeNode.childNodes.length == 0){
    		return null;
    	}
    	
    	var valueRangeList = [];
    	for(var i=0; i<valueRangeNode.childNodes.length; i++){
    		valueRangeList.push(valueRangeNode.childNodes[i].text);
    	}
    	valueRangeList.sort(this.sortNumber);
    	return valueRangeList;
    },
    
    /**
	 * 功能：根据管线的图层ID和关键字，搜索管线信息
	 * 参数：pipelineId - 管线的图层Id; key - 对象的关键字，即US_KEY值; 
	 * 返回：搜索结果
	 */
	getPipeLocalInfo : function(pipelineId, key){
		var pipeLayer = earth.LayerManager.GetLayerByGUID(pipelineId);
		if(pipeLayer == null){
			return null;
		}
		var params = pipeLayer.LocalSearchParameter;
		if(params == null){
			return null;
		}
		params.ReturnDataType = 0;//0 返回所有数据，1 返回xml数据，2 返回渲染数据
		params.PageRecordCount = 100;
		params.SetFilter(key, "");
		params.HasDetail = false;
		params.HasMesh = false;
        var result = pipeLayer.SearchFromLocal();
		return result;
	},
    

	/**
	 * 功能：根据管线的图层ID，搜索管线信息
	 * 参数：pipeLayer - 管线的图层Id或管线图层对象; filter - 搜索条件; queryType - 搜索类型; queryTableType - 搜索表类型；spatial-空间搜索对象
	 * 返回：搜索结果
	 */
	getPipelineInfo : function(pipeLayer, filter, queryType, queryTableType, spatial){
		if(typeof(pipeLayer) == "string"){
			pipeLayer = earth.LayerManager.GetLayerByGUID(pipeLayer);
		}
		if(pipeLayer == null){
			return null;
		}
		var params = pipeLayer.QueryParameter;
		if(params == null){
			return null;
		}
		if(filter != null){
			params.Filter = filter;
		}		
		if(spatial != null){
			params.SetSpatialFilter(spatial);
		}		
		if(queryType != null){
			params.QueryType = queryType;
		}
		if(queryTableType != null){
			params.QueryTableType = queryTableType; //0为点表搜索；1为线表搜索
		}
		var result = pipeLayer.SearchFromGISServer();
		return result;
	},
	
    /**
     * 功能：根据线节点的XML信息，获取道路中心线的Buffer区域。
     * 参数：node - 线节点信息
     * 返回：道路中心线的Buffer区域。
     */
	getRoadBufferByNode: function(node){
		var rWidth = parseFloat(node.selectSingleNode("US_RWIDTH").text);
		var nWidth = parseFloat(node.selectSingleNode("US_NWIDTH").text);
		var sWidth = parseFloat(node.selectSingleNode("US_SWIDTH").text);
		var bufferWidth = rWidth + nWidth + sWidth;
		var coordsList = this.getLineCoordsByNode(node);
		if(coordsList == null){
			return null;
		}
		var geoLines = earth.Factory.CreateGeoPoints();
		for(var i = 0; i < coordsList.length; i++){
			var coordPoint = coordsList[i];
			geoLines.add(coordPoint.longitude, coordPoint.latitude, coordPoint.altitude);
		}
		var bufferGeos = earth.GeometryAlgorithm.CreatePolygonFromPolylineAndWidth(geoLines, bufferWidth, bufferWidth);
		var bufferVecs = earth.Factory.CreateVector3s(); 
		for(var k = 0; k < bufferGeos.Count; k++){
            var geoPoint = bufferGeos.GetPointAt(k);
            bufferVecs.Add(geoPoint.Longitude, geoPoint.Latitude, geoPoint.Altitude);
        }
		return bufferVecs;
	},
	

    /**
     * 功能：根据线节点的XML信息，获取区域信息。
     * 参数：node - 线节点信息
     * 返回：区域信息。
     */
	getDistrictBufferByNode: function(node){
		var coordsList = this.getLineCoordsByNode(node);
		if(coordsList == null){
			return null;
		}
		var bufferVecs = earth.Factory.CreateVector3s(); 
		for(var k = 0; k < coordsList.length; k++){
            var coordPoint = coordsList[k];
            bufferVecs.Add(coordPoint.longitude, coordPoint.latitude, coordPoint.altitude);
        }
		return bufferVecs;
	},

    /**
     * 功能：根据线节点的XML信息，获取线的两端点坐标。
     * 参数：node - 线节点信息
     * 返回：线的坐标信息列表。
     */
	getLineCoordsByNode: function(node){
	     var startAlt = null;
	     var startAltNode = node.selectSingleNode("US_SALT");
	     if(startAltNode != null){
	    	 startAlt = startAltNode.text;
	     } 
	     var endAlt = null;
	     var endAltNode = node.selectSingleNode("US_EALT");
	     if(endAltNode != null){
	    	 endAlt = endAltNode.text;
	     }
	     
	     var shapeNode = node.selectSingleNode("SHAPE");
	     if(shapeNode == null){
	    	 return null;
	     }
	     var shapeXml = shapeNode.xml;
	     var coordBeginIndex = shapeXml.indexOf("<Coordinates>");
	     if(coordBeginIndex == -1){
	    	 return null;
	     }
	     coordBeginIndex = coordBeginIndex + "<Coordinates>".length;
	     var coordEndIndex = shapeXml.indexOf("</Coordinates>");
	     var coordStr = shapeXml.substr(coordBeginIndex, coordEndIndex - coordBeginIndex);	     
	     var coordArr = coordStr.split(",");	     
	     var coordList = [];
	     for(var i = 0; i < coordArr.length; i = i + 3){
	    	coordList.push({
	    		longitude: coordArr[i],
	    		latitude: coordArr[i + 1],
	    		altitude: coordArr[i + 2]
	    	});
	     }
	     if(startAlt != null && coordList[0] != null){
	    	 coordList[0].altitude = startAlt;
	     }
	     if(endAlt != null && coordList[1] != null){
	    	 coordList[1].altitude = endAlt;
	     }
	     return coordList;
	},
    
    /**
     * 功能：根据搜索结果获取管线的总长度。
     * 参数：result - 搜索结果
     * 返回：管线的总长度。
     */
    getTotalLength : function(result){
		 if(result == null){
	     	return 0;
	     }
	     var totalLength = 0;
	     for(var p=0; p<result.RecordCount/100; p++){
		     var resultXml = result.GotoPage(p);
		     var resultDoc = loadXMLStr(resultXml);
		     var resultRoot = resultDoc.documentElement;
		     var recordRoot = resultRoot.firstChild;
		     for(var i=0; i<recordRoot.childNodes.length; i++){
		    	 var recordNode = recordRoot.childNodes[i];
		    	 var length = this.getLengthByNode(recordNode);
		    	 totalLength = totalLength + length;
		     }
	     }
	     totalLength = parseFloat(totalLength.toFixed(3));
	     return totalLength;
    },
    
    /**
     * 功能：获取单条管线的长度。
     * 参数：recordNode - 管线的节点信息
     * 返回：管线的长度。
     */
    getLengthByNode : function(recordNode){
    	var length = 0;
    	var coordList = this.getLineCoordsByNode(recordNode);
    	if(coordList != null){
    		var coordPoint1 =  this.pipeDatum.des_BLH_to_src_xy(coordList[0].longitude, coordList[0].latitude, coordList[0].altitude);
    		var coordPoint2 =  this.pipeDatum.des_BLH_to_src_xy(coordList[1].longitude, coordList[1].latitude, coordList[1].altitude);
    		length = PipelineMeasureAlgorithm.VectorSub(coordPoint1,coordPoint2).Length;
    	}
    	length = parseFloat(length.toFixed(3));
    	return length;
    },
    
    /**
     * 功能：显示统计结果
     * 参数：classResList - 统计结果列表; container-显示统计结果的jquery容器对象; columnNum-表的列数
     * 返回：无
     */
    showClassificationResult : function(classResList, container, columnNum){
    	var htmlStr = '<table style="width: 100%;" cellspacing="0">';
    	for(var i=0; i<classResList.length; i++){
    		var classLayer = classResList[i];
    		htmlStr = htmlStr + '<tr>';
    		htmlStr = htmlStr + '<td colspan="' + columnNum + '" class="spaceForLeft" style="text-align:left; border-bottom: 1px double #56a2ff; font-weight: bold;">' + classLayer.layerName  + '</td>';
    		htmlStr = htmlStr + '</tr>';    		
    		for(var k=0; k<classLayer.dataList.length; k++){
    			var dataObj = classLayer.dataList[k];
    			var trStyle = "cursor: hand;";
    			if(k%2 == 1){
    				trStyle = trStyle + "background-color: #add8e6;"; //偶数行添加背景效果
    			}
    			var clickFunc = "";
    			if(classLayer.clickKeyList != null){
    				var clickKeyId = classLayer.clickKeyList[k].keyId;
    				var clickKeyParam = classLayer.clickKeyList[k].keyParam;
    				clickFunc = "StatisticsMgr.highlightObject('" + clickKeyId + "', '" + clickKeyParam + "')";
    			}
            	htmlStr = htmlStr + '<tr style="' + trStyle + '" ondblclick="' + clickFunc + '">';
    			for(var attr in dataObj){
            		htmlStr = htmlStr + '<td align="center" width="' + 100/columnNum + '%">' + dataObj[attr]  + '</td>';
    			}
        		htmlStr = htmlStr + '</tr>';
    		}
        	htmlStr = htmlStr + '<tr><td height="10px"></td></tr>'; //空行，用来做图层统计间的分割
    	}
    	htmlStr = htmlStr + '</table>';
    	container.html(htmlStr);
    },
    
    /**
     * 功能：显示长度统计结果
     * 参数：classResList - 长度统计结果列表; container-显示统计结果的jquery容器对象; columnNum-表的列数
     * 返回：无
     */
    showLengthStatisticsResult : function(classResList, container,columnNum){
    	var htmlStr = '<table style="width: 100%;" cellspacing="0">';
    	var columnWidth = 100/columnNum + '%';
    	for(var i=0; i<classResList.length; i++){
    		var dataObj = classResList[i];
    		var trStyle = "cursor: hand;";
    		if(i%2 == 1){
    			trStyle = trStyle + "background-color: #add8e6;"; //偶数行添加背景效果
    		}
            htmlStr = htmlStr + '<tr style="' + trStyle + '" >';
    		for(var attr in dataObj){
            	htmlStr = htmlStr + '<td align="center" width="' + columnWidth + '">' + dataObj[attr]  + '</td>';
    		}
        	htmlStr = htmlStr + '</tr>';
    	}
    	htmlStr = htmlStr + '</table>';
    	container.html(htmlStr);
    },
        
    /**
     * 功能：双击查询结果，高亮显示双击的管线
     * 参数：layerId - 管线图层ID编号; keyParam - 管线查询关键字
     * 返回：无
     */
    highlightObject: function(layerId, keyParam){
    	var result = this.getPipeLocalInfo(layerId, keyParam);
	    if(result == null || result.RecordCount == 0){
	    	//alert("未能查询到选择的管线");
	    	return;
	    }
	    var resXml = result.GotoPage(0); //获取数据
        var obj = result.GetLocalObject(0);
        var vecCenter = obj.GetLonLatRect().Center;
        earth.GlobeObserver.FlytoLookat(vecCenter.X, vecCenter.Y, vecCenter.Z+50, 0.0, 89.0, 0, 4,3);
        earth.Paint.ClearHighlightObject();
    	earth.Paint.HighlightObject(obj, 10, 1.0, parseInt('0x77FF0000'));//高亮显示管线对象
    },
    
    /**
     * 功能：将table导出成Excel文档
     * 参数：tableId - 要导出的表对象; columns - 列标题数组
     * 返回：无
     */
    importExcelByTable : function(tabObj, columns){
		var xls = null;
		try{
			xls = new ActiveXObject("Excel.Application");
		}catch(e){
			alert("无法启动Excel\n\n如果您确信您的电脑中已经安装了Excel, 那么请调整IE的安全级别\n" +
				  "具体的操作：\n" + 
				  "工具 -> Internet选项 -> 安全 -> 自定义级别 -> 对没有标记为安全的ActiveX进行初始化和脚本运行 -> 启用");
			return;
		}
		xls.visible = true;
		var xlsBook = xls.Workbooks.Add;
		var xlsSheet = xlsBook.WorkSheets(1);
		
		for(var k=0; k<columns.length; k++){
			xlsSheet.Cells(1, k+1).Value = columns[k];
		}
		
		var rowList = tabObj.rows;
		for(var i=0; i<rowList.length; i++){
			var cellList = rowList[i].cells;
			for(var j=0; j<cellList.length; j++){
				xlsSheet.Cells(i+2, j+1).Value = cellList[j].innerHTML;
			}
		}
		xls.UserControl = true;
    },
    
    /**
     * 功能：根据管线图层ID初始化该管线的编码映射文件对象和空间参考对象
     * 参数：layer - 管线图层ID或关系对象; isInitDoc-是否初始化管线的编码映射文件对象; isInitDatum-是否初始化管线的空间参考对象
     * 返回：无
     */
    initPipeConfigDoc : function(layer, isInitDoc, isInitDatum){
    	if(typeof(layer) == "string"){
    		layer = earth.LayerManager.GetLayerByGUID(layer);
    	}
		var projectSetting = layer.ProjectSetting;
		var layerLink = projectSetting.PipeConfigFile;
		if(this.pipeConfigLink == layerLink){
			return;
		}		
		
		this.pipeConfigLink = layerLink;	
		if(isInitDoc == true){ //初始化管线编码映射文件对象
			var configUrl = layerLink;
			this.pipeConfigDoc = loadXMLFile(configUrl); //初始化编码映射文件对象
		}

		if(isInitDatum == true){ //初始化管线空间参考对象
			var spatialUrl = projectSetting.SpatialRefFile;
			this.pipeDatum = parent.CoordinateTransform.createDatum(spatialUrl);
		}
    },
    
    /**
     * 功能：根据编码，获取编码对应的详细值
     * 参数：type-编码类型；codeId - 编码ID
     * 返回：编码对应的详细值
     */
    getValueByCode : function(type, codeId){
    	var value = codeId;
        var pipeConfig = parent.SYSTEMPARAMS.pipeConfigDoc;
       	var nodes = pipeConfig.getElementsByTagName(type);
    //	var nodes = this.pipeConfigDoc.getElementsByTagName(type);
    	for(var i=0; i<nodes.length; i++){
    		var node = nodes[i];
    		var codeNode = node.selectSingleNode("Code");
    		if(parseFloat(codeNode.text) == parseFloat(codeId)){
    			value = node.selectSingleNode("Name").text;
    			break;
    		}
    	}
    	return value;
    },
    
    //------------------------------------------------------------------------
    //分段统计
    //------------------------------------------------------------------------     
	/**
	 * 功能：初始化统计范围列表
	 * 参数：container-显示统计范围的jquery对象; rangeList-要显示的元素列表
	 * 返回：无
	 */
	showRangeList : function(container, rangeList){
		container.html("");		
		var htmlStr = '<table style="width:100%;" cellspacing="1">';
		container.append();
		for(var k=0; k<rangeList.length; k++){
			htmlStr = htmlStr + '<tr><td style="text-align:left; cursor:default;" onclick="StatisticsMgr.selectSingleRow(this)">' + rangeList[k] + '</td></tr>';
		}
		htmlStr = htmlStr + '</table>';
		container.html(htmlStr);
	},
	
	/**
	 * 功能：在“统计范围”列表中添加一行
	 * 参数：downValue-下限值； upValue-上限值; container-统计范围列表的JQuery对象
	 */
	appendStatisticsRangeRow : function(downValue, upValue, container){
		var htmlStr = '<tr>';
		htmlStr = htmlStr + '<td class="downLimitTd" onclick="StatisticsMgr.selectSingleRow(this)" ondblclick="StatisticsMgr.editSingleCell(this)">' + downValue + '</td>';
		htmlStr = htmlStr + '<td class="upLimitTd" onclick="StatisticsMgr.selectSingleRow(this)" ondblclick="StatisticsMgr.editSingleCell(this)">' + upValue + '</td>';
		htmlStr = htmlStr + '</tr>';
		container.append(htmlStr);
	},
		
	/**
	 * 功能：单行选择表中的某一行
	 * 参数：obj - 选择的表单元格对象
	 * 返回：无
	 */
	selectSingleRow : function(obj){
		var trObj = obj.parentNode;
		var tableObj = trObj.parentNode;
		for(var i=0; i<tableObj.rows.length; i++){
			tableObj.rows[i].style.color = "#000000";
			tableObj.rows[i].style.backgroundColor = "transparent";
		}
		trObj.style.color = "#ffffff";
		trObj.style.backgroundColor = "#316ac5";
		tableObj.parentNode.selectIndex = trObj.rowIndex;
	},
	
	/**
	 * 功能：使表单元格处于可编辑状态
	 * 参数：obj - 选择的表单元格对象
	 * 返回：无
	 */
	editSingleCell : function(obj){
		var value = obj.innerHTML;
		if(value.toLowerCase().indexOf("<input") != -1){
			return;
		}
		obj.innerHTML = '<input style="width:29px;" type="text" value="' + value + '" onfocus="StatisticsMgr.focusSingleCell(this)" onblur="StatisticsMgr.unFocusSingleCell(this)"/>';
		obj.firstChild.focus();
	},
	
	/**
	 * 功能：表单元格编辑框的onfocus事件 - 即编辑框获得焦点的事件
	 * 参数：obj - 选择的表单元格对象
	 * 返回：无
	 */
	focusSingleCell : function(obj){
		obj.select();
	},
	
	/**
	 * 功能：表单元格编辑框的onblur事件- 即编辑框失去焦点的事件
	 * 参数：obj - 选择的表单元格对象
	 * 返回：无
	 */
	unFocusSingleCell : function(obj){
		var value = obj.value;
		obj.parentNode.innerHTML = value;
	},
    detachShere: function() {
        if (elementSphere != null) {
            earth.DetachObject(elementSphere);
            elementSphere = null;
        }
    },
    fieldClassification: function(spatial, field, queryTableType, filter, compoundCondition, chartTitle) {
        var classResList = [];
        //要传递到chart统计的数据
        var layers = [];
        var fields;
        if (chartTitle === "特征分类统计图" || chartTitle === "附属物分类统计图") {
            fields = [{
                pointType: "点性质"
            }, {
                pointNum: "点数"
            }];
        } else {
            fields = [{
                dataType: "埋深"
            }, {
                dataNum: "数量"
            }, {
                length: "长度"
            }];
        }
        var chartTitle = chartTitle;

        $(":checkbox:checked").each(function() {
            var layerId = $(this).val();
            var layerName = $(this).next("label").html();
            layers.push(layerName);
            var classLayer = {
                chartTitle: chartTitle,
                layer: layers,
                fields: fields,
                layerName: layerName,
                dataList: [{
                    layerName: layerName
                }]
            };
            var result = StatisticsMgr.statisticsTypeParamQuery(layerId, spatial, field, queryTableType, filter, compoundCondition);
            if (result != "") {
                var json = $.xml2json(result);
                if (json == null || json == "") {
                    return;
                }
                var items = json.Item;
                var len = items.length;
                if (typeof len == "number") {
                    var lengthCount = 0;
                    var numCount = 0;
                    for (var i = 0; i < len; i++) {
                        var item = items[i];
                        var subtotal = StatisticsMgr.getItem(item, classLayer, field);
                        lengthCount = parseFloat(lengthCount) + parseFloat(subtotal.split(",")[0]);
                        numCount = parseFloat(numCount) + parseFloat(subtotal.split(",")[1]);
                    }
                    if (numCount != 0) {
                        classLayer.dataList = StatisticsMgr.arrSortBytwo(classLayer.dataList);
                        classLayer.dataList.push({
                            dataType: "小计",
                            dataNum: numCount,
                            length: parseFloat(lengthCount).toFixed(3)
                        });
                    } else {
                        classLayer.dataList.push({
                            dataType: "小计",
                            length: lengthCount
                        });
                    }
                } else {
                    var item = items;
                    StatisticsMgr.getItem(item, classLayer, field);
                }
            }
            classResList.push(classLayer);
        });
        return classResList;
    },
    statisticsTypeParamQuery: function(pipelineId, spatial, field, queryTableType, filter, compoundCondition) {
        var layer = earth.LayerManager.GetLayerByGUID(pipelineId);
        var subLayer = null;
        for (var i = 0, len = layer.GetChildCount(); i < len; i++) {
            subLayer = layer.GetChildAt(i);
            if (subLayer.LayerType == "Container") { // 使用具体的_container图层
                break;
            }
        }
        if (subLayer == null) {
            return;
        }
        var params = subLayer.QueryParameter;
        if (params == null) {
            return null;
        }
        params.ClearCompoundCondition();
        params.ClearSpatialFilter();
        params.ClearRanges();
        if (compoundCondition != null) {
            var cc = compoundCondition.split(",");
            params.SetCompoundCondition(cc[0], cc[1], parseFloat(cc[2]).toFixed(3));
        }

        if (field != null) {
            params.SetClassCountField(field);
        }

        if (spatial != null) {
            params.SetSpatialFilter(spatial);
        }
        params.Filter = "";
        if (filter != null) {
            params.Filter = filter;
        }
        params.QueryType = 3;
        params.QueryTableType = queryTableType; //0为点表搜索；1为线表搜索
        var result = subLayer.ClassCount();
        return result;
    },
    getItem: function(item, classLayer, field, type) { //todo:这里用管线还是用管点???
        var usAttachment = top.getName("US_ATTACHMENT", 0, true);
        //var pointTypeValue = item.US_ATTACHM;//附属物
        var pointTypeValue = item[usAttachment]; //附属物
        if (!pointTypeValue) {
            usAttachment = top.getName("US_PT_TYPE", 0, true);
            pointTypeValue = item[usAttachment]; //特征
        }
        if (!pointTypeValue) {
            usAttachment = top.getName("US_SIZE", 0, true);
            pointTypeValue = item[usAttachment]; //管径
        }
        if (!pointTypeValue) {
            usAttachment = top.getName("US_PWIDTH", 0, true);
            pointTypeValue = item[usAttachment]; //管块
        }
        if (!pointTypeValue) {
            usAttachment = top.getName("US_PMATER", 0, true);
            pointTypeValue = item[usAttachment]; //材质
        }
        if (!pointTypeValue) {
            // usAttachment = top.getName("US_ATTACHMENT",0,true);
            // pointTypeValue = item.US_IS_SCRA;//废弃
        }
        if (!pointTypeValue) {
            usAttachment = top.getName("US_OWNER", 0, true);
            pointTypeValue = item[usAttachment]; //权属单位
        }
        if (!pointTypeValue) {
            usAttachment = top.getName("US_BD_TIME", 0, true);
            pointTypeValue = item[usAttachment]; //建设年代
        }
        if (!pointTypeValue) {
            //usAttachment = top.getName("US_ATTACHMENT",0,true);
            //pointTypeValue = item.US_PHEIGHT;//方管高度
        }
        if (!pointTypeValue) {
            // usAttachment = top.getName("US_SIZE",0,true);
            // pointTypeValue=item[usAttachment];//管径统计
        }
        // if (!pointTypeValue) {
        //     return;
        // }
        var pointType = pointTypeValue;
        // if (field == "US_ATTACHM") {
        //     pointType = StatisticsMgr.getValueByCode("AttachmentCode", pointTypeValue);
        // } else if (field == "US_PT_TYPE") {
        //     pointType = StatisticsMgr.getValueByCode("CPointCodes", pointTypeValue);
        // } else if (field == "US_PMATER") {
        //     if (type) {
        //         pointType = StatisticsMgr.getValueByCode("Materials", pointTypeValue);
        //         pointType = "管线" + "(" + pointType + ")";
        //     } else {
        //         pointType = StatisticsMgr.getValueByCode("Materials", pointTypeValue);
        //     }
        // }
        if (!pointType) {
            pointType = item[field];
            if (!pointType) {
                pointType = "其他";
            }
        }
        var lengthCount = 0;
        var numCount = 0;
        var totalLength = item.length;
        if (type) {
            if (totalLength) {
                var dataNum = item.Times;
                totalLength = parseFloat(totalLength / 1000).toFixed(3);
                classLayer.dataList.push({
                    dataType: pointType,
                    dataNum: dataNum,
                    length: totalLength
                });
                lengthCount = parseFloat(lengthCount) + parseFloat(totalLength);
                numCount = parseFloat(numCount) + parseFloat(dataNum);
            } else {
                totalLength = item.Times;
                classLayer.dataList.push({
                    dataType: pointType,
                    dataNum: totalLength,
                    length: "-"
                });
                lengthCount = parseFloat(lengthCount) + parseFloat(totalLength);
            }
        } else {
            if (totalLength) {
                var dataNum = item.Times;
                if (pointType != "其他" && pointType != "0") {
                    totalLength = parseFloat(totalLength / 1000).toFixed(3);
                    classLayer.dataList.push({
                        dataType: pointType,
                        dataNum: dataNum,
                        length: totalLength
                    });
                    lengthCount = parseFloat(lengthCount) + parseFloat(totalLength);
                    numCount = parseFloat(numCount) + parseFloat(dataNum);
                }
            } else {
                totalLength = item.Times;
                if (pointType != "其他") {
                    classLayer.dataList.push({
                        dataType: pointType,
                        dataNum: totalLength
                    });
                    lengthCount = parseFloat(lengthCount) + parseFloat(totalLength);
                }
            }
        }
        return lengthCount + "," + numCount;
    },
    arrSortBytwo: function(array_1) {
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        for (var i = 0; i < array_1.length; i++) {
            var arr = array_1[i];
            if (arr.dataType) {
                if (arr.dataType.indexOf("X") != -1) {
                    arr1.push(arr)
                } else {
                    arr2.push(arr)
                }
            } else {
                arr3.push({
                    layerName: arr.layerName
                });
            }
        }
        return arr3.concat(arr2, arr1);
    },
    showClassificationResult4: function(classResList, container, columnNum) {
        var tdCss = "border-right: 1px double #ACA899;border-bottom: 1px double #ACA899;overflow: auto;";
        var htmlStr = '<table id="exportTab" style="width: 100%;" cellspacing="0" >';
        for (var i = 0; i < classResList.length; i++) {
            var classLayer = classResList[i];
            if (classLayer.dataList.length > 1) {
                for (var k = 0; k < classLayer.dataList.length; k++) {
                    var dataObj = classLayer.dataList[k];
                    htmlStr = htmlStr + '<tr>';
                    if (k == 0 && dataObj["layerName"]) {
                        htmlStr = htmlStr + '<td rowspan="' + (classLayer.dataList.length - 1) + '" style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObj["layerName"] + '</td>';
                        k++;
                        dataObj = classLayer.dataList[k];
                        for (var customAttr in dataObj) {
                            htmlStr = htmlStr + '<td style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObj[customAttr] + '</td>';
                        }
                    } else {
                        for (var customAttr in dataObj) {

                            htmlStr = htmlStr + '<td style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObj[customAttr] + '</td>';
                        }
                    }
                    htmlStr = htmlStr + '</tr>';
                }
            }
        }
        htmlStr = htmlStr + '</table>';
        container.html(htmlStr);
    },
    showClassificationResult5: function(classResList, container, columnNum) {
        var tdCss = "border-right: 1px double #ACA899;border-bottom: 1px double #ACA899;overflow: auto;";
        var htmlStr = '<table id="exportTab" style="width: 100%;" cellspacing="0" >';
        for (var i = 0; i < classResList.length; i++) {
            var classLayer = classResList[i];
            if (classLayer.dataList.length > 1) {
                //for (var k = 0; k < classLayer.dataList.length; k++) {
                    var dataObj0 = classLayer.dataList[0];
                    var dataObjn = classLayer.dataList[classLayer.dataList.length-1];
                    htmlStr = htmlStr + '<tr>';
                    if (dataObj0["layerName"]) {
                        htmlStr = htmlStr + '<td style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObj0["layerName"] + '</td>';
                        htmlStr = htmlStr + '<td style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObjn["dataNum"] + '</td>';
                        htmlStr = htmlStr + '<td style="' + tdCss + '" align="center" width="' + 100 / (columnNum + 1) + '%">' + dataObjn["length"] + '</td>';
                    }
                    htmlStr = htmlStr + '</tr>';
               // }
            }
        }
        htmlStr = htmlStr + '</table>';
        container.html(htmlStr);
    },	
	
	
	
    /**
     * 功能：获取指定图层下的所有勾选选中的管线图层列表
     * 参数：layer-指定图层
     * 返回：指定图层下的所有管线图层列表
     */
    getPipeListByLayerChecked: function(layer) {
        var pipelineArr = [];
        var count = layer.GetChildCount();
        var pipelineLayerzTree = $.fn.zTree.getZTreeObj("PipelineLayerTree");
        var checkCount = pipelineLayerzTree.getCheckedNodes(true);
        if (checkCount) {
            for (var j = 0; j < checkCount.length; j++) {
                var node = checkCount[j];
                for (var i = 0; i < count; i++) {
                    var childLayer = layer.GetChildAt(i);
                    var layerTypeC = childLayer.LayerType;
                    if (node.id === childLayer.Guid) {
                        if (layerTypeC === "Pipeline") {
                            var pipelineId = childLayer.Guid;
                            var pipelineName = childLayer.Name;
                            var pipelineServer = childLayer.GISServer;
                            var layerType = childLayer.PipeLineType;
                            pipelineArr.push({
                                id: pipelineId,
                                name: pipelineName,
                                server: pipelineServer,
                                LayerType: layerType
                            });
                        } else {
                            var childCount = childLayer.GetChildCount();
                            if (childCount > 0) {
                                var childPipelineArr = this.getPipeListByLayerChecked(childLayer);
                                for (var k = 0; k < childPipelineArr.length; k++) {
                                    pipelineArr.push(childPipelineArr[k]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return pipelineArr;
    },

    statisticsParamQuery: function(pipelineId, spatial, low, upper, field) {
        var layer = earth.LayerManager.GetLayerByGUID(pipelineId);
        var subLayer = null;
        for (var i = 0, len = layer.GetChildCount(); i < len; i++) {
            subLayer = layer.GetChildAt(i);
            if (subLayer.LayerType == "Container") { // 使用具体的_container图层
                break;
            }
        }
        if (subLayer == null) {
            return;
        }
        var params = subLayer.QueryParameter;
        if (params == null) {
            return null;
        }
        params.ClearCompoundCondition();
        params.ClearSpatialFilter();
        params.ClearRanges();
        params.AddRange(low, upper);
        params.SetClassCountField(field);

        if (spatial != null) {
            params.SetSpatialFilter(spatial);
        }
        params.QueryType = 3;
        params.QueryTableType = 1; //0为点表搜索；1为线表搜索
        var result = subLayer.ClassCountRange();
        return result;
    },
    paramQuery: function(pFeat, guid, filter, queryType, queryTableType) {
        var layer = earth.LayerManager.GetLayerByGUID(guid);
        var subLayer = null;
        for (var i = 0, len = layer.GetChildCount(); i < len; i++) {
            subLayer = layer.GetChildAt(i);
            if (subLayer.LayerType == "Container") { // 使用具体的_container图层
                break;
            }
        }
        if (subLayer == null) {
            return;
        }
        var param = subLayer.QueryParameter;
        param.ClearSpatialFilter();
        if (filter != null) {
            param.Filter = filter;
        }
        if (pFeat != null) {
            param.SetSpatialFilter(pFeat);
        }
        if (queryTableType != null) {
            param.QueryTableType = queryTableType; // 0：SE_Table_Point，1：SE_Table_Line
        }
        param.QueryType = queryType; // SE_AttributeData
        param.PageRecordCount = 12;
        var result = subLayer.SearchFromGISServer();
        return result;
    }	
};


/**
 * 管线测量算法
 */
var PipelineMeasureAlgorithm = {
	/**
	 * 功能：判断两条线段是否相交
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：是否相交结果（true表示相交，false表示不相交）
	 */
	IsSegmentIntersect : function(p1,p2, q1, q2){
		//
        //	每个线段的两点都在另一个线段的左右不同侧，则能断定线段相交
        //	公式对于向量(x1,y1)->(x2,y2),判断点(x3,y3)在向量的左边,右边,还是线上.
        //	p=x1(y3-y2)+x2(y1-y3)+x3(y2-y1).p<0 左侧,	p=0 线上, p>0 右侧
        //
        var line1, line2;

        //	判断q1和q2是否在p1->p2两侧
        line1 = p1.X * (q1.Y - p2.Y) + p2.X * (p1.Y - q1.Y) + q1.X * (p2.Y - p1.Y);
        line2 = p1.X * (q2.Y - p2.Y) + p2.X * (p1.Y - q2.Y) + q2.X * (p2.Y - p1.Y);

        //符号位异或为0:q1和q2在p1->p2同侧
        if (((line1 * line2) >= 0) && !(line1 == 0 && line2 == 0)){
            return false;
        }

        // 判断p1和p2是否在q1->q2两侧
        line1 = q1.X * (p1.Y - q2.Y) + q2.X * (q1.Y - p1.Y) + p1.X * (q2.Y - q1.Y);
        line2 = q1.X * (p2.Y - q2.Y) + q2.X * (q1.Y - p2.Y) + p2.X * (q2.Y - q1.Y);

        //符号位异或为0:p1和p2在q1->q2同侧
        if (((line1 * line2) >= 0) && !(line1 == 0 && line2 == 0)){
            return false;
        }

        //判为相交
        return true;
	},
	
	/**
	 * 功能：获取两条线的交点
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：两条线的交点
	 */
	segmentIntersect : function(p1,p2, q1, q2){
		//根据两点式化为标准式，进而求线性方程组
        var cross_point = earth.Factory.CreateVector2();
        var temp_left, temp_right;

        //求X坐标
        temp_left = (q2.X - q1.X) * (p1.Y - p2.Y) - (p2.X - p1.X) * (q1.Y - q2.Y);
        temp_right = (p1.Y - q1.Y) * (p2.X - p1.X) * (q2.X - q1.X) + q1.X * (q2.Y - q1.Y) * (p2.X - p1.X) - p1.X * (p2.Y - p1.Y) * (q2.X - q1.X);
        cross_point.X = temp_right / temp_left;

        //求Y坐标
        temp_left = (p1.X - p2.X) * (q2.Y - q1.Y) - (p2.Y - p1.Y) * (q1.X - q2.X);
        temp_right = p2.Y * (p1.X - p2.X) * (q2.Y - q1.Y) + (q2.X - p2.X) * (q2.Y - q1.Y) * (p1.Y - p2.Y) - q2.Y * (q1.X - q2.X) * (p2.Y - p1.Y);
        cross_point.Y = temp_right / temp_left;

        return cross_point;
	},
	
	/**
	 * 功能：二维向量的相减
	 * 参数：v1 - 二维向量1, v2 - 二维向量2
	 * 返回：相减后的结果向量
	 */
	Vector2Sub : function(v1,v2){
        var resVec = earth.Factory.CreateVector2();
        resVec.X = v1.X - v2.X;
        resVec.Y = v1.Y - v2.Y;
        return resVec;
	},
	
	/**
	 * 功能：三维向量的相减
	 * 参数：v1 - 三维向量1, v2 - 三维向量2
	 * 返回：相减后的结果向量
	 */
	VectorSub : function(v1,v2){
        var resVec = earth.Factory.CreateVector3();
        resVec.X = v1.X - v2.X;
        resVec.Y = v1.Y - v2.Y;
        resVec.Z = v1.Z - v2.Z;
        return resVec;
	},
	
	/**
	 * 功能：判断空间线段是否共面
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：true为共面，false为不共面
	 */
	IsInterface : function(p1,p2, q1, q2){
		var tempV = this.VectorSub(p1, q1); //p1 - q1;
        var line1 = this.VectorSub(p1, p2); //p1 - p2;
        var line2 = this.VectorSub(q1, q2); //q1 - q2;
        return (tempV.Dot(line1.Cross(line2))==0);
	},
	
	/**
	 * 功能：计算空间点到线段的最小距离垂线的垂足
	 * 参数：q - 空间点, p1 - 线段2端点, p2 - 线段2端点
	 * 返回：空间点到线段的最小距离垂线的垂足
	 */
	Point2LineFoot : function(q, p1, p2){
        var footP = earth.Factory.CreateVector3();
        var v12 = this.VectorSub(p1,p2); //p1-p2
        var l = v12.Length * v12.Length;
        var k = -((p1.X - q.X) * (p2.X - p1.X) + (p1.Y - q.Y)*(p2.Y - p1.Y) + (p1.Z - q.Z)*(p2.Z - p1.Z)) / l;
        footP.X = k * (p2.X - p1.X) + p1.X;
        footP.Y = k * (p2.Y - p1.Y) + p1.Y;
        footP.Z = k * (p2.Z - p1.Z) + p1.Z;
        return footP;
	},
	
	/**
	 * 功能：求空间直线公垂线的两个垂足点
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：空间直线公垂线的两个垂足点
	 */
	Line2LineFoot : function(p1, p2, q1, q2){
		 var foots = [];
         var ab = this.VectorSub(p2,p1); //p2-p1;
         var cd = this.VectorSub(q2,q1); //q2-q1;
         var f1ab = ab.Length * ab.Length;
         var f1cd = cd.Length * cd.Length;
         var f2 = ab.Dot(cd);
         var f3ab = ab.Dot(this.VectorSub(q1,p1));
         var f3cd = cd.Dot(this.VectorSub(q1,p1));
         var t1 = (f3ab * f1cd - f3cd * f2) / (f1ab * f1cd - f2 * f2);
         var t2 = (f3cd * f1ab - f2 * f3ab) / (f2 * f2 - f1ab * f1cd);
         
         var foot1 = earth.Factory.CreateVector3();
         foot1.X = t1 * (p2.X - p1.X) + p1.X;
         foot1.Y = t1 * (p2.Y - p1.Y) + p1.Y;
         foot1.Z = t1 * (p2.Z - p1.Z) + p1.Z;    
         foots.push(foot1);
         
         var foot2 = earth.Factory.CreateVector3();
         foot2.X = t2 * (q2.X - q1.X) + q1.X;
         foot2.Y = t2 * (q2.Y - q1.Y) + q1.Y;
         foot2.Z = t2 * (q2.Z - q1.Z) + q1.Z;
         foots.push(foot2);         
         //验证是否是公垂线
         return foots;
	},
	
	/**
	 * 功能：计算空间点到线段的最小距离
	 * 参数：q - 空间点, p1 - 线段2端点, p2 - 线段2端点
	 * 返回：空间点到线段的最小距离
	 */
	Point2Line : function(q, p1, p2){
		 var foot = this.Point2LineFoot(q, p1, p2); 
         //判断垂足点是否在线段内
         if (Math.min(p1.X, p2.X) <= foot.X && foot.X <= Math.max(p1.X, p2.X) && 
        	 Math.min(p1.Y, p2.Y) <= foot.Y && foot.Y <= Math.max(p1.Y, p2.Y) && 
        	 Math.min(p1.Z, p2.Z) <= foot.Z && foot.Z <= Math.max(p1.Z, p2.Z)){
             ///空间三角求点到该线段所在直线的最小距离
             //double p = ((p1 - p2).Length + (p1 - q).Length + (p2 - q).Length) / 2;
             //double s = Math.Sqrt(p * (p - (p1 - p2).Length) * (p - (p1 - q).Length) * (p - (p2 - q).Length));
             //return 2 * s / (p2 - p1).Length;

             ///垂线长
        	 var vFootP = this.VectorSub(foot,q); //(foot - q).Length;
             var verticalLineLength = vFootP.Length;
             return verticalLineLength;
         }else {
             //点到线段两端点的最小距离
        	 var vp1 = this.VectorSub(q , p1); //q - p1
        	 var vp2 = this.VectorSub(q , p2); //q - p2
             return Math.min(vp1.Length, vp2.Length);
         }
	},
	
	/**
	 * 功能：求空间两直线的最短距离，即公垂线长
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：公垂线长
	 */
	CommonLine : function(p1,p2, q1, q2){
        var line1 = this.VectorSub(p2 , p1); //p2 - p1;
        var line2 = this.VectorSub(q2 , q1); //q2 - q1;
        var commonline = line1.Cross(line2);
        var lenght = Math.abs(commonline.Dot(this.VectorSub(q1 , p1)) / commonline.Length);
        return lenght;
    },
	
	/**
	 * 功能：求空间线段的最小距离
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：空间线段的最小距离
	 */
	SegmentMinDistance : function(p1,p2, q1, q2){
		//判断是否共面
        if (this.IsInterface(p1, p2, q1, q2) == true){
            ///
            ///判断是否相交,可以省去
            ///
            var d1 = this.Point2Line(p1, q1, q2);
            var d2 = this.Point2Line(p2, q1, q2);
            var d3 = this.Point2Line(q1, p1, p2);
            var d4 = this.Point2Line(q2, p1, p2);
            var minDistance = Math.min(d1, d2);
            minDistance = Math.min(minDistance, d3);
            minDistance = Math.min(minDistance, d4);
            return minDistance;
        }else {
            var foot = this.Line2LineFoot(p1, p2, q1, q2);
            //判断线段p1、p2直线上的垂足foot[0]是否在线段上
            if (Math.min(p1.X, p2.X) <= foot[0].X && foot[0].X <= Math.max(p1.X, p2.X) && 
            	Math.min(p1.Y, p2.Y) <= foot[0].Y && foot[0].Y <= Math.max(p1.Y, p2.Y) && 
            	Math.min(p1.Z, p2.Z) <= foot[0].Z && foot[0].Z <= Math.max(p1.Z, p2.Z)){
                //判断线段q1、q2直线上的垂足foot[1]是否在线段上
                if (Math.min(q1.X, q2.X) <= foot[1].X && foot[1].X <= Math.max(q1.X, q2.X) && 
                	Math.min(q1.Y, q2.Y) <= foot[1].Y && foot[1].Y <= Math.max(q1.Y, q2.Y) && 
                	Math.min(q1.Z, q2.Z) <= foot[1].Z && foot[1].Z <= Math.max(q1.Z, q2.Z)){
                    return this.CommonLine(p1, p2, q1, q2);
                }else { //p1、p2直线上的垂足foot[0]到q1、q2线段的最小距离
                    var d1 = this.Point2Line(p1, q1, q2);
                    var d2 = this.Point2Line(p2, q1, q2);
                    var d3 = this.Point2Line(foot[0], q1, q2);
                    var min = Math.min(d1,d2);
                    return Math.min(min, d3);
                }
            }else if (Math.min(q1.X, q2.X) <= foot[1].X && foot[1].X <= Math.max(q1.X, q2.X) && 
            		  Math.min(q1.Y, q2.Y) <= foot[1].Y && foot[1].Y <= Math.max(q1.Y, q2.Y) && 
            		  Math.min(q1.Z, q2.Z) <= foot[1].Z && foot[1].Z <= Math.max(q1.Z, q2.Z)){
                var d1 = this.Point2Line(q1, p1, p2);
                var d2 = this.Point2Line(q2, p1, p2);
                var d3 = this.Point2Line(foot[1], p1, p2);
                var min = Math.min(d1, d2);
                return Math.min(min, d3);
            }else{
                var d1 = this.Point2Line(p1, q1, q2);
                var d2 = this.Point2Line(p2, q1, q2);
                var d3 = this.Point2Line(q1, p1, p2);
                var d4 = this.Point2Line(q2, p1, p2);
                var minDistance = Math.min(d1, d2);
                minDistance = Math.min(minDistance, d3);
                minDistance = Math.min(minDistance, d4);
                return minDistance;
            }
        }
	},

	/**
	 * 功能：求空间线段的最小距离
	 * 参数：p1 - 线段1端点, p2 - 线段1端点, q1 - 线段2端点, q2 - 线段2端点
	 * 返回：空间线段的最小距离
	 */
	generatePolygons: function(vec3sList){

	}

};
