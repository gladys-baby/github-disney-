var ApprovalMgr = {};
var pipeDataDoc = null;
var pipeLineObjList = null; //存放生成的管线对象
(function(){
	var imgLocation = "http://" + getRootPath() + "/image/PipeMaterial/Standard/";

	/**
	 * 功能：获取项目根路径
	 */
    function getRootPath(){    
    	var pathName=window.document.location.pathname;    
    	var localhost=window.location.host;    
    	var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);    
    	return(localhost+projectName);
    }
    function initApprovalEnvir(){
		if(pipeDataDoc == null){
			pipeDataDoc = getPipeDataDoc();
			pipeLineObjList = initPipeDataObj(pipeDataDoc);
		}
    }
    
    function getImportedPipeList(){
    	initApprovalEnvir();
		var pipeArr = [];
		var pipeRoot = pipeDataDoc.documentElement.firstChild;
		var pipeList = pipeRoot.childNodes;
		for(var i = 0; i < pipeList.length; i++){   //PipelineType
			var pipeNode = pipeList[i];
			var id = pipeNode.getAttribute("id");
			var name = pipeNode.getAttribute("name");
            var pipeType = pipeNode.getAttribute("type");
			pipeArr.push({id:id, name:name,pipeType:pipeType});
		}
		return pipeArr;
    }
    function getImportedPolognList(){
    	initApprovalEnvir();
		var pipeArr = [];
		var pipeList = pipeDataDoc.getElementsByTagName("PipePolygonElement");
		//var pipeList = pipeRoot.childNodes;
		for(var i = 0; i < pipeList.length; i++){
			var pipeNode = pipeList[i];
			var id = pipeNode.getAttribute("id");
			var name = pipeNode.getAttribute("name");
			pipeArr.push({id:id, name:name});
		}
		return pipeArr;
    }
    
    /**
	 * 功能：导入XML管线文件
	 */
	function importXmlFile(){
		var filepath = earth.UserDocument.OpenFileDialog("", "*.xml|*.XML");
		if((filepath === null)||(filepath === "")){
			return;
		}
		var pipeDataXml = earth.UserDocument.LoadXmlFile(filepath);
		var tmpDoc = loadXMLStr(pipeDataXml);
		var root = tmpDoc.documentElement;
		var nodes;
		var node;
		var lineNode;
		var projectIDValue=parent.projectListVal;
		var pipeLineValue=parent.pipeListVal;
		var layer=earth.LayerManager.GetLayerByGUID(pipeLineValue);
		var LayerName=layer.name;
		var pipelineTypeName=LayerName[0]+LayerName[1]; 
		//parent.importPipeLineType=pipelineType;
		var tmpNode = lookupNodeByName(pipeDataDoc,pipelineTypeName);
		if(tmpNode == null){//如果管线文件没有导入，则导入管线文件。否则直接显示导入的管线树
			//创建导入管线的根节点
			var guid = earth.Factory.CreateGuid();
            var type =layer.PipelineType;
			var pipeRootNode = createPipeRootNode(guid,LayerName,projectIDValue,pipeLineValue,type);
			pipeDataDoc.documentElement.firstChild.appendChild(pipeRootNode);
			//创建管线线对象和节点

			var pipelineNodes = tmpDoc.getElementsByTagName("线");
			var nodes=tmpDoc.getElementsByTagName("节点");
			//for(var i = 0; nodes != null && i < nodes.length; i++){
			var i=0;
			for(var m = 0; pipelineNodes != null && m < pipelineNodes.length; m++){
				var pipelineNode = pipelineNodes[m];
				var vector3s = earth.Factory.CreateVector3s();
				var lid=pipelineNode.getAttribute("lid");
				var vec3s = getPipelineVec3sByNode(pipelineNode);
				//nodes=pipelineNodes.context.getElementsByTagName("节点");
				
				node=nodes[i].getAttribute("pid");
				var specification = getSpecificationByNode(pipelineNode);
				var pipeLineName = pipelineNode.selectSingleNode("名称").text;
                var nodeNames1=  pipelineNode.childNodes[0].getAttribute("pid");
                var nodeNames2 = pipelineNode.childNodes[1].getAttribute("pid");
				var pipelineId = earth.Factory.CreateGuid();
				var pipelineObject = createPipeLine(vec3s,specification,pipeLineName,type,pipelineId);
				pipeLineObjList.push(pipelineObject);
				var pipeDataNode = createPipeDataNode(nodeNames1,nodeNames2,lid,pipelineId,vec3s,specification,pipeLineName,type);
				pipeRootNode.appendChild(pipeDataNode);
				i=i+2;
			}
			
			var pipePolygonNodes = tmpDoc.getElementsByTagName("面");
			if(pipePolygonNodes!=null||pipePolygonNodes!=""){
			for(var n = 0; pipePolygonNodes != null && n < pipePolygonNodes.length; n++){
				var pipePolygonNode = pipePolygonNodes[n];
				var vec3s = getPipePolygonVec3sByNode(pipePolygonNode);
				var pipePolygonName = pipePolygonNode.selectSingleNode("名称").text;
				var pipePolygonId = earth.Factory.CreateGuid();
				var height = getVolumeHeight(vec3s.Items(0));
				var pipePolygonObject = createPipePolygon(vec3s, height,pipePolygonName, pipePolygonId);
                //parent.wellPolygon =   pipePolygonObject;
				pipeLineObjList.push(pipePolygonObject);
				var pipePolygonNode = createPipePolygonNode(vec3s,height,pipePolygonName,pipePolygonId);
				pipeRootNode.appendChild(pipePolygonNode);
				$("div[tag='AcceptWellPosCompare']").attr("disabled",false);
				}
			}else{
				$("div[tag='AcceptWellPosCompare']").attr("disabled",true);
			}		
			savePipeDataFile(pipeDataDoc.xml);
		}else{
			alert(pipelineTypeName + "管线已经导入");
		}
		if($("#ifResult").attr("src") != "html/approval/approvalImportXml.html"){
			showLargeDialog("html/approval/approvalImportXml.html", "数据导入");	
		}else{
			ifResult.pipeDataTree = ifResult.initPipeDataTree(pipeDataDoc);
		}		
	}
	
	function initPipeDataObj(pipeDataDoc){
		var pipeLineObjList = [];
		var pipelineNodes = pipeDataDoc.getElementsByTagName("PipelineElement");
		for(var m = 0; pipelineNodes != null && m < pipelineNodes.length; m++){
			var pipelineNode = pipelineNodes[m];
			var coordinateStr = pipelineNode.selectSingleNode("Coordinates").text; 
			var coordinateArr = coordinateStr.split(",");
			var vec3s = earth.Factory.CreateVector3s(); 	
			for(var k = 0; k < coordinateArr.length; k = k + 3){
				vec3s.Add(coordinateArr[k], coordinateArr[k+1], coordinateArr[k+2]);
			}
			var specification = pipelineNode.selectSingleNode("Specification").text; 
			var pipeLineName = pipelineNode.getAttribute("name");
			var type = pipelineNode.selectSingleNode("PipeType").text; 
			var pipelineId = pipelineNode.getAttribute("id");
			var pipelineObject = createPipeLine(vec3s,specification,pipeLineName,type,pipelineId);
			pipeLineObjList.push(pipelineObject);
		}
		
		var pipePolygonNodes = pipeDataDoc.getElementsByTagName("PipePolygonElement");
		for(var n = 0; pipePolygonNodes != null && n < pipePolygonNodes.length; n++){
			var pipePolygonNode = pipePolygonNodes[n];				
			var coordinateStr = pipePolygonNode.selectSingleNode("Coordinates").text; 
			var coordinateArr = coordinateStr.split(",");
			var vec3s = earth.Factory.CreateVector3s(); 	
			for(var k = 0; k < coordinateArr.length; k = k + 3){
				vec3s.Add(coordinateArr[k], coordinateArr[k+1], coordinateArr[k+2]);
			}
			var pipePolygonName = pipePolygonNode.getAttribute("name");
			var pipePolygonId = pipePolygonNode.getAttribute("id");
			var height = parseFloat(pipePolygonNode.selectSingleNode("Height").text);
			var pipePolygonObject = createPipePolygon(vec3s, height, pipePolygonName, pipePolygonId);
			pipeLineObjList.push(pipePolygonObject);
		}
		return pipeLineObjList;
	}
	
	
	/**
	 * 功能：保存文档信息
	 * 参数：docXml-要保存的标注文档信息
	 * 返回：无
	 */
	function savePipeDataFile(docXml){
		var savePath = earth.Environment.RootPath + "temp\\PipeData";
		earth.UserDocument.SaveXmlFile(savePath, docXml);
	}

	/**
	 * 功能：创建标注文档
	 * 参数：无
	 * 返回：新建创建的文档内容
	 */
	function createPipeDataFile(){
		var id = earth.Factory.CreateGuid();
		var xmlStr = '<xml><PipeDataDocument id="' + id + '" name="导入数据" checked="true" /></xml>';
		savePipeDataFile(xmlStr);
		return xmlStr;
	}

	/**
	 * 功能：获取标注文档对象
	 * 参数：无
	 * 返回：标注文档对象
	 */
	function getPipeDataDoc(){
		var loadPath = earth.Environment.RootPath + "temp\\PipeData.xml";
		var docXml = earth.UserDocument.LoadXmlFile(loadPath);
		if((docXml == null) || (docXml == "")){
			docXml = createPipeDataFile();
		}
		var fileDoc = loadXMLStr(docXml);
		return fileDoc;
	}	
	

    function createPipeRootNode(rootId,rootName,projectIDValue,pipeLineValue,type){
		var attrArr = [
			{name: "id", value: rootId},
			{name: "name", value: rootName},
            {name: "type", value: type},
			{name: "checked", value: "true"}
		];
		var pipeRootNode = createElementNode("Pipeline",attrArr,pipeDataDoc);
		pipeRootNode.appendChild(createElementText("ProjectId",projectIDValue,pipeDataDoc));
		pipeRootNode.appendChild(createElementText("PipeLineId",pipeLineValue,pipeDataDoc));
		return pipeRootNode;
	}
    
    function createPipeDataNode(node,nodeend,lid,pipeLineId,vec3s,specification,pipeLineName,type){
		var attrArr = [
			{name: "id", value: pipeLineId},
			{name:"pipeId",value:lid},
			{name: "name", value: pipeLineName},
            {name: "type", value: type},
			{name: "checked", value: "true"}
		];
		var lineCoordinate = "";
        for (var i = 0; i < vec3s.Count; i++) {
            var pt = vec3s.Items(i);
            if(lineCoordinate == ""){
                lineCoordinate = pt.X + "," + pt.Y + "," + pt.Z ;
            }else{
            	lineCoordinate = lineCoordinate + "," + pt.X + "," + pt.Y + "," + pt.Z ;
            }
        }
		var pipelineNode = createElementNode("PipelineElement",attrArr,pipeDataDoc);
		
		pipelineNode.appendChild(createElementText("Coordinates", lineCoordinate, pipeDataDoc));
		pipelineNode.appendChild(createElementText("Specification", specification, pipeDataDoc));
		pipelineNode.appendChild(createElementText("PipeType", type, pipeDataDoc));
		pipelineNode.appendChild(createElementText("NodeId", node, pipeDataDoc));
        pipelineNode.appendChild(createElementText("NodeIdEnd", nodeend, pipeDataDoc));
		return pipelineNode;
	}
	
	
    function createPipePolygonNode(vec3s,height,polygonName,polygonNameId){
		var attrArr = [
			{name: "id", value: polygonNameId},
			{name: "name", value: polygonName},
			{name: "checked", value: "true"}
		];
		var polyCoordinate = "";
        for (var i = 0; i < vec3s.Count; i++) {
            var pt = vec3s.Items(i);
            if(polyCoordinate == ""){
                polyCoordinate = pt.X + "," + pt.Y + "," + pt.Z ;
            }else{
            	polyCoordinate = polyCoordinate + "," + pt.X + "," + pt.Y + "," + pt.Z ;
            }
        }
		var pipePolygonNode = createElementNode("PipePolygonElement",attrArr,pipeDataDoc);
		pipePolygonNode.appendChild(createElementText("Coordinates", polyCoordinate, pipeDataDoc));
		pipePolygonNode.appendChild(createElementText("Height", height.toString(), pipeDataDoc));
		return pipePolygonNode;
	}
    

    function getPipelineVec3sByNode(node){  
		var pipelineVec3s = earth.Factory.CreateVector3s(); 	
		var pointNodes = node.getElementsByTagName("节点");
		for(var m = 0; pointNodes != null && m < pointNodes.length; m++){
			var pointNode = pointNodes[m];
			var xVal = pointNode.selectSingleNode("横坐标").text;
			var yVal = pointNode.selectSingleNode("纵坐标").text;
			var zVal = pointNode.selectSingleNode("高程").text;
			//var id=pointNode.getAttribute("pid");
			pipelineVec3s.Add(xVal, yVal, zVal);
		}
		return pipelineVec3s;
    }
    
   
    function getPipePolygonVec3sByNode(node){    
		var pipepolygonVec3s = earth.Factory.CreateVector3s(); 	
		var pointNodes = node.getElementsByTagName("多边形点");
		for(var m = 0; pointNodes != null && m < pointNodes.length; m++){
			var pointNode = pointNodes[m];
			var xVal = pointNode.selectSingleNode("横坐标").text;
			var yVal = pointNode.selectSingleNode("纵坐标").text;
			var zVal = pointNode.selectSingleNode("高程").text;
			pipepolygonVec3s.Add(xVal, yVal, zVal);
		}
		return pipepolygonVec3s;
    }
    
    function getSpecificationByNode(node){
    	var specification = null;
    	var width = parseFloat(node.selectSingleNode("Width").text);
    	var height = parseFloat(node.selectSingleNode("Height").text);
    	if(width == 0){ //width为0，表示管线为圆管线
    		specification = height.toString();
    	}else{
    		specification = width + "X" + height;
    	}
    	return specification;
    }
	

	function createPipeLine(vec3s,specification,pipeLineName,type,pipelineId){
		var pipeLineTypeValue = PipelineStandard.PipelineType[type];
		var sideTexturePath = imgLocation + pipeLineTypeValue+".jpg";
		createNewLayer();
		return createModel(vec3s,specification,pipelineId,pipeLineName,sideTexturePath);
	}
	
    function createNewLayer(){
        var tempDemPath = earth.Environment.RootPath + "\\temp\\terrain\\";
        var rect = earth.TerrainManager.GetTempLayerRect();
        var levelMin = earth.TerrainManager.GetTempLayerMinLevel();
        var levelMax = earth.TerrainManager.GetTempLayerMaxLevel();
        var guid = earth.Factory.CreateGUID();
        var tempLayer = earth.Factory.CreateDemLayer(guid, "TempTerrainLayer", tempDemPath, rect, levelMin, levelMax, 1000);
        earth.AttachObject(tempLayer);
    }
    
    function createModel(args,specification,modelGuid,name,sideTexturePath) {
    	 // 生成边缘模型
        var terrain = earth.TerrainManager;
        var mModelObj = null;
        if(specification.indexOf("X") == -1){
        	var radius = 0.0005 * parseFloat(specification);
        	mModelObj = terrain.GenerateRoundTunnel(modelGuid,name, args,radius, 24, sideTexturePath);
        }else{
        	var width = specification.split("X")[0];
        	width = 0.001 * parseFloat(width);
        	var height = specification.split("X")[1];
        	height = 0.001 * parseFloat(height);
        	mModelObj = terrain.GenerateTunnel(modelGuid,name, args, width,height,sideTexturePath);
        }
    	earth.AttachObject(mModelObj);
    	return mModelObj;
    }
    
    function getVolumeHeight(posPoint){
    	var lon = posPoint.X;
    	var lat = posPoint.Y;
    	var alt = earth.GlobeObserver.GetHeight(lon, lat);
    	var height = Math.abs(alt - posPoint.Z - 0.5);
    	return height;
    }
	
    function createPipePolygon(vec3s, height, polygonName, polygonId){
    	if(height < 5){
    		height = 5;
    	}
		var bufPolygon = earth.Factory.CreateElementVolume(polygonId, polygonName);
		bufPolygon.BeginUpdate();
		bufPolygon.Height = 5;
		bufPolygon.SphericalVectors = vec3s;
		bufPolygon.EndUpdate();
		earth.AttachObject(bufPolygon);		
		return bufPolygon;
    }
    
	function getSelectedPipeDataIndex(guid){
		var index = -1;
		for(var i = 0; i < pipeLineObjList.length; i++){
			if(pipeLineObjList[i].Guid == guid){
				index = i;
				break;
			}
		}
		return index;
	}
	 function deleteAllElement(){
       for(var i=0;i<pipeLineObjList.length;i++){
           earth.DetachObject(pipeLineObjList[i]);
       }
         pipeLineObjList = [];
     }
	function deletePipeDataById(guid){
		var pos = getSelectedPipeDataIndex(guid);
		if(pos != -1){
			earth.DetachObject(pipeLineObjList[pos]);
			pipeLineObjList.splice(pos,1);
		}	
	}
	
	function getPipeDataById(guid){
		var pipeData = null;
		for(var i = 0; i < pipeLineObjList.length; i++){
			if(pipeLineObjList[i].Guid == guid){
				pipeData = pipeLineObjList[i];
				break;
			}
		}
		return pipeData;
	}
	/*function getPipeNameById(guid){
		var name = null;
		for(var i = 0; i < pipeLineObjList.length; i++){
			if(pipeLineObjList[i].Guid == guid){
				name = pipeLineObjList[i].Name;
				break;
			}
		}
		return name;
	}*/
	function initImportedPipeList(container){
    	var pipeArr = getImportedPipeList();
    	for(var i = 0; i < pipeArr.length; i++){
    		var id = pipeArr[i].id;
    		var name = pipeArr[i].name;
			container.append('<option value="' + id + '">' + name + '</option>');
    	}
	}

	function initCillisionPipeList(){
		 var pipeArr = getImportedPipeList();
		 for(var i = 0; i < pipeArr.length; i++){
		    var id = pipeArr[i].id;
		    var name = pipeArr[i].name;
		    //alert(name);
				return name;
		    	}
			}
	function initImportedPolognForDisAys(container){
    	var pipeArr = getImportedPolognList();
    	for(var i = 0; i < pipeArr.length; i++){
    		var id = pipeArr[i].id;
    		var name = pipeArr[i].name;
    		
    			container.append('<option value="' + id + '">' + name + '</option>');
		
    	}
	}

	function initImportedPipeListForDisAys(){
    	var pipeArr = getImportedPipeList();
    	for(var i = 0; i < pipeArr.length; i++){
    		var id = pipeArr[i].id;
    		var name = pipeArr[i].name;
            var pipeType = pipeArr[i].pipeType ;
    		//if(pipeType == "5000" || pipeType == "1000"){
    			return name;
    		//}
    	}
	}
	
	
	function getPipelineCoords(pipeId){
		var pipeNode = lookupNodeById(pipeDataDoc,pipeId);
		if(pipeNode == null){
			return null;
		}
		var geoLines = earth.Factory.CreateGeoPoints();
		var pipelineNodes = pipeNode.getElementsByTagName("PipelineElement");
		for(var i = 0; i < pipelineNodes.length; i++){
			var pipelineNode = pipelineNodes[i];
			var coordStr = pipelineNode.selectSingleNode("Coordinates").text;		     
		    var coordArr = coordStr.split(",");	    
		    for(var k = 0; k < coordArr.length; k = k + 3){
		    	geoLines.add(coordArr[k], coordArr[k+1], coordArr[k+2]);
		    }
		}
		return geoLines;
	}
	
//================add by JIA Rong start ================================
	
    /**
	 * 功能：导入XML管线文件
	 */
	function importGUOLUGUAN(){
		var pipeId;
		var filepath = earth.UserDocument.OpenFileDialog("", "*.xml|*.XML");
		if((filepath === null)||(filepath === "")){
			return;
		}
		var pipeDataXml = earth.UserDocument.LoadXmlFile(filepath);
		var tmpDoc = loadXMLStr(pipeDataXml);
		var root = tmpDoc.documentElement;
		var nodes;
		var node;
		var lineNode;

			//创建管线线对象和节点

			var pipelineNodes = tmpDoc.getElementsByTagName("线");
			var nodes=tmpDoc.getElementsByTagName("节点");
			//for(var i = 0; nodes != null && i < nodes.length; i++){
			var i=0;
			for(var m = 0; pipelineNodes != null && m < pipelineNodes.length; m++){
				var pipelineNode = pipelineNodes[m];
				var vector3s = earth.Factory.CreateVector3s();
				var lid=pipelineNode.getAttribute("lid");
				var vec3s = getPipelineVec3sByNode(pipelineNode);
				//nodes=pipelineNodes.context.getElementsByTagName("节点");
				
				node=nodes[i].getAttribute("pid");
				var specification = getSpecificationByNode(pipelineNode);
				var pipeLineName = pipelineNode.selectSingleNode("名称").text + pipelineNode.selectSingleNode("PipeID").text;
                var nodeNames1=  pipelineNode.childNodes[0].getAttribute("pid");
                var nodeNames2 = pipelineNode.childNodes[1].getAttribute("pid");

				var pipelineId = earth.Factory.CreateGuid();
				//暂用工业管颜色表示导入过路管
				var pipelineObject = createPipeLine(vec3s,specification,pipeLineName,"Industry",pipelineId);
				//pipeLineObjList.push(pipelineObject);
			}
			
	}
	
//===============================JIA Rong End=============================
	
	
	
	
	
	ApprovalMgr.initApprovalEnvir = initApprovalEnvir;
	ApprovalMgr.importXmlFile = importXmlFile;
	ApprovalMgr.getPipeDataById = getPipeDataById;
	ApprovalMgr.deletePipeDataById = deletePipeDataById;
    ApprovalMgr.deleteAllElement=deleteAllElement;
	ApprovalMgr.savePipeDataFile = savePipeDataFile;
	ApprovalMgr.getImportedPipeList = getImportedPipeList;
	ApprovalMgr.initImportedPipeList = initImportedPipeList;
	ApprovalMgr.initImportedPipeListForDisAys = initImportedPipeListForDisAys;
	ApprovalMgr.getPipelineCoords = getPipelineCoords;
	ApprovalMgr.initCillisionPipeList=initCillisionPipeList;
	ApprovalMgr.initImportedPolognForDisAys=initImportedPolognForDisAys;
	ApprovalMgr.importGUOLUGUAN=importGUOLUGUAN;

	
	
})();