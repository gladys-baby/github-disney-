var FieldValueStringMap={};
(function () {
	 var GetLayerTypeString=function(type)
     {
         switch(type)
         {
             case "Electricity":
                 return "电力电缆";
             case "Energetics":
                 return "热力管线";
             case "FeedWater":
                 return "供水管线";
             case "Gas":
                 return "燃气管线";
             case "Industry":
                 return "工业管线";
             case "Rain":
                 return "雨水管线";
             case "Road":
                 return "道路";
             case "Sewage":
                 return "污水管线";
             case "Telegraphy":
                 return "电信电缆";
             case "Television":
                 return "电视电缆";
             case "Streetlamp":
                 return "路灯电缆";
             default:
                 return "未知";
         }
     };
     var GetMaterialString=function(matCode)
     {
         switch (matCode)
         {
             // 普通点
             case 0:
                 return "铸铁";
             case 1:
                 return "球墨铸铁";
             case 2:
                 return "砼";
             case 3:
                 return "钢";
             case 4:
                 return "玻璃钢";
             case 5:
                 return "PVC";
             case 6:
                 return "陶瓷";
             case 7:
                 return "砖";
             case 8:
                 return "铜";
             case 9:
                 return "光纤";
             case 0xffff:
                 return "未知";
             default:
                 return matCode.toString();
         }
     };

     // 点性质代码对应字符串
     var GetPointTypeString = function(pntCode)
     {
         switch (pntCode)
         {
             // 普通点
             case 0x0000:
                 return "普通点标记";
             case 0x0001:
                 return "非普查";
             case 0x0002:
                 return "预留口";
             case 0x0003:
                 return "直线点";
             case 0x0004:
                 return "转折点";
             case 0x0005:
                 return "分支点";
             case 0x0006:
                 return "变径点";
             case 0x0007:
                 return "变深点";
             case 0x0008:
                 return "盖堵";
             case 0x0009:
                 return "源点";
             case 0x000A:
                 return "进水口";
             case 0x000B:
                 return "出水口";

             // 连接点
             case 0x1000:
                 return "连接点标记";
             case 0x1001:
                 return "管帽";
             case 0x1002:
                 return "弯头";
             case 0x1003:
                 return "三通";
             case 0x1004:
                 return "四通";
             case 0x1005:
                 return "五通";

             // 功能设备点
             case 0x2000:
                 return "设备点标记";
             case 0x2001:
                 return "上杆";
             case 0x2002:
                 return "接线箱";
             case 0x2003:
                 return "化粪池";
             case 0x2004:
                 return "阀门";
             case 0x2005:
                 return "水表";
             case 0x2006:
                 return "消防栓";
             case 0x2007:
                 return "凝水缸";
             case 0x2008:
                 return "调压箱";
             default:
                 return pntCode.toString();
         }
     };

     // 埋设类型对应字符串
     var GetCoverageTypeString=function(covCode)
     {
         switch(covCode)
         {
             case 0:
                 return "直埋";
             case 1:
                 return "管埋";
             case 2:
                 return "管块";
             case 3:
                 return "沟道";
             case 4:
                 return "架空";
             default:
                 return covCode.toString();
         }
     };

     // 流向对应字符串
     var GetFlowDirString=function(dirCode)
     {
         switch(dirCode)
         {
             case 1:
                 return "起点到终点";
             case 2:
                 return "终点到起点";
             case 3:
                 return "双向";
             default:
                 return "未知";
         }
     };

     // 井形状对应字符串
     var GetWellTypeString=function(wellCode)
     {
         switch(wellCode)
         {
             case 0:
                 return "无井";
             case 1:
                 return "圆井";
             case 2:
                 return "方井";
             case 3:
                 return "雨水篦子";
             case 4:
                 return "手孔";
             default:
                 return wellCode.toString();
         }
     };

     // 字段名对应中文字符串 -- 该方法废弃!
     var GetFieldNameString=function(nameCode)
     {
         switch (nameCode)
         {
                 // 通用。屏蔽GUID，对用户无意义
             case "US_KEY":
                 return "唯一编号";
                 // line
             /*case "US_SPT_KEY":
                 return "起点编号";
             case "US_EPT_KEY":
                 return "终点编号";*/
             /*case "US_SDEEP":
                 return "起点埋深";
             case "US_EDEEP":
                 return "终点埋深";*/
             /*case "US_SALT":
                 return "起点地面高程";
             case "US_EALT":
                 return "终点地面高程";*/
             case "US_LTTYPE":
                 return "埋设类型";
             case "US_FLOWDIR":
                 return "管内流向";
             case "US_PMATER":
                 return "材质类型";
             case "US_PDIAM":
                 return "圆管直径";
             case "US_FLOWDIR":
                 return "管内流向";
             case "US_IS_SCRA":
                 return "废弃年代";
             case "US_BD_TIME":
                 return "建设日期";
             case "US_FX_YEAR":
                 return "使用年限";
             case "US_OWNER":
                 return "权属单位";
             case "US_STATE":
                 return "使用状态";
             case "US_UPDATE":
                 return "更新状态";
             case "US_PWIDTH":
                 return "方管宽度";//4.23修改fxd为字段加了一个P
             case "US_PHEIGHT":
                 return "方管高度";//4.23修改fxd为字段加了一个P
             case "US_SIZE":
                 return "管径";
                 // point
             case "US_PT_ALT":
                 return "点高程";
             case "US_PT_TYPE":
                 return "点类型";
            /* case "US_WELL":
                 return "井形状";
             case "US_WELL_ID":
                 return "相关井ID";*/
             /*case "US_FEATURE":
                 return "关联的模型";*/
             case "US_ATTACHM":
                 return "附属物";
             case "US_ROAD":
                 return "道路名称";
             default:
                 return "";
         }
     };

 // 字段值对应中文字符串 --- 废弃字段待处理
 var GetFieldValueString=function(nameCode, valueCode)
 {   var value = parseInt(valueCode);
     switch (nameCode)
     {
         // line
         case "US_LTTYPE":
        	 return FieldValueStringMap.GetCoverageTypeString(value);
         case "US_FLOWDIR":
             return FieldValueStringMap.GetFlowDirString(value);
         case "US_PMATER":
             return FieldValueStringMap.GetMaterialString(value);
         // point
         case "US_PT_TYPE":
             return FieldValueStringMap.GetPointTypeString(value);
         case "US_WELL":
             return FieldValueStringMap.GetWellTypeString(value);

         default:
             return valueCode;
     }
 };
 FieldValueStringMap.GetCoverageTypeString=GetCoverageTypeString;
 FieldValueStringMap.GetWellTypeString=GetWellTypeString;
 FieldValueStringMap.GetFlowDirString=GetFlowDirString;
 FieldValueStringMap.GetMaterialString=GetMaterialString;
 FieldValueStringMap.GetPointTypeString=GetPointTypeString;
 FieldValueStringMap.GetLayerTypeString=GetLayerTypeString;
 FieldValueStringMap.GetFieldNameString=GetFieldNameString;
 FieldValueStringMap.GetFieldValueString=GetFieldValueString;
})();
