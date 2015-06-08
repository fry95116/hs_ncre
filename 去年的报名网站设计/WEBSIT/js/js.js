<!--
/*
'' ============================================================================================
'' 项目名称：查询班级报名情况
'' 项目版本：V1.0
'' 项目描述：按班级查询报名情况
'' 文件名称：js/js.js
'' 文件描述：Javascript通用脚本库
'' 公司名称：教务处
'' 开发人员：李大侠
'' 创建日期：2010-12-4 16:44:24
'' 修订日期：2010-12-04 04:53:52
'' 版权信息：Copyright (C) 2010

'' 项目升级时需读取以下生成工具的版权信息
'' 生成工具：风越代码生成器 [FireCode Creator]
'' 当前版本：通用版 V3.5
'' 官方网站：http://www.sino8848.com
'' ============================================================================================
*/

function showMsg(strMsg)
{
    alert(strMsg);
}

function goUrl(strUrl,theMethod)
{
    if (strUrl=="-1")
    {
        window.history.go(-1);
    }
    else if (strUrl=="1")
    {
        window.history.go(1);
    }
    else
    {
        if(theMethod=="reload")
        {
            window.location.reload();
        }
        else if (theMethod=="href")
        {
            window.location.href=strUrl;
        }
        else
        {
            window.location.replace(strUrl);
        }
    }
}

function Trim(str) 
{
    return str.replace(/^\s*(.*?)[\s\n]*$/g,'$1');
}

function popWin(strUrl,strParam)
{
    window.open(strUrl,"",strParam);
}

function setCookie(sName, sValue, sExpires)
{
    if (/(^[+-]?\d+$)/gi.test(sExpires))
    {
        var dt = new Date();
        var y = dt.getYear();
        y = y<100?(1900 + y):y;
        dt.setTime(dt.getTime() + parseInt(sExpires)*24*60*60*1000);

        document.cookie = sName + "=" + escape(sValue) +";expires=" + dt.toGMTString() + ";";
    }
    else
        document.cookie = sName + "=" + escape(sValue);
}

function getCookie(sName)
{
    return getCookieDo(sName, true);
}

function getCookieDo(sName, bUnescape)
{
   var aCookie = document.cookie;
   aCookie = aCookie.split("; ");
   for (var i = 0; i < aCookie.length; i++)
   {
      var aCrumb = aCookie[i].split("=");
      if (sName == aCrumb[0])
      {
         var strValue = aCookie[i].substr(aCookie[i].indexOf("=") + 1);
         if (bUnescape)
            return unescape(strValue);
         else
            return strValue;
      }
   }
   return "";
}

function setCookieSub(sMainName, sName, sValue, sExpires)
{
    var mainCookie = getCookieDo(sMainName, false);
    var strPattern = "(" + sName + ")(=)([^&]*)(&|$)";
    var reg = new RegExp(strPattern, "igm");
    mainCookie = mainCookie.replace(reg, "");
    var theCookie="";
    if (mainCookie.length == 0)
    {
        theCookie=sMainName + "=" + sName + "=" + escape(sValue) + ";";
    }
    else
    {
        theCookie=sMainName + "=" + mainCookie + "&"  + sName + "=" + escape(sValue) + ";";
    }

    if (/(^[+-]?\d+$)/gi.test(sExpires))
    {
        var dt = new Date();
        var y = dt.getYear();
        y = y<100?(1900 + y):y; 
        dt.setTime(dt.getTime() + parseInt(sExpires)*24*60*60*1000);
        document.cookie = theCookie+"expires=" + dt.toGMTString() + ";";
    }
    else
        document.cookie = theCookie
}

function getCookieSub(sMainName, sName)
{
    var mainCookie = getCookieDo(sMainName, false);
    mainCookie = mainCookie.split("&");
    for (var i = 0; i < mainCookie.length; i++)
    {
        var aCrumb = mainCookie[i].split("=");
        if (sName == aCrumb[0])
        {
            return unescape(mainCookie[i].substr(mainCookie[i].indexOf("=") + 1));
        }
    }
    return "";
}

function setAllCheckBoxSta(objCBAll,strAllCBName)
{
    var isChecked=objCBAll.checked;
    allElements=document.getElementsByName(strAllCBName);
    for(i=0;i<allElements.length;i++)
    {
        allElements[i].checked=isChecked;
    }
    for(i=0;i<document.getElementsByName(objCBAll.name).length;i++)
    {
        document.getElementsByName(objCBAll.name)[i].checked=isChecked;
    }
    return isChecked;
}

function setCheckBoxAllSta(strCBAllName,strAllCBName)
{
    allElements=document.getElementsByName(strAllCBName);
    var isChecked=true;
    var iSel=0;
    var iNoSel=0;
    for(i=0;i<allElements.length;i++)
    {
        if (!allElements[i].checked)
        {
            iNoSel++;
            isChecked=false;
        }
        else
        {
            iSel++;
        }
    }
    for(i=0;i<document.getElementsByName(strCBAllName).length;i++)
    {
        document.getElementsByName(strCBAllName)[i].checked=isChecked;
    }
    return iSel.toString()+" "+iNoSel.toString();
}

function getUrlParm(strParmName)
{
    if (window.location.search.length != 0)
    {
        var strUrl = window.location.search.substr(1);
        var strUrlParms = strUrl.split("&");
        for (i=0;i<strUrlParms.length;i++)
        {
            if (strUrlParms[i].indexOf(strParmName+"=") >= 0)
            {
                return strUrlParms[i].substr(strParmName.length+1);
            }
        }
        return "";
    }
}

function BreakItUp(objForm, objCtrl) 
{ 
    var FormLimit = (1024*100)/2-1;
    var TempVar = new String;
    TempVar = objCtrl.value;
    if (TempVar.length > FormLimit) 
    { 
        objCtrl.value = TempVar.substr(0, FormLimit) ;
        TempVar = TempVar.substr(FormLimit) ;
        while (TempVar.length > 0) 
        { 
            var objTEXTAREA = document.createElement("TEXTAREA");
            objTEXTAREA.name = objCtrl.name;
            objTEXTAREA.value = TempVar.substr(0, FormLimit);
            objTEXTAREA.style.display = "none";
            objForm.appendChild(objTEXTAREA);
            
            TempVar = TempVar.substr(FormLimit);
        }
    }
}

-->
